const express = require('express');
const router = express.Router();
const EntryController = require('../controllers/entryController');
const { validateDailyEntry } = require('../middleware/validateMiddleware');

// Daily Entry routes
router.post('/', validateDailyEntry, EntryController.submitEntry);
router.get('/', EntryController.getGlobalFeed);
router.get('/vehicle/:vehicleId', EntryController.getVehicleEntries);
router.get('/:id', EntryController.getEntryById);

module.exports = router;
