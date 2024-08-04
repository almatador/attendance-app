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
const userMeetingRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
userMeetingRouter.use(express_1.default.json());
// Get all meetings for a user
userMeetingRouter.get('/user/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = parseInt(req.params.userId, 10);
    try {
        const meetings = yield prisma.meeting.findMany({
            where: { userId },
        });
        res.status(200).json(meetings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching meetings.' });
    }
}));
exports.default = userMeetingRouter;
//# sourceMappingURL=meetinguser.js.map