import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import useNavigationConfig from '../../../hooks/useNavigationConfig';
import Sidebar from '../../../components/admin/Sidebar';
import Topbar from '../../../components/admin/Topbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarItems, quickAccess, roleName, accessibleFeatures } = useNavigationConfig();

  const toggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const topbarQuickLinks = useMemo(
    () =>
      quickAccess.slice(0, 3).map((feature) => ({
        key: feature.key,
        label: feature.label,
        icon: feature.icon,
        path: `/app/${feature.path}`,
      })),
    [quickAccess]
  );

  const notificationsFeature = useMemo(
    () => accessibleFeatures.find((feature) => feature.key === 'notifications'),
    [accessibleFeatures]
  );

  const profileFeature = useMemo(
    () => accessibleFeatures.find((feature) => feature.key === 'profile'),
    [accessibleFeatures]
  );

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarCollapsed}
        onToggle={toggleSidebar}
        currentPath={location.pathname}
        items={sidebarItems}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Topbar
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          user={user}
          isSidebarCollapsed={sidebarCollapsed}
          roleName={roleName}
          quickLinks={topbarQuickLinks}
          notificationsPath={notificationsFeature ? `/app/${notificationsFeature.path}` : null}
          profilePath={profileFeature ? `/app/${profileFeature.path}` : null}
        />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
