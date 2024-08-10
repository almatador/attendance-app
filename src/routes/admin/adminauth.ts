import express from 'express';
import mysql from 'mysql2';
import connection from '../database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // Import JWT library

const adminRouter = express.Router();
const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // Replace with your own secret key

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

interface Admin {
  id: number;
  username: string;
  password: string;
}

// دالة لتشفير كلمة المرور
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// دالة للتحقق من كلمة المرور
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

adminRouter.post('/create', async (req, res) => {
  const { name, username, email, phoneNumber, password } = req.body;

  if (!name || !username || !email || !phoneNumber || !password) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = `
      INSERT INTO Admin (name, username, email, phoneNumber, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    connection.query(query, [name, username, email, phoneNumber, hashedPassword], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدير.' });
      }

      const newId = (results as mysql.OkPacket).insertId;

      res.status(201).json({
        id: newId,
        name,
        username,
        email,
        phoneNumber,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
  }
});



adminRouter.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, email, phoneNumber, password } = req.body;

  try {
    let query = `
      UPDATE Admin
      SET name = ?, username = ?, email = ?, phoneNumber = ?
    `;
    const params = [name, username, email, phoneNumber];

    if (password) {
      const hashedPassword = await hashPassword(password);
      query += `, password = ? WHERE id = ?`;
      params.push(hashedPassword, id);
    } else {
      query += ` WHERE id = ?`;
      params.push(id);
    }

    connection.query(query, params, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating Admin.' });
      }
      res.status(200).json({ id, name, username, email, phoneNumber });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
  }
});

adminRouter.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM Admin
    WHERE id = ?
  `;

  connection.query(query, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting Admin.' });
    }
    res.status(204).send();
  });
});

adminRouter.post('/user/create', async (req, res) => {
  const { name, email, password, adminId, jobTitle } = req.body;

  // Ensure all required fields are provided
  if (!name || !email || !password || !adminId || !jobTitle) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }
  const hashedPassword = await hashPassword(password);

  const query = `
    INSERT INTO User (name, email, password, jobTitle, adminId)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, email, hashedPassword, jobTitle, adminId], (err,results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error creating User.' });
    }
    const newId = (results as mysql.OkPacket).insertId;

    res.status(201).json({id:newId, name, email, password, adminId, jobTitle });
  });
});

adminRouter.put('/user/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, jobTitle } = req.body;

  let query = `
    UPDATE User
    SET name = ?, email = ?, jobTitle = ?
  `;
  const params = [name, email, jobTitle];

  if (password) {
    const hashedPassword = await hashPassword(password);
    query += `, password = ? WHERE id = ?`;
    params.push(hashedPassword, id);
  } else {
    query += ` WHERE id = ?`;
    params.push(id);
  }

  connection.query(query, params, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error updating User.' });
    }
    res.status(200).json({ id, name, email, jobTitle });
  });
});

adminRouter.delete('/user/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM User
    WHERE id = ?
  `;

  connection.query(query, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error deleting User.' });
    }
    res.status(204).send();
  });
});

adminRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM Admin WHERE username = ?`;

  connection.query(query, [username], async (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
    }

    if (!results.length) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const admin: Admin = results[0] as Admin;
    
    const match = await verifyPassword(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign({ adminId: admin.id }, jwtSecret, { expiresIn: '1h' });

    const insertTokenQuery = `INSERT INTO SecretKeyAdmin (adminId, token) VALUES (?, ?)`;
    connection.query(insertTokenQuery, [admin.id, token], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
      }

      res.status(200).json({ token });
    });
  });
});

// تسجيل الخروج
adminRouter.post('/logout', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'التوكن مطلوب.' });
  }

  const deleteTokenQuery = `DELETE FROM SecretKeyAdmin WHERE token = ?`;

  connection.query(deleteTokenQuery, [token], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
    }

    res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
  });
});
export default adminRouter;
