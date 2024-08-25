import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import adminRouter from './src/routes/admin/adminauth';
import planRouter from './src/routes/plans/plans';
import superAdminRouter from './src/routes/superadmin/superadmin';
import attendanceRouter from './src/routes/user/attendace';
import userVacationRouter from './src/routes/user/vacations';
import adminVacationRouter from './src/routes/admin/vacationsadmin';
import userSalaryRouter from './src/routes/user/userSalary';
import adminSalaryRouter from './src/routes/admin/adminSalary';
import adminMeetingRouter from './src/routes/admin/meetingadmin';
import userMeetingRouter from './src/routes/user/meetinguser';
import adminzoun from './src/routes/admin/adminzoun';
import connection from './src/routes/database';
import userRouter from './src/routes/user/userauth';
import shiftRouter from './src/routes/admin/adminshift';
import refreshadminRouter from './src/Middleware/refreshadmin';
import errorHandler, { errorLogs } from './src/Middleware/Middlewareeror';
import upload from './src/Middleware/uploud';

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// تعريف جميع الـ routes
app.use('/admin', adminRouter);
app.use('/refreshtoken', refreshadminRouter);
app.use('/shift', shiftRouter);
app.use('/plan', planRouter);
app.use('/super', superAdminRouter);
app.use('/attendance', attendanceRouter);
app.use('/vacations', userVacationRouter);
app.use('/vacationsadmin', adminVacationRouter);
app.use('/zoun', adminzoun);
app.use('/salaryuser', userSalaryRouter);
app.use('/salaryadmin', adminSalaryRouter);
app.use('/meetingadmin', adminMeetingRouter);
app.use('/meetinguser', userMeetingRouter);
app.use('/user', userRouter);

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
  connection.connect((err) => {
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

export default app;
