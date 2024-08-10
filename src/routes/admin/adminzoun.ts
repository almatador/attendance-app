import express from 'express';
import mysql from 'mysql2/promise';
import connection from '../database';
import verifyAdmin from '../../Middleware/Middlewareadmin';

const adminzoun = express.Router();

adminzoun.use(verifyAdmin);

// إضافة زون جديدة
adminzoun.post('/zones', async (req, res) => {
    const { name, center_latitude, center_longitude, radius, adminId } = req.body;
  
    try {
      const [result]: any = await connection.execute(
        'INSERT INTO Zones (name, center_latitude, center_longitude, radius, adminId) VALUES (?, ?, ?, ?, ?)',
        [name, center_latitude, center_longitude, radius, adminId]
      );
  
      res.status(201).json({ id: result.ID, name, center_latitude, center_longitude, radius });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding new zone.' });
    }
  });
adminzoun.put('/zones/:id', async (req, res) => {
  const { id } = req.params;
  const { name, center_latitude, center_longitude, radius } = req.body;

  try {
    await connection.execute(
      'UPDATE Zones SET name = ?, center_latitude = ?, center_longitude = ?, radius = ? WHERE id = ?',
      [name, center_latitude, center_longitude, radius, id]
    );
    res.status(200).json({ id, name, center_latitude, center_longitude, radius });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating zone.' });
  }
});

// حذف زون
adminzoun.delete('/zones/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await connection.execute('DELETE FROM Zones WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting zone.' });
  }
});

// الحصول على جميع الزونات
adminzoun.get('/zones', async (req, res) => {
  try {
    const zones = await connection.execute('SELECT * FROM Zones');
    res.status(200).json(zones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching zones.' });
  }
});

export default adminzoun;
