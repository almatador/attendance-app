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
const attendanceRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
attendanceRouter.use(express_1.default.json());
// Check-in
attendanceRouter.post('/checkin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkInTime } = req.body;
    try {
        // Ensure attendance record exists for the user
        let attendance = yield prisma.attendance.findFirst({
            where: { userId: userId }
        });
        if (!attendance) {
            attendance = yield prisma.attendance.create({
                data: { userId: userId }
            });
        }
        const checkIn = yield prisma.attendancecheckIn.create({
            data: {
                AttendanceId: attendance.id,
                checkIn: checkInTime
            },
        });
        res.status(201).json(checkIn);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during check-in.' });
    }
}));
// Check-out
attendanceRouter.post('/checkout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkOutTime } = req.body;
    try {
        // Ensure attendance record exists for the user
        let attendance = yield prisma.attendance.findFirst({
            where: { userId: userId }
        });
        if (!attendance) {
            return res.status(404).json({ error: 'Attendance record not found for user.' });
        }
        const checkOut = yield prisma.attendancecheckout.create({
            data: {
                AttendanceId: attendance.id,
                checkOut: checkOutTime
            },
        });
        res.status(200).json(checkOut);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during check-out.' });
    }
}));
// Get my attendance records
attendanceRouter.get('/myrecords', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }
    try {
        const records = yield prisma.attendance.findMany({
            where: { userId: parseInt(userId, 10) },
            include: {
                Attendancecheckin: true,
                Attendancecheckout: true,
            },
        });
        res.status(200).json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching attendance records.' });
    }
}));
exports.default = attendanceRouter;
//# sourceMappingURL=attendace.js.map