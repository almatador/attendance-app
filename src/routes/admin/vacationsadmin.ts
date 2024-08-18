import express from 'express';
import mysql from 'mysql2';
import connection from '../database';
import verifySubscription from './../../Middleware/verifySubscription ';

const adminVacationRouter = express.Router();
adminVacationRouter.use( verifySubscription);

// Define the type for vacation request
interface VacationRequest {
  id: number;
  description: string;
  userId: number;
  startDate: string;
  endDate: string;
  type: 'Annual' | 'Emergency';
  status: string;
}

// Update a vacation request status
adminVacationRouter.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const selectVacationQuery = `SELECT * FROM vacation WHERE id = ?`;

  try {
    const [results] = await connection.promise().query(selectVacationQuery, [id]);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Vacation request not found.' });
    }

    const vacation = results[0] as VacationRequest;

    const updateVacationQuery = `UPDATE vacation SET status = ? WHERE id = ?`;
    await connection.promise().query(updateVacationQuery, [status, id]);

    if (status === 'approved') {
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Add reservation for the requested days
      const reserveQuery = `INSERT INTO reservations (userId, startDate, endDate) VALUES (?, ?, ?)`;
      await connection.promise().query(reserveQuery, [vacation.userId, vacation.startDate, vacation.endDate]);

      // Check attendance for the vacation days
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const checkAttendanceQuery = `SELECT * FROM attendance WHERE userId = ? AND date = ?`;
        const [attendanceResults]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.promise().query(checkAttendanceQuery, [vacation.userId, date.toISOString().split('T')[0]]);

        if (attendanceResults.length === 0) {
          // Deduct one day from the employee's leave balance
          const updateUserQuery = vacation.type === 'Annual'
            ? `UPDATE user SET annualLeaveDays = annualLeaveDays - 1 WHERE id = ?`
            : `UPDATE user SET emergencyLeaveDays = emergencyLeaveDays - 1 WHERE id = ?`;

          await connection.promise().query(updateUserQuery, [vacation.userId]);
        }
      }
    }

    res.status(200).json({ ...vacation, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating vacation request.' });
  }
});

// Get all vacation requests
adminVacationRouter.get('/all', (req, res) => {
  const query = `SELECT * FROM vacation`;

  connection.query(query, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching vacation requests.' });
    }
    res.status(200).json(results);
  });
});

export default adminVacationRouter;
