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
const adminzoun = express_1.default.Router();
// إضافة زون جديدة
adminzoun.post('/zones/:adminId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, center_latitude, center_longitude, radius } = req.body;
    const { adminId } = req.params;
    if (!name || !center_latitude || !center_longitude || !radius || !radius || !adminId) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    try {
        const query = `
    INSERT INTO zones (name, center_latitude, center_longitude, radius, adminId)
    VALUES (?, ?, ?, ?, ?)
  `;
        database_1.default.query(query, [name, center_latitude, center_longitude, radius, adminId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المدير.' });
            }
            const newId = results.insertId;
            res.status(201).json({
                id: newId,
                name,
                center_latitude,
                center_longitude,
                radius,
                adminId
            });
        });
    }
    catch (error) {
        console.error('Error in POST /zones:', error);
        res.status(500).json({
            error: 'Error adding new zone.',
            message: error.message
        });
    }
}));
// تحديث زون
adminzoun.put('/zones/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, center_latitude, center_longitude, radius } = req.body;
    // التحقق من وجود جميع الحقول
    if (!name || !center_latitude || !center_longitude || !radius) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const query = 'UPDATE zones SET name = ?, center_latitude = ?, center_longitude = ?, radius = ? WHERE id = ?';
    const params = [name, center_latitude, center_longitude, radius, id];
    try {
        database_1.default.query(query, params, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating User.' });
            }
            res.status(200).json({ id, name, center_latitude, center_longitude, radius });
        });
        //   const [result] = await connection.execute<mysql.OkPacket>(query, [name, center_latitude, center_longitude, radius, id]);
        //   if ((result as mysql.OkPacket).affectedRows === 0) {
        //     return res.status(404).json({ error: 'Zone not found.' });
        //   }
        //   res.status(200).json({ id, name, center_latitude, center_longitude, radius });
    }
    catch (error) {
        console.error('Error in PUT /zones/:id:', error);
        res.status(500).json({ error: 'Error updating zone.', message: error.message });
    }
}));
// حذف زون
adminzoun.delete('/zones/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const query = `
    DELETE FROM zones
    WHERE id = ?
  `;
    database_1.default.query(query, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error deleting User.' });
        }
        res.status(204).send();
    });
}));
// // الحصول على جميع الزونات
adminzoun.get('/zones/:adminId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminId } = req.params;
    const query = 'SELECT * FROM zones WHERE adminId = ?';
    database_1.default.query(query, [adminId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching vacation requests.' });
        }
        res.status(200).json(results);
    });
}));
exports.default = adminzoun;
//# sourceMappingURL=adminzoun.js.map