import express from 'express';
import mysql from 'mysql2/promise';
import connection from '../database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // Import JWT library
import verifyAdmin from './../../Middleware/Middlewareadmin';

const adminRouter = express.Router();
const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // Replace with your own secret key

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

interface Admin {
  id: number;
  email: string;
  password: string;
  role:string;
  
}   
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  jobTitle: string;
  adminId: number;

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
  const { name, username, email, phoneNumber, password, role ='admin' } = req.body;

  if (!name || !username || !email || !phoneNumber || !password) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = `
      INSERT INTO admin (name, username, email, phoneNumber, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [name, username, email, phoneNumber, hashedPassword ,role], (err, results) => {
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
      console.log(err)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
  }
});



adminRouter.put('/update/:id',verifyAdmin, async (req, res) => {
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

adminRouter.delete('/delete/:id',verifyAdmin, (req, res) => {
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

adminRouter.post('/user/create', verifyAdmin, async (req, res) => {
  const { name, email, password, adminId, jobTitle, emergencyLeaveDays, annualLeaveDays } = req.body.user;
  const { period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate, is_captured = 'pending' } = req.body.salary;

  if (!name || !email || !password || !adminId || !jobTitle || !period || !basicSalary) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Check admin's subscription plan
    const [subscriptionRows]: [any, any] = await connection.promise().query(
      `SELECT p.users AS maxUsers 
       FROM subscription s 
       JOIN plan p ON s.planId = p.id 
       WHERE s.adminId = ? AND s.endDate > NOW()`,
      [adminId]
    );

    if (subscriptionRows.length === 0) {
      return res.status(400).json({ error: 'Admin is not subscribed to any plan or subscription has expired.' });
    }

    const { maxUsers } = subscriptionRows[0];

    // Check the current number of users
    const [userCountRows]: [any, any] = await connection.promise().query(
      'SELECT COUNT(*) AS count FROM User WHERE adminId = ?',
      [adminId]
    );
    const { count } = userCountRows[0];

    if (count >= maxUsers) {
      return res.status(400).json({ error: 'Cannot create more users. The maximum number of users for this plan has been reached.' });
    }

    // Insert the new user and create salary record in a transaction

    try {
      const userQuery = `
        INSERT INTO User (name, email, password, jobTitle, adminId, emergencyLeaveDays, annualLeaveDays)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [userResult]: any = await connection.execute(userQuery, [name, email, hashedPassword, jobTitle, adminId, emergencyLeaveDays, annualLeaveDays]);
      const newUserId = userResult.insertId;

      const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

      const salaryQuery = `
        INSERT INTO salary (userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate, is_captured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(salaryQuery, [newUserId, new Date(period), basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate), is_captured]);

      await connection.commit();
      res.status(201).json({ id: newUserId, name, email, jobTitle, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate, is_captured });
    } catch (error) {
      throw error;}
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the user and salary record.' });
  }
});

adminRouter.put('/user/update/:id',verifyAdmin, async (req, res) => {
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

adminRouter.delete('/user/delete/:id',verifyAdmin, (req, res) => {
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
  const { email, password } = req.body;

  const query = `SELECT * FROM admin WHERE email = ?`;

  connection.query(query, [email], async (err, results: mysql.RowDataPacket[]) => {
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

    const token = jwt.sign({ adminId: admin.id ,role: admin.role }, jwtSecret, { expiresIn: '7d' });

    let insertTokenQuery = '';
    if (admin.role === 'superadmin') {
      insertTokenQuery = `INSERT INTO secretkeysuperadmin (superAdminId, token) VALUES (?, ?)`;
    } else {
      insertTokenQuery = `INSERT INTO secretkeyadmin (adminId, token) VALUES (?, ?)`;
    }
      connection.query(insertTokenQuery, [admin.id, token], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
      }
      res.cookie('authToken', token, { httpOnly: true, secure: true });

      res.status(200).json({ token:token , admin: admin});
    });
  });
});
adminRouter.get('/users/:adminId',verifyAdmin, (req, res) => {
  const { adminId } = req.params;
  const query = `SELECT * FROM user WHERE adminId = ?`;

  connection.query(query, [adminId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: 'Error fetching users.',
        message: err.message,
      });
    }

    // Assuming `results` is an array of rows, we map them to the `User` interface
    const users: User[] = (results as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      jobTitle: row.jobTitle,
      adminId: row.adminId,
    }));

    res.status(200).json(users);
  });
});





adminRouter.post('/logout', (req, res) => {
  const token = req.cookies?.authToken;
  console.log(token)
  if (!token) {
      return res.status(400).json({ error: 'لم يتم العثور على التوكن.' });
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

export default adminRouter;
