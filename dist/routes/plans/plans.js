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
const planRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
planRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, duration } = req.body;
    try {
        const plan = yield prisma.plan.create({
            data: {
                name,
                description,
                price,
                duration,
            },
        });
        res.status(201).json(plan);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the plan.' });
    }
}));
planRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plans = yield prisma.plan.findMany();
        res.status(200).json(plans);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the plans.' });
    }
}));
planRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const plan = yield prisma.plan.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (plan) {
            res.status(200).json(plan);
        }
        else {
            res.status(404).json({ error: 'Plan not found.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the plan.' });
    }
}));
planRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;
    try {
        const updatedPlan = yield prisma.plan.update({
            where: { id: parseInt(id, 10) },
            data: {
                name,
                description,
                price,
                duration,
            },
        });
        res.status(200).json(updatedPlan);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the plan.' });
    }
}));
planRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.plan.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the plan.' });
    }
}));
exports.default = planRouter;
//# sourceMappingURL=plans.js.map