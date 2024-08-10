import express from 'express';
import mysql from 'mysql2';
import connection from '../database';
import verifySuperAdmin from '../../Middleware/Middlewaresuperadmin'; // افترض أن هذا هو مسار الـ Middleware

const ruleRouter = express.Router();


ruleRouter.use(verifySuperAdmin);

// Create a new rule
ruleRouter.post('/create', (req, res) => {
  const { name, description } = req.body;

  const query = `
    INSERT INTO rule (name, description)
    VALUES (?, ?)
  `;

  connection.query(query, [name, description], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while creating the rule.' });
    }
    // Cast results to ResultSetHeader to access insertId
    const resultSetHeader = results as mysql.ResultSetHeader;
    res.status(201).json({ id: resultSetHeader.insertId, name, description });
  });
});

// Get all rules
ruleRouter.get('/', (req, res) => {
  const query = `SELECT * FROM rule`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching the rules.' });
    }
    res.status(200).json(results);
  });
});

// Get a rule by ID
ruleRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const query = `SELECT * FROM rule WHERE id = ?`;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching the rule.' });
    }

    // Ensure results is an array
    if (Array.isArray(results) && results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ error: 'Rule not found.' });
    }
  });
});

// Update a rule by ID
ruleRouter.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description } = req.body;

  const query = `
    UPDATE rule
    SET name = ?, description = ?
    WHERE id = ?
  `;

  connection.query(query, [name, description, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while updating the rule.' });
    }
    res.status(200).json({ id, name, description });
  });
});

// Delete a rule by ID
ruleRouter.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const query = `DELETE FROM rule WHERE id = ?`;

  connection.query(query, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while deleting the rule.' });
    }
    res.status(204).send();
  });
});

// Add a rule to a plan
ruleRouter.post('/:ruleId/plan/:planId', (req, res) => {
  const ruleId = parseInt(req.params.ruleId, 10);
  const planId = parseInt(req.params.planId, 10);

  const query = `
    INSERT INTO plan_rule (ruleId, planId)
    VALUES (?, ?)
  `;

  connection.query(query, [ruleId, planId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while adding the rule to the plan.' });
    }
    // Cast results to ResultSetHeader to access insertId
    const resultSetHeader = results as mysql.ResultSetHeader;
    res.status(201).json({ id: resultSetHeader.insertId, ruleId, planId });
  });
});

// Remove a rule from a plan
ruleRouter.delete('/:ruleId/plan/:planId', (req, res) => {
  const ruleId = parseInt(req.params.ruleId, 10);
  const planId = parseInt(req.params.planId, 10);

  const query = `DELETE FROM plan_rule WHERE ruleId = ? AND planId = ?`;

  connection.query(query, [ruleId, planId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while removing the rule from the plan.' });
    }
    res.status(204).send();
  });
});

export default ruleRouter;
