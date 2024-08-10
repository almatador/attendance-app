"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database")); // Assuming you have a connection configured
const Middlewaresuperadmin_1 = __importDefault(require("../../Middleware/Middlewaresuperadmin")); // افترض أن هذا هو مسار الـ Middleware
const planRouter = express_1.default.Router();
planRouter.use(express_1.default.json());
// حماية جميع المسارات بسوبر أدمن Middleware
planRouter.use(Middlewaresuperadmin_1.default);
// إنشاء خطة جديدة
planRouter.post('/create', (req, res) => {
    const { name, description, price, duration } = req.body;
    const query = `
    INSERT INTO plan (name, description, price, duration)
    VALUES (?, ?, ?, ?)
  `;
    database_1.default.query(query, [name, description, price, duration], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while creating the plan.' });
        }
        res.status(201).json({ name, description, price, duration });
    });
});
// الحصول على جميع الخطط
planRouter.get('/', (req, res) => {
    const query = `SELECT * FROM plan`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching the plans.' });
        }
        res.status(200).json(results);
    });
});
// الحصول على خطة بواسطة ID
planRouter.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const query = `SELECT * FROM plan WHERE id = ?`;
    database_1.default.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while fetching the plan.' });
        }
        // Type assertion to RowDataPacket[]
        const rows = results;
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        }
        else {
            res.status(404).json({ error: 'Plan not found.' });
        }
    });
});
// تحديث خطة
planRouter.put('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, description, price, duration } = req.body;
    const query = `
    UPDATE plan
    SET name = ?, description = ?, price = ?, duration = ?
    WHERE id = ?
  `;
    database_1.default.query(query, [name, description, price, duration, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while updating the plan.' });
        }
        res.status(200).json({ id, name, description, price, duration });
    });
});
// حذف خطة
planRouter.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const query = `DELETE FROM plan WHERE id = ?`;
    database_1.default.query(query, [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while deleting the plan.' });
        }
        res.status(204).send();
    });
});
exports.default = planRouter;
//# sourceMappingURL=plans.js.map