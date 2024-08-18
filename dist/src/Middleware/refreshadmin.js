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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../routes/database"));
const body_parser_1 = __importDefault(require("body-parser"));
const refreshadminRouter = express_1.default.Router();
const jwtSecret = 'your_jwt_secret'; // تأكد من أن السر موجود في مكان آمن مثل ملفات البيئة
const refreshSecret = 'your_refresh_secret'; // سر لتوقيع توكن التحديث
refreshadminRouter.use(body_parser_1.default.json()); // لتحليل محتوى JSON
refreshadminRouter.post('/refresh-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken; // تأكد من استخدام refreshToken وليس authToken
    if (!refreshToken) {
        return res.status(401).json({ error: 'Access denied. No refresh token provided.' });
    }
    try {
        // تحقق من صحة توكن التحديث
        const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshSecret);
        const { adminId, role } = decoded;
        // تحقق من وجود توكن التحديث في قاعدة البيانات
        const [rows] = yield database_1.default.execute(`SELECT * FROM SecretKeyAdmin WHERE adminId = ? AND refreshToken = ?`, [adminId, refreshToken]);
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Invalid refresh token.' });
        }
        // إنشاء توكن جديد
        const newToken = jsonwebtoken_1.default.sign({ adminId, role }, jwtSecret, { expiresIn: '1h' });
        res.cookie('authToken', newToken, { httpOnly: true, secure: true });
        return res.status(200).json({ token: newToken });
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid refresh token.', message: err.message });
    }
}));
exports.default = refreshadminRouter;
//# sourceMappingURL=refreshadmin.js.map