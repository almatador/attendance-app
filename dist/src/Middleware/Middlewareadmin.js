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
const database_1 = __importDefault(require("../routes/database"));
const console_1 = require("console");
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.authToken;
    console.log(token);
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'your_jwt_secret');
        console.log(decoded);
        const role = decoded.role;
        const id = decoded.adminId;
        let tableName = '';
        if (role === 'superadmin') {
            tableName = 'SecretKeySuperadmin';
        }
        else if (role === 'admin') {
            tableName = 'SecretKeyadmin';
        }
        else {
            return res.status(403).json({ error: 'Access denied. Invalid role.' });
        }
        const [rows] = yield database_1.default.execute(`SELECT * FROM ${tableName} WHERE adminId = ?`, [id]);
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Access denied. Not authorized.' });
        }
        req.user = rows[0];
        next();
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Invalid token.' });
        console.log(console_1.error);
    }
});
exports.default = verifyAdmin;
//# sourceMappingURL=Middlewareadmin.js.map