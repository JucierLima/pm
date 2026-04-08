import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Challenge.css';
import QuizComplete from '../components/QuizComplete';

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
  const [answers, setAnswers] = useState([]); 
  
  const { materia, dificuldade } = useParams();

  useEffect(() => {
    fetchQuestions();
  }, [materia, dificuldade]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
`/questions/session?materia=${encodeURIComponent(materia || 'Língua Portuguesa')}&dificuldade=${dificuldade || 'Médio'}&limit=10`
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
    
    setShowFeedback(true);
    setLoading(true);
    
    try {
      const response = await axios.post(`/questions/${questions[currentIndex]._id}/answer`, {
        respostaUsuario: selectedAnswer
      });
      
      const isCorrect = response.data.correta;
      
      // Update question stats (already done server)
setResult(response.data);
      setAnswers(prev => [...prev, { correta: response.data.correta }]);
    } catch (err) {
      console.error('Error updating stats:', err);
    } finally {
      setLoading(false);
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
          const acertos = answers.filter(a => a.correta).length;

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

