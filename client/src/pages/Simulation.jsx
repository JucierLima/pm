import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Simulation.css';

const Simulation = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [materias] = useState([
    { id: 'Língua Portuguesa', name: 'Português', icon: '📝' },
    { id: 'Raciocínio Lógico', name: 'Raciocínio Lógico', icon: '🧠' },
    { id: 'Informática', name: 'Informática', icon: '💻' },
    { id: 'Direito Constitucional', name: 'Direito Const.', icon: '⚖️' },
    { id: 'Direitos Humanos', name: 'Direitos Humans', icon: '🤝' },
    { id: 'História de Pernambuco', name: 'Hist. PE', icon: '🏛️' },
    { id: 'Legislação Extravagante', name: 'Leg. Extravag.', icon: '📜' },
    { id: 'Legislação PMPE', name: 'Leg. PMPE', icon: '🎖️' }
  ]);

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [timeLimit, setTimeLimit] = useState(30); // minutes
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);

  const toggleSubject = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const startSimulation = async () => {
    if (selectedSubjects.length === 0) {
      alert('Selecione pelo menos uma matéria.');
      return;
    }

    setLoading(true);
    try {
      // Get questions from all selected subjects
      let allQuestions = [];
      for (const subject of selectedSubjects) {
        const res = await axios.get(`/questions/session`, {
          params: {
            materia: subject,
            dificuldade: 'Médio',
            limit: 5
          }
        });
        allQuestions = [...allQuestions, ...res.data.questions];
      }

      // Shuffle and take 20 questions for simulation
      const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
      
      setQuestions(shuffled);
      setSelectedSubjects(selectedSubjects);
      setSimulationStarted(true);
      setCurrentIndex(0);
      setAnswers([]);
      setTimeRemaining(timeLimit * 60);
    } catch (error) {
      console.error('Erro ao iniciar simulado:', error);
      alert('Erro ao carregar questões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (simulationStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            finishSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [simulationStarted]);

  const handleAnswer = async (answerIndex) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);

    try {
      const response = await axios.post(`/questions/${questions[currentIndex]._id}/answer`, {
        respostaUsuario: answerIndex
      });

      setResult(response.data);
      setShowResult(true);
      setAnswers(prev => [...prev, {
        questao: questions[currentIndex]._id,
        respostaUsuario: answerIndex,
        correta: response.data.correta
      }]);
    } catch (error) {
      console.error('Erro ao responder:', error);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    } else {
      finishSimulation();
    }
  };

  const finishSimulation = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const acertos = answers.filter(a => a.correta).length;
    const erros = answers.length - acertos;
    const experienciaGanha = acertos * 15 + erros * 3;

    try {
      await axios.post('/progress/attempt', {
        materia: selectedSubjects.join(', '),
        modo: 'simulado',
        questoes: answers,
        acertos,
        erros,
        experienciaGanha,
        tempoTotal: timeLimit * 60 - timeRemaining,
        questoesErradas: answers.filter(a => !a.correta).map(a => a.questao)
      });

      const userResponse = await axios.get('/auth/me');
      updateUser(userResponse.data);

      // Show results
      setSimulationStarted(false);
      setShowResult(true);
      setResult({ acertos, erros, total: questions.length, experienciaGanha });
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  // Results screen
  if (showResult && result && !simulationStarted && result.total) {
    const percentual = Math.round((result.acertos / result.total) * 100);
    
    return (
      <div className="simulation-page">
        <header className="simulation-header">
          <h1>Resultado do Simulado</h1>
        </header>

        <div className="simulation-content">
          <div className="result-card">
            <div className="result-score">
              <span className={`score-percent ${percentual >= 70 ? 'good' : percentual >= 50 ? 'medium' : 'low'}`}>
                {percentual}%
              </span>
            </div>

            <div className="result-details">
              <div className="result-stat">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{result.acertos}</span>
                <span className="stat-label">Acertos</span>
              </div>
              <div className="result-stat">
                <span className="stat-icon">❌</span>
                <span className="stat-value">{result.erros}</span>
                <span className="stat-label">Erros</span>
              </div>
              <div className="result-stat">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">+{result.experienciaGanha}</span>
                <span className="stat-label">XP Ganho</span>
              </div>
            </div>

            <div className="result-message">
              {percentual >= 70 && <p>🎉 Excelente desempenho! Continue assim!</p>}
              {percentual >= 50 && percentual < 70 && <p>👍 Bom trabalho! Mas ainda há espaço para melhorar.</p>}
              {percentual < 50 && <p>📚 Continue estudando! A prática leva à perfeição.</p>}
            </div>

            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Voltar ao Início
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setShowResult(false);
                setResult(null);
                setSimulationStarted(false);
              }}>
                Novo Simulado
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simulation in progress
  if (simulationStarted && currentQuestion) {
    return (
      <div className="simulation-page">
        <header className="simulation-header">
          <div className="header-left">
            <button className="back-btn" onClick={finishSimulation}>←</button>
            <span className="question-counter">{currentIndex + 1}/{questions.length}</span>
          </div>
          <div className={`timer ${timeRemaining < 60 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </header>

        <div className="simulation-content">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="question-card">
            <p className="question-text">{currentQuestion.enunciado}</p>

            <div className="alternatives">
              {currentQuestion.alternativas.map((alt, idx) => (
                <button
                  key={idx}
                  className={`alternative-btn ${selectedAnswer === idx ? 'selected' : ''} ${
                    showResult 
                      ? idx === currentQuestion.respostaCorreta 
                        ? 'correct' 
                        : selectedAnswer === idx 
                          ? 'wrong' 
                          : ''
                      : ''
                  }`}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                >
                  <span className="alt-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="alt-text">{alt}</span>
                </button>
              ))}
            </div>

            {showResult && result && (
              <div className={`result-box ${result.correta ? 'correct' : 'wrong'}`}>
                <p className="explanation">
                  <strong>Explicação:</strong> {result.explicacao}
                </p>
                <button className="btn btn-primary" onClick={nextQuestion}>
                  {currentIndex < questions.length - 1 ? 'Próxima' : 'Ver Resultado'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Configuration screen
  return (
    <div className="simulation-page">
      <header className="simulation-header">
        <Link to="/" className="back-btn">←</Link>
        <h1>Simulado</h1>
      </header>

      <div className="simulation-content">
        <div className="config-card">
          <h3>Configure seu Simulado</h3>
          
          <div className="config-section">
            <label className="config-label">Tempo limite:</label>
            <div className="time-options">
              {[15, 30, 45, 60].map(time => (
                <button
                  key={time}
                  className={`time-btn ${timeLimit === time ? 'active' : ''}`}
                  onClick={() => setTimeLimit(time)}
                >
                  {time} min
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <label className="config-label">Matérias ({selectedSubjects.length} selecionadas):</label>
            <div className="subjects-grid">
              {materias.map(subject => (
                <button
                  key={subject.id}
                  className={`subject-chip ${selectedSubjects.includes(subject.id) ? 'selected' : ''}`}
                  onClick={() => toggleSubject(subject.id)}
                >
                  <span>{subject.icon}</span>
                  <span>{subject.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="simulation-info">
            <p>📝 20 questões</p>
            <p>⏱️ {timeLimit} minutos</p>
            <p>⭐ XP em dobro!</p>
          </div>

          <button 
            className="btn btn-primary w-full" 
            onClick={startSimulation}
            disabled={loading || selectedSubjects.length === 0}
          >
            {loading ? 'Carregando...' : 'Iniciar Simulado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Simulation;

