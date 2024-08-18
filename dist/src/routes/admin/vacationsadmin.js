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
const verifySubscription_1 = __importDefault(require("./../../Middleware/verifySubscription "));
const adminVacationRouter = express_1.default.Router();
adminVacationRouter.use(verifySubscription_1.default);
// Update a vacation request status
adminVacationRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }
    const selectVacationQuery = `SELECT * FROM vacation WHERE id = ?`;
    try {
        const [results] = yield database_1.default.promise().query(selectVacationQuery, [id]);
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: 'Vacation request not found.' });
        }
        const vacation = results[0];
        const updateVacationQuery = `UPDATE vacation SET status = ? WHERE id = ?`;
        yield database_1.default.promise().query(updateVacationQuery, [status, id]);
        if (status === 'approved') {
            const start = new Date(vacation.startDate);
            const end = new Date(vacation.endDate);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            // Add reservation for the requested days
            const reserveQuery = `INSERT INTO reservations (userId, startDate, endDate) VALUES (?, ?, ?)`;
            yield database_1.default.promise().query(reserveQuery, [vacation.userId, vacation.startDate, vacation.endDate]);
            // Check attendance for the vacation days
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const checkAttendanceQuery = `SELECT * FROM attendance WHERE userId = ? AND date = ?`;
                const [attendanceResults] = yield database_1.default.promise().query(checkAttendanceQuery, [vacation.userId, date.toISOString().split('T')[0]]);
                if (attendanceResults.length === 0) {
                    // Deduct one day from the employee's leave balance
                    const updateUserQuery = vacation.type === 'Annual'
                        ? `UPDATE user SET annualLeaveDays = annualLeaveDays - 1 WHERE id = ?`
                        : `UPDATE user SET emergencyLeaveDays = emergencyLeaveDays - 1 WHERE id = ?`;
                    yield database_1.default.promise().query(updateUserQuery, [vacation.userId]);
                }
            }
        }
        res.status(200).json(Object.assign(Object.assign({}, vacation), { status }));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating vacation request.' });
    }
}));
// Get all vacation requests
adminVacationRouter.get('/all', (req, res) => {
    const query = `SELECT * FROM vacation`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching vacation requests.' });
        }
        res.status(200).json(results);
    });
});
exports.default = adminVacationRouter;
//# sourceMappingURL=vacationsadmin.js.map