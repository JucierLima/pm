import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Ranking.css';

const Ranking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const [rankingRes, positionRes] = await Promise.all([
        axios.get('/ranking?limit=20'),
        axios.get('/ranking/me')
      ]);
      setRanking(rankingRes.data);
      setUserPosition(positionRes.data);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
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

  const getRankClass = (position) => {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    if (position === 3) return 'bronze';
    return '';
  };

  return (
    <div className="ranking-page">
      <header className="ranking-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>🏆 Ranking</h1>
      </header>

      <div className="ranking-content">
        {userPosition && (
          <div className="user-position-card">
            <div className="position-info">
              <span className="position-label">Sua posição</span>
              <span className="position-number">#{userPosition.posicao}</span>
            </div>
            <div className="user-info">
              <span className="user-icon">{rankIcons[userPosition.patente]}</span>
              <div>
                <span className="user-name">{userPosition.apelido}</span>
                <span className="user-rank">{userPosition.patente} • Nível {userPosition.nivel}</span>
              </div>
            </div>
            <div className="user-exp">
              <span className="exp-value">{userPosition.experiencia}</span>
              <span className="exp-label">XP</span>
            </div>
          </div>
        )}

        <div className="ranking-list">
          <h3>Top 20</h3>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            ranking.map((entry, index) => (
              <div 
                key={entry._id || index} 
                className={`ranking-item ${getRankClass(entry.posicao)} ${entry.apelido === user?.apelido ? 'highlight' : ''}`}
              >
                <div className="rank-position">
                  {entry.posicao <= 3 ? (
                    <span className="medal">
                      {entry.posicao === 1 ? '🥇' : entry.posicao === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="position">#{entry.posicao}</span>
                  )}
                </div>
                <div className="rank-user">
                  <span className="user-icon">{rankIcons[entry.patente]}</span>
                  <div>
                    <span className="user-name">{entry.apelido}</span>
                    <span className="user-rank">{entry.patente}</span>
                  </div>
                </div>
                <div className="rank-exp">
                  <span className="exp-value">{entry.experiencia}</span>
                  <span className="exp-label">XP</span>
                </div>
              </div>
            ))
          )}
        </div>

        {userPosition?.abaixo && userPosition.abaixo.length > 0 && (
          <div className="ranking-nearby">
            <h4>Logo abaixo de você</h4>
            {userPosition.abaixo.map((entry, index) => (
              <div key={index} className="nearby-item">
                <span className="user-name">{entry.apelido}</span>
                <span className="exp-value">{entry.experiencia} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-item">🏠 Início</Link>
        <Link to="/estudar" className="nav-item">📚 Estudar</Link>
        <Link to="/simulado" className="nav-item">📋 Simulado</Link>
        <Link to="/ranking" className="nav-item active">🏆 Ranking</Link>
        <Link to="/estatisticas" className="nav-item">📊 Estatísticas</Link>
      </nav>
    </div>
  );
};

export default Ranking;

