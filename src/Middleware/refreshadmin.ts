import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import connection from '../routes/database'; // تأكد من المسار الصحيح لملف قاعدة البيانات

// توليد Refresh Token جديد
const generateRefreshToken = (user: any) => {
    return jwt.sign(user, 'your_refresh_token_secret', { expiresIn: '7d' }); // صلاحية 7 أيام كمثال
};

// مسار لتجديد الـRefresh Token
const renewRefreshToken = async (req: Request, res: Response) => {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) {
        return res.status(401).json({ error: 'Access denied. No refresh token provided.' });
    }

    try {
        const decoded: any = jwt.verify(oldRefreshToken, 'your_refresh_token_secret');
        const role = decoded.role;
        const id = decoded.adminId;
        let query = '';

        if (role === 'superadmin') {
            query = 'SELECT * FROM secretkeysuperadmin WHERE superAdminId = ?';
        } else if (role === 'admin') {
            query = 'SELECT * FROM secretkeyadmin WHERE adminId = ?';
        } else {
            return res.status(403).json({ error: 'Access denied. Invalid role.' });
        }

        const [results]:any = await connection.query(query, [id]);

        if (!results.length) {
            return res.status(403).json({ error: 'Access denied. Invalid refresh token.' });
        }

        // توليد Refresh Token جديد وتخزينه
        const newRefreshToken = generateRefreshToken({ role, adminId: id });
        // تحديث Refresh Token في قاعدة البيانات
        const updateQuery = role === 'superadmin'
            ? 'UPDATE secretkeysuperadmin SET refreshToken = ? WHERE superAdminId = ?'
            : 'UPDATE secretkeyadmin SET refreshToken = ? WHERE adminId = ?';

        await connection.query(updateQuery, [newRefreshToken, id]);

        // إرسال Refresh Token الجديد إلى العميل
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
        res.json({ refreshToken: newRefreshToken });
    } catch (err) {
        console.error(err);
        res.status(403).json({ error: 'Invalid refresh token.' });
    }
};

export default renewRefreshToken;
