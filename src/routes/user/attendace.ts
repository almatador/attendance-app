import express from 'express';
import geolib from 'geolib';
import verifyuser from './../../Middleware/Middlewareuser';
import connection from '../database';

const attendanceRouter = express.Router();

// Calculate deduction function
function calculateDeduction(lateTimeMillis: number) {
  const lateHours = lateTimeMillis / (1000 * 60 * 60);
  const hourlyDeduction = 5.00; // Example: $5 deduction per hour
  return lateHours * hourlyDeduction;
}
attendanceRouter.post('/checkin', verifyuser, async (req, res) => {
  const { userId, checkInTime, latitude, longitude } = req.body;

  try {
    // Fetch user
    const [userRows]: [any[], any] = await connection.promise().query('SELECT * FROM User WHERE id = ?', [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch zones
    const [zoneRows]: [any[], any] = await connection.promise().query('SELECT * FROM Zones WHERE adminId = ?', [user.adminId]);
    const zones = zoneRows;

    // Check if user is in any zone
    const employeeLocation = { latitude, longitude };
    let isInZone = false;

    for (const zone of zones) {
      const zoneCenter = { latitude: zone.center_latitude, longitude: zone.center_longitude };
      const distance = geolib.getDistance(employeeLocation, zoneCenter);

      if (distance <= zone.radius) {
        isInZone = true;
        break;
      }
    }

    if (!isInZone) {
      return res.status(400).send('You are not in the allowed zone to check-in.');
    }

    // Fetch today's shift
    const [userShiftRows]: [any[], any] = await connection.promise().query('SELECT * FROM UserShifts WHERE userId = ? AND shiftDate = CURDATE()', [userId]);
    const userShift = userShiftRows[0];
    if (!userShift) return res.status(404).json({ error: 'No shift assigned for today.' });

    const [shiftRows]: [any[], any] = await connection.promise().query('SELECT * FROM Shifts WHERE id = ?', [userShift.shiftId]);
    const shift = shiftRows[0];
    if (!shift) return res.status(404).json({ error: 'Shift not found.' });

    const shiftStartTime = new Date();
    shiftStartTime.setHours(shift.startTime.split(':')[0], shift.startTime.split(':')[1], 0);

    const shiftEndTime = new Date();
    shiftEndTime.setHours(shift.endTime.split(':')[0], shift.endTime.split(':')[1], 0);

    if (new Date(checkInTime) > shiftEndTime) {
      return res.status(400).json({ error: 'You are too late for your shift.' });
    }

    // Check-in
    const [checkInResult]: [any[], any] = await connection.promise().query('INSERT INTO Attendance (userId, status, createdAt) VALUES (?, ?, NOW())', [userId, 'present']);
    const attendanceId = checkInResult[0].insertId;

    await connection.promise().query('INSERT INTO AttendancecheckIn (attendanceId, checkIn, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [attendanceId, checkInTime]);

    // Calculate late deductions if applicable
    if (new Date(checkInTime) > shiftStartTime) {
      const lateTimeMillis = new Date(checkInTime).getTime() - shiftStartTime.getTime();
      const lateTimeFormatted = new Date(lateTimeMillis).toISOString().substr(11, 5); // HH:MM format

      // Insert late mark
      await connection.promise().query('INSERT INTO LateMark (userId, date, lateTime) VALUES (?, CURDATE(), ?)', [userId, lateTimeFormatted]);

      // Calculate deduction
      const deductionAmount = calculateDeduction(lateTimeMillis);

      // Update Salary table
      await connection.promise().query('UPDATE Salary SET emergencyDeductions = emergencyDeductions + ? WHERE userId = ? AND MONTH(period) = MONTH(CURDATE()) AND YEAR(period) = YEAR(CURDATE())', [deductionAmount, userId]);
    }

    res.status(201).json({ message: 'Check-in successful', checkInResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error during check-in.',
      details: error.message
    });
  }
});
attendanceRouter.post('/checkout', verifyuser, async (req, res) => {
  const { userId, checkOutTime } = req.body;

  try {
    // Fetch today's attendance record
    const [attendanceRows]: [any[], any] = await connection.promise().query('SELECT * FROM Attendance WHERE userId = ? AND DATE(createdAt) = CURDATE()', [userId]);
    const attendance = attendanceRows[0];
    if (!attendance) return res.status(404).json({ error: 'No check-in record found for today.' });

    const attendanceId = attendance.id;

    // Insert checkout record
    await connection.promise().query('INSERT INTO Attendancecheckout (attendanceId, checkOut, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [attendanceId, checkOutTime]);

    // Calculate work duration and update status if needed
    const checkInTime = new Date(attendance.createdAt).getTime();
    const checkOutMillis = new Date(checkOutTime).getTime();
    const workDurationMillis = checkOutMillis - checkInTime;
    
    // Assuming 8 hours as a standard work duration for an example
    const standardWorkDurationMillis = 8 * 60 * 60 * 1000;

    let status = attendance.status;

    if (workDurationMillis < standardWorkDurationMillis) {
      status = 'early_checkout'; // You can use 'present', 'absent', 'early_checkout', etc.
    }

    // Update attendance status
    await connection.promise().query('UPDATE Attendance SET status = ? WHERE id = ?', [status, attendanceId]);

    res.status(200).json({ message: 'Checkout successful', status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Error during checkout.',
      details: error.message 
    });
  }
});

export default attendanceRouter;
