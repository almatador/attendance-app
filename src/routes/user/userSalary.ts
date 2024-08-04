import express from 'express';
import { PrismaClient } from '@prisma/client';

const userSalaryRouter = express.Router();
const prisma = new PrismaClient();


// Get all salary records for a user
userSalaryRouter.get('/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const salaries = await prisma.salary.findMany({
      where: { userId },
    });
    res.status(200).json(salaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching salary records.' });
  }
});

export default userSalaryRouter;
