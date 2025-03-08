// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <span className="logo-text">PUCMM</span>
                </div>
            </div>

            <h1>Reservas de Laboratorio - EICT</h1>

            <nav className="header-actions">
                {location.pathname !== '/' && (
                    <Link to="/" className="header-link">
                        Reservas Activas
                    </Link>
                )}

                {location.pathname !== '/nueva-reserva' && (
                    <Link to="/nueva-reserva" className="header-link">
                        Nueva Reserva
                    </Link>
                )}

                {location.pathname !== '/registros-pasados' && (
                    <Link to="/registros-pasados" className="header-link">
                        Registros Pasados
                    </Link>
                )}

                <div className="settings-dropdown">
                    <button className="settings-button" onClick={toggleMenu}>
                        ⚙️ Ajustes
                    </button>
                    {showMenu && (
                        <div className="dropdown-menu">
                            <Link to="/configuracion-api" className="dropdown-item" onClick={() => setShowMenu(false)}>
                                Configuración API
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;