const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'borewell-super-secret-key-2026';

/**
 * Verifies JWT token or session header and attaches user to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: No authentication token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    // Handle mock token or standard JWT
    if (token.startsWith('mock-jwt-')) {
      const parts = token.split('-');
      const userId = parts.slice(3).join('-');
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid session token' });
      }
      req.user = user;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found for token' });
      }
      req.user = user;
      next();
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failure',
    });
  }
};

/**
 * Role-Based Access Control Guard
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Enforces Manager Vehicle Lock
 */
const requireVehicleLock = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  // Admins have global override
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // If Manager, ensure vehicle_id matches their locked assigned_vehicle_id
  const submittedVehicleId = req.body.vehicle_id || req.params.vehicleId || req.query.vehicle_id;
  if (!req.user.assigned_vehicle_id) {
    return res.status(403).json({
      success: false,
      message: 'Manager account is not assigned to any drilling vehicle. Contact Fleet Admin.',
    });
  }

  if (submittedVehicleId && parseInt(submittedVehicleId, 10) !== req.user.assigned_vehicle_id) {
    return res.status(403).json({
      success: false,
      message: `Vehicle Lock Violation: You are locked to Rig #${req.user.assigned_vehicle_id} and cannot submit or view Rig #${submittedVehicleId}.`,
    });
  }

  next();
};

module.exports = {
  JWT_SECRET,
  verifyToken,
  requireRole,
  requireVehicleLock,
};
