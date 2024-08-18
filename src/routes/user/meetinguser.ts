import express from 'express';
import connection from '../database';
import verifyuser from './../../Middleware/Middlewareuser';

const userMeetingRouter = express.Router();

userMeetingRouter.use(express.json());

// Get all meetings for a user

userMeetingRouter.get('/user/:userId', verifyuser,(req, res) => {
  const userId = parseInt(req.params.userId, 10);

  const query = 'SELECT * FROM Meetings WHERE userId = ?';

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching meetings.' });
    }
    res.status(200).json(results);
  });
});

export default userMeetingRouter;
