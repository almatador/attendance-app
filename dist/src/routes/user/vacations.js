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
const userVacationRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
userVacationRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, startDate, endDate, reason, type } = req.body;
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (type === 'Annual' && user.annualLeaveDays < duration) {
            return res.status(400).json({ error: 'Insufficient annual leave days.' });
        }
        if (type === 'Emergency' && user.emergencyLeaveDays < duration) {
            return res.status(400).json({ error: 'Insufficient emergency leave days.' });
        }
        const vacation = yield prisma.vacation.create({
            data: {
                userId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                type,
            },
        });
        res.status(201).json(vacation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating vacation request.' });
    }
}));
userVacationRouter.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId, 10);
    try {
        const vacations = yield prisma.vacation.findMany({
            where: { userId },
        });
        res.status(200).json(vacations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching vacation requests.' });
    }
}));
exports.default = userVacationRouter;
//# sourceMappingURL=vacations.js.map