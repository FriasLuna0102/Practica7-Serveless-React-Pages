// src/components/ReservasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchActiveReservations } from '../services/api';

const ReservasList = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReservations = async () => {
            try {
                setLoading(true);
                const data = await fetchActiveReservations();
                setReservas(data);
                setError(null);
            } catch (err) {
                setError('Error al cargar las reservas: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        loadReservations();

        // Recargar datos cada minuto
        const intervalId = setInterval(loadReservations, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const formatDateTime = (dateTimeArray) => {
        if (!dateTimeArray || !Array.isArray(dateTimeArray)) return 'Fecha inválida';

        const [year, month, day, hour, minute] = dateTimeArray;
        const date = new Date(year, month - 1, day, hour, minute);

        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Función para determinar el estado de una reserva basado en su horario
    const getReservationStatus = (horario) => {
        if (!horario || !Array.isArray(horario)) return 'invalid';

        const [year, month, day, hour, minute] = horario;
        const reservaDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

        // Si la fecha de reserva es hoy
        if (reservaDate.toDateString() === now.toDateString()) {
            // Si la hora ya pasó
            if (reservaDate < now) {
                return 'in-progress';
            }
            // Si la reserva es en menos de 1 hora
            if (reservaDate - now < 3600000) {
                return 'upcoming';
            }
        }

        return 'scheduled';
    };

    if (loading) {
        return (
            <div className="reservas-list loading-container">
                <div className="loading">
                    <span>Cargando reservas</span>
                    <span className="loading-dots">...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reservas-list">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reservas-list">
            <div className="list-header">
                <h2>Reservas Activas</h2>
                <div className="actions">
                    <Link to="/nueva-reserva" className="add-button">
                        <span className="icon">+</span> Nueva Reserva
                    </Link>
                </div>
            </div>

            {reservas.length === 0 ? (
                <div className="no-results">
                    <p>No hay reservas activas en este momento.</p>
                    <p className="suggestion">Haz clic en "Nueva Reserva" para crear una.</p>
                </div>
            ) : (
                <>
                    <div className="reservas-count">
                        Mostrando {reservas.length} reserva{reservas.length !== 1 ? 's' : ''}
                    </div>
                    <div className="table-container">
                        <table className="reservas-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Laboratorio</th>
                                <th>Fecha y Hora</th>
                                <th>Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reservas.map((reserva) => {
                                const status = getReservationStatus(reserva.horario);

                                return (
                                    <tr key={reserva.id} className={`status-${status}`}>
                                        <td>{reserva.idEstudiante}</td>
                                        <td>{reserva.nombre}</td>
                                        <td>
                                                <span className="lab-badge">
                                                    {reserva.laboratorio}
                                                </span>
                                        </td>
                                        <td>{formatDateTime(reserva.horario)}</td>
                                        <td>
                                                <span className={`status-indicator ${status}`}>
                                                    {status === 'in-progress' && 'En curso'}
                                                    {status === 'upcoming' && 'Próxima'}
                                                    {status === 'scheduled' && 'Programada'}
                                                    {status === 'invalid' && 'Inválida'}
                                                </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReservasList;