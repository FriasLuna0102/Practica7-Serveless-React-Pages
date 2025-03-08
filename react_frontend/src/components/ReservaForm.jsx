// src/components/ReservaForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createReservation } from '../services/api';

const ReservaForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        idEstudiante: '',
        laboratorio: '',
        fecha: '',
        hora: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const validateField = (name, value) => {
        let error = null;

        switch (name) {
            case 'nombre':
                if (!value.trim()) error = 'El nombre es obligatorio';
                else if (value.trim().length < 3) error = 'El nombre debe tener al menos 3 caracteres';
                break;

            case 'correo':
                if (!value.trim()) error = 'El correo es obligatorio';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Ingrese un correo válido';
                break;

            case 'idEstudiante':
                if (!value.trim()) error = 'El ID es obligatorio';
                break;

            case 'laboratorio':
                if (!value) error = 'Seleccione un laboratorio';
                break;

            case 'fecha':
                if (!value) error = 'Seleccione una fecha';
                break;

            case 'hora':
                if (!value) error = 'Seleccione una hora';
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        const error = validateField(name, value);

        setFieldErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Por favor corrija los errores antes de continuar.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Crear objeto DateTime en formato adecuado para el backend
            const [year, month, day] = formData.fecha.split('-').map(Number);
            const [hour] = formData.hora.split(':').map(Number);

            const reservaData = {
                nombre: formData.nombre,
                correo: formData.correo,
                idEstudiante: formData.idEstudiante,
                laboratorio: formData.laboratorio,
                horario: [year, month, day, hour, 0]
            };

            await createReservation(reservaData);

            setSuccess(true);
            // Limpiar formulario
            setFormData({
                nombre: '',
                correo: '',
                idEstudiante: '',
                laboratorio: '',
                fecha: '',
                hora: ''
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    // Generar opciones de horas (8am - 10pm)
    const hoursOptions = [];
    for (let i = 8; i <= 22; i++) {
        const formattedHour = `${i}:00`;
        const displayHour = `${i}:00 ${i < 12 ? 'AM' : 'PM'}`;

        hoursOptions.push(
            <option key={i} value={formattedHour}>
                {displayHour}
            </option>
        );
    }

    // Obtener la fecha actual para el mínimo en el selector de fecha
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="reservation-form-container">
            <div className="form-header">
                <h2>Nueva Reserva</h2>
                <Link to="/" className="back-link">
                    ← Volver a reservas
                </Link>
            </div>

            {success && (
                <div className="success-message">
                    <span className="icon">✓</span> ¡Reserva creada con éxito! Redirigiendo...
                </div>
            )}

            {error && (
                <div className="error-message">
                    <span className="icon">!</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-group">
                    <label htmlFor="idEstudiante">ID Estudiante:</label>
                    <input
                        type="text"
                        id="idEstudiante"
                        name="idEstudiante"
                        value={formData.idEstudiante}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Ej: 1234567"
                        className={fieldErrors.idEstudiante ? 'input-error' : ''}
                    />
                    {fieldErrors.idEstudiante && (
                        <span className="error-text">{fieldErrors.idEstudiante}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="nombre">Nombre Completo:</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Ej: Juan Pérez"
                        className={fieldErrors.nombre ? 'input-error' : ''}
                    />
                    {fieldErrors.nombre && (
                        <span className="error-text">{fieldErrors.nombre}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="correo">Correo Electrónico:</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Ej: usuario@ejemplo.com"
                        className={fieldErrors.correo ? 'input-error' : ''}
                    />
                    {fieldErrors.correo && (
                        <span className="error-text">{fieldErrors.correo}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="laboratorio">Laboratorio:</label>
                    <select
                        id="laboratorio"
                        name="laboratorio"
                        value={formData.laboratorio}
                        onChange={handleChange}
                        disabled={loading}
                        className={fieldErrors.laboratorio ? 'input-error' : ''}
                    >
                        <option value="">Seleccionar Laboratorio</option>
                        <option value="REDES">REDES</option>
                        <option value="PROGRAMACION">PROGRAMACIÓN</option>
                        <option value="ELECTRONICA">ELECTRÓNICA</option>
                        <option value="COMUNICACIONES">COMUNICACIONES</option>
                    </select>
                    {fieldErrors.laboratorio && (
                        <span className="error-text">{fieldErrors.laboratorio}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="fecha">Fecha de Reserva:</label>
                    <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        min={today}
                        disabled={loading}
                        className={fieldErrors.fecha ? 'input-error' : ''}
                    />
                    {fieldErrors.fecha && (
                        <span className="error-text">{fieldErrors.fecha}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="hora">Hora:</label>
                    <select
                        id="hora"
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        disabled={loading}
                        className={fieldErrors.hora ? 'input-error' : ''}
                    >
                        <option value="">Seleccionar Hora</option>
                        {hoursOptions}
                    </select>
                    {fieldErrors.hora && (
                        <span className="error-text">{fieldErrors.hora}</span>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Reserva'}
                    </button>
                    <Link to="/" className="cancel-btn" tabIndex={loading ? -1 : 0}>
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ReservaForm;