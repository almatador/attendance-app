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
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = express_1.default.Router();
const jwtSecret = 'your_jwt_secret'; // Replace with your own secret key
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
const verifyPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compare(password, hashedPassword);
});
userRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const query = `SELECT * FROM user WHERE username = ?`;
    database_1.default.query(query, [username], (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
        }
        if (!results.length) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
        }
        const user = results[0];
        const match = yield verifyPassword(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
        }
        const token = jsonwebtoken_1.default.sign({ adminId: user.id }, jwtSecret, { expiresIn: '1h' });
        const insertTokenQuery = `INSERT INTO SecretKeyuser (userId, token) VALUES (?, ?)`;
        database_1.default.query(insertTokenQuery, [user.id, token], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
            }
            res.status(200).json({ token });
        });
    }));
}));
userRouter.delete('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.default = userRouter;
//# sourceMappingURL=userauth.js.map