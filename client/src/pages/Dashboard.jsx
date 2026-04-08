import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import InstallButton from '../components/InstallButton';
import './Dashboard.css';

const Dashboard = ({ installPrompt, onInstalled }) => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/progress/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const subjects = [
    { id: 'Língua Portuguesa', name: 'Português', icon: '📝', color: '#3b82f6' },
    { id: 'Raciocínio Lógico', name: 'Raciocínio Lógico', icon: '🧠', color: '#8b5cf6' },
    { id: 'Informática', name: 'Informática', icon: '💻', color: '#06b6d4' },
    { id: 'Direito Constitucional', name: 'Direito Const.', icon: '⚖️', color: '#f59e0b' },
    { id: 'Direitos Humanos', name: 'Direitos Humans', icon: '🤝', color: '#10b981' },
    { id: 'História de Pernambuco', name: 'Hist. PE', icon: '🏛️', color: '#ef4444' },
    { id: 'Legislação Extravagante', name: 'Leg. Extravag.', icon: '📜', color: '#ec4899' },
    { id: 'Legislação PMPE', name: 'Leg. PMPE', icon: '🎖️', color: '#1a365d' }
  ];

  const rankIcons = {
    'Soldado': '⭐',
    'Cabo': '🔰',
    'Sargento': '🎖️',
    'Tenente': '⚔️',
    'Capitão': '🏅',
    'Major': '🌟',
    'Coronel': '👑'
  };

  const motivationalQuotes = [
    "Disciplina é a ponte entre objetivos e conquistas.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A determinação pode superar qualquer obstáculo.",
    "Cada pergunta respondida é um passo para a aprovação.",
    "A persistência é o caminho do êxito."
  ];

  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🎖️ Policial Estudos</h1>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <InstallButton prompt={installPrompt} onInstalled={onInstalled} />

      <div className="dashboard-welcome">
        <div className="welcome-card">
          <div className="welcome-info">
            <span className="rank-icon">{rankIcons[user?.patente]}</span>
            <div>
              <h2>Bem-vindo, {user?.patente} {user?.nome}!</h2>
              <p className="level-info">Nível {user?.nivel} • {user?.xp} XP</p>
            </div>
          </div>
          <div className="streak-badge">
            <span className="streak-fire">🔥</span>
            <span className="streak-count">{stats?.streak || 0} dias</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalAttempts || 0}</span>
            <span className="stat-label">Questões Respondidas</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats?.overallAccuracy || 0}%</span>
            <span className="stat-label">Acerto Total</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-value">#{stats?.rankingPosicao || '-'}</span>
            <span className="stat-label">Ranking</span>
          </div>
        </div>
      </div>

      <div className="dashboard-modes">
        <h3>Modos de Estudo</h3>
        <div className="modes-grid">
          <Link to="/estudar" className="mode-card mode-study">
            <span className="mode-icon">📚</span>
            <h4>Modo Estudo</h4>
            <p>Sem limite de tempo, aprenda no seu ritmo</p>
          </Link>
          <Link to="/desafio" className="mode-card mode-challenge">
            <span className="mode-icon">⚡</span>
            <h4>Modo Desafio</h4>
            <p>Sessões rápidas para testar seus conhecimentos</p>
          </Link>
          <Link to="/simulado" className="mode-card mode-simulated">
            <span className="mode-icon">📋</span>
            <h4>Simulado</h4>
            <p>Prova completa com tempo determinado</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-subjects">
        <div className="section-header">
          <h3>Disciplinas</h3>
          <Link to="/ranking" className="link-ranking">Ver Ranking</Link>
        </div>
        <div className="subjects-grid">
          {subjects.map((subject) => {
            const subjectStats = stats?.bySubject?.find(s => s.materia === subject.id);
            return (
              <Link 
                to={`/estudar/${subject.id}/Médio`} 
                key={subject.id} 
                className="subject-card"
                style={{ borderLeftColor: subject.color }}
              >
                <span className="subject-icon">{subject.icon}</span>
                <div className="subject-info">
                  <h4>{subject.name}</h4>
                  <div className="subject-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${subjectStats?.percentual || 0}%`,
                          backgroundColor: subject.color
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">{subjectStats?.percentual || 0}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="dashboard-quote">
        <p>"{quote}"</p>
      </div>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-item active">🏠 Início</Link>
        <Link to="/estudar" className="nav-item">📚 Estudar</Link>
        <Link to="/simulado" className="nav-item">📋 Simulado</Link>
        <Link to="/ranking" className="nav-item">🏆 Ranking</Link>
        <Link to="/estatisticas" className="nav-item">📊 Estatísticas</Link>
      </nav>
    </div>
  );
};

export default Dashboard;

