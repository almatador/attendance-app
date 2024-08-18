"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const Middlewareuser_1 = __importDefault(require("./../../Middleware/Middlewareuser"));
const userVacationRouter = express_1.default.Router();
userVacationRouter.post('/create', Middlewareuser_1.default, (req, res) => {
    const { userId, startDate, endDate, reason, type } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const userQuery = 'SELECT * FROM Users WHERE id = ?';
    database_1.default.query(userQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error checking user.' });
        }
        let leaveCheckQuery = '';
        if (type === 'Annual') {
            leaveCheckQuery = 'SELECT annualLeaveDays FROM Users WHERE id = ?';
        }
        else if (type === 'Emergency') {
            leaveCheckQuery = 'SELECT emergencyLeaveDays FROM Users WHERE id = ?';
        }
        else {
            return res.status(400).json({ error: 'Invalid leave type.' });
        }
        database_1.default.query(leaveCheckQuery, [userId], (err, leaveResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error checking leave balance.' });
            }
            if (leaveResults.length > 0) {
                const leaveDays = type === 'Annual'
                    ? leaveResults[0].annualLeaveDays
                    : leaveResults[0].emergencyLeaveDays;
                if (leaveDays && leaveDays < duration) {
                    return res.status(400).json({ error: `Insufficient ${type.toLowerCase()} leave days.` });
                }
                const insertQuery = 'INSERT INTO Vacations (userId, startDate, endDate, reason, type) VALUES (?, ?, ?, ?, ?)';
                database_1.default.query(insertQuery, [userId, startDate, endDate, reason, type], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Error creating vacation request.' });
                    }
                    res.status(201).json({ message: 'Vacation request created successfully.' });
                });
            }
            else {
                return res.status(404).json({ error: 'User not found or no leave data available.' });
            }
        });
    });
});
exports.default = userVacationRouter;
//# sourceMappingURL=vacations.js.map