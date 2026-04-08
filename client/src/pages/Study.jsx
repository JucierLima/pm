import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Study.css';

const Study = () => {
  const { materia: paramMateria, dificuldade: paramDificuldade } = useParams();
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

  const [dificuldades] = useState([
    { id: 'Fácil', name: 'Fácil', color: '#10b981' },
    { id: 'Médio', name: 'Médio', color: '#f59e0b' },
    { id: 'Difícil', name: 'Difícil', color: '#ef4444' }
  ]);

  const [selectedMateria, setSelectedMateria] = useState(paramMateria || '');
  const [selectedDificuldade, setSelectedDificuldade] = useState(paramDificuldade || 'Médio');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    if (paramMateria && paramDificuldade) {
      startSession(paramMateria, paramDificuldade);
    }
  }, [paramMateria, paramDificuldade]);

  const startSession = async (materia, dificuldade) => {
    setLoading(true);
    try {
      const response = await axios.get(`/questions/session?materia=${encodeURIComponent(materia)}&dificuldade=${dificuldade}&limit=10`);
      setQuestions(response.data);
      setSelectedMateria(materia);
      setSelectedDificuldade(dificuldade);
      setSessionStarted(true);
      setCurrentIndex(0);
      setWrongQuestions([]);
      setReviewMode(false);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      alert('Erro ao carregar questões. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getAlternativas = (q) => {
    if (Array.isArray(q.alternativas)) return q.alternativas;
    return [q.alternativaA, q.alternativaB, q.alternativaC, q.alternativaD, q.alternativaE];
  };

  const handleAnswer = async (answerIndex) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setLoading(true);

    try {
      const currentQ = questions[currentIndex];
      const response = await axios.post(`/questions/${currentQ.id}/answer`, {
        selectedAnswer: answerIndex,
        isCorrect: false,
        timeSpent: 0,
        materia: selectedMateria,
      });

      setResult(response.data);
      setShowResult(true);

      if (!response.data.correta) {
        setWrongQuestions(prev => [...prev, currentQ.id]);
      }
    } catch (error) {
      console.error('Erro ao responder:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    const acertos = questions.length - wrongQuestions.length;
    const erros = wrongQuestions.length;

    try {
      await axios.post('/progress/attempt', {
        materia: selectedMateria,
        modo: 'estudo',
        questoes: questions.map(q => ({ questao: q.id })),
        acertos,
        erros,
        experienciaGanha: acertos * 10 + erros * 2,
        tempoTotal: 0,
        questoesErradas: wrongQuestions
      });

      const userResponse = await axios.get('/auth/me');
      updateUser(userResponse.data);
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }

    if (wrongQuestions.length > 0 && !reviewMode) {
      startReviewSession();
    } else {
      navigate('/');
    }
  };

  const startReviewSession = async () => {
    setLoading(true);
    try {
      const questionIdsStr = wrongQuestions.join(',');
      const response = await axios.get(`/questions/review/wrong?questionIds=${questionIdsStr}`);

      setQuestions(response.data.questions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
      setReviewMode(true);
    } catch (error) {
      console.error('Erro ao buscar questões erradas:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  if (!sessionStarted) {
    return (
      <div className="study-page">
        <header className="study-header">
          <Link to="/" className="back-btn">←</Link>
          <h1>Escolha a Matéria</h1>
        </header>

        <div className="study-content">
          <div className="difficulty-selector">
            {dificuldades.map(diff => (
              <button
                key={diff.id}
                className={`difficulty-btn ${selectedDificuldade === diff.id ? 'active' : ''}`}
                style={{ 
                  '--diff-color': diff.color,
                  backgroundColor: selectedDificuldade === diff.id ? diff.color : 'transparent',
                  color: selectedDificuldade === diff.id ? 'white' : diff.color
                }}
                onClick={() => setSelectedDificuldade(diff.id)}
              >
                {diff.name}
              </button>
            ))}
          </div>

          <div className="subjects-list">
            {materias.map(subject => (
              <button
                key={subject.id}
                className="subject-btn"
                onClick={() => startSession(subject.id, selectedDificuldade)}
                disabled={loading}
              >
                <span className="subject-icon">{subject.icon}</span>
                <span className="subject-name">{subject.name}</span>
                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading && !currentQuestion) {
    return (
      <div className="study-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="study-page">
        <header className="study-header">
          <Link to="/" className="back-btn">←</Link>
          <h1>Sem Questões</h1>
        </header>
        <div className="study-content">
          <p>Não há questões disponíveis para esta matéria e nível.</p>
          <button className="btn btn-primary" onClick={() => setSessionStarted(false)}>
            Escolher outra matéria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-page">
      <header className="study-header">
        <button className="back-btn" onClick={() => navigate('/')}>←</button>
        <div className="header-info">
          <span className="materia-badge">{selectedMateria}</span>
          <span className="question-count">
            {reviewMode ? `Revisão: ${currentIndex + 1}/${questions.length}` : `${currentIndex + 1}/${questions.length}`}
          </span>
        </div>
      </header>

      <div className="study-content">
        <div className="progress-dots">
          {questions.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? (wrongQuestions.includes(questions[idx].id) ? 'wrong' : 'correct') : ''}`}
            />
          ))}
        </div>

        <div className="question-card animate-fadeIn">
          <div className="question-header">
            <span className="difficulty-badge" style={{ backgroundColor: dificuldades.find(d => d.id === selectedDificuldade)?.color }}>
              {selectedDificuldade}
            </span>
            <span className="subject-tag">{currentQuestion.assunto}</span>
          </div>

          <p className="question-text">{currentQuestion.enunciado}</p>

          <div className="alternatives">
            {getAlternativas(currentQuestion).map((alt, idx) => (
              <button
                key={idx}
                className={`alternative-btn ${selectedAnswer === idx ? 'selected' : ''} ${
                  showResult
                    ? idx === result?.respostaCorreta
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
            <div className={`result-box ${result.correta ? 'correct' : 'wrong'} animate-slideUp`}>
              {result.correta ? (
                <div className="result-header">
                  <span className="result-icon">✅</span>
                  <span>Correto!</span>
                </div>
              ) : (
                <div className="result-header">
                  <span className="result-icon">❌</span>
                  <span>Incorreto</span>
                </div>
              )}
              
              <p className="explanation">
                <strong>Explicação:</strong> {result.explicacao}
              </p>

              <div className="xp-gained">
                <span>XP Gain: +{result.experienciaGanha}</span>
              </div>

              <div className="result-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/questao', {
                    state: {
                      question: { ...currentQuestion, respostaCorreta: result.respostaCorreta },
                      userChoice: selectedAnswer
                    }
                  })}
                >
                  Ver Análise
                </button>
                <button className="btn btn-primary" onClick={nextQuestion}>
                  {currentIndex < questions.length - 1 ? 'Próxima Questão' : wrongQuestions.length > 0 && !reviewMode ? 'Revisar Erradas' : 'Finalizar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Study;
