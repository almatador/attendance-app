import express from 'express';
import mysql from 'mysql2';
import connection from '../database';

const adminVacationRouter = express.Router();

// Define the type for vacation request
interface VacationRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  type: 'Annual' | 'Emergency';
  status: string;
}

// Update a vacation request status
adminVacationRouter.put('/update/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const selectVacationQuery = `SELECT * FROM vacation WHERE id = ?`;

  connection.query(selectVacationQuery, [id], (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching vacation request.' });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Vacation request not found.' });
    }

    const vacation = results[0] as VacationRequest;

    const updateVacationQuery = `UPDATE vacation SET status = ? WHERE id = ?`;

    connection.query(updateVacationQuery, [status, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating vacation request.' });
      }

      if (status === 'approved') {
        const start = new Date(vacation.startDate);
        const end = new Date(vacation.endDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const updateUserQuery = vacation.type === 'Annual'
          ? `UPDATE user SET annualLeaveDays = annualLeaveDays - ? WHERE id = ?`
          : `UPDATE user SET emergencyLeaveDays = emergencyLeaveDays - ? WHERE id = ?`;

        connection.query(updateUserQuery, [duration, vacation.userId], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error updating user leave days.' });
          }
        });
      } else if (status === 'rejected') {
        // Since we're updating the status to rejected, no need to delete
        // Adjust the logic as needed based on the desired outcome
      }

      res.status(200).json({ ...vacation, status });
    });
  });
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
