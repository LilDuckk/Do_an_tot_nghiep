import { useState } from 'react';

export const useAlerts = () => {
  const [alertsVisible, setAlertsVisible] = useState(false);
 
  return {
    alertsVisible,
    setAlertsVisible
  };
}; 