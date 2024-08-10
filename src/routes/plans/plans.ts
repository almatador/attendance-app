import express from 'express';
import mysql from 'mysql2';
import connection from '../database'; // Assuming you have a connection configured
import verifySuperAdmin from '../../Middleware/Middlewaresuperadmin'; // افترض أن هذا هو مسار الـ Middleware

const planRouter = express.Router();

planRouter.use(express.json());

// حماية جميع المسارات بسوبر أدمن Middleware
planRouter.use(verifySuperAdmin);

// إنشاء خطة جديدة
planRouter.post('/create', (req, res) => {
  const { name, description, price, duration } = req.body;

  const query = `
    INSERT INTO plan (name, description, price, duration)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(query, [name, description, price, duration], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while creating the plan.' });
    }
    res.status(201).json({ name, description, price, duration });
  });
});

// الحصول على جميع الخطط
planRouter.get('/', (req, res) => {
  const query = `SELECT * FROM plan`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching the plans.' });
    }
    res.status(200).json(results);
  });
});

// الحصول على خطة بواسطة ID
planRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const query = `SELECT * FROM plan WHERE id = ?`;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching the plan.' });
    }

    // Type assertion to RowDataPacket[]
    const rows = results as mysql.RowDataPacket[];

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: 'Plan not found.' });
    }
  });
});

// تحديث خطة
planRouter.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, description, price, duration } = req.body;

  const query = `
    UPDATE plan
    SET name = ?, description = ?, price = ?, duration = ?
    WHERE id = ?
  `;

  connection.query(query, [name, description, price, duration, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while updating the plan.' });
    }
    res.status(200).json({ id, name, description, price, duration });
  });
});

// حذف خطة
planRouter.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  const query = `DELETE FROM plan WHERE id = ?`;

  connection.query(query, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while deleting the plan.' });
    }
    res.status(204).send();
  });
});

export default planRouter;
