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
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../database")); // تأكد من أن هذا المسار صحيح
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import JWT library
const superAdminRouter = express_1.default.Router();
// Replace with your own secret key
// توليد مفتاح سري
const generateSecretKey = () => crypto_1.default.randomBytes(64).toString('hex');
const jwtSecret = generateSecretKey();
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
});
const verifyPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compare(password, hashedPassword);
});
superAdminRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, phoneNumber, password } = req.body;
    if (!name || !username || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    try {
        const hashedPassword = yield hashPassword(password);
        const query = `
      INSERT INTO Admin (name, username, email, phoneNumber, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const role = 'superadmin';
        database_1.default.query(query, [name, username, email, phoneNumber, hashedPassword, role], (err, results) => {
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
                role
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
    }
}));
superAdminRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const query = `SELECT * FROM Admim WHERE username = ?`;
    database_1.default.query(query, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
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
        const token = jsonwebtoken_1.default.sign({ adminId: admin.id }, jwtSecret, { expiresIn: '1h' });
        const insertTokenQuery = `INSERT INTO secretkeysuperadmin (superAdminId, token) VALUES (?, ?)`;
        database_1.default.query(insertTokenQuery, [admin.id, token], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
            }
            res.status(200).json({ admin, token });
        });
    }));
}));
// تسجيل الخروج
superAdminRouter.post('/logout', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'التوكن مطلوب.' });
    }
    const deleteTokenQuery = `DELETE FROM SecretKeySuperadmin WHERE token = ?`;
    database_1.default.query(deleteTokenQuery, [token], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
        }
        res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
    });
});
superAdminRouter.get('/getall', (req, res) => {
    const query = `SELECT * FROM Admin WHERE role = 'superadmin'`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching superadmin requests.' });
        }
        res.status(200).json(results);
    });
});
exports.default = superAdminRouter;
//# sourceMappingURL=superadmin.js.map