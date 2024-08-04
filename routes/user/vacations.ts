import express from 'express';
import { PrismaClient } from '@prisma/client';

const userVacationRouter = express.Router();
const prisma = new PrismaClient();


userVacationRouter.post('/create', async (req, res) => {
  const { userId, startDate, endDate, reason, type } = req.body;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (type === 'Annual' && user.annualLeaveDays < duration) {
      return res.status(400).json({ error: 'Insufficient annual leave days.' });
    }
    if (type === 'Emergency' && user.emergencyLeaveDays < duration) {
      return res.status(400).json({ error: 'Insufficient emergency leave days.' });
    }

    const vacation = await prisma.vacation.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        type,
      },
    });
    res.status(201).json(vacation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating vacation request.' });
  }
});

userVacationRouter.get('/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const vacations = await prisma.vacation.findMany({
      where: { userId },
    });
    res.status(200).json(vacations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching vacation requests.' });
  }
});

export default userVacationRouter;
