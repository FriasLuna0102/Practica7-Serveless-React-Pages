import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchHistoricalReservations } from '../services/api';

const HistoricalSearch = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [isCustomFilter, setIsCustomFilter] = useState(false);

    // Añadir estado para filtro y búsqueda
    const [filterText, setFilterText] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'horario', direction: 'descending' });

    // Cargar automáticamente todas las reservas pasadas al montar el componente
    useEffect(() => {
        loadAllPastReservations();
    }, []);

    // Función para cargar todas las reservas pasadas
    const loadAllPastReservations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fecha de inicio desde hace un año (puedes ajustar esto)
            const start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            start.setHours(0, 0, 0, 0);

            // Fecha de fin (hoy)
            const end = new Date();
            end.setHours(23, 59, 59, 999);

            console.log('Cargando todas las reservas pasadas desde', start, 'hasta', end);
            const data = await fetchHistoricalReservations(start, end);
            setReservas(data);
            setSearched(true);
            setIsCustomFilter(false);

            // Establecer las fechas en los inputs para reflejar el rango cargado
            setStartDate(formatDateForInput(start));
            setEndDate(formatDateForInput(end));
        } catch (err) {
            setError('Error al cargar reservas pasadas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear Date para input type="date"
    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            setError('Por favor seleccione fechas de inicio y fin');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Crear objetos Date con horarios específicos
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Inicio del día

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Final del día

            // Validar que la fecha de inicio sea anterior a la fecha de fin
            if (start > end) {
                setError('La fecha de inicio debe ser anterior a la fecha de fin');
                setLoading(false);
                return;
            }

            console.log('Buscando reservas desde', start, 'hasta', end);
            const data = await fetchHistoricalReservations(start, end);
            setReservas(data);
            setSearched(true);
            setIsCustomFilter(true);
            setFilterText(''); // Reset filter when new search is performed
        } catch (err) {
            setError('Error al buscar reservas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para limpiar el filtro y volver a mostrar todas las reservas pasadas
    const handleResetFilter = () => {
        loadAllPastReservations();
    };

    const formatDateTime = (dateTimeArray) => {
        // Si es un array, convertir [año, mes, día, hora, minuto] a una cadena legible
        if (Array.isArray(dateTimeArray)) {
            const [year, month, day, hour, minute] = dateTimeArray;
            const date = new Date(year, month - 1, day, hour, minute);

            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        // Si es una string ISO o un objeto Date
        else if (dateTimeArray) {
            const date = new Date(dateTimeArray);
            if (!isNaN(date)) {
                return date.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }

        return 'Fecha inválida';
    };

    // Función para ordenar datos de tabla
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filtrar y ordenar los resultados
    const getFilteredAndSortedReservas = () => {
        // Filtrar por texto
        let filteredData = reservas;
        if (filterText) {
            const lowercaseFilter = filterText.toLowerCase();
            filteredData = reservas.filter(item => {
                return (
                    item.nombre?.toLowerCase().includes(lowercaseFilter) ||
                    item.idEstudiante?.toString().includes(lowercaseFilter) ||
                    item.laboratorio?.toLowerCase().includes(lowercaseFilter)
                );
            });
        }

        // Ordenar datos
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                if (sortConfig.key === 'horario') {
                    // Manejar diferentes formatos de fecha
                    const getDateValue = (horario) => {
                        if (Array.isArray(horario)) {
                            const [year, month, day, hour, minute] = horario;
                            return new Date(year, month - 1, day, hour, minute).getTime();
                        } else {
                            return new Date(horario).getTime();
                        }
                    };

                    const dateA = getDateValue(a.horario);
                    const dateB = getDateValue(b.horario);

                    if (sortConfig.direction === 'ascending') {
                        return dateA - dateB;
                    } else {
                        return dateB - dateA;
                    }
                } else {
                    // Comparar strings o números
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }

        return filteredData;
    };

    const filteredReservas = getFilteredAndSortedReservas();

    // Función para obtener la clase de ordenamiento
    const getSortClass = (key) => {
        if (sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
    };

    return (
        <div className="historical-search">
            <div className="search-header">
                <h2>Registros Pasados</h2>
                <Link to="/" className="back-link">
                    ← Volver a reservas activas
                </Link>
            </div>

            <div className="search-panel">
                {/* Formulario de búsqueda con botones de filtro ENCIMA de los inputs de fecha */}
                <form onSubmit={handleSearch} className="date-search-form">
                    {/* Botones de acción colocados ANTES de los inputs de fecha */}
                    <div className="form-group button-group" style={{ marginBottom: '1rem' }}>
                        <button type="submit" disabled={loading} className="search-button">
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <span>Filtrar</span>
                            )}
                        </button>

                        {isCustomFilter && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                disabled={loading}
                                className="reset-button"
                            >
                                Mostrar Todos
                            </button>
                        )}
                    </div>

                    {/* Inputs de fecha DEBAJO de los botones */}
                    <div className="date-inputs-container">
                        <div className="form-group">
                            <label htmlFor="startDate">Fecha Inicio:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={loading}
                                className="date-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">Fecha Fin:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={loading}
                                className="date-input"
                            />
                        </div>
                    </div>
                </form>

                {error && <div className="error-message">{error}</div>}
            </div>

            {searched && (
                <div className="search-results">
                    <div className="results-header">
                        <h3>
                            {isCustomFilter
                                ? `Resultados de Búsqueda (${startDate} - ${endDate})`
                                : "Todas las Reservas Pasadas"}
                        </h3>
                        <div className="results-meta">
                            {filteredReservas.length} reserva{filteredReservas.length !== 1 ? 's' : ''} encontrada{filteredReservas.length !== 1 ? 's' : ''}
                        </div>
                        {reservas.length > 0 && (
                            <div className="filter-container">
                                <input
                                    type="text"
                                    placeholder="Filtrar resultados..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="filter-input"
                                />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Cargando reservas...</p>
                        </div>
                    ) : filteredReservas.length === 0 ? (
                        <div className="no-results">
                            <p>No se encontraron reservas en el rango de fechas seleccionado.</p>
                            {filterText && (
                                <p>Prueba con otros criterios de búsqueda o elimina el filtro actual.</p>
                            )}
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="reservas-table">
                                <thead>
                                <tr>
                                    <th
                                        onClick={() => requestSort('idEstudiante')}
                                        className={getSortClass('idEstudiante')}
                                    >
                                        ID Estudiante
                                    </th>
                                    <th
                                        onClick={() => requestSort('nombre')}
                                        className={getSortClass('nombre')}
                                    >
                                        Nombre
                                    </th>
                                    <th
                                        onClick={() => requestSort('laboratorio')}
                                        className={getSortClass('laboratorio')}
                                    >
                                        Laboratorio
                                    </th>
                                    <th
                                        onClick={() => requestSort('horario')}
                                        className={getSortClass('horario')}
                                    >
                                        Fecha y Hora
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredReservas.map((reserva) => (
                                    <tr key={reserva.id}>
                                        <td>{reserva.idEstudiante}</td>
                                        <td>{reserva.nombre}</td>
                                        <td>
                                            <span className="lab-badge">
                                                {reserva.laboratorio}
                                            </span>
                                        </td>
                                        <td>{formatDateTime(reserva.horario)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoricalSearch;