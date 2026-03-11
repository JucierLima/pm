import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || '');
  const [apelido, setApelido] = useState(user?.apelido || '');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put('/auth/profile', { nome, apelido });
      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setEditMode(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const rankIcons = {
    'Soldado': '⭐',
    'Cabo': '🔰',
    'Sargento': '🎖️',
    'Tenente': '⚔️',
    'Capitão': '🏅',
    'Major': '🌟',
    'Coronel': '👑'
  };

  const ranks = [
    { name: 'Soldado', xp: 0, icon: '⭐' },
    { name: 'Cabo', xp: 300, icon: '🔰' },
    { name: 'Sargento', xp: 1000, icon: '🎖️' },
    { name: 'Tenente', xp: 2500, icon: '⚔️' },
    { name: 'Capitão', xp: 4500, icon: '🏅' },
    { name: 'Major', xp: 7000, icon: '🌟' },
    { name: 'Coronel', xp: 10000, icon: '👑' }
  ];

  const currentRankIndex = ranks.findIndex(r => r.name === user?.patente);

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>👤 Perfil</h1>
      </header>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-icon">{rankIcons[user?.patente]}</span>
          </div>

          {editMode ? (
            <div className="edit-form">
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Apelido</label>
                <input
                  type="text"
                  className="input"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                />
              </div>
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="edit-actions">
                <button className="btn btn-outline" onClick={() => setEditMode(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-info">
                <h2>{user?.nome}</h2>
                <p className="username">@{user?.apelido}</p>
                <p className="rank-badge">{user?.patente} • Nível {user?.nivel}</p>
              </div>
              <button className="btn btn-outline edit-btn" onClick={() => setEditMode(true)}>
                Editar Perfil
              </button>
            </>
          )}
        </div>

        {/* Rank Progression */}
        <div className="rank-card">
          <h3>Progressão de Patente</h3>
          <div className="rank-list">
            {ranks.map((rank, index) => (
              <div 
                key={rank.name} 
                className={`rank-item ${index <= currentRankIndex ? 'achieved' : ''} ${index === currentRankIndex ? 'current' : ''}`}
              >
                <span className="rank-icon">{rank.icon}</span>
                <span className="rank-name">{rank.name}</span>
                <span className="rank-xp">{rank.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="stats-card">
          <h3>Resumo</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{user?.experiencia}</span>
              <span className="stat-label">XP Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user?.nivel}</span>
              <span className="stat-label">Nível</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user?.sequenciaDias}</span>
              <span className="stat-label">Dias Seguidos</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="settings-card">
          <h3>Configurações</h3>
          <div className="settings-list">
            <div className="setting-item">
              <span>Tema</span>
              <button className="theme-btn" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button className="btn btn-logout" onClick={handleLogout}>
          Sair da Conta
        </button>
      </div>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-item">🏠 Início</Link>
        <Link to="/estudar" className="nav-item">📚 Estudar</Link>
        <Link to="/simulado" className="nav-item">📋 Simulado</Link>
        <Link to="/ranking" className="nav-item">🏆 Ranking</Link>
        <Link to="/estatisticas" className="nav-item">📊 Estatísticas</Link>
      </nav>
    </div>
  );
};

export default Profile;

