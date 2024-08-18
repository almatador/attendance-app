import express from 'express';
import crypto from 'crypto';
import connection from '../database';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 

const userRouter = express.Router();

interface user {
  id: number;
  name: string;
  email: string;
  password: string;
  jobTitle: string;
  adminId: number;
}
const jwtSecret = 'your_jwt_secret'; // Replace with your own secret key

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM user WHERE email = ?`;
  connection.query(query, [email], async (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
    }

    if (!results.length) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const user: user = results[0] as user;

    const match = await verifyPassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign({ adminId: user.id }, jwtSecret, { expiresIn: '1h' });

    const insertTokenQuery = `INSERT INTO SecretKeyuser (userId, token) VALUES (?, ?)`;
    connection.query(insertTokenQuery, [user.id, token], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
      }
      res.cookie('token', token, {
        httpOnly: true, // يجعل الكوكي غير متاحة للوصول عبر جافاسكريبت من جانب العميل
        secure: true, // تأكد من أن هذا موجود إذا كنت تستخدم HTTPS
        maxAge: 3600000, // عمر الكوكي (1 ساعة في هذه الحالة)
      });
      res.status(200).json({ token });
    });
  });
});
userRouter.delete('/logout', async (req, res) => {

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
        res.clearCookie('authToken');

        res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
      });
});
  
export default userRouter;  