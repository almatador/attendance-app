"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
// إعداد النقل عبر البريد الإلكتروني
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'abedalrhmnhassan@gmail.com',
        pass: 'matador 2024',
    },
});
const sendNotification = (email, subject, message) => {
    const mailOptions = {
        from: 'abedalrhmnhassan@gmail.com',
        to: email,
        subject: subject,
        text: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};
exports.default = sendNotification;
//# sourceMappingURL=rule.js.map