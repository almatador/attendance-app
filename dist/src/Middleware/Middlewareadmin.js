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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // تأكد من أنك تستخدم JWT للتحقق من التوكن
const database_1 = __importDefault(require("../routes/database"));
// Middleware للتحقق من السوبر أدمن
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // افترض أن التوكن يأتي في رأس Authorization
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'your_jwt_secret'); // استخدم السر الخاص بك
        // تحقق من أن السوبر أدمن موجود في قاعدة البيانات
        const [rows] = yield database_1.default.execute('SELECT * FROM admin WHERE id = ?', [decoded.id]);
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. Not a admin.' });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid token.' });
    }
});
exports.default = verifyAdmin;
//# sourceMappingURL=Middlewareadmin.js.map