// import express from 'express';
// import mysql from 'mysql2/promise';
// import connection from '../database';
// const lateMarkRouter = express.Router();
// const calculateDeduction = (lateTime, hourlyRate) => {
//     // Convert lateTime to minutes
//     const [hours, minutes] = lateTime.split(':').map(Number);
//     const totalMinutesLate = hours * 60 + minutes;
//     // Define a rate of deduction per minute
//     const deductionPerMinute = hourlyRate / 60;
//     // Calculate the total deduction
//     const totalDeduction = totalMinutesLate * deductionPerMinute;
//     return totalDeduction;
// };
// lateMarkRouter.post('/deduct', async (req, res) => {
//     const { userId, date } = req.body;
//     try {
//         // Fetch the late marks for the given user and date
//         const [lateMarks] = await connection.execute(
//             `SELECT * FROM LateMark WHERE userId = ? AND date = ?`,
//             [userId, date]
//         );
//         if (lateMarks.length === 0) {
//             return res.status(404).json({ error: 'No late marks found for the specified user and date.' });
//         }
//         // Fetch the user's salary information
//         const [salaryResults] = await connection.execute(
//             `SELECT * FROM Salary WHERE userId = ? AND period LIKE ?`,
//             [userId, `${date.getFullYear()}%`]
//         );
//         if (salaryResults.length === 0) {
//             return res.status(404).json({ error: 'Salary record not found for the specified user and date.' });
//         }
//         const salary = salaryResults[0];
//         const hourlyRate = salary.basicSalary / (30 * 8); // Assuming 30 working days and 8 working hours per day
//         // Calculate total deduction based on late marks
//         let totalDeduction = 0;
//         for (const mark of lateMarks) {
//             const deduction = calculateDeduction(mark.lateTime, hourlyRate);
//             totalDeduction += deduction;
//         }
//         // Update the salary record with the deduction
//         const updatedNetSalary = salary.netSalary - totalDeduction;
//         connection.execute(
//             `UPDATE Salary SET netSalary = ? WHERE id = ?`,
//             [updatedNetSalary, salary.id]
//         );
//         res.status(200).json({ message: 'Salary updated successfully with deductions.', totalDeduction });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Error updating salary with deductions.' });
//     }
// });
//# sourceMappingURL=lateMarks.js.map