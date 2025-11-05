/**
 * ISHEBOT - Classic Dashboard Component
 * Original dashboard view for student management
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import FuturisticDashboard from './FuturisticDashboard';

/**
 * Classic Dashboard - currently redirects to Futuristic Dashboard
 * Can be customized for a different look/feel if needed
 */
const Dashboard: React.FC = () => {
  return <FuturisticDashboard />;
};

export default Dashboard;
