import express from 'express';
import { PrismaClient } from '@prisma/client';

const adminMeetingRouter = express.Router();
const prisma = new PrismaClient();


adminMeetingRouter.post('/create', async (req, res) => {
  const { title, date, time, place, audience, notes, userId } = req.body;

  try {
    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: new Date(date),
        time: new Date(time),
        place,
        audience,
        notes,
        userId,
      },
    });
    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating meeting.' });
  }
});

// Update an existing meeting
adminMeetingRouter.put('/update/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, date, time, place, audience, notes, status } = req.body;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        time: new Date(time),
        place,
        audience,
        notes,
        status,
      },
    });
    res.status(200).json(updatedMeeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating meeting.' });
  }
});

// Get all meetings
adminMeetingRouter.get('/all', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany();
    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching meetings.' });
  }
});

export default adminMeetingRouter;
