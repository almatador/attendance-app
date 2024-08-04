import express from 'express';
import { PrismaClient } from '@prisma/client';

const userMeetingRouter = express.Router();
const prisma = new PrismaClient();

userMeetingRouter.use(express.json());

// Get all meetings for a user
userMeetingRouter.get('/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    const meetings = await prisma.meeting.findMany({
      where: { userId },
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching meetings.' });
  }
});

export default userMeetingRouter;
