"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const connection = mysql2_1.default.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'matador',
});
connection.connect((err) => {
    if (err) {
        console.error('خطأ في الاتصال بقاعدة البيانات: ', err.stack);
        return;
    }
    console.log('متصل بقاعدة البيانات كـ id ' + connection.threadId);
});
exports.default = connection;
//# sourceMappingURL=database.js.map