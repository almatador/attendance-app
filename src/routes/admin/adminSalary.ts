import express from 'express';
import { PrismaClient } from '@prisma/client';

const adminSalaryRouter = express.Router();
const prisma = new PrismaClient();

adminSalaryRouter.use(express.json());

// Create a new salary record
adminSalaryRouter.post('/create', async (req, res) => {
  const { userId, period, basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;

  try {
    const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

    const salary = await prisma.salary.create({
      data: {
        userId,
        period: new Date(period),
        basicSalary,
        increase,
        projectPercentage,
        emergencyDeductions,
        netSalary,
        exchangeDate: new Date(exchangeDate),
      },
    });
    res.status(201).json(salary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating salary record.' });
  }
});

// Update an existing salary record
adminSalaryRouter.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { basicSalary, increase, projectPercentage, emergencyDeductions, exchangeDate } = req.body;

  try {
    const salary = await prisma.salary.findUnique({
      where: { id },
    });

    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found.' });
    }

    const netSalary = basicSalary + increase + projectPercentage - emergencyDeductions;

    const updatedSalary = await prisma.salary.update({
      where: { id },
      data: {
        basicSalary,
        increase,
        projectPercentage,
        emergencyDeductions,
        netSalary,
        exchangeDate: new Date(exchangeDate),
      },
    });
    res.status(200).json(updatedSalary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating salary record.' });
  }
});

// Get all salary records
adminSalaryRouter.get('/all', async (req, res) => {
  try {
    const salaries = await prisma.salary.findMany();
    res.status(200).json(salaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching salary records.' });
  }
});

export default adminSalaryRouter;
