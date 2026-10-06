const UserModel = require('../models/User');

class UserController {
  static async listManagers(req, res) {
    try {
      const managers = await UserModel.getAllManagers();
      return res.json({
        success: true,
        count: managers.length,
        data: managers,
      });
    } catch (error) {
      console.error('Error listing managers:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch managers' });
    }
  }

  static async createManager(req, res) {
    try {
      const { name, username, phone, email, password, assigned_vehicle_id } = req.body;

      if (!name || !username) {
        return res.status(400).json({
          success: false,
          message: 'Manager full name and username are required',
        });
      }

      const newManager = await UserModel.createManager({
        name,
        username,
        phone,
        email,
        password,
        assigned_vehicle_id,
      });

      return res.status(201).json({
        success: true,
        message: `Manager ${newManager.name} created successfully and locked to Rig #${newManager.assigned_vehicle_id || 'None'}`,
        data: newManager,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error creating manager',
      });
    }
  }

  static async updateManager(req, res) {
    try {
      const { id } = req.params;
      const updated = await UserModel.updateManager(id, req.body);
      return res.json({
        success: true,
        message: 'Manager profile updated successfully',
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error updating manager',
      });
    }
  }

  static async assignVehicle(req, res) {
    try {
      const { id } = req.params;
      const { vehicle_id } = req.body;

      const updated = await UserModel.assignVehicle(id, vehicle_id);
      return res.json({
        success: true,
        message: `Successfully locked manager to Vehicle ID ${vehicle_id}`,
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error assigning vehicle',
      });
    }
  }
}

module.exports = UserController;
