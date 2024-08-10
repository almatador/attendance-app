"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const adminSalaryRouter = express_1.default.Router();
adminSalaryRouter.post('/create', (req, res) => {
    const { userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;
    const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;
    const query = `
    INSERT INTO salary (userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
    database_1.default.query(query, [userId, new Date(period), basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, new Date(exchangeDate)], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error creating salary record.' });
        }
        res.status(201).json({ id: userId, userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, netSalary, exchangeDate });
    });
});
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
exports.default = adminSalaryRouter;
//# sourceMappingURL=adminSalary.js.map