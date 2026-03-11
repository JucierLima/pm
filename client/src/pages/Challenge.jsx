import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Challenge.css';

const Challenge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now());
  
  const { materia, dificuldade } = useParams();

  useEffect(() => {
    fetchQuestions();
  }, [materia, dificuldade]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (materia) params.append('materia', materia);
      if (dificuldade) params.append('dificuldade', dificuldade);
      params.append('limit', '10');
      
      const response = await axios.get(`/questions/session?${params.toString()}`);
      setQuestions(response.data.questions);
    } catch (err) {
      setError('Erro ao carregar questões. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) return;
    
    const question = questions[currentIndex];
    const isCorrect = selectedAnswer === question.respostaCorreta;
    
    setShowFeedback(true);
    
    // Update question stats
    try {
      await axios.post(`/questions/${question._id}/answer`, {
        resposta: selectedAnswer,
        correta: isCorrect
      });
    } catch (err) {
      console.error('Error updating stats:', err);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Calculate results
      await finishChallenge();
    }
  };

  const finishChallenge = async () => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    // Calculate correct answers
    const correctAnswers = questions.filter((q, idx) => {
      // We need to track user answers - for now calculate from results
      return false;
    }).length;

    try {
      const response = await axios.post('/progress/attempt', {
        materia: materia || 'Todas',
        modo: 'desafio',
        acertos: 0, // Would need to track this properly
        erros: 0,
        tempoTotal: timeSpent
      });
      
      setResults(response.data);
    } catch (err) {
      console.error('Error saving attempt:', err);
    }
    
    setCompleted(true);
  };

  const getOptionClass = (index) => {
    if (!showFeedback) {
      return selectedAnswer === index ? 'selected' : '';
    }
    
    const question = questions[currentIndex];
    if (index === question.respostaCorreta) {
      return 'correct';
    }
    if (index === selectedAnswer && index !== question.respostaCorreta) {
      return 'incorrect';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="challenge-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando desafio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="challenge-page">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchQuestions}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="challenge-page">
        <div className="results-container">
          <h2>🏆 Desafio Concluído!</h2>
          
          <div className="results-stats">
            <div className="result-stat">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">{Math.floor((Date.now() - startTime) / 1000)}s</span>
              <span className="stat-label">Tempo</span>
            </div>
          </div>
          
          <div className="motivational-phrase">
            <p>"A persistência é o caminho do êxito."</p>
          </div>
          
          <div className="results-actions">
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Voltar ao Início
            </button>
            <button className="btn btn-outline" onClick={() => {
              setCompleted(false);
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setShowFeedback(false);
              fetchQuestions();
            }}>
              Novo Desafio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="challenge-page">
      <header className="challenge-header">
        <button className="back-btn" onClick={() => navigate('/')}>✕</button>
        <div className="progress-info">
          <span className="question-counter">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="timer">
          ⏱️ {Math.floor((Date.now() - startTime) / 1000)}s
        </div>
      </header>

      <div className="challenge-content">
        <div className="question-card">
          <div className="question-meta">
            <span className="question-subject">{currentQuestion?.materia}</span>
            <span className="question-difficulty difficulty-{currentQuestion?.dificuldade.toLowerCase()}">
              {currentQuestion?.dificuldade}
            </span>
          </div>
          
          <p className="question-text">{currentQuestion?.enunciado}</p>
          
          <div className="options-list">
            {currentQuestion?.alternativas.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${getOptionClass(index)}`}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`feedback ${selectedAnswer === currentQuestion?.respostaCorreta ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === currentQuestion?.respostaCorreta ? (
                <p>✅ Correto!</p>
              ) : (
                <>
                  <p>❌ Incorreto</p>
                  <p className="correct-answer">
                    Resposta correta: {String.fromCharCode(65 + currentQuestion?.respostaCorreta)}
                  </p>
                </>
              )}
              <p className="explanation">{currentQuestion?.explicacao}</p>
            </div>
          )}
        </div>
      </div>

      <footer className="challenge-footer">
        {!showFeedback ? (
          <button 
            className="btn btn-primary" 
            onClick={submitAnswer}
            disabled={selectedAnswer === null}
          >
            Confirmar Resposta
          </button>
        ) : (
          <button className="btn btn-primary" onClick={nextQuestion}>
            {currentIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultados'}
          </button>
        )}
      </footer>
    </div>
  );
};

export default Challenge;

