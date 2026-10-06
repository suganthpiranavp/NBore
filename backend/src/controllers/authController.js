const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password, expected_role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Both username/email and password are required',
        });
      }

      const user = await UserModel.findByUsernameOrEmail(username);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials: User not found',
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact fleet admin.',
        });
      }

      // Check password
      const isMatch = UserModel.verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials: Incorrect password',
        });
      }

      // Role check if client passed expected_role
      if (expected_role && user.role !== expected_role) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role mismatch. Account is ${user.role}, but attempted login as ${expected_role}.`,
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const safeUser = {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        assigned_vehicle_id: user.assigned_vehicle_id,
        vehicle_number: user.vehicle_number,
        rig_name: user.rig_name,
      };

      return res.json({
        success: true,
        message: `Welcome ${user.name}! Authenticated as ${user.role}.`,
        token,
        role: user.role,
        user: safeUser,
        vehicle_id: user.assigned_vehicle_id,
        vehicle_number: user.vehicle_number,
        rig_name: user.rig_name,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication',
      });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          assigned_vehicle_id: user.assigned_vehicle_id,
          vehicle_number: user.vehicle_number,
          rig_name: user.rig_name,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  }
}

module.exports = AuthController;
