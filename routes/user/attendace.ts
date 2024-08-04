import express from 'express';
import { PrismaClient } from '@prisma/client';

const attendanceRouter = express.Router();
const prisma = new PrismaClient();

attendanceRouter.use(express.json());

// Check-in
attendanceRouter.post('/checkin', async (req, res) => {
  const { userId, checkInTime } = req.body;

  try {
    // Ensure attendance record exists for the user
    let attendance = await prisma.attendance.findFirst({
      where: { userId: userId }
    });

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: { userId: userId }
      });
    }

    const checkIn = await prisma.attendancecheckIn.create({
      data: { 
        AttendanceId: attendance.id,
        checkIn: checkInTime 
      },
    });
    res.status(201).json(checkIn);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-in.' });
  }
});

// Check-out
attendanceRouter.post('/checkout', async (req, res) => {
  const { userId, checkOutTime } = req.body;

  try {
    // Ensure attendance record exists for the user
    let attendance = await prisma.attendance.findFirst({
      where: { userId: userId }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found for user.' });
    }

    const checkOut = await prisma.attendancecheckout.create({
      data: { 
        AttendanceId: attendance.id,
        checkOut: checkOutTime 
      },
    });
    res.status(200).json(checkOut);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-out.' });
  }
});

// Get my attendance records
attendanceRouter.get('/myrecords', async (req, res) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const records = await prisma.attendance.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        Attendancecheckin: true,
        Attendancecheckout: true,
      },
    });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching attendance records.' });
  }
});

export default attendanceRouter;
