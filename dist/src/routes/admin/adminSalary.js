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
const adminSalaryRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
adminSalaryRouter.use(express_1.default.json());
// Create a new salary record
adminSalaryRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;
    try {
        const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;
        const salary = yield prisma.salary.create({
            data: {
                userId,
                period: new Date(period),
                basicSalary,
                increase,
                projectPercentage,
                emergencyDeductions,
                netSalary,
                exchangeDate: new Date(exchangeDate),
            },
        });
        res.status(201).json(salary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating salary record.' });
    }
}));
// Update an existing salary record
adminSalaryRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id, 10);
    const { basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;
    try {
        const salary = yield prisma.salary.findUnique({
            where: { id },
        });
        if (!salary) {
            return res.status(404).json({ error: 'Salary record not found.' });
        }
        const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;
        const updatedSalary = yield prisma.salary.update({
            where: { id },
            data: {
                basicSalary,
                increase,
                projectPercentage,
                emergencyDeductions,
                netSalary,
                exchangeDate: new Date(exchangeDate),
            },
        });
        res.status(200).json(updatedSalary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating salary record.' });
    }
}));
// Get all salary records
adminSalaryRouter.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salaries = yield prisma.salary.findMany();
        res.status(200).json(salaries);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching salary records.' });
    }
}));
exports.default = adminSalaryRouter;
//# sourceMappingURL=adminSalary.js.map