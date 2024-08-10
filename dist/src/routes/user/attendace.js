"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../database"));
const geolib_1 = __importDefault(require("geolib"));
const Middlewareuser_1 = __importDefault(require("../../Middleware/Middlewareuser"));
const attendanceRouter = express_1.default.Router();
attendanceRouter.use(Middlewareuser_1.default);
attendanceRouter.post('/checkin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkInTime, latitude, longitude } = req.body;
    try {
        // Fetch user
        const [userRows] = yield database_1.default.execute('SELECT * FROM Users WHERE id = ?', [userId]);
        const user = userRows[0];
        if (!user)
            return res.status(404).json({ error: 'User not found.' });
        // Fetch zones
        const [zoneRows] = yield database_1.default.execute('SELECT * FROM Zones WHERE adminId = ?', [user.adminId]);
        const zones = zoneRows;
        // Check if user is in any zone
        const employeeLocation = { latitude, longitude };
        let isInZone = false;
        zones.forEach((zone) => {
            const zoneCenter = { latitude: zone.center_latitude, longitude: zone.center_longitude };
            const distance = geolib_1.default.getDistance(employeeLocation, zoneCenter);
            if (distance <= zone.radius) {
                isInZone = true;
            }
        });
        if (!isInZone) {
            return res.status(400).send('You are not in the allowed zone to check-in.');
        }
        // Check-in
        const [checkInResult] = yield database_1.default.execute('CALL CheckIn(?, ?)', [userId, checkInTime]);
        res.status(201).json(checkInResult);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during check-in.' });
    }
}));
attendanceRouter.post('/checkout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkOutTime, latitude, longitude } = req.body;
    try {
        // Check if user is in any zone
        const employeeLocation = { latitude, longitude };
        const [zoneRows] = yield database_1.default.execute('SELECT * FROM Zones');
        const zones = zoneRows;
        let isInZone = false;
        for (const zone of zones) {
            const zoneCenter = { latitude: zone.center_latitude, longitude: zone.center_longitude };
            const distance = geolib_1.default.getDistance(employeeLocation, zoneCenter);
            if (distance <= zone.radius) {
                isInZone = true;
                break;
            }
        }
        if (!isInZone) {
            return res.status(400).send('You are not in the allowed zone to check-out.');
        }
        // Check-out
        const [checkOutResult] = yield database_1.default.execute('CALL CheckOut(?, ?)', [userId, checkOutTime]);
        res.status(200).json(checkOutResult);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during check-out.' });
    }
}));
// Get my attendance records
attendanceRouter.get('/myrecords', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }
    try {
        // Fetch records
        const [recordRows] = yield database_1.default.execute('CALL GetMyRecords(?)', [parseInt(userId, 10)]);
        res.status(200).json(recordRows[0]); // Typically, results are returned in [0]
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching attendance records.' });
    }
}));
exports.default = attendanceRouter;
//# sourceMappingURL=attendace.js.map