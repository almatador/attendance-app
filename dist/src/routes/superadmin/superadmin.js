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
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const superAdminRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
superAdminRouter.post('/createSuperAdmin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, phoneNumber, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const superAdmin = yield prisma.superAdmin.create({
            data: {
                name: name,
                username: username,
                email: email,
                phoneNumber: phoneNumber,
                password: hashedPassword,
                secretKeys: {
                    create: {
                        token: generateSecretKey(), // Generate and include secret key
                    }
                }
            },
        });
        res.status(201).json(superAdmin);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the super admin.' });
    }
}));
superAdminRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("الرجاء تقديم البريد الإلكتروني وكلمة المرور");
    }
    try {
        const admin = yield prisma.superAdmin.findUnique({
            where: {
                email: email,
            },
        });
        if (admin && bcrypt_1.default.compareSync(password, admin.password)) {
            const newToken = generateSecretKey();
            const secretKeyAdmin = yield prisma.secretKeySuperadmin.findMany({
                where: {
                    superAdminId: admin.id,
                },
            });
            if (secretKeyAdmin) {
                yield prisma.secretKeySuperadmin.update({
                    where: {
                        id: admin.id,
                    },
                    data: {
                        token: newToken,
                    },
                });
            }
            else {
                yield prisma.secretKeySuperadmin.create({
                    data: {
                        superAdminId: admin.id,
                        token: newToken,
                    },
                });
            }
            res.status(200).json({ admin, token: newToken });
        }
        else {
            res.status(404).send("الايميل او كلمة المرور خطأ");
        }
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
}));
superAdminRouter.post('/logout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).send('Invalid ID');
        }
        yield prisma.secretKeySuperadmin.updateMany({
            where: {
                superAdminId: parseInt(id)
            },
            data: {
                token: "null"
            }
        });
        res.clearCookie('token'); // Adjust the cookie name if different
        res.status(200).send("تم تسجيل الخروج بنجاح");
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
}));
exports.default = superAdminRouter;
//# sourceMappingURL=superadmin.js.map