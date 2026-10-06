const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// User management endpoints (Admins only for modification)
router.get('/managers', UserController.listManagers);
router.post('/managers', UserController.createManager);
router.put('/managers/:id', UserController.updateManager);
router.put('/managers/:id/assign-vehicle', UserController.assignVehicle);

module.exports = router;
