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
adminRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, phoneNumber, password } = req.body;
    if (!name || !username || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    try {
        const hashedPassword = yield hashPassword(password);
        const query = `
      INSERT INTO Admin (name, username, email, phoneNumber, password)
      VALUES (?, ?, ?, ?, ?)
    `;
        database_1.default.query(query, [name, username, email, phoneNumber, hashedPassword], (err, results) => {
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
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة كلمة المرور.' });
    }
}));
adminRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, username, email, phoneNumber, password } = req.body;
    try {
        let query = `
      UPDATE Admin
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
adminRouter.delete('/delete/:id', (req, res) => {
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
adminRouter.post('/user/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, adminId, jobTitle } = req.body;
    // Ensure all required fields are provided
    if (!name || !email || !password || !adminId || !jobTitle) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const hashedPassword = yield hashPassword(password);
    const query = `
    INSERT INTO User (name, email, password, jobTitle, adminId)
    VALUES (?, ?, ?, ?, ?)
  `;
    database_1.default.query(query, [name, email, hashedPassword, jobTitle, adminId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error creating User.' });
        }
        const newId = results.insertId;
        res.status(201).json({ id: newId, name, email, password, adminId, jobTitle });
    });
}));
adminRouter.put('/user/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
adminRouter.delete('/user/delete/:id', (req, res) => {
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
    const { username, password } = req.body;
    const query = `SELECT * FROM Admin WHERE username = ?`;
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
        const insertTokenQuery = `INSERT INTO SecretKeyAdmin (adminId, token) VALUES (?, ?)`;
        database_1.default.query(insertTokenQuery, [admin.id, token], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
            }
            res.status(200).json({ token });
        });
    }));
}));
// تسجيل الخروج
adminRouter.post('/logout', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'التوكن مطلوب.' });
    }
    const deleteTokenQuery = `DELETE FROM SecretKeyAdmin WHERE token = ?`;
    database_1.default.query(deleteTokenQuery, [token], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
        }
        res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
    });
});
exports.default = adminRouter;
//# sourceMappingURL=adminauth.js.map