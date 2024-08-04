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
const adminVacationRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
adminVacationRouter.use(express_1.default.json());
// Update a vacation request status
adminVacationRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    try {
        const vacation = yield prisma.vacation.update({
            where: { id },
            data: { status },
        });
        if (status === 'approved') {
            const start = new Date(vacation.startDate);
            const end = new Date(vacation.endDate);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            yield prisma.user.update({
                where: { id: vacation.userId },
                data: vacation.type === 'Annual'
                    ? { annualLeaveDays: { decrement: duration } }
                    : { emergencyLeaveDays: { decrement: duration } },
            });
        }
        else if (status === 'rejected') {
            yield prisma.vacation.delete({
                where: { id },
            });
        }
        res.status(200).json(vacation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating vacation request.' });
    }
}));
// Get all vacation requests
adminVacationRouter.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vacations = yield prisma.vacation.findMany();
        res.status(200).json(vacations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching vacation requests.' });
    }
}));
exports.default = adminVacationRouter;
//# sourceMappingURL=vacationsadmin.js.map