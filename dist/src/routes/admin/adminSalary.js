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
const adminSalaryRouter = express_1.default.Router();
// Update an existing salary record
adminSalaryRouter.put('/update/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;
    const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;
    const selectQuery = `SELECT * FROM salary WHERE id = ?`;
    database_1.default.query(selectQuery, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching salary record.' });
        }
        const updateQuery = `
      UPDATE salary
      SET basicSalary = ?, increase = ?, projectPercentage = ?, emergencyDeductions = ?, netSalary = ?, exchangeDate = ?
      WHERE id = ?
    `;
        database_1.default.query(updateQuery, [basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate), id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating salary record.' });
            }
            res.status(200).json({ id, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate });
        });
    });
});
adminSalaryRouter.post('/is_captured/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId, 10);
    const { is_captured } = req.body;
    try {
        // استرجاع تفاصيل المستخدم
        const [rows] = yield database_1.default.promise().query('SELECT * FROM salary WHERE userId = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // إذا كانت الحالة هي "paid"
        if (is_captured === 'paid') {
            // انتظر لمدة يومين (48 ساعة)
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                // تحديث حالة القبض إلى الشهر الجديد
                const updateQuery = 'UPDATE salary SET month = month + 1 WHERE userId = ?';
                yield database_1.default.promise().query(updateQuery, [userId]);
                return res.json({ message: 'User status updated and moved to the next month' });
            }), 48 * 60 * 60 * 1000); // 48 ساعة بالمللي ثانية
        }
        else {
            return res.json({ message: 'No update needed. The status is still pending.' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}));
// Get all salary records
adminSalaryRouter.get('/all', (req, res) => {
    const query = `SELECT * FROM salary`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching salary records.' });
        }
        res.status(200).json(results);
    });
});
adminSalaryRouter.get('/all/:adminId', (req, res) => {
    const { adminId } = req.params;
    const query = `
    SELECT s.*
    FROM salary s
    JOIN user u ON s.userId = u.id
    WHERE u.adminId = ?
  `;
    database_1.default.query(query, [adminId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching salary records.' });
        }
        // Cast results to Salary[] if needed, depending on the actual returned data
        const salaries = results;
        if (salaries.length === 0) {
            return res.status(404).json({ message: 'No salary records found for this admin.' });
        }
        res.status(200).json(salaries);
    });
});
exports.default = adminSalaryRouter;
//# sourceMappingURL=adminSalary.js.map