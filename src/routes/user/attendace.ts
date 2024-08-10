import express from 'express';
import connection from '../database';
import geolib from 'geolib';
import verifyuser from '../../Middleware/Middlewareuser';
import mysql from 'mysql2/promise';
import { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2';

const attendanceRouter = express.Router();

attendanceRouter.use(verifyuser);

attendanceRouter.post('/checkin', async (req, res) => {
  const { userId, checkInTime, latitude, longitude } = req.body;

  try {
    // Fetch user
    const [userRows]: any = await connection.execute('SELECT * FROM Users WHERE id = ?', [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch zones
    const [zoneRows]: any= await connection.execute('SELECT * FROM Zones WHERE adminId = ?', [user.adminId]);
    const zones = zoneRows as RowDataPacket[];

    // Check if user is in any zone
    const employeeLocation = { latitude, longitude };
    let isInZone = false;

    zones.forEach((zone) => {
      const zoneCenter = { latitude: (zone as any).center_latitude, longitude: (zone as any).center_longitude };
      const distance = geolib.getDistance(employeeLocation, zoneCenter);

      if (distance <= (zone as any).radius) {
        isInZone = true;
      }
    });

    if (!isInZone) {
      return res.status(400).send('You are not in the allowed zone to check-in.');
    }

    // Check-in
    const [checkInResult]: any = await connection.execute('CALL CheckIn(?, ?)', [userId, checkInTime]);
    res.status(201).json(checkInResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-in.' });
  }
});

attendanceRouter.post('/checkout', async (req, res) => {
  const { userId, checkOutTime, latitude, longitude } = req.body;

  try {
    // Check if user is in any zone
    const employeeLocation = { latitude, longitude };
    const [zoneRows]: any = await connection.execute('SELECT * FROM Zones');
    const zones = zoneRows as RowDataPacket[];

    let isInZone = false;

    for (const zone of zones) {
      const zoneCenter = { latitude: (zone as any).center_latitude, longitude: (zone as any).center_longitude };
      const distance = geolib.getDistance(employeeLocation, zoneCenter);

      if (distance <= (zone as any).radius) {
        isInZone = true;
        break;
      }
    }

    if (!isInZone) {
      return res.status(400).send('You are not in the allowed zone to check-out.');
    }

    // Check-out
    const [checkOutResult]:any = await connection.execute('CALL CheckOut(?, ?)', [userId, checkOutTime]);
    res.status(200).json(checkOutResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-out.' });
  }
});

// Get my attendance records
attendanceRouter.get('/myrecords', async (req, res) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Fetch records
    const [recordRows]: any = await connection.execute('CALL GetMyRecords(?)', [parseInt(userId, 10)]);
    res.status(200).json(recordRows[0]); // Typically, results are returned in [0]
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching attendance records.' });
  }
});

export default attendanceRouter;
