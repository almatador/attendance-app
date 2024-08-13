"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const userMeetingRouter = express_1.default.Router();
userMeetingRouter.use(express_1.default.json());
// Get all meetings for a user
userMeetingRouter.get('/user/:userId', (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const query = 'SELECT * FROM Meetings WHERE userId = ?';
    database_1.default.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching meetings.' });
        }
        res.status(200).json(results);
    });
});
exports.default = userMeetingRouter;
//# sourceMappingURL=meetinguser.js.map