// src/components/ApiConfig.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateApiConfig } from '../services/api';

// Claves para localStorage
const LS_API_BASE_URL = 'api_base_url';
const LS_ENDPOINT_ACTIVE = 'endpoint_active_reservations';
const LS_ENDPOINT_HISTORICAL = 'endpoint_historical_reservations';
const LS_ENDPOINT_CREATE = 'endpoint_create_reservation';

// Valores por defecto
const DEFAULT_API_BASE_URL = 'https://0no4rqbxuc.execute-api.us-east-1.amazonaws.com/default';
const DEFAULT_ENDPOINT_ACTIVE = 'ObtenerReservasActivas';
const DEFAULT_ENDPOINT_HISTORICAL = 'ObtenerReservasRango';
const DEFAULT_ENDPOINT_CREATE = 'CrearReserva';

const ApiConfig = () => {
    const [apiConfig, setApiConfig] = useState({
        baseUrl: localStorage.getItem(LS_API_BASE_URL) || DEFAULT_API_BASE_URL,
        activeEndpoint: localStorage.getItem(LS_ENDPOINT_ACTIVE) || DEFAULT_ENDPOINT_ACTIVE,
        historicalEndpoint: localStorage.getItem(LS_ENDPOINT_HISTORICAL) || DEFAULT_ENDPOINT_HISTORICAL,
        createEndpoint: localStorage.getItem(LS_ENDPOINT_CREATE) || DEFAULT_ENDPOINT_CREATE
    });

    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApiConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReset = () => {
        setApiConfig({
            baseUrl: DEFAULT_API_BASE_URL,
            activeEndpoint: DEFAULT_ENDPOINT_ACTIVE,
            historicalEndpoint: DEFAULT_ENDPOINT_HISTORICAL,
            createEndpoint: DEFAULT_ENDPOINT_CREATE
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            // Validar que la URL base es válida
            new URL(apiConfig.baseUrl);

            // Guardar configuración
            updateApiConfig(
                apiConfig.baseUrl,
                apiConfig.activeEndpoint,
                apiConfig.historicalEndpoint,
                apiConfig.createEndpoint
            );

            setSuccess(true);
            setError(null);
            setIsEditing(false);

            // Mostrar mensaje de éxito por 3 segundos
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError('La URL base no es válida. Por favor, ingresa una URL válida.');
        }
    };

    return (
        <div className="api-config-container">
            <div className="config-header">
                <h2>Configuración de API</h2>
                <Link to="/" className="back-link">
                    ← Volver a reservas
                </Link>
            </div>

            {success && (
                <div className="success-message">
                    <span className="icon">✓</span> Configuración guardada correctamente
                </div>
            )}

            {error && (
                <div className="error-message">
                    <span className="icon">!</span> {error}
                </div>
            )}

            <div className="config-content">
                <div className="current-config">
                    <h3>Configuración Actual</h3>
                    <div className="config-item">
                        <strong>URL Base:</strong>
                        <div className="config-value">{apiConfig.baseUrl}</div>
                    </div>
                    <div className="config-item">
                        <strong>Endpoint Reservas Activas:</strong>
                        <div className="config-value">{apiConfig.activeEndpoint}</div>
                    </div>
                    <div className="config-item">
                        <strong>Endpoint Reservas Históricas:</strong>
                        <div className="config-value">{apiConfig.historicalEndpoint}</div>
                    </div>
                    <div className="config-item">
                        <strong>Endpoint Crear Reserva:</strong>
                        <div className="config-value">{apiConfig.createEndpoint}</div>
                    </div>

                    <div className="config-actions">
                        <button
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Editar Configuración
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className="edit-config">
                        <h3>Editar Configuración</h3>
                        <form onSubmit={handleSubmit} className="config-form">
                            <div className="form-group">
                                <label htmlFor="baseUrl">URL Base:</label>
                                <input
                                    type="text"
                                    id="baseUrl"
                                    name="baseUrl"
                                    value={apiConfig.baseUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.execute-api.us-east-1.amazonaws.com/stage"
                                />
                                <small className="help-text">Ej: https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/default</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="activeEndpoint">Endpoint Reservas Activas:</label>
                                <input
                                    type="text"
                                    id="activeEndpoint"
                                    name="activeEndpoint"
                                    value={apiConfig.activeEndpoint}
                                    onChange={handleChange}
                                    placeholder="ObtenerReservasActivas"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="historicalEndpoint">Endpoint Reservas Históricas:</label>
                                <input
                                    type="text"
                                    id="historicalEndpoint"
                                    name="historicalEndpoint"
                                    value={apiConfig.historicalEndpoint}
                                    onChange={handleChange}
                                    placeholder="ObtenerReservasRango"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="createEndpoint">Endpoint Crear Reserva:</label>
                                <input
                                    type="text"
                                    id="createEndpoint"
                                    name="createEndpoint"
                                    value={apiConfig.createEndpoint}
                                    onChange={handleChange}
                                    placeholder="crear"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Guardar Cambios
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="reset-btn"
                                    onClick={handleReset}
                                >
                                    Restaurar Valores Predeterminados
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiConfig;