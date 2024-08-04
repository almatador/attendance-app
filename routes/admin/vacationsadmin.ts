import express from 'express';
import { PrismaClient } from '@prisma/client';

const adminVacationRouter = express.Router();
const prisma = new PrismaClient();

adminVacationRouter.use(express.json());

// Update a vacation request status
adminVacationRouter.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  try {
    const vacation = await prisma.vacation.update({
      where: { id },
      data: { status },
    });

    if (status === 'approved') {
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      await prisma.user.update({
        where: { id: vacation.userId },
        data: vacation.type === 'Annual'
          ? { annualLeaveDays: { decrement: duration } }
          : { emergencyLeaveDays: { decrement: duration } },
      });
    } else if (status === 'rejected') {
      await prisma.vacation.delete({
        where: { id },
      });
    }

    res.status(200).json(vacation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating vacation request.' });
  }
});

// Get all vacation requests
adminVacationRouter.get('/all', async (req, res) => {
  try {
    const vacations = await prisma.vacation.findMany();
    res.status(200).json(vacations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching vacation requests.' });
  }
});

export default adminVacationRouter;
