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
const ruleRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Create a new rule
ruleRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    try {
        const rule = yield prisma.rule.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json(rule);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the rule.' });
    }
}));
// Get all rules
ruleRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rules = yield prisma.rule.findMany();
        res.status(200).json(rules);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the rules.' });
    }
}));
// Get a rule by ID
ruleRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const rule = yield prisma.rule.findUnique({
            where: { id: parseInt(id, 10) },
        });
        if (rule) {
            res.status(200).json(rule);
        }
        else {
            res.status(404).json({ error: 'Rule not found.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the rule.' });
    }
}));
// Update a rule by ID
ruleRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const updatedRule = yield prisma.rule.update({
            where: { id: parseInt(id, 10) },
            data: {
                name,
                description,
            },
        });
        res.status(200).json(updatedRule);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the rule.' });
    }
}));
// Delete a rule by ID
ruleRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.rule.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the rule.' });
    }
}));
// Add a rule to a plan
ruleRouter.post('/:ruleId/plan/:planId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ruleId, planId } = req.params;
    try {
        const planRule = yield prisma.planRule.create({
            data: {
                ruleId: parseInt(ruleId, 10),
                planId: parseInt(planId, 10),
            },
        });
        res.status(201).json(planRule);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while adding the rule to the plan.' });
    }
}));
// Remove a rule from a plan
ruleRouter.delete('/:ruleId/plan/:planId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ruleId, planId } = req.params;
    try {
        yield prisma.planRule.deleteMany({
            where: {
                ruleId: parseInt(ruleId, 10),
                planId: parseInt(planId, 10),
            },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while removing the rule from the plan.' });
    }
}));
exports.default = ruleRouter;
//# sourceMappingURL=rule.js.map