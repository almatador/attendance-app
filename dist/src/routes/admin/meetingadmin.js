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
const client_1 = require("@prisma/client");
const adminMeetingRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
adminMeetingRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, date, time, place, audience, notes, userId } = req.body;
    try {
        const meeting = yield prisma.meeting.create({
            data: {
                title,
                date: new Date(date),
                time: new Date(time),
                place,
                audience,
                notes,
                userId,
            },
        });
        res.status(201).json(meeting);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating meeting.' });
    }
}));
// Update an existing meeting
adminMeetingRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const { title, date, time, place, audience, notes, status } = req.body;
    try {
        const meeting = yield prisma.meeting.findUnique({
            where: { id },
        });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found.' });
        }
        const updatedMeeting = yield prisma.meeting.update({
            where: { id },
            data: {
                title,
                date: new Date(date),
                time: new Date(time),
                place,
                audience,
                notes,
                status,
            },
        });
        res.status(200).json(updatedMeeting);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating meeting.' });
    }
}));
// Get all meetings
adminMeetingRouter.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const meetings = yield prisma.meeting.findMany();
        res.status(200).json(meetings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching meetings.' });
    }
}));
exports.default = adminMeetingRouter;
//# sourceMappingURL=meetingadmin.js.map