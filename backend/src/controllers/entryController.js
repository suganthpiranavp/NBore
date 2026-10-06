const DailyEntryModel = require('../models/DailyEntry');
const UserModel = require('../models/User');

class EntryController {
  static async submitEntry(req, res) {
    try {
      const payload = req.body;

      // Determine manager ID
      let managerId = payload.manager_id;
      if (req.user) {
        managerId = req.user.id;
        // If user is MANAGER, ensure locked vehicle is respected
        if (req.user.role === 'MANAGER') {
          payload.vehicle_id = req.user.assigned_vehicle_id;
        }
      }

      if (!managerId) {
        // Fallback to vehicle's currently assigned manager
        const managers = await UserModel.getAllManagers();
        const found = managers.find((m) => m.assigned_vehicle_id === parseInt(payload.vehicle_id, 10));
        managerId = found ? found.id : 'b0000000-0000-0000-0000-000000000001';
      }

      payload.manager_id = managerId;

      const created = await DailyEntryModel.create(payload);

      return res.status(201).json({
        success: true,
        message: 'Daily drilling entry recorded successfully!',
        data: created,
        metrics: {
          rpm_start: created.rpm_start,
          rpm_end: created.rpm_end,
          rpm_total: created.rpm_total,
        },
      });
    } catch (error) {
      console.error('Error submitting daily entry:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal error saving daily entry',
      });
    }
  }

  static async getGlobalFeed(req, res) {
    try {
      const { vehicle_id, date, village, search } = req.query;
      const entries = await DailyEntryModel.getAll({ vehicle_id, date, village, search });

      const summary = entries.reduce(
        (acc, curr) => {
          acc.totalDepth += parseFloat(curr.depth || 0);
          acc.totalDiesel += parseFloat(curr.diesel_liters || 0);
          acc.totalRpmHours += parseFloat(curr.rpm_total || 0);
          return acc;
        },
        { totalReports: entries.length, totalDepth: 0, totalDiesel: 0, totalRpmHours: 0 }
      );

      summary.totalDepth = parseFloat(summary.totalDepth.toFixed(2));
      summary.totalDiesel = parseFloat(summary.totalDiesel.toFixed(2));
      summary.totalRpmHours = parseFloat(summary.totalRpmHours.toFixed(2));

      return res.json({
        success: true,
        count: entries.length,
        summary,
        data: entries,
      });
    } catch (error) {
      console.error('Error getting global feed:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch global feed' });
    }
  }

  static async getVehicleEntries(req, res) {
    try {
      const { vehicleId } = req.params;
      const entries = await DailyEntryModel.getByVehicleId(vehicleId);

      const summary = entries.reduce(
        (acc, curr) => {
          acc.totalDepth += parseFloat(curr.depth || 0);
          acc.totalDiesel += parseFloat(curr.diesel_liters || 0);
          acc.totalRpmHours += parseFloat(curr.rpm_total || 0);
          return acc;
        },
        { totalReports: entries.length, totalDepth: 0, totalDiesel: 0, totalRpmHours: 0 }
      );

      summary.totalDepth = parseFloat(summary.totalDepth.toFixed(2));
      summary.totalDiesel = parseFloat(summary.totalDiesel.toFixed(2));
      summary.totalRpmHours = parseFloat(summary.totalRpmHours.toFixed(2));

      return res.json({
        success: true,
        count: entries.length,
        summary,
        data: entries,
      });
    } catch (error) {
      console.error('Error getting vehicle entries:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch vehicle entries' });
    }
  }

  static async getEntryById(req, res) {
    try {
      const entry = await DailyEntryModel.getById(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Drilling entry not found' });
      }
      return res.json({ success: true, data: entry });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error retrieving entry' });
    }
  }
}

module.exports = EntryController;
