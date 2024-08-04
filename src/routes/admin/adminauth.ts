import express from 'express';
import { PrismaClient } from '@prisma/client';

const adminRouter = express.Router();
const prisma = new PrismaClient();

adminRouter.post('/create', async (req, res) => {
    const { name, username, email, phoneNumber, password } = req.body;

    try {
        const admin = await prisma.admin.create({
            data: {
                name,
                username,
                email,
                phoneNumber,
                password,
            },
        });
        res.status(201).json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the admin.' });
    }
});

adminRouter.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, username, email, phoneNumber, password } = req.body;

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id: parseInt(id, 10) },
            data: { name, username, email, phoneNumber, password },
        });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ error: 'Error updating Admin.' });
    }
});

// Delete an Admin by ID
adminRouter.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.admin.delete({ where: { id: parseInt(id, 10) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting Admin.' });
    }
});

adminRouter.post('/user/create', async (req, res) => {
    const { name, email, password, adminId ,jopTitel} = req.body;
  
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          jopTitel,
          admin: { connect: { id: adminId } },
        },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error creating User.' });
    }
  });
  
  // Update a User by ID (by Admin)
  adminRouter.put('/user/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password,jopTitel } = req.body;
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id, 10) },
        data: { name, email, password ,jopTitel},
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Error updating User.' });
    }
  });
  
  // Delete a User by ID (by Admin)
  adminRouter.delete('/user/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.user.delete({ where: { id: parseInt(id, 10) } });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting User.' });
    }
  });
  
export default adminRouter;
