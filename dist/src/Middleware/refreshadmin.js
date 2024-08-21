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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../routes/database")); // تأكد من المسار الصحيح لملف قاعدة البيانات
// توليد Refresh Token جديد
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign(user, 'your_refresh_token_secret', { expiresIn: '7d' }); // صلاحية 7 أيام كمثال
};
// مسار لتجديد الـRefresh Token
const renewRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const oldRefreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!oldRefreshToken) {
        return res.status(401).json({ error: 'Access denied. No refresh token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(oldRefreshToken, 'your_refresh_token_secret');
        const role = decoded.role;
        const id = decoded.adminId;
        let query = '';
        if (role === 'superadmin') {
            query = 'SELECT * FROM secretkeysuperadmin WHERE superAdminId = ?';
        }
        else if (role === 'admin') {
            query = 'SELECT * FROM secretkeyadmin WHERE adminId = ?';
        }
        else {
            return res.status(403).json({ error: 'Access denied. Invalid role.' });
        }
        const [results] = yield database_1.default.query(query, [id]);
        if (!results.length) {
            return res.status(403).json({ error: 'Access denied. Invalid refresh token.' });
        }
        // توليد Refresh Token جديد وتخزينه
        const newRefreshToken = generateRefreshToken({ role, adminId: id });
        // تحديث Refresh Token في قاعدة البيانات
        const updateQuery = role === 'superadmin'
            ? 'UPDATE secretkeysuperadmin SET refreshToken = ? WHERE superAdminId = ?'
            : 'UPDATE secretkeyadmin SET refreshToken = ? WHERE adminId = ?';
        yield database_1.default.query(updateQuery, [newRefreshToken, id]);
        // إرسال Refresh Token الجديد إلى العميل
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
        res.json({ refreshToken: newRefreshToken });
    }
    catch (err) {
        console.error(err);
        res.status(403).json({ error: 'Invalid refresh token.' });
    }
});
exports.default = renewRefreshToken;
//# sourceMappingURL=refreshadmin.js.map