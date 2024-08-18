import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import connection from '../routes/database';
import { error } from 'console';

interface CustomRequest extends Request {
    user?: any;
}

const verifyAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.authToken;
    console.log(token)
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded: any = jwt.verify(token, 'your_jwt_secret');
        console.log(decoded)
        const role = decoded.role;
        const id = decoded.adminId
        let tableName = '';

        if (role === 'superadmin') {
            tableName = 'SecretKeySuperadmin';
        } else if (role === 'admin') {
            tableName = 'SecretKeyadmin';
        } else {
            return res.status(403).json({ error: 'Access denied. Invalid role.' });
        }

        const [rows]: any = await connection.execute(
            `SELECT * FROM ${tableName} WHERE adminId = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. Not authorized.' });
        }

        req.user = rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid token.' });
        console.log(error)
    }
};

export default verifyAdmin;
