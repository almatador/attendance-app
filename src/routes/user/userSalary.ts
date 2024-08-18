import express from 'express';
import connection from '../database';
import verifyuser from './../../Middleware/Middlewareuser';

const userSalaryRouter = express.Router();


// Get all salary records for a user
userSalaryRouter.get('/user/:userId',verifyuser, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { token } = req.headers; // التوكن يتم إرساله كجزء من الهيدر

  if (!token) {
    return res.status(400).json({ error: 'التوكن مطلوب.' });
  }

  try {
    // التحقق من صحة التوكن
    const tokenQuery = 'SELECT * FROM secretKeyuser WHERE token = ? AND userId = ?';
    connection.query(tokenQuery, [token, userId], (err, tokenResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error verifying token.' });
      }


      // إذا كان التوكن صالحًا، جلب سجلات الرواتب
      const salaryQuery = 'SELECT * FROM Salary WHERE userId = ?';
      connection.query(salaryQuery, [userId], (err, salaryResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching salary records.' });
        }

        res.status(200).json(salaryResults);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching salary records.' });
  }
});


export default userSalaryRouter;
