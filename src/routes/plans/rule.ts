import express from 'express';
import { PrismaClient } from '@prisma/client';

const ruleRouter = express.Router();
const prisma = new PrismaClient();


// Create a new rule
ruleRouter.post('/create', async (req, res) => {
  const { name, description } = req.body;

  try {
    const rule = await prisma.rule.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json(rule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the rule.' });
  }
});

// Get all rules
ruleRouter.get('/', async (req, res) => {
  try {
    const rules = await prisma.rule.findMany();
    res.status(200).json(rules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the rules.' });
  }
});

// Get a rule by ID
ruleRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const rule = await prisma.rule.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (rule) {
      res.status(200).json(rule);
    } else {
      res.status(404).json({ error: 'Rule not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the rule.' });
  }
});

// Update a rule by ID
ruleRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedRule = await prisma.rule.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
      },
    });

    res.status(200).json(updatedRule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the rule.' });
  }
});

// Delete a rule by ID
ruleRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.rule.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the rule.' });
  }
});

// Add a rule to a plan
ruleRouter.post('/:ruleId/plan/:planId', async (req, res) => {
  const { ruleId, planId } = req.params;

  try {
    const planRule = await prisma.planRule.create({
      data: {
        ruleId: parseInt(ruleId, 10),
        planId: parseInt(planId, 10),
      },
    });

    res.status(201).json(planRule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the rule to the plan.' });
  }
});

// Remove a rule from a plan
ruleRouter.delete('/:ruleId/plan/:planId', async (req, res) => {
  const { ruleId, planId } = req.params;

  try {
    await prisma.planRule.deleteMany({
      where: {
        ruleId: parseInt(ruleId, 10),
        planId: parseInt(planId, 10),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while removing the rule from the plan.' });
  }
});

export default ruleRouter;
