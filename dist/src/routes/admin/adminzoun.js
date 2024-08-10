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
const Middlewareadmin_1 = __importDefault(require("../../Middleware/Middlewareadmin"));
const adminzoun = express_1.default.Router();
adminzoun.use(Middlewareadmin_1.default);
// إضافة زون جديدة
adminzoun.post('/zones', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, center_latitude, center_longitude, radius, adminId } = req.body;
    try {
        const [result] = yield database_1.default.execute('INSERT INTO Zones (name, center_latitude, center_longitude, radius, adminId) VALUES (?, ?, ?, ?, ?)', [name, center_latitude, center_longitude, radius, adminId]);
        res.status(201).json({ id: result.ID, name, center_latitude, center_longitude, radius });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding new zone.' });
    }
}));
adminzoun.put('/zones/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, center_latitude, center_longitude, radius } = req.body;
    try {
        yield database_1.default.execute('UPDATE Zones SET name = ?, center_latitude = ?, center_longitude = ?, radius = ? WHERE id = ?', [name, center_latitude, center_longitude, radius, id]);
        res.status(200).json({ id, name, center_latitude, center_longitude, radius });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating zone.' });
    }
}));
// حذف زون
adminzoun.delete('/zones/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield database_1.default.execute('DELETE FROM Zones WHERE id = ?', [id]);
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting zone.' });
    }
}));
// الحصول على جميع الزونات
adminzoun.get('/zones', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const zones = yield database_1.default.execute('SELECT * FROM Zones');
        res.status(200).json(zones);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching zones.' });
    }
}));
exports.default = adminzoun;
//# sourceMappingURL=adminzoun.js.map