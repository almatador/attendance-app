import express from 'express';
import connection from '../database';
import verifyAdmin from './../../Middleware/Middlewareadmin';
import verifySubscription from './../../Middleware/verifySubscription ';

const shiftRouter = express.Router(); // استخدام Router بدلاً من express()
shiftRouter.use(verifyAdmin, verifySubscription);

// مسار لإضافة فترة عمل
shiftRouter.post('/shifts', verifyAdmin, async (req, res) => {
  const { name, startTime, endTime, adminId } = req.body;

  try {
    const [result]: [any, any] = await connection.promise().query(
      'INSERT INTO shift (name, startTime, endTime, adminId) VALUES (?, ?, ?, ?)',
      [name, startTime, endTime, adminId]
    );
    console.log('Insert result:', result);

    if (result && result.insertId) {
      res.status(201).json({ message: 'Shift added successfully', shiftId: result.insertId });
    } else {
      res.status(500).json({ error: 'Shift added successfully, but no insertId was returned.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding shift', details: error.message });
  }
});

// مسار لتحديث فترة عمل
shiftRouter.put('/shifts/:shiftId', verifyAdmin, async (req, res) => {
  const { shiftId } = req.params;
  const { name, startTime, endTime, adminId } = req.body;

  try {
    const [result]: [any, any] = await connection.promise().query(
      'UPDATE shift SET name = ?, startTime = ?, endTime = ?, adminId = ? WHERE id = ?',
      [name, startTime, endTime, adminId, shiftId]
    );
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.status(200).json({ message: 'Shift updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating shift', details: error.message });
  }
});

// مسار لحذف فترة عمل
shiftRouter.delete('/shifts/:shiftId', verifyAdmin, async (req, res) => {
  const { shiftId } = req.params;

  try {
    const [result]: [any, any] = await connection.promise().query(
      'DELETE FROM shift WHERE id = ?',
      [shiftId]
    );
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting shift', details: error.message });
  }
});
shiftRouter.post('/shifts/:shiftId/users', verifyAdmin, async (req, res) => {
  const { shiftId } = req.params;
  const { userId, shiftDate } = req.body;

  try {
    // 1. التحقق من أن المستخدم ينتمي إلى نفس الـ adminId الخاص بفترة العمل
    const [shiftRows]: [any, any] = await connection.promise().query(
      'SELECT adminId FROM shift WHERE id = ?',
      [shiftId]
    );
    const shift = shiftRows[0];
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const [userRows]: [any, any] = await connection.promise().query(
      'SELECT * FROM User WHERE id = ? AND adminId = ?',
      [userId, shift.adminId]
    );
    const user = userRows[0];
    if (!user) {
      return res.status(403).json({ error: 'User does not belong to the same admin' });
    }

    // 2. إدراج المستخدم إلى فترة العمل
    const [result]: [any, any] = await connection.promise().query(
      'INSERT INTO usershift (userId, shiftId, shiftDate) VALUES (?, ?, ?)',
      [userId, shiftId, shiftDate]
    );
    if (result && result.insertId) {
      res.status(201).json({ message: 'User added to shift successfully', userShiftId: result.insertId });
    } else {
      res.status(500).json({ error: 'User added to shift successfully, but no insertId was returned.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding user to shift', details: error.message });
  }
});
// مسار للحصول على معلومات فترة عمل مع المستخدمين
shiftRouter.get('/shifts/:shiftId/users', verifyAdmin, async (req, res) => {
  const { shiftId } = req.params;

  try {
    const [shiftRows]: [any, any] = await connection.promise().query(
      'SELECT * FROM shift WHERE id = ?',
      [shiftId]
    );
    const shift = shiftRows[0];
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const [userShiftRows]: [any, any] = await connection.promise().query(
      `SELECT u.id, u.name, us.shiftDate 
       FROM User u
       JOIN usershift us ON u.id = us.userId 
       WHERE us.shiftId = ?`,
      [shiftId]
    );

    res.status(200).json({ shift, users: userShiftRows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching shift with users', details: error.message });
  }
});

// مسار للحصول على جميع فترات العمل مع المستخدمين
shiftRouter.get('/shifts', verifyAdmin, async (req, res) => {
  try {
    const [shifts]: [any, any] = await connection.promise().query(
      'SELECT * FROM shift'
    );

    const shiftWithUsers = await Promise.all(
      shifts.map(async (shift: any) => {
        const [userShiftRows]: [any, any] = await connection.promise().query(
          `SELECT u.id, u.name, us.shiftDate 
           FROM User u
           JOIN usershift us ON u.id = us.userId 
           WHERE us.shiftId = ?`,
          [shift.id]
        );

        return { ...shift, users: userShiftRows };
      })
    );

    res.status(200).json({ shifts: shiftWithUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching shifts with users', details: error.message });
  }
});

export default shiftRouter;
