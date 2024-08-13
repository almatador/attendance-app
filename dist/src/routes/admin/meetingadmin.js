"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const adminMeetingRouter = express_1.default.Router();
adminMeetingRouter.use(express_1.default.json());
// Create a new meeting
adminMeetingRouter.post('/create', (req, res) => {
    const { title, date, time, place, audience, notes, userId } = req.body;
    const query = `
    INSERT INTO meeting (title, date, time, place, audience, notes, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    database_1.default.query(query, [title, new Date(date), new Date(time), place, audience, notes, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error creating meeting.' });
        }
        res.status(201).json({
            title,
            date,
            time,
            place,
            audience,
            notes,
            userId,
        });
    });
});
// Update an existing meeting
adminMeetingRouter.put('/update/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, date, time, place, audience, notes, status } = req.body;
    const selectQuery = `SELECT * FROM meeting WHERE id = ?`;
    database_1.default.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching meeting.' });
        }
        const updateQuery = `
      UPDATE meeting
      SET title = ?, date = ?, time = ?, place = ?, audience = ?, notes = ?, status = ?
      WHERE id = ?
    `;
        database_1.default.query(updateQuery, [title, new Date(date), new Date(time), place, audience, notes, status, id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating meeting.' });
            }
            res.status(200).json({
                id,
                title,
                date,
                time,
                place,
                audience,
                notes,
                status,
            });
        });
    });
});
// Get all meetings
adminMeetingRouter.get('/all', (req, res) => {
    const query = `SELECT * FROM meeting`;
    database_1.default.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching meetings.' });
        }
        res.status(200).json(results);
    });
});
exports.default = adminMeetingRouter;
//# sourceMappingURL=meetingadmin.js.map