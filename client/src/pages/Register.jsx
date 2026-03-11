import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const Register = () => {
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome || !apelido || !senha || !confirmarSenha) {
      setError('Preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await register(nome, apelido, senha);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const ranks = ['Soldado', 'Cabo', 'Sargento', 'Tenente', 'Capitão', 'Major', 'Coronel'];

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
            <p className="auth-subtitle">Comece sua jornada militar!</p>
          </div>

          <div className="register-ranks">
            {ranks.map((rank, index) => (
              <span key={rank} className={`register-rank ${index === 0 ? 'active' : ''}`}>
                {rank}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="input-group">
              <label className="input-label">Nome Completo</label>
              <input
                type="text"
                className="input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Apelido</label>
              <input
                type="text"
                className="input"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Como quer ser chamado"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Senha</label>
              <input
                type="password"
                className="input"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar Senha</label>
              <input
                type="password"
                className="input"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20 }}></span>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Já tem conta? <Link to="/login">Entre</Link>
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

export default Register;

