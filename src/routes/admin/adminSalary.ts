import express from 'express';
import mysql from 'mysql2';
import connection from '../database';

const adminSalaryRouter = express.Router();


adminSalaryRouter.post('/create', (req, res) => {
  const { userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;

  const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

  const query = `
    INSERT INTO salary (userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [userId, new Date(period), basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate)], (err, ) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error creating salary record.' });
    }
    res.status(201).json({ id: userId, userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate });
  });
});

// Update an existing salary record
adminSalaryRouter.put('/update/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;

  const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

  const selectQuery = `SELECT * FROM salary WHERE id = ?`;

  connection.query(selectQuery, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching salary record.' });
    }


    const updateQuery = `
      UPDATE salary
      SET basicSalary = ?, increase = ?, projectPercentage = ?, emergencyDeductions = ?, netSalary = ?, exchangeDate = ?
      WHERE id = ?
    `;

    connection.query(updateQuery, [basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate), id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating salary record.' });
      }
      res.status(200).json({ id, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate });
    });
  });
});

// Get all salary records
adminSalaryRouter.get('/all', (req, res) => {
  const query = `SELECT * FROM salary`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching salary records.' });
    }
    res.status(200).json(results);
  });
});

export default adminSalaryRouter;
