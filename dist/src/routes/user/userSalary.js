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
const Middlewareuser_1 = __importDefault(require("./../../Middleware/Middlewareuser"));
const userSalaryRouter = express_1.default.Router();
// Get all salary records for a user
userSalaryRouter.get('/user/:userId', Middlewareuser_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId, 10);
    const { token } = req.headers; // التوكن يتم إرساله كجزء من الهيدر
    if (!token) {
        return res.status(400).json({ error: 'التوكن مطلوب.' });
    }
    try {
        // التحقق من صحة التوكن
        const tokenQuery = 'SELECT * FROM secretKeyuser WHERE token = ? AND userId = ?';
        database_1.default.query(tokenQuery, [token, userId], (err, tokenResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error verifying token.' });
            }
            // إذا كان التوكن صالحًا، جلب سجلات الرواتب
            const salaryQuery = 'SELECT * FROM Salary WHERE userId = ?';
            database_1.default.query(salaryQuery, [userId], (err, salaryResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error fetching salary records.' });
                }
                res.status(200).json(salaryResults);
            });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching salary records.' });
    }
}));
exports.default = userSalaryRouter;
//# sourceMappingURL=userSalary.js.map