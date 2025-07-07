import React, { useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Sidebar from "../../../components/admin/Sidebar";
import Topbar from "../../../components/admin/Topbar";
import Owners from "../owners/Owners";
import Guards from "../guard/Guards";
import Apartments from "../apartments/Apartments";
import Towers from "../towers/Towers";
import Payments from "../payments/Payments";
import Surveys from "../surveys/Surveys";
import Reservations from "../reservations/Reservations";
import PQRS from "../pqrs/PQRS";
import Notifications from "../notifications/Notifications";
import Parking from "../parking/Parking";
import Pets from "../pets/Pets";
import Profile from "../profile/Profile";
import Visitors from "../visitors/Visitors";
import Facilities from "../facilities/Facilities";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderDashboardCards = () => {
    const cards = [
      { to: "/admin/owners", icon: "bi-person-fill", label: "PROPIETARIOS" },
      { to: "/admin/guards", icon: "bi-shield-fill", label: "VIGILANTES" },
      { to: "/admin/apartments", icon: "bi-house-door", label: "APARTAMENTOS" },
      {
        to: "/admin/reservations",
        icon: "bi-calendar-event",
        label: "RESERVAS",
      },
      { to: "/admin/surveys", icon: "bi-clipboard-data", label: "ENCUESTAS" },
      { to: "/admin/payments", icon: "bi-cash", label: "PAGOS" },
      { to: "/admin/pqrs", icon: "bi-question-circle", label: "PQRS" },
      { to: "/admin/notifications", icon: "bi-bell", label: "NOTIFICACIONES" },
      { to: "/admin/parking", icon: "bi-p-circle", label: "PARQUEADEROS" },
      { to: "/admin/pets", icon: "bi-heart", label: "MASCOTAS" },
      { to: "/admin/visitors", icon: "bi-door-open", label: "VISITANTES" },
      { to: "/admin/facilities", icon: "bi-gear", label: "ZONAS COMUNES" },
    ];

    return (
      <div className="container-fluid p-4">
        <div className="dashboard-header mb-5">
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="dashboard-subtitle">Gestiona todos los aspectos de tu conjunto residencial</p>
        </div>
        
        <div className="dashboard-cards-grid">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.to}
              className="dashboard-card-link"
              aria-label={`Ir a ${card.label.toLowerCase()}`}
            >
              <div className="dashboard-card-item">
                <div className="card-icon-wrapper">
                  <i className={`bi ${card.icon} card-icon`} aria-hidden="true"></i>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{card.label}</h3>
                  <div className="card-arrow">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
                <div className="card-overlay"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarCollapsed}
        onToggle={toggleSidebar}
        currentPath={location.pathname}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? "expanded" : ""}`}>
        <Topbar
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          user={user}
          isSidebarCollapsed={sidebarCollapsed}
        />

        <div className="dashboard-content">
          <Routes>
            <Route path="" element={renderDashboardCards()} />
            <Route path="owners" element={<Owners />} />
            <Route path="guards" element={<Guards />} />
            <Route path="apartments" element={<Apartments />} />
            <Route path="towers" element={<Towers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="pqrs" element={<PQRS />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="parking" element={<Parking />} />
            <Route path="pets" element={<Pets />} />
            <Route path="profile" element={<Profile />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="facilities" element={<Facilities />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
