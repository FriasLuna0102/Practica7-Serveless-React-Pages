// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ReservasList from './components/ReservasList';
import ReservaForm from './components/ReservaForm';
import HistoricalSearch from './components/HistoricalSearch';
import ApiConfig from './components/ApiConfig';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<ReservasList />} />
                        <Route path="/nueva-reserva" element={<ReservaForm />} />
                        <Route path="/registros-pasados" element={<HistoricalSearch />} />
                        <Route path="/configuracion-api" element={<ApiConfig />} />
                        {/* Redirect any unknown routes to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <footer className="app-footer">
                    <p>© {new Date().getFullYear()} Sistema de Reservas de Laboratorio - PUCMM</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;