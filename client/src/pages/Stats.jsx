import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Stats.css';

const Stats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        axios.get('/progress/stats'),
        axios.get('/progress/history?limit=10')
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data.attempts);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
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

  const getProgressColor = (percent) => {
    if (percent >= 70) return '#10b981';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const modeLabels = {
    'estudo': 'Modo Estudo',
    'desafio': 'Modo Desafio',
    'simulado': 'Simulado'
  };

  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <h1>📊 Estatísticas</h1>
      </header>

      <div className="stats-content">
        {/* Overview Cards */}
        <div className="stats-overview">
          <div className="stat-overview-card">
            <span className="stat-icon">📝</span>
            <span className="stat-value">{stats?.totalQuestions || 0}</span>
            <span className="stat-label">Questões Respondidas</span>
          </div>
          <div className="stat-overview-card">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{stats?.overallAccuracy || 0}%</span>
            <span className="stat-label">Acerto Total</span>
          </div>
          <div className="stat-overview-card">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{stats?.streak || 0}</span>
            <span className="stat-label">Dias Seguidos</span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="level-card">
          <div className="level-header">
            <span className="level-icon">{rankIcons[user?.patente]}</span>
            <div className="level-info">
              <span className="level-title">{user?.patente}</span>
              <span className="level-subtitle">Nível {user?.nivel}</span>
            </div>
            <div className="level-exp">
              <span className="exp-value">{user?.xp}</span>
              <span className="exp-label">XP Total</span>
            </div>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(user?.xp % 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{100 - (user?.xp % 100)} XP para próximo nível</span>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="subjects-performance">
          <h3>Desempenho por Matéria</h3>
          
          {stats?.bySubject && stats.bySubject.length > 0 ? (
            <div className="subjects-list">
              {[...stats.bySubject]
                .sort((a, b) => b.percentual - a.percentual)
                .map((subject) => (
                  <div key={subject.materia} className="subject-stat-item">
                    <div className="subject-info">
                      <span className="subject-name">{subject.materia}</span>
                      <span className="subject-stats">
                        {subject.acertos}/{subject.total}
                      </span>
                    </div>
                    <div className="subject-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ 
                            width: `${subject.percentual}%`,
                            backgroundColor: getProgressColor(subject.percentual)
                          }}
                        ></div>
                      </div>
                      <span className="percent-value" style={{ color: getProgressColor(subject.percentual) }}>
                        {subject.percentual}%
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <p className="no-data">Nenhum dado ainda. Comece a estudar!</p>
          )}
        </div>

        {/* Strongest & Weakest */}
        {stats?.strongest && stats?.weakest && (
          <div className="performance-comparison">
            <div className="comparison-card best">
              <h4>🌟 Matéria Mais Forte</h4>
              <span className="subject-name">{stats.strongest.materia}</span>
              <span className="subject-percent">{stats.strongest.percentual}%</span>
            </div>
            <div className="comparison-card worst">
              <h4>📚 Precisa Melhorar</h4>
              <span className="subject-name">{stats.weakest.materia}</span>
              <span className="subject-percent">{stats.weakest.percentual}%</span>
            </div>
          </div>
        )}

        {/* History */}
        <div className="history-section">
          <h3>Histórico Recente</h3>
          
          {history && history.length > 0 ? (
            <div className="history-list">
              {history.map((attempt) => (
                <div key={attempt.id} className="history-item">
                  <div className="history-info">
                    <span className="history-mode">{modeLabels[attempt.modo]}</span>
                    <span className="history-date">
                      {new Date(attempt.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="history-stats">
                    <span className="history-correct">{attempt.acertos} ✓</span>
                    <span className="history-wrong">{attempt.erros} ✗</span>
                  </div>
                  <div className="history-percent" style={{ color: getProgressColor(attempt.percentual) }}>
                    {attempt.percentual}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Nenhum histórico ainda.</p>
          )}
        </div>
      </div>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-item">🏠 Início</Link>
        <Link to="/estudar" className="nav-item">📚 Estudar</Link>
        <Link to="/simulado" className="nav-item">📋 Simulado</Link>
        <Link to="/ranking" className="nav-item">🏆 Ranking</Link>
        <Link to="/estatisticas" className="nav-item active">📊 Estatísticas</Link>
      </nav>
    </div>
  );
};

export default Stats;

