const app = require('./src/app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚜 Borewell Drilling Fleet API running on port ${PORT}`);
    console.log(`- Modular Architecture: Auth, Users, Vehicles, Entries`);
    console.log(`- Auth API:     POST /api/auth/login, GET /api/auth/me`);
    console.log(`- Users API:    GET/POST /api/users/managers, PUT /api/users/managers/:id/assign-vehicle`);
    console.log(`- Vehicles API: GET  /api/vehicles`);
    console.log(`- Entries API:  GET/POST /api/entries, GET /api/entries/vehicle/:id`);
    console.log(`====================================================`);
  });
}

module.exports = app;
