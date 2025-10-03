import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import './DashboardHome.css';

const accentPalette = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#20c9a6', '#858796'];

const DashboardHome = () => {
  const { accessibleFeatures, roleName, roleKey } = useNavigationConfig();

  const featureMap = useMemo(
    () => new Map(accessibleFeatures.map((feature) => [feature.key, feature])),
    [accessibleFeatures]
  );

  const buildCard = (feature) => {
    if (!feature?.path) return null;
    return {
      key: feature.key,
      label: (feature.label || '').toUpperCase(),
      icon: feature.icon || 'bi-grid',
      link: `/app/${feature.path}`,
      highlight: Boolean(feature.quickAccess),
    };
  };

  const orderedCards = useMemo(() => {
    const pick = (keys) =>
      keys
  .map((key) => featureMap.get(key))
  .map(buildCard)
  .filter(Boolean);

    if (roleKey === 'ADMIN') {
      const adminOrder = [
        'owners',
        'guards',
        'apartments',
        'towers',
        'tenants',
        'reservations',
        'surveys',
        'payments',
        'pqrs',
        'notifications',
        'parking',
        'pets',
        'visitors',
        'facilities',
        'profile',
      ];
      const primary = pick(adminOrder);
      const remaining = accessibleFeatures
        .filter((feature) => feature.key !== 'dashboard' && !adminOrder.includes(feature.key))
        .map(buildCard)
        .filter(Boolean);
      return [...primary, ...remaining];
    }

    if (roleKey === 'OWNER') {
      const ownerOrder = ['payments', 'reservations', 'surveys', 'pets', 'pqrs', 'notifications', 'profile'];
      return pick(ownerOrder);
    }

    if (roleKey === 'SECURITY') {
      const securityOrder = ['visitors', 'parking', 'profile'];
      return pick(securityOrder);
    }

    return accessibleFeatures
      .filter((feature) => feature.key !== 'dashboard')
      .map(buildCard)
      .filter(Boolean);
  }, [accessibleFeatures, featureMap, roleKey]);

  const cards = useMemo(() => {
    const seen = new Set();
    const deduped = [];
    orderedCards.forEach((card) => {
      if (!seen.has(card.key)) {
        seen.add(card.key);
        deduped.push(card);
      }
    });
    return deduped.map((card, index) => ({
      ...card,
      accent: accentPalette[index % accentPalette.length],
    }));
  }, [orderedCards]);

  const subtitle = useMemo(() => {
    if (roleKey === 'ADMIN') {
      return 'Gestiona todos los módulos del conjunto desde un solo lugar.';
    }
    if (roleKey === 'OWNER') {
      return 'Consulta tus pagos, reservas, PQRS y novedades del conjunto.';
    }
    if (roleKey === 'SECURITY') {
      return 'Controla visitantes, registra movimientos y consulta parqueaderos.';
    }
    return roleName ? `Bienvenido ${roleName} a VALHALLA` : 'Bienvenido al sistema de administración de VALHALLA';
  }, [roleKey, roleName]);

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel de Control</h1>
        <p className="dashboard-subtitle">{subtitle}</p>
      </div>

      {cards.length ? (
        <div className="dashboard-cards-grid">
          {cards.map((card) => (
            <Link key={card.key} to={card.link} className="dashboard-card-link">
              <div className="dashboard-card-item">
                <div className="card-icon-wrapper" style={{ color: card.accent }}>
                  <i className={`bi ${card.icon} card-icon`} aria-hidden="true"></i>
                </div>
                <div className="card-content">
                  <div className="card-text">
                    <h3 className="card-title">{card.label}</h3>
                    {card.highlight && <span className="card-badge">ACCESO RÁPIDO</span>}
                  </div>
                  <div className="card-arrow">
                    <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
                <div className="card-overlay" style={{ background: `${card.accent}15` }}></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <i className="bi bi-grid"></i>
          <h3>No tienes módulos disponibles</h3>
          <p>Contacta al administrador para asignarte permisos o funcionalidades.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;