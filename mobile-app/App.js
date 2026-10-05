import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import ManagerDashboard from './ManagerDashboard';

export default function App() {
  const [managerSession, setManagerSession] = useState(null);

  const handleLoginSuccess = (sessionData) => {
    // sessionData contains: { user, vehicle_id, vehicle_number, rig_name, token }
    setManagerSession(sessionData);
  };

  const handleLogout = () => {
    setManagerSession(null);
  };

  if (!managerSession) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ManagerDashboard
      user={managerSession.user}
      vehicleId={managerSession.vehicle_id}
      vehicleNumber={managerSession.vehicle_number}
      rigName={managerSession.rig_name}
      onLogout={handleLogout}
    />
  );
}
