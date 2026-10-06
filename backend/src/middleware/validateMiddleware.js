/**
 * Validation Middleware for Drilling Daily Log Submissions
 */
const validateDailyEntry = (req, res, next) => {
  const {
    vehicle_id,
    party_name,
    village,
    depth,
    rpm_start,
    rpm_end,
  } = req.body;

  const errors = [];

  if (!vehicle_id) {
    errors.push('Assigned vehicle_id is required');
  }

  if (!party_name || party_name.trim() === '') {
    errors.push('Party Name (Customer) is required');
  }

  if (!village || village.trim() === '') {
    errors.push('Village / Location is required');
  }

  if (depth === undefined || depth === null || depth === '') {
    errors.push('Drilling Depth (ft) is required');
  } else if (isNaN(parseFloat(depth)) || parseFloat(depth) < 0) {
    errors.push('Drilling Depth must be a non-negative number');
  }

  if (rpm_start === undefined || rpm_start === '' || isNaN(parseFloat(rpm_start))) {
    errors.push('Valid RPM Start hour reading is required');
  }

  if (rpm_end === undefined || rpm_end === '' || isNaN(parseFloat(rpm_end))) {
    errors.push('Valid RPM End hour reading is required');
  }

  const startNum = parseFloat(rpm_start);
  const endNum = parseFloat(rpm_end);

  if (!isNaN(startNum) && !isNaN(endNum)) {
    if (endNum <= startNum) {
      errors.push(
        `RPM Validation Failed: RPM End (${endNum}) must be strictly greater than RPM Start (${startNum})`
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateDailyEntry,
};
