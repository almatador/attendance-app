import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userRouter = express.Router();
const prisma = new PrismaClient();


const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

userRouter.delete('/logout/:id', async (req, res) => {
    const { id } = req.params; // Assuming id is passed as a route parameter

    try {
        const deletedSecretKey = await prisma.secretKeyuser.deleteMany({
            where: { userId: parseInt(id) },
        });

        if (!deletedSecretKey.count || deletedSecretKey.count === 0) {
            return res.status(404).send('Secret key not found for the user.');
        }

        res.status(200).send('Logged out successfully.');
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send('An error occurred while logging out.');
    }
});
userRouter.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users.' });
    }
});
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      const isValid = await bcrypt.compare(password, user.password);
  
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
      const existingToken = await prisma.secretKeyuser.findFirst({
        where: { userId: user.id }
      });
  
      if (existingToken) {
        return res.status(403).json({ error: 'User already logged in.' });
      }
  
      const token = generateSecretKey();

      // Create or update token in SecretKeyuser table
      await prisma.secretKeyuser.updateMany({
        where: { userId: user.id },
        data: { token: token },
      });
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in.' });
    }
  });
  
export default userRouter;  