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
const database_1 = __importDefault(require("./../routes/database"));
const verifySubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.body.adminId || req.query.adminId || req.params.adminId;
    if (!adminId) {
        return res.status(400).json({ error: 'Admin ID is required' });
    }
    // Query for the subscription
    const [subscriptionRows] = yield database_1.default.promise().query('SELECT * FROM subscription WHERE adminId = ?', [adminId]);
    const subscription = subscriptionRows[0];
    if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found.' });
    }
    // Query for the admin's email
    const [adminRows] = yield database_1.default.promise().query('SELECT email FROM admin WHERE id = ?', [adminId]);
    const admin = adminRows[0];
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found.' });
    }
    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);
    if (currentDate > endDate) {
        const email = admin.email;
        // Include the email in the notification message
        return res.status(403).json({ error: 'Subscription has expired. Please renew your subscription.' });
    }
    next();
});
exports.default = verifySubscription;
//# sourceMappingURL=verifySubscription%20.js.map