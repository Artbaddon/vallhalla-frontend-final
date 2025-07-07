import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/home/home-page.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Header with Navigation */}
      <header>
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand">
              Puerta Alameda
              <small>Puerta de Alameda Valhalla</small>
            </Link>

            {/* Toggler Button */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01">
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Collapsible Content */}
            <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    <i className="bi bi-person-circle me-2"></i>Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Carousel Section */}
      <section className="carousel-section">
        <div className="container">
          <h3 className="carousel-title">FOTOS DEL CONJUNTO</h3>

          <div className="carousel rounded">
            <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
              {/* Indicators */}
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" className="active"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="3"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="4"></button>
              </div>

              {/* Carousel Items */}
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="https://images.adsttc.com/media/images/5cae/859d/284d/d19a/9100/03f3/newsletter/_FI.jpg?1554941328"
                    alt="Modern apartment building exterior" />
                </div>
                <div className="carousel-item">
                  <img src="https://th.bing.com/th/id/OIP.H6Xy3eF8Ggfa0UlP5_Bg5wHaEx?rs=1&pid=ImgDetMain"
                    alt="Residential complex" />
                </div>
                <div className="carousel-item">
                  <img src="https://www.thesingledose.com/wp-content/uploads/2023/05/5b771054209cc-scaled.jpeg"
                    alt="Contemporary housing" />
                </div>
                <div className="carousel-item">
                  <img src="https://images.adsttc.com/media/images/5cae/859d/284d/d19a/9100/03f3/newsletter/_FI.jpg?1554941328"
                    alt="Modern apartment building" />
                </div>
                <div className="carousel-item">
                  <img src="https://th.bing.com/th/id/OIP.qoZTYhL0CHqM2UDPf9lzDgHaEK?w=1280&h=720&rs=1&pid=ImgDetMain"
                    alt="Residential development" />
                </div>
              </div>

              {/* Controls */}
              <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Section */}
      <section className="announcement-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 mb-4">
              <div className="card announcement-card">
                <div className="row g-0">
                  <div className="col-md-4 d-none d-md-block">
                    <img src="https://th.bing.com/th/id/OIP.EVkEQXpDudjbwX0pjx15dwHaE7?rs=1&pid=ImgDetMain"
                      className="announcement-img" alt="Featured post image" />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body h-100 d-flex flex-column">
                      <h3 className="card-title">Nuevas Amenidades</h3>
                      <div className="text-muted mb-2">12 de Noviembre, 2024</div>
                      <p className="card-text">
                        Estamos emocionados de anunciar la apertura de nuestras nuevas amenidades. 
                        Disfruta de nuestra piscina, gimnasio y área social completamente renovada.
                      </p>
                      <Link to="#" className="btn btn-primary mt-auto align-self-start">Leer más</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-10">
              <div className="card announcement-card">
                <div className="row g-0">
                  <div className="col-md-4 d-none d-md-block">
                    <img src="https://th.bing.com/th/id/OIP.EVkEQXpDudjbwX0pjx15dwHaE7?rs=1&pid=ImgDetMain"
                      className="announcement-img" alt="Featured post image" />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body h-100 d-flex flex-column">
                      <h3 className="card-title">Mantenimiento Programado</h3>
                      <div className="text-muted mb-2">10 de Noviembre, 2024</div>
                      <p className="card-text">
                        Informamos a nuestra comunidad sobre el mantenimiento programado 
                        para el próximo fin de semana. Apreciamos su comprensión.
                      </p>
                      <Link to="#" className="btn btn-primary mt-auto align-self-start">Leer más</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 