import express from 'express';
import connection from '../database';
import { RowDataPacket } from 'mysql2';
import verifyuser from './../../Middleware/Middlewareuser';

interface LeaveResult extends RowDataPacket {
  annualLeaveDays?: number;
  emergencyLeaveDays?: number;
}

const userVacationRouter = express.Router();

userVacationRouter.post('/create',verifyuser, (req, res) => {
  const { userId, startDate, endDate, reason, type } = req.body;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const userQuery = 'SELECT * FROM Users WHERE id = ?';
  connection.query(userQuery, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error checking user.' });
    }

    let leaveCheckQuery = '';
    if (type === 'Annual') {
      leaveCheckQuery = 'SELECT annualLeaveDays FROM Users WHERE id = ?';
    } else if (type === 'Emergency') {
      leaveCheckQuery = 'SELECT emergencyLeaveDays FROM Users WHERE id = ?';
    } else {
      return res.status(400).json({ error: 'Invalid leave type.' });
    }

    connection.query<LeaveResult[]>(leaveCheckQuery, [userId], (err, leaveResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error checking leave balance.' });
      }

      if (leaveResults.length > 0) {
        const leaveDays = type === 'Annual'
          ? leaveResults[0].annualLeaveDays
          : leaveResults[0].emergencyLeaveDays;

        if (leaveDays && leaveDays < duration) {
          return res.status(400).json({ error: `Insufficient ${type.toLowerCase()} leave days.` });
        }

        const insertQuery = 'INSERT INTO Vacations (userId, startDate, endDate, reason, type) VALUES (?, ?, ?, ?, ?)';
        connection.query(insertQuery, [userId, startDate, endDate, reason, type], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error creating vacation request.' });
          }

          res.status(201).json({ message: 'Vacation request created successfully.' });
        });
      } else {
        return res.status(404).json({ error: 'User not found or no leave data available.' });
      }
    });
  });
});

export default userVacationRouter;
