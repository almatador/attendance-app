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
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const adminauth = require('./dist/src/routes/admin/adminauth').default;
const plans = require('./dist/src/routes/plans/plans').default;
const rule = require('./dist/src/routes/plans/rule').default;
const superadmin = require('./dist/src/routes/superadmin/superadmin').default;
const attendace = require('./dist/src/routes/user/attendace').default;
const vacations = require('./dist/src/routes/user/vacations').default;
const vacationsadmin = require('./dist/src/routes/admin/vacationsadmin').default;
const userSalary = require('./dist/src/routes/user/userSalary').default;
const adminSalary = require('./dist/src/routes/admin/adminSalary').default;
const meetingadmin = require('./dist/src/routes/admin/meetingadmin').default;
const meetinguser = require('./dist/src/routes/user/meetinguser').default;
const adminzoun = require('./dist/src/routes/admin/adminzoun').default;
const database = require('./dist/src/routes/database').default;
const userauth = require('./dist/src/routes/user/userauth').default;
const adminshift = require('./dist/src/routes/admin/adminshift').default;
const cookieParser = require('cookie-parser');
const refreshadmin = require('./dist/src/Middleware/refreshadmin').default;
const { errorLogs, default: errorHandler } = require('./dist/src/Middleware/Middlewareeror');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// تعريف جميع الـ routes
app.use('/admin', adminauth);
app.use('/refreshtoken', refreshadmin);
app.use('/shift', adminshift);
app.use('/plan', plans);
app.use('/super', superadmin);
app.use('/attendance', attendace);
app.use('/vacations', vacations);
app.use('/vacationsadmin', vacationsadmin);
app.use('/zoun', adminzoun);
app.use('/salaryuser', userSalary);
app.use('/salaryadmin', adminSalary);
app.use('/meetingadmin', meetingadmin);
app.use('/meetinguser', meetinguser);
app.use('/user', userauth);

// Middleware لمعالجة الأخطاء
app.use(errorHandler);

// Route لعرض الأخطاء
app.get('/error-logs', (req, res) => {
  if (errorLogs.length === 0) {
    return res.status(404).json({ message: 'No errors found.' });
  }
  res.status(200).json(errorLogs);
});

// Root route
app.get('/', (req, res) => {
  database.connect((err) => {
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

module.exports = app;
