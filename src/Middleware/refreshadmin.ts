import express from 'express';
import jwt from 'jsonwebtoken';
import connection from '../routes/database';
import bodyParser from 'body-parser';

const refreshadminRouter = express.Router();
const jwtSecret = 'your_jwt_secret';  // تأكد من أن السر موجود في مكان آمن مثل ملفات البيئة
const refreshSecret = 'your_refresh_secret'; // سر لتوقيع توكن التحديث

refreshadminRouter.use(bodyParser.json()); // لتحليل محتوى JSON

refreshadminRouter.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies?.authToken; // تأكد من استخدام refreshToken وليس authToken

    if (!refreshToken) {
        return res.status(401).json({ error: 'Access denied. No refresh token provided.' });
    }

    try {
        // تحقق من صحة توكن التحديث
        const decoded: any = jwt.verify(refreshToken, refreshSecret);

        const { adminId, role } = decoded;

        // تحقق من وجود توكن التحديث في قاعدة البيانات
        const [rows]: any = await connection.execute(
            `SELECT * FROM SecretKeyAdmin WHERE adminId = ? AND refreshToken = ?`,
            [adminId, refreshToken]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: 'Invalid refresh token.' });
        }

        // إنشاء توكن جديد
        const newToken = jwt.sign({ adminId, role }, jwtSecret, { expiresIn: '1h' });

        res.cookie('authToken', newToken, { httpOnly: true, secure: true });
        return res.status(200).json({ token: newToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token.', message: (err as Error).message });
    }
});

export default refreshadminRouter;
