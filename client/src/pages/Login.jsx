import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const Login = () => {
  const [apelido, setApelido] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!apelido || !senha) {
      setError('Preencha todos os campos.');
      setLoading(false);
      return;
    }

    const result = await login(apelido, senha);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">🎖️</span>
              <h1>Policial Estudos</h1>
            </div>
            <p className="auth-subtitle">Prepare-se para a aprovação!</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="input-group">
              <label className="input-label">Apelido</label>
              <input
                type="text"
                className="input"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Digite seu apelido"
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                type="password"
                className="input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20 }}></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Não tem conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </div>

          <div className="auth-ranks">
            <p className="ranks-label">Ascensão Militar</p>
            <div className="ranks-icons">
              <span title="Soldado">⭐</span>
              <span title="Cabo">🔰</span>
              <span title="Sargento">🎖️</span>
              <span title="Tenente">⚔️</span>
              <span title="Capitão">🏅</span>
              <span title="Major">🌟</span>
              <span title="Coronel">👑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

