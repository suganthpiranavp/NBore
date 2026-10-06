const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');

router.get('/', VehicleController.listVehicles);
router.get('/:id', VehicleController.getVehicleById);
router.patch('/:id/status', VehicleController.updateStatus);

module.exports = router;
