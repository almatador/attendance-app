import express from 'express';
import mysql from 'mysql2';
import connection from '../database'; // Assuming you have a connection configured
import verifyAdmin from './../../Middleware/Middlewareadmin'; // افترض أن هذا هو مسار الـ Middleware

const planRouter = express.Router();

planRouter.use(express.json());

// حماية جميع المسارات بسوبر أدمن Middleware
planRouter.use(verifyAdmin);
// إنشاء خطة جديدة
planRouter.post('/create', (req, res) => {
  const { name, description, price, duration, days, users } = req.body;

  const query = `
    INSERT INTO plan (name, description, price, duration, days, users)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, description, price, duration, days, users], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while creating the plan.' });
    }
    res.status(201).json({ name, description, price, duration, days, users });
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
// اشتراك في خطة
planRouter.post('/subscribe/:planId', async (req, res) => {
  const { planId } = req.params;
  const { adminId, subscriptionEndDate } = req.body;

  // تأكد من أن الخطة موجودة
  const [planRows]: [any, any] = await connection.promise().query(
    'SELECT * FROM plan WHERE id = ?',
    [planId]
  );
  const plan = planRows[0];
  
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found.' });
  }

  // تحقق من الاشتراك الحالي
  const [subscriptionRows]: [any, any] = await connection.promise().query(
    'SELECT * FROM subscription WHERE adminId = ? AND planId = ?',
    [adminId, planId]
  );
  const subscription = subscriptionRows[0];
  
  if (subscription) {
    return res.status(400).json({ error: 'Already subscribed to this plan.' });
  }

  // إضافة الاشتراك
  const query = `
    INSERT INTO subscription (adminId, planId, startDate, endDate)
    VALUES (?, ?, NOW(), ?)
  `;
  connection.query(query, [adminId, planId, subscriptionEndDate], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while subscribing.' });
    }
    res.status(201).json({ message: 'Subscribed successfully.' });
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
planRouter.get('/subscriptions/:planId', async (req, res) => {
  const planId = parseInt(req.params.planId, 10);

  try {
    // استعلام للحصول على الاشتراكات بناءً على planId
    const [subscriptionRows]: [any, any] = await connection.promise().query(
      `SELECT s.id, s.adminId, s.startDate, s.endDate, p.name AS planName
       FROM subscription s
       JOIN plan p ON s.planId = p.id
       WHERE s.planId = ?`,
      [planId]
    );

    if (subscriptionRows.length === 0) {
      return res.status(404).json({ error: 'No subscriptions found for this plan.' });
    }

    res.status(200).json(subscriptionRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching subscriptions.', details: error.message });
  }
});


export default planRouter;
