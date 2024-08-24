import express from 'express';
import connection from '../database';
const adminSalaryRouter = express.Router();

interface Salary {
  id: number;
  userId: number;
  period: Date;
  basicSalary: number;
  increase: number;
  projectPercentage: number;
  emergencyDeductions: number;
  netSalary: number;
  exchangeDate: Date;
  is_captured:string
}

// Update an existing salary record
adminSalaryRouter.put('/update/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;

  const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

  const selectQuery = `SELECT * FROM salary WHERE id = ?`;

  connection.query(selectQuery, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching salary record.' });
    }


    const updateQuery = `
      UPDATE salary
      SET basicSalary = ?, increase = ?, projectPercentage = ?, emergencyDeductions = ?, netSalary = ?, exchangeDate = ?
      WHERE id = ?
    `;

    connection.query(updateQuery, [basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate), id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating salary record.' });
      }
      res.status(200).json({ id, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate });
    });
  });
});
adminSalaryRouter.post('/is_captured/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { is_captured } = req.body;

  try {
    // استرجاع تفاصيل المستخدم
    const [rows] :any = await connection.promise().query('SELECT * FROM salary WHERE userId = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // إذا كانت الحالة هي "paid"
    if (is_captured === 'paid') {
      // انتظر لمدة يومين (48 ساعة)
      setTimeout(async () => {
        // تحديث حالة القبض إلى الشهر الجديد
        const updateQuery = 'UPDATE salary SET month = month + 1 WHERE userId = ?';
        await connection.promise().query(updateQuery, [userId]);

        return res.json({ message: 'User status updated and moved to the next month' });
      }, 48 * 60 * 60 * 1000); // 48 ساعة بالمللي ثانية

    } else {
      return res.json({ message: 'No update needed. The status is still pending.' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all salary records
adminSalaryRouter.get('/all', (req, res) => {
  const query = `SELECT * FROM salary`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching salary records.' });
    }
    res.status(200).json(results);
  });
});

adminSalaryRouter.get('/all/:adminId', (req, res) => {
  const { adminId } = req.params;

  const query = `
    SELECT s.*
    FROM salary s
    JOIN user u ON s.userId = u.id
    WHERE u.adminId = ?
  `;

  connection.query(query, [adminId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching salary records.' });
    }

    // Cast results to Salary[] if needed, depending on the actual returned data
    const salaries: Salary[] = results as Salary[];

    if (salaries.length === 0) {
      return res.status(404).json({ message: 'No salary records found for this admin.' });
    }

    res.status(200).json(salaries);
  });
});

export default adminSalaryRouter;
