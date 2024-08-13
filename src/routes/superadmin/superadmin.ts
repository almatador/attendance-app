import express from 'express';
import mysql from 'mysql2/promise'; // استخدام promise-based mysql2
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import connection from '../database'; // تأكد من أن هذا المسار صحيح
import jwt from 'jsonwebtoken'; // Import JWT library

const superAdminRouter = express.Router();
 // Replace with your own secret key

// توليد مفتاح سري
const generateSecretKey = () => crypto.randomBytes(64).toString('hex');
interface Admin {
    id: number;
    username: string;
    password: string;
    role:string;
    
}
const jwtSecret = generateSecretKey();
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};
superAdminRouter.post('/create', async (req, res) => {
  const { name, username, email, phoneNumber, password } = req.body;

  if (!name || !username || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
      const hashedPassword = await hashPassword(password);
      const query = `
      INSERT INTO admin (name, username, email, phoneNumber, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const role = 'superadmin'; 


      connection.query(query, [name, username, email, phoneNumber, hashedPassword, role], (err, results) => {
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
              role
          });
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
  }
});

superAdminRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const query = `SELECT * FROM Admim WHERE username = ?`;
  
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
  
      const insertTokenQuery = `INSERT INTO secretkeysuperadmin (superAdminId, token) VALUES (?, ?)`;
      connection.query(insertTokenQuery, [admin.id, token], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
        }
  
        res.status(200).json({admin ,token });
      });
    });
  });
  
// تسجيل الخروج

superAdminRouter.post('/logout', (req, res) => {
    const { token } = req.body;
  
    if (!token) {
      return res.status(400).json({ error: 'التوكن مطلوب.' });
    }
  
    const deleteTokenQuery = `DELETE FROM secretkeysuperadmin WHERE token = ?`;
  
    connection.query(deleteTokenQuery, [token], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
      }
  
      res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
    });
  });
  superAdminRouter.get('/getall', (req, res) => {
    const query = `SELECT * FROM Admin WHERE role = 'superadmin'`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching superadmin requests.' });
        }
        res.status(200).json(results);
    });
});

export default superAdminRouter;
