import { Request, Response, NextFunction } from 'express';
import connection from './../routes/database';

const verifySubscription = async (req: Request, res: Response, next: NextFunction) => {
  const adminId = req.body.adminId || req.query.adminId || req.params.adminId;
  if (!adminId) {
    return res.status(400).json({ error: 'Admin ID is required' });
  }

  // Query for the subscription
  const [subscriptionRows]: [any, any] = await connection.promise().query(
    'SELECT * FROM subscription WHERE adminId = ?',
    [adminId]
  );

  const subscription = subscriptionRows[0];
  
  if (!subscription) {
    return res.status(404).json({ error: 'No active subscription found.' });
  }

  // Query for the admin's email
  const [adminRows]: [any, any] = await connection.promise().query(
    'SELECT email FROM admin WHERE id = ?',
    [adminId]
  );

  const admin = adminRows[0];

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found.' });
  }

  const currentDate = new Date();
  const endDate = new Date(subscription.endDate);

  if (currentDate > endDate) {
    const email = admin.email;

    // Include the email in the notification message

    return res.status(403).json({ error: 'Subscription has expired. Please renew your subscription.' });
  }

  next();
};

export default verifySubscription;
