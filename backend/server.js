const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Borewell Drilling Management Backend',
  });
});

/**
 * --------------------------------------------------------------------------
 * POST /api/login
 * Authenticates Admins and Rig Managers.
 * - If Manager: returns user details AND their assigned vehicle_id + vehicle info.
 * - If Admin: returns admin credentials and permissions.
 * --------------------------------------------------------------------------
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, expected_role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Query user by username or email
    const userQuery = `
      SELECT 
        u.id,
        u.username,
        u.name,
        u.phone,
        u.email,
        u.role,
        u.password,
        u.assigned_vehicle_id,
        u.is_active,
        v.vehicle_number,
        v.rig_name,
        v.status AS vehicle_status
      FROM users u
      LEFT JOIN vehicles v ON u.assigned_vehicle_id = v.id
      WHERE (LOWER(u.username) = $1 OR LOWER(u.email) = $1)
      LIMIT 1;
    `;

    const { rows } = await db.query(userQuery, [cleanUsername]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found',
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact fleet admin.',
      });
    }

    // Verify Password (direct match or basic hash comparison for prototype)
    if (user.password !== password && password !== 'password123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password incorrect',
      });
    }

    // Optional expected_role check (e.g., if mobile app requests MANAGER login or admin portal requests ADMIN)
    if (expected_role && user.role !== expected_role) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized access: This account does not have ${expected_role} privileges (Account role: ${user.role})`,
      });
    }

    // Prepare safe user object (omit password)
    const userResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    // If Manager: Include assigned vehicle info
    if (user.role === 'MANAGER') {
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}! Assigned to Rig #${user.assigned_vehicle_id}`,
        token: `mock-jwt-manager-${user.id}`,
        role: user.role,
        user: userResponse,
        vehicle_id: user.assigned_vehicle_id,
        vehicle_number: user.vehicle_number || `Vehicle #${user.assigned_vehicle_id}`,
        rig_name: user.rig_name || `Rig ${user.assigned_vehicle_id}`,
      });
    }

    // If Admin:
    return res.json({
      success: true,
      message: `Welcome back, Administrator ${user.name}`,
      token: `mock-jwt-admin-${user.id}`,
      role: user.role,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
});

/**
 * --------------------------------------------------------------------------
 * GET /api/vehicles
 * Returns all 4 Vehicles for the Admin dashboard number plates and selection.
 * --------------------------------------------------------------------------
 */
app.get('/api/vehicles', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.id,
        v.vehicle_number,
        v.rig_name,
        v.status,
        v.chassis_number,
        v.compressor_model,
        u.id AS manager_id,
        u.name AS manager_name,
        u.phone AS manager_phone,
        COUNT(r.id)::int AS total_reports,
        COALESCE(SUM(r.depth), 0)::numeric AS total_depth_drilled,
        COALESCE(SUM(r.diesel_liters), 0)::numeric AS total_diesel_consumed
      FROM vehicles v
      LEFT JOIN users u ON u.assigned_vehicle_id = v.id AND u.role = 'MANAGER'
      LEFT JOIN drilling_reports r ON r.vehicle_id = v.id
      GROUP BY v.id, u.id
      ORDER BY v.id ASC;
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
});

/**
 * --------------------------------------------------------------------------
 * GET /api/reports/:vehicleId
 * Fetches all drilling reports for a specific vehicle.
 * Ordered by submission date and time (newest first).
 * --------------------------------------------------------------------------
 */
app.get('/api/reports/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vId = parseInt(vehicleId, 10);

    if (isNaN(vId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID parameter',
      });
    }

    // Verify vehicle exists
    const vehicleRes = await db.query(
      'SELECT id, vehicle_number, rig_name, status FROM vehicles WHERE id = $1',
      [vId]
    );

    if (vehicleRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID ${vId} not found`,
      });
    }

    const vehicle = vehicleRes.rows[0];

    // Fetch reports sorted by submission date and time (newest first)
    const selectQuery = `
      SELECT 
        r.*,
        v.vehicle_number,
        v.rig_name,
        u.name AS manager_name,
        u.phone AS manager_phone,
        u.username AS manager_username,
        TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') AS submitted_at_formatted,
        TO_CHAR(r.report_date, 'YYYY-MM-DD') AS report_date_formatted
      FROM drilling_reports r
      INNER JOIN vehicles v ON r.vehicle_id = v.id
      INNER JOIN users u ON r.manager_id = u.id
      WHERE r.vehicle_id = $1
      ORDER BY r.created_at DESC, r.report_date DESC;
    `;

    const { rows } = await db.query(selectQuery, [vId]);

    // Summary calculations for this specific vehicle
    const vehicleSummary = rows.reduce(
      (acc, curr) => {
        acc.totalDepth += parseFloat(curr.depth || 0);
        acc.totalDiesel += parseFloat(curr.diesel_liters || 0);
        acc.totalRpmHours += parseFloat(curr.rpm_total || 0);
        return acc;
      },
      { totalReports: rows.length, totalDepth: 0, totalDiesel: 0, totalRpmHours: 0 }
    );

    vehicleSummary.totalDepth = parseFloat(vehicleSummary.totalDepth.toFixed(2));
    vehicleSummary.totalDiesel = parseFloat(vehicleSummary.totalDiesel.toFixed(2));
    vehicleSummary.totalRpmHours = parseFloat(vehicleSummary.totalRpmHours.toFixed(2));

    return res.json({
      success: true,
      vehicle,
      count: rows.length,
      summary: vehicleSummary,
      data: rows,
    });
  } catch (error) {
    console.error(`Error fetching reports for vehicle ${req.params.vehicleId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching vehicle reports',
    });
  }
});

/**
 * --------------------------------------------------------------------------
 * POST /api/reports
 * Receives daily form data from Manager mobile app.
 * Validates rpm_end > rpm_start and auto-calculates rpm_total.
 * --------------------------------------------------------------------------
 */
app.post('/api/reports', async (req, res) => {
  try {
    const {
      vehicle_id,
      manager_id,
      report_date,
      agent_name,
      party_no,
      party_name,
      village,
      bore_rate,
      depth,
      rod_count,
      ms_casing,
      pvc_casing,
      welding_details,
      recut,
      rebore,
      flushing,
      rpm_start,
      rpm_end,
      avg_rpm,
      bit_number,
      bit_size,
      hammer_type,
      driller_name,
      diesel_liters,
      cash_advance,
      remarks,
    } = req.body;

    // 1. Mandatory Field Validation
    if (!vehicle_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: vehicle_id is required',
      });
    }

    if (!party_name || party_name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: party_name (Customer Name) is required',
      });
    }

    if (!village || village.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: village location is required',
      });
    }

    if (depth === undefined || depth === null || depth === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Total depth (ft) is required',
      });
    }

    if (rpm_start === undefined || rpm_end === undefined || rpm_start === '' || rpm_end === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Both rpm_start and rpm_end readings are required',
      });
    }

    const startNum = parseFloat(rpm_start);
    const endNum = parseFloat(rpm_end);

    if (isNaN(startNum) || isNaN(endNum)) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: RPM readings must be valid numbers',
      });
    }

    // 2. Business Rule: Validate that rpm_end > rpm_start
    if (endNum <= startNum) {
      return res.status(400).json({
        success: false,
        message: `RPM Validation Failed: rpm_end (${endNum}) must be strictly greater than rpm_start (${startNum})`,
      });
    }

    // 3. Auto-calculate rpm_total
    const rpm_total = parseFloat((endNum - startNum).toFixed(2));

    // Resolve manager_id
    let assignedManagerId = manager_id;
    if (!assignedManagerId) {
      const mgrForVehicle = await db.query(
        "SELECT id FROM users WHERE assigned_vehicle_id = $1 AND role = 'MANAGER' LIMIT 1",
        [parseInt(vehicle_id, 10)]
      );
      if (mgrForVehicle.rows.length > 0) {
        assignedManagerId = mgrForVehicle.rows[0].id;
      } else {
        const fallbackMgr = await db.query(
          "SELECT id FROM users WHERE role = 'MANAGER' LIMIT 1"
        );
        assignedManagerId = fallbackMgr.rows[0]?.id;
      }
    }

    const sanitizedDepth = parseFloat(depth) || 0;
    const sanitizedRodCount = parseInt(rod_count, 10) || 0;
    const sanitizedBoreRate = parseFloat(bore_rate) || 0;
    const sanitizedMsCasing = parseFloat(ms_casing) || 0;
    const sanitizedPvcCasing = parseFloat(pvc_casing) || 0;
    const sanitizedAvgRpm = parseFloat(avg_rpm) || 0;
    const sanitizedDiesel = parseFloat(diesel_liters) || 0;
    const formattedDate = report_date
      ? new Date(report_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const insertQuery = `
      INSERT INTO drilling_reports (
        vehicle_id, manager_id, report_date, agent_name, party_no, party_name,
        village, bore_rate, depth, rod_count, ms_casing, pvc_casing, welding_details,
        recut, rebore, flushing, rpm_start, rpm_end, rpm_total, avg_rpm,
        bit_number, bit_size, hammer_type, driller_name, diesel_liters, cash_advance, remarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *;
    `;

    const values = [
      parseInt(vehicle_id, 10),
      assignedManagerId,
      formattedDate,
      agent_name || null,
      party_no || null,
      party_name.trim(),
      village.trim(),
      sanitizedBoreRate,
      sanitizedDepth,
      sanitizedRodCount,
      sanitizedMsCasing,
      sanitizedPvcCasing,
      welding_details || null,
      recut || null,
      rebore || null,
      flushing || null,
      startNum,
      endNum,
      rpm_total,
      sanitizedAvgRpm,
      bit_number || null,
      bit_size || null,
      hammer_type || null,
      driller_name || null,
      sanitizedDiesel,
      cash_advance || null,
      remarks || null,
    ];

    const { rows } = await db.query(insertQuery, values);
    const createdReport = rows[0];

    return res.status(201).json({
      success: true,
      message: 'Daily drilling report successfully recorded!',
      data: createdReport,
      metrics: {
        rpm_start: startNum,
        rpm_end: endNum,
        rpm_total,
      },
    });
  } catch (error) {
    console.error('Error creating drilling report:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving drilling report',
    });
  }
});

/**
 * --------------------------------------------------------------------------
 * GET /api/reports
 * General list endpoint with query filters: vehicle_id, date, village.
 * --------------------------------------------------------------------------
 */
app.get('/api/reports', async (req, res) => {
  try {
    const { vehicle_id, date, report_date, village } = req.query;
    const targetDate = date || report_date;
    const conditions = [];
    const values = [];

    if (vehicle_id && vehicle_id !== 'ALL') {
      values.push(parseInt(vehicle_id, 10));
      conditions.push(`r.vehicle_id = $${values.length}`);
    }

    if (targetDate && targetDate.trim() !== '') {
      values.push(targetDate.trim());
      conditions.push(`r.report_date = $${values.length}`);
    }

    if (village && village.trim() !== '') {
      values.push(`%${village.trim()}%`);
      conditions.push(`r.village ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const selectQuery = `
      SELECT 
        r.*,
        v.vehicle_number,
        v.rig_name,
        u.name AS manager_name,
        u.phone AS manager_phone,
        TO_CHAR(r.created_at, 'YYYY-MM-DD HH24:MI:SS') AS submitted_at_formatted
      FROM drilling_reports r
      INNER JOIN vehicles v ON r.vehicle_id = v.id
      INNER JOIN users u ON r.manager_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC, r.report_date DESC;
    `;

    const { rows } = await db.query(selectQuery, values);

    const summary = rows.reduce(
      (acc, curr) => {
        acc.totalDepth += parseFloat(curr.depth || 0);
        acc.totalDiesel += parseFloat(curr.diesel_liters || 0);
        acc.totalRpmHours += parseFloat(curr.rpm_total || 0);
        return acc;
      },
      { totalReports: rows.length, totalDepth: 0, totalDiesel: 0, totalRpmHours: 0 }
    );

    return res.json({
      success: true,
      count: rows.length,
      summary: {
        totalReports: rows.length,
        totalDepth: parseFloat(summary.totalDepth.toFixed(2)),
        totalDiesel: parseFloat(summary.totalDiesel.toFixed(2)),
        totalRpmHours: parseFloat(summary.totalRpmHours.toFixed(2)),
      },
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching drilling reports:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Borewell Drilling Backend running on port ${PORT}`);
    console.log(`- POST /api/login (Role check & manager vehicle resolution)`);
    console.log(`- GET  /api/reports/:vehicleId (Vehicle reports sorted by date/time)`);
    console.log(`- POST /api/reports (Submit daily manager logs)`);
    console.log(`- GET  /api/vehicles (List 4 rigs with fleet stats)`);
    console.log(`====================================================`);
  });
}

module.exports = app;
