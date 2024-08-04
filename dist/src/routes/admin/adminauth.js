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
const adminRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
adminRouter.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, phoneNumber, password } = req.body;
    try {
        const admin = yield prisma.admin.create({
            data: {
                name,
                username,
                email,
                phoneNumber,
                password,
            },
        });
        res.status(201).json(admin);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the admin.' });
    }
}));
adminRouter.put('/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, username, email, phoneNumber, password } = req.body;
    try {
        const updatedAdmin = yield prisma.admin.update({
            where: { id: parseInt(id, 10) },
            data: { name, username, email, phoneNumber, password },
        });
        res.status(200).json(updatedAdmin);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating Admin.' });
    }
}));
// Delete an Admin by ID
adminRouter.delete('/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.admin.delete({ where: { id: parseInt(id, 10) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting Admin.' });
    }
}));
adminRouter.post('/user/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, adminId, jopTitel } = req.body;
    try {
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                password,
                jopTitel,
                admin: { connect: { id: adminId } },
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating User.' });
    }
}));
// Update a User by ID (by Admin)
adminRouter.put('/user/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, password, jopTitel } = req.body;
    try {
        const updatedUser = yield prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: { name, email, password, jopTitel },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating User.' });
    }
}));
// Delete a User by ID (by Admin)
adminRouter.delete('/user/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.user.delete({ where: { id: parseInt(id, 10) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting User.' });
    }
}));
exports.default = adminRouter;
//# sourceMappingURL=adminauth.js.map