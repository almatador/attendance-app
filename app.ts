import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import adminRouter from './src/routes/admin/adminauth';
import planRouter from './src/routes/plans/plans';
import ruleRouter from './src/routes/plans/rule';
import superAdminRouter from './src/routes/superadmin/superadmin';
import attendanceRouter from './src/routes/user/attendace';
import userVacationRouter from './src/routes/user/vacations';
import adminVacationRouter from './src/routes/admin/vacationsadmin';
import userSalaryRouter from './src/routes/user/userSalary';
import adminSalaryRouter from './src/routes/admin/adminSalary';
import adminMeetingRouter from './src/routes/admin/meetingadmin';
import userMeetingRouter from './src/routes/user/meetinguser';


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/admin', adminRouter);
app.use('/plan', planRouter);
app.use('/rule', ruleRouter);
app.use('/super', superAdminRouter);
app.use('/attendance', attendanceRouter);
app.use('/vacations', userVacationRouter);
app.use('/vacationsadmin', adminVacationRouter);

app.use('/salaryuser', userSalaryRouter);
app.use('/salaryadmin', adminSalaryRouter);
app.use('/meetingadmin', adminMeetingRouter);
app.use('/meetinguser', userMeetingRouter);

app.get('/', async (req, res) => {
    res.status(200).send('Server Is Online');
});
app.listen(port, () => {
    console.log(`🚀 Server ready at: http://localhost:${port}`);
});
export default app;
