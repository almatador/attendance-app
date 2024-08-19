import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise'; // استخدام mysql2/promise
import connection from '../routes/database'; // تأكد من أن هذا يستخدم mysql2/promise

interface CustomRequest extends Request {
    user?: any;
}

const verifyAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.authToken;
    console.log(token);
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded: any = jwt.verify(token, 'your_jwt_secret');
        console.log(decoded);
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

        // استخدام طريقة promise-based query
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(403).json({ error: 'Access denied. Not authorized.' });
            }

            req.user = results;
            console.log("token done")
            next();
        })
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid token.' });
    }
};

export default verifyAdmin;
