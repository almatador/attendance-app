"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const adminauth_1 = __importDefault(require("./src/routes/admin/adminauth"));
const plans_1 = __importDefault(require("./src/routes/plans/plans"));
const superadmin_1 = __importDefault(require("./src/routes/superadmin/superadmin"));
const attendace_1 = __importDefault(require("./src/routes/user/attendace"));
const vacations_1 = __importDefault(require("./src/routes/user/vacations"));
const vacationsadmin_1 = __importDefault(require("./src/routes/admin/vacationsadmin"));
const userSalary_1 = __importDefault(require("./src/routes/user/userSalary"));
const adminSalary_1 = __importDefault(require("./src/routes/admin/adminSalary"));
const meetingadmin_1 = __importDefault(require("./src/routes/admin/meetingadmin"));
const meetinguser_1 = __importDefault(require("./src/routes/user/meetinguser"));
const adminzoun_1 = __importDefault(require("./src/routes/admin/adminzoun"));
const database_1 = __importDefault(require("./src/routes/database"));
const userauth_1 = __importDefault(require("./src/routes/user/userauth"));
const adminshift_1 = __importDefault(require("./src/routes/admin/adminshift"));
const refreshadmin_1 = __importDefault(require("./src/Middleware/refreshadmin"));
const Middlewareeror_1 = __importStar(require("./src/Middleware/Middlewareeror"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
// تعريف جميع الـ routes
app.use('/admin', adminauth_1.default);
app.use('/refreshtoken', refreshadmin_1.default);
app.use('/shift', adminshift_1.default);
app.use('/plan', plans_1.default);
app.use('/super', superadmin_1.default);
app.use('/attendance', attendace_1.default);
app.use('/vacations', vacations_1.default);
app.use('/vacationsadmin', vacationsadmin_1.default);
app.use('/zoun', adminzoun_1.default);
app.use('/salaryuser', userSalary_1.default);
app.use('/salaryadmin', adminSalary_1.default);
app.use('/meetingadmin', meetingadmin_1.default);
app.use('/meetinguser', meetinguser_1.default);
app.use('/user', userauth_1.default);
// Middleware لمعالجة الأخطاء
app.use(Middlewareeror_1.default);
// Route لعرض الأخطاء
app.get('/error-logs', (req, res) => {
    if (Middlewareeror_1.errorLogs.length === 0) {
        return res.status(404).json({ message: 'No errors found.' });
    }
    res.status(200).json(Middlewareeror_1.errorLogs);
});
// Root route
app.get('/', (req, res) => {
    database_1.default.connect((err) => {
        if (err) {
            console.error('خطأ في الاتصال بقاعدة البيانات: ', err.stack);
            return res.send(`
        <html>
          <head>
            <title>خطأ في الاتصال بقاعدة البيانات</title>
          </head>
          <body style="background-color: black; color: white; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div>
              <h1>خطأ في الاتصال بقاعدة البيانات</h1>
              <p>${err.stack}</p>
            </div>
          </body>
        </html>
      `);
        }
        res.send(`
      <html>
        <head>
          <title>نجاح الاتصال</title>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: black;
              font-family: Arial, sans-serif;
              color: white;
            }
            .text {
              font-size: 3em;
              opacity: 0;
              animation: fadeIn 2s forwards;
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.5);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          </style>
        </head>
        <body>
          <div class="text">
            متصل بقاعدة البيانات بنجاح
            <div class="text">Made from Matador</div>
          </div>
        </body>
      </html>
    `);
    });
});
app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map