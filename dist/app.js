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
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const adminauth_1 = __importDefault(require("./src/routes/admin/adminauth"));
const plans_1 = __importDefault(require("./src/routes/plans/plans"));
const rule_1 = __importDefault(require("./src/routes/plans/rule"));
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
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    database_1.default.connect((err) => {
        if (err) {
            console.error('خطأ في الاتصال بقاعدة البيانات: ', err.stack);
            // إرسال صفحة HTML عند حدوث خطأ
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
        // إرسال صفحة HTML عند النجاح في الاتصال
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
//    const superAdmin = {
//     name: 'Super Admin',
//     email: 'superadmin@example.com',
//     password: 'superadminpassword' // كلمة المرور الأصلية
//   };
//   // تشفير كلمة المرور
//   bcrypt.hash(superAdmin.password, 10, (err, hashedPassword) => {
//     if (err) {
//       console.error('خطأ في تشفير كلمة المرور:', err);
//       return;
//     }
//     // إعداد استعلام SQL لإدخال سوبر أدمن
//     const sql = 'INSERT INTO super_admins (name, email, password) VALUES (?, ?, ?)';
//     // تنفيذ الاستعلام
//     connection.query(sql, [superAdmin.name, superAdmin.email, hashedPassword], (err, result) => {
//       if (err) {
//         console.error('خطأ في إدخال سوبر أدمن:', err);
//         return;
//       }
//       console.log('تم تسجيل سوبر أدمن بنجاح.');
//     });
// }); 
app.use('/admin', adminauth_1.default);
app.use('/plan', plans_1.default);
app.use('/rule', rule_1.default);
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
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(database_1.default);
    res.status(200).send('Server Is Online');
}));
app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map