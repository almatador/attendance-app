import express from 'express';
import connection from '../database';
import geolib from 'geolib';
import { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2';

const attendanceRouter = express.Router();


attendanceRouter.post('/checkin', async (req, res) => {
  const { userId, checkInTime, latitude, longitude } = req.body;

  try {
    // Fetch user
    const [userRows]: [any[], any] = await connection.promise().query('SELECT * FROM Users WHERE id = ?', [userId]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch zones
    const [zoneRows]: [any[], any] = await connection.promise().query('SELECT * FROM Zones WHERE adminId = ?', [user.adminId]);
    const zones = zoneRows;

    // Check if user is in any zone
    const employeeLocation = { latitude, longitude };
    let isInZone = false;

    zones.forEach((zone: any) => {
      const zoneCenter = { latitude: zone.center_latitude, longitude: zone.center_longitude };
      const distance = geolib.getDistance(employeeLocation, zoneCenter);

      if (distance <= zone.radius) {
        isInZone = true;
      }
    });

    if (!isInZone) {
      return res.status(400).send('You are not in the allowed zone to check-in.');
    }

    // Check-in
    const [checkInResult]: [any[], any] = await connection.promise().query('CALL CheckIn(?, ?)', [userId, checkInTime]);
    res.status(201).json(checkInResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-in.' });
  }
});
attendanceRouter.post('/checkout', async (req, res) => {
  const { userId, checkOutTime, latitude, longitude } = req.body;

  try {
    // Fetch zones
    const [zoneRows]: [any[], any] = await connection.promise().query('SELECT * FROM Zones');
    const zones = zoneRows;

    // Check if user is in any zone
    const employeeLocation = { latitude, longitude };
    let isInZone = false;

    for (const zone of zones) {
      const zoneCenter = { latitude: zone.center_latitude, longitude: zone.center_longitude };
      const distance = geolib.getDistance(employeeLocation, zoneCenter);

      if (distance <= zone.radius) {
        isInZone = true;
        break;
      }
    }

    if (!isInZone) {
      return res.status(400).send('You are not in the allowed zone to check-out.');
    }

    // Check-out
    const [checkOutResult]: [any[], any] = await connection.promise().query('CALL CheckOut(?, ?)', [userId, checkOutTime]);
    res.status(200).json(checkOutResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during check-out.' });
  }
});

// Get my attendance records
attendanceRouter.get('/myrecords/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid User ID.' });
  }

  try {
    // Fetch records
    const [recordRows]: [any[], any] = await connection.promise().query('CALL GetMyRecords(?)', [userId]);
    const records = recordRows[0]; // Typically, results are returned in [0]
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching attendance records.' });
  }
});

export default attendanceRouter;
