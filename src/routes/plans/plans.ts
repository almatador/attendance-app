import express from 'express';
import { PrismaClient } from '@prisma/client';

const planRouter = express.Router();
const prisma = new PrismaClient();


planRouter.post('/create', async (req, res) => {
  const { name, description, price, duration } = req.body;

  try {
    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price,
        duration,
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the plan.' });
  }
});

planRouter.get('/', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany();
    res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the plans.' });
  }
});

planRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (plan) {
      res.status(200).json(plan);
    } else {
      res.status(404).json({ error: 'Plan not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the plan.' });
  }
});

planRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration } = req.body;

  try {
    const updatedPlan = await prisma.plan.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
        price,
        duration,
      },
    });

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the plan.' });
  }
});

planRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.plan.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the plan.' });
  }
});

export default planRouter;
