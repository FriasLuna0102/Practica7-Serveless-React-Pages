// src/services/api.js

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

// Función para obtener configuración desde localStorage o usar valor por defecto
const getConfig = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue || defaultValue;
};

// Función para actualizar configuración
export const updateApiConfig = (baseUrl, activeEndpoint, historicalEndpoint, createEndpoint) => {
    if (baseUrl) localStorage.setItem(LS_API_BASE_URL, baseUrl);
    if (activeEndpoint) localStorage.setItem(LS_ENDPOINT_ACTIVE, activeEndpoint);
    if (historicalEndpoint) localStorage.setItem(LS_ENDPOINT_HISTORICAL, historicalEndpoint);
    if (createEndpoint) localStorage.setItem(LS_ENDPOINT_CREATE, createEndpoint);
};

// Formatear fechas al formato esperado por el backend
const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const fetchActiveReservations = async () => {
    try {
        const baseUrl = getConfig(LS_API_BASE_URL, DEFAULT_API_BASE_URL);
        const endpoint = getConfig(LS_ENDPOINT_ACTIVE, DEFAULT_ENDPOINT_ACTIVE);

        const response = await fetch(`${baseUrl}/${endpoint}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.mensajeError || 'Error al obtener reservas activas');
        }

        return data.reservas || [];
    } catch (error) {
        console.error('Error fetching active reservations:', error);
        throw error;
    }
};

export const fetchHistoricalReservations = async (startDate, endDate) => {
    try {
        const baseUrl = getConfig(LS_API_BASE_URL, DEFAULT_API_BASE_URL);
        const endpoint = getConfig(LS_ENDPOINT_HISTORICAL, DEFAULT_ENDPOINT_HISTORICAL);

        // Asegurarse de que las fechas son objetos Date
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        // Establecer la hora de inicio a las 00:00:00
        start.setHours(0, 0, 0, 0);

        // Establecer la hora de fin a las 23:59:59
        end.setHours(23, 59, 59, 999);

        const params = new URLSearchParams({
            inicio: formatearFecha(start),
            fin: formatearFecha(end)
        });

        console.log('URL de consulta:', `${baseUrl}/${endpoint}?${params}`);
        console.log('Consultando reservas desde', formatearFecha(start), 'hasta', formatearFecha(end));

        const response = await fetch(`${baseUrl}/${endpoint}?${params}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en respuesta:', errorText);
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.mensajeError || 'Error al obtener reservas históricas');
        }

        // Ordenar las reservas por fecha (de más reciente a más antigua)
        const sortedReservations = (data.reservas || []).sort((a, b) => {
            const dateA = new Date(a.horario);
            const dateB = new Date(b.horario);
            return dateB - dateA; // Orden descendente
        });

        return sortedReservations;
    } catch (error) {
        console.error('Error fetching historical reservations:', error);
        throw error;
    }
};

export const createReservation = async (reservationData) => {
    try {
        const baseUrl = getConfig(LS_API_BASE_URL, DEFAULT_API_BASE_URL);
        const endpoint = getConfig(LS_ENDPOINT_CREATE, DEFAULT_ENDPOINT_CREATE);

        const url = `${baseUrl}/${endpoint}`;
        console.log('Enviando solicitud a:', url);
        console.log('Datos de reserva originales:', JSON.stringify(reservationData, null, 2));

        // Crear una copia para modificar sin alterar el objeto original
        const dataToSend = { ...reservationData };

        // Convertir el formato de fecha si es un array [año, mes, día, hora, minuto]
        if (Array.isArray(dataToSend.horario) && dataToSend.horario.length >= 5) {
            const [year, month, day, hour, minute] = dataToSend.horario;

            // Crear fecha válida (ajustando el mes ya que en JavaScript los meses van de 0-11)
            const fecha = new Date(year, month - 1, day, hour, minute, 0);

            // Asegurar que la fecha es válida antes de convertir
            if (isNaN(fecha.getTime())) {
                throw new Error('La fecha proporcionada no es válida');
            }

            // Convertir a formato ISO y ajustar para que siempre tenga minutos y segundos en 0
            dataToSend.horario = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`;
        }
        // Si es un string de fecha, asegurarse de que tenga el formato correcto
        else if (typeof dataToSend.horario === 'string') {
            const fecha = new Date(dataToSend.horario);

            if (isNaN(fecha.getTime())) {
                throw new Error('La fecha proporcionada no es válida');
            }

            // Formatear para asegurar que minutos y segundos sean 0
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            const hour = String(fecha.getHours()).padStart(2, '0');

            dataToSend.horario = `${year}-${month}-${day}T${hour}:00:00`;
        }
        // Si es un objeto Date
        else if (dataToSend.horario instanceof Date) {
            if (isNaN(dataToSend.horario.getTime())) {
                throw new Error('La fecha proporcionada no es válida');
            }

            const year = dataToSend.horario.getFullYear();
            const month = String(dataToSend.horario.getMonth() + 1).padStart(2, '0');
            const day = String(dataToSend.horario.getDate()).padStart(2, '0');
            const hour = String(dataToSend.horario.getHours()).padStart(2, '0');

            dataToSend.horario = `${year}-${month}-${day}T${hour}:00:00`;
        }

        console.log('Datos de reserva formateados para enviar:', JSON.stringify(dataToSend, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        console.log('Respuesta recibida. Status code:', response.status);

        // Si la respuesta no es OK, intentar obtener detalles del error
        if (!response.ok) {
            let errorMessage;
            try {
                // Intentar parsear la respuesta como JSON
                const errorData = await response.json();
                console.error('Detalles de error (JSON):', errorData);
                errorMessage = errorData.mensajeError || `Error HTTP: ${response.status}`;
            } catch (e) {
                // Si no podemos parsear como JSON, obtener el texto crudo
                const errorText = await response.text();
                console.error('Respuesta de error (texto):', errorText);
                errorMessage = errorText || `Error HTTP: ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        // Intentar parsear la respuesta
        let data;
        try {
            data = await response.json();
            console.log('Datos de respuesta:', data);
        } catch (e) {
            console.error('Error al parsear respuesta como JSON:', e);
            const textResponse = await response.text();
            console.log('Respuesta como texto:', textResponse);
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (data.error) {
            throw new Error(data.mensajeError || 'Error al crear la reserva');
        }

        return data.reserva;
    } catch (error) {
        console.error('Error creating reservation:', error);
        throw error;
    }
};