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
const Middlewareadmin_1 = __importDefault(require("./../../Middleware/Middlewareadmin"));
const verifySubscription_1 = __importDefault(require("./../../Middleware/verifySubscription "));
const shiftRouter = express_1.default.Router(); // استخدام Router بدلاً من express()
shiftRouter.use(Middlewareadmin_1.default, verifySubscription_1.default);
// مسار لإضافة فترة عمل
shiftRouter.post('/shifts', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, startTime, endTime, adminId } = req.body;
    try {
        const [result] = yield database_1.default.promise().query('INSERT INTO shift (name, startTime, endTime, adminId) VALUES (?, ?, ?, ?)', [name, startTime, endTime, adminId]);
        console.log('Insert result:', result);
        if (result && result.insertId) {
            res.status(201).json({ message: 'Shift added successfully', shiftId: result.insertId });
        }
        else {
            res.status(500).json({ error: 'Shift added successfully, but no insertId was returned.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding shift', details: error.message });
    }
}));
// مسار لتحديث فترة عمل
shiftRouter.put('/shifts/:shiftId', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shiftId } = req.params;
    const { name, startTime, endTime, adminId } = req.body;
    try {
        const [result] = yield database_1.default.promise().query('UPDATE shift SET name = ?, startTime = ?, endTime = ?, adminId = ? WHERE id = ?', [name, startTime, endTime, adminId, shiftId]);
        if (result && result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shift not found' });
        }
        res.status(200).json({ message: 'Shift updated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating shift', details: error.message });
    }
}));
// مسار لحذف فترة عمل
shiftRouter.delete('/shifts/:shiftId', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shiftId } = req.params;
    try {
        const [result] = yield database_1.default.promise().query('DELETE FROM shift WHERE id = ?', [shiftId]);
        if (result && result.affectedRows === 0) {
            return res.status(404).json({ error: 'Shift not found' });
        }
        res.status(200).json({ message: 'Shift deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting shift', details: error.message });
    }
}));
shiftRouter.post('/shifts/:shiftId/users', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shiftId } = req.params;
    const { userId, shiftDate } = req.body;
    try {
        // 1. التحقق من أن المستخدم ينتمي إلى نفس الـ adminId الخاص بفترة العمل
        const [shiftRows] = yield database_1.default.promise().query('SELECT adminId FROM shift WHERE id = ?', [shiftId]);
        const shift = shiftRows[0];
        if (!shift) {
            return res.status(404).json({ error: 'Shift not found' });
        }
        const [userRows] = yield database_1.default.promise().query('SELECT * FROM User WHERE id = ? AND adminId = ?', [userId, shift.adminId]);
        const user = userRows[0];
        if (!user) {
            return res.status(403).json({ error: 'User does not belong to the same admin' });
        }
        // 2. إدراج المستخدم إلى فترة العمل
        const [result] = yield database_1.default.promise().query('INSERT INTO usershift (userId, shiftId, shiftDate) VALUES (?, ?, ?)', [userId, shiftId, shiftDate]);
        if (result && result.insertId) {
            res.status(201).json({ message: 'User added to shift successfully', userShiftId: result.insertId });
        }
        else {
            res.status(500).json({ error: 'User added to shift successfully, but no insertId was returned.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding user to shift', details: error.message });
    }
}));
// مسار للحصول على معلومات فترة عمل مع المستخدمين
shiftRouter.get('/shifts/:shiftId/users', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shiftId } = req.params;
    try {
        const [shiftRows] = yield database_1.default.promise().query('SELECT * FROM shift WHERE id = ?', [shiftId]);
        const shift = shiftRows[0];
        if (!shift) {
            return res.status(404).json({ error: 'Shift not found' });
        }
        const [userShiftRows] = yield database_1.default.promise().query(`SELECT u.id, u.name, us.shiftDate 
       FROM User u
       JOIN usershift us ON u.id = us.userId 
       WHERE us.shiftId = ?`, [shiftId]);
        res.status(200).json({ shift, users: userShiftRows });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching shift with users', details: error.message });
    }
}));
// مسار للحصول على جميع فترات العمل مع المستخدمين
shiftRouter.get('/shifts', Middlewareadmin_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [shifts] = yield database_1.default.promise().query('SELECT * FROM shift');
        const shiftWithUsers = yield Promise.all(shifts.map((shift) => __awaiter(void 0, void 0, void 0, function* () {
            const [userShiftRows] = yield database_1.default.promise().query(`SELECT u.id, u.name, us.shiftDate 
           FROM User u
           JOIN usershift us ON u.id = us.userId 
           WHERE us.shiftId = ?`, [shift.id]);
            return Object.assign(Object.assign({}, shift), { users: userShiftRows });
        })));
        res.status(200).json({ shifts: shiftWithUsers });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching shifts with users', details: error.message });
    }
}));
exports.default = shiftRouter;
//# sourceMappingURL=adminshift.js.map