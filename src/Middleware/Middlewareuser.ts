import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // تأكد من أنك تستخدم JWT للتحقق من التوكن
import connection from '../routes/database';

// Middleware للتحقق من السوبر أدمن
const verifyuser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.authToken;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded: any = jwt.verify(token, 'your_jwt_secret'); // استخدم السر الخاص بك

        // تحقق من أن السوبر أدمن موجود في قاعدة البيانات
        const [rows]: any = await connection.execute(
            'SELECT * FROM user WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. Not a user.' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid token.' });
    }
};
export default verifyuser;