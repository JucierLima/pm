import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import Challenge from './pages/Challenge';
import Simulation from './pages/Simulation';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import QuestionDetail from './pages/QuestionDetail';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { loading } = useAuth();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard installPrompt={installPrompt} onInstalled={() => setInstallPrompt(null)} />
        </PrivateRoute>
      } />
      
      <Route path="/estudar" element={
        <PrivateRoute>
          <Study />
        </PrivateRoute>
      } />
      
      <Route path="/estudar/:materia/:dificuldade" element={
        <PrivateRoute>
          <Study />
        </PrivateRoute>
      } />
      
      <Route path="/desafio" element={
        <PrivateRoute>
          <Challenge />
        </PrivateRoute>
      } />
      
      <Route path="/desafio/:materia/:dificuldade" element={
        <PrivateRoute>
          <Challenge />
        </PrivateRoute>
      } />
      
      <Route path="/simulado" element={
        <PrivateRoute>
          <Simulation />
        </PrivateRoute>
      } />
      
      <Route path="/ranking" element={
        <PrivateRoute>
          <Ranking />
        </PrivateRoute>
      } />
      
      <Route path="/estatisticas" element={
        <PrivateRoute>
          <Stats />
        </PrivateRoute>
      } />
      
      <Route path="/perfil" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path="/questao" element={
        <PrivateRoute>
          <QuestionDetail />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

