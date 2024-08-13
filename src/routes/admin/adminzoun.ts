import express from 'express';
import mysql from 'mysql2/promise';
import connection from '../database';

const adminzoun = express.Router();

// إضافة زون جديدة
adminzoun.post('/zones/:adminId', async (req, res) => {
  const { name, center_latitude, center_longitude, radius } = req.body;
  const { adminId } = req.params;

  if (!name || !center_latitude || !center_longitude || !radius || !radius || !adminId) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
    const query = `
    INSERT INTO zones (name, center_latitude, center_longitude, radius, adminId)
    VALUES (?, ?, ?, ?, ?)
  `;

    connection.query(query, [name, center_latitude, center_longitude, radius ,adminId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدير.' });
        }

        const newId = (results as mysql.OkPacket).insertId;

        res.status(201).json({
            id: newId,
            name,
            center_latitude,
            center_longitude,
            radius,
            adminId
        });
    });
} catch (error) {
    console.error('Error in POST /zones:', error);
    res.status(500).json({
      error: 'Error adding new zone.',
      message: (error as Error).message
    });
  }
});

// تحديث زون
adminzoun.put('/zones/:id', async (req, res) => {
  const { id } = req.params;
  const { name, center_latitude, center_longitude, radius } = req.body;

  // التحقق من وجود جميع الحقول
  if (!name || !center_latitude || !center_longitude || !radius) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  const query = 'UPDATE zones SET name = ?, center_latitude = ?, center_longitude = ?, radius = ? WHERE id = ?';
  const params = [name, center_latitude, center_longitude,radius,id];

  try {
    connection.query(query, params, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating User.' });
      }
      res.status(200).json({ id, name, center_latitude, center_longitude, radius});
    });
  //   const [result] = await connection.execute<mysql.OkPacket>(query, [name, center_latitude, center_longitude, radius, id]);

  //   if ((result as mysql.OkPacket).affectedRows === 0) {
  //     return res.status(404).json({ error: 'Zone not found.' });
  //   }

  //   res.status(200).json({ id, name, center_latitude, center_longitude, radius });
  } catch (error) {
    console.error('Error in PUT /zones/:id:', error);
    res.status(500).json({ error: 'Error updating zone.', message: (error as Error).message });
  }
});

// حذف زون
adminzoun.delete('/zones/:id', async (req, res) => {
  const { id } = req.params;
  const query = `
    DELETE FROM zones
    WHERE id = ?
  `;
  connection.query(query, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting User.' });
    }
    res.status(204).send();
});})

// // الحصول على جميع الزونات
adminzoun.get('/zones/:adminId', async (req, res) => {
  const { adminId } = req.params;
  const query = 'SELECT * FROM zones WHERE adminId = ?';

 
  connection.query(query, [adminId],(err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching vacation requests.' });
    }
    res.status(200).json(results);
  })
});


export default adminzoun;
