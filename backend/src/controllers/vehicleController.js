const VehicleModel = require('../models/Vehicle');

class VehicleController {
  static async listVehicles(req, res) {
    try {
      const vehicles = await VehicleModel.getAllWithStats();
      return res.json({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error) {
      console.error('Error listing vehicles:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
  }

  static async getVehicleById(req, res) {
    try {
      const vehicle = await VehicleModel.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }
      return res.json({ success: true, data: vehicle });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error retrieving vehicle' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await VehicleModel.updateStatus(req.params.id, status);
      return res.json({ success: true, data: updated });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = VehicleController;
