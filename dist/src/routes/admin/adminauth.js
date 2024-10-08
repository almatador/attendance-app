"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import JWT library
const Middlewareadmin_1 = __importDefault(require("./../../Middleware/Middlewareadmin"));
const uploud_1 = __importDefault(require("./../../Middleware/uploud"));
const adminRouter = express_1.default.Router();
const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // Replace with your own secret key
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
// دالة لتشفير كلمة المرور
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
});
// دالة للتحقق من كلمة المرور
const verifyPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compare(password, hashedPassword);
});
adminRouter.post('/create', uploud_1.default.single('profileImage'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, username, email, phoneNumber, password, role = 'admin' } = req.body;
    const profileImage = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename; // اسم الملف الذي تم رفعه
    if (!name || !username || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوب' });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const query = `
            INSERT INTO admin (name, username, email, phoneNumber, password, role, profileImage)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        database_1.default.query(query, [name, username, email, phoneNumber, hashedPassword, role, profileImage], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدير.' });
            }
            const newId = results.insertId;
            res.status(201).json({
                id: newId,
                name,
                username,
                email,
                phoneNumber,
                role,
                profileImage
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
    }
}));
adminRouter.put('/update/:id', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, username, email, phoneNumber, password } = req.body;
    try {
        let query = `
      UPDATE admin
      SET name = ?, username = ?, email = ?, phoneNumber = ?
    `;
        const params = [name, username, email, phoneNumber];
        if (password) {
            const hashedPassword = yield hashPassword(password);
            query += `, password = ? WHERE id = ?`;
            params.push(hashedPassword, id);
        }
        else {
            query += ` WHERE id = ?`;
            params.push(id);
        }
        database_1.default.query(query, params, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating Admin.' });
            }
            res.status(200).json({ id, name, username, email, phoneNumber });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
    }
}));
adminRouter.delete('/delete/:id', Middlewareadmin_1.default, (req, res) => {
    const { id } = req.params;
    const query = `
    DELETE FROM Admin
    WHERE id = ?
  `;
    database_1.default.query(query, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error deleting Admin.' });
        }
        res.status(204).send();
    });
});
adminRouter.post('/user/create', Middlewareadmin_1.default, uploud_1.default.single('profileImage'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, adminId, jobTitle, emergencyLeaveDays, annualLeaveDays, profileImage } = req.body.user;
    const { period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate, is_captured = 'pending' } = req.body.salary;
    if (!name || !email || !password || !adminId || !jobTitle || !period || !basicSalary) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        // Hash the password
        const hashedPassword = yield hashPassword(password);
        // Check admin's subscription plan
        const [subscriptionRows] = yield database_1.default.promise().query(`SELECT p.users AS maxUsers 
       FROM subscription s 
       JOIN plan p ON s.planId = p.id 
       WHERE s.adminId = ? AND s.endDate > NOW()`, [adminId]);
        if (subscriptionRows.length === 0) {
            return res.status(400).json({ error: 'Admin is not subscribed to any plan or subscription has expired.' });
        }
        const { maxUsers } = subscriptionRows[0];
        // Check the current number of users
        const [userCountRows] = yield database_1.default.promise().query('SELECT COUNT(*) AS count FROM User WHERE adminId = ?', [adminId]);
        const { count } = userCountRows[0];
        if (count >= maxUsers) {
            return res.status(400).json({ error: 'Cannot create more users. The maximum number of users for this plan has been reached.' });
        }
        // Insert the new user and create salary record in a transaction
        try {
            const userQuery = `
        INSERT INTO User (name, email, password, jobTitle, adminId, emergencyLeaveDays, annualLeaveDays,profileImage)
        VALUES (?, ?, ?, ?, ?, ?, ?,?)
      `;
            const [userResult] = yield database_1.default.execute(userQuery, [name, email, hashedPassword, jobTitle, adminId, emergencyLeaveDays, annualLeaveDays, profileImage]);
            const newUserId = userResult.insertId;
            const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;
            const salaryQuery = `
        INSERT INTO salary (userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate, is_captured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            yield database_1.default.execute(salaryQuery, [newUserId, new Date(period), basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate), is_captured]);
            yield database_1.default.commit();
            res.status(201).json({ id: newUserId, name, email, jobTitle, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate, is_captured });
        }
        catch (error) {
            throw error;
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the user and salary record.' });
    }
}));
adminRouter.put('/user/update/:id', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, password, jobTitle } = req.body;
    let query = `
    UPDATE User
    SET name = ?, email = ?, jobTitle = ?
  `;
    const params = [name, email, jobTitle];
    if (password) {
        const hashedPassword = yield hashPassword(password);
        query += `, password = ? WHERE id = ?`;
        params.push(hashedPassword, id);
    }
    else {
        query += ` WHERE id = ?`;
        params.push(id);
    }
    database_1.default.query(query, params, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error updating User.' });
        }
        res.status(200).json({ id, name, email, jobTitle });
    });
}));
adminRouter.delete('/user/delete/:id', Middlewareadmin_1.default, (req, res) => {
    const { id } = req.params;
    const query = `
    DELETE FROM User
    WHERE id = ?
  `;
    database_1.default.query(query, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error deleting User.' });
        }
        res.status(204).send();
    });
});
adminRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const query = `SELECT * FROM admin WHERE email = ?`;
    database_1.default.query(query, [email], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
        }
        if (!results.length) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
        }
        const admin = results[0];
        const match = yield verifyPassword(password, admin.password);
        if (!match) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
        }
        const token = jsonwebtoken_1.default.sign({ adminId: admin.id, role: admin.role }, jwtSecret, { expiresIn: '7d' });
        let insertTokenQuery = '';
        if (admin.role === 'superadmin') {
            insertTokenQuery = `INSERT INTO secretkeysuperadmin (superAdminId, token) VALUES (?, ?)`;
        }
        else {
            insertTokenQuery = `INSERT INTO secretkeyadmin (adminId, token) VALUES (?, ?)`;
        }
        database_1.default.query(insertTokenQuery, [admin.id, token], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
            }
            res.cookie('authToken', token, { httpOnly: true, secure: true });
            res.status(200).json({ token: token, admin: admin });
        });
    }));
}));
adminRouter.get('/users/:adminId', Middlewareadmin_1.default, (req, res) => {
    const { adminId } = req.params;
    const query = `SELECT * FROM user WHERE adminId = ?`;
    database_1.default.query(query, [adminId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Error fetching users.',
                message: err.message,
            });
        }
        // Assuming `results` is an array of rows, we map them to the `User` interface
        const users = results.map((row) => ({
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
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken;
    console.log(token);
    if (!token) {
        return res.status(400).json({ error: 'لم يتم العثور على التوكن.' });
    }
    const deleteTokenQuery = `DELETE FROM SecretKeyAdmin WHERE token = ?`;
    database_1.default.query(deleteTokenQuery, [token], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
        }
        res.clearCookie('authToken');
        res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
    });
});
exports.default = adminRouter;
//# sourceMappingURL=adminauth.js.map