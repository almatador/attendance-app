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
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
userRouter.delete('/logout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Assuming id is passed as a route parameter
    try {
        const deletedSecretKey = yield prisma.secretKeyuser.deleteMany({
            where: { userId: parseInt(id) },
        });
        if (!deletedSecretKey.count || deletedSecretKey.count === 0) {
            return res.status(404).send('Secret key not found for the user.');
        }
        res.status(200).send('Logged out successfully.');
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).send('An error occurred while logging out.');
    }
}));
userRouter.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching users.' });
    }
}));
userRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password.' });
        }
        const existingToken = yield prisma.secretKeyuser.findFirst({
            where: { userId: user.id }
        });
        if (existingToken) {
            return res.status(403).json({ error: 'User already logged in.' });
        }
        const token = generateSecretKey();
        // Create or update token in SecretKeyuser table
        yield prisma.secretKeyuser.updateMany({
            where: { userId: user.id },
            data: { token: token },
        });
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ error: 'Error logging in.' });
    }
}));
exports.default = userRouter;
//# sourceMappingURL=userauth.js.map