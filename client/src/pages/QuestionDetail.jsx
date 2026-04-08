import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle } from 'lucide-react';
import './QuestionDetail.css';

export default function QuestionDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state?.question) {
    return (
      <div className="qd-page">
        <div className="qd-empty">
          <p>Nenhuma questão para exibir.</p>
          <button className="qd-back-btn" onClick={() => navigate('/')}>Voltar ao início</button>
        </div>
      </div>
    );
  }

  const { question, userChoice } = state;

  const alternativas = [
    question.alternativaA ?? question.alternativas?.[0],
    question.alternativaB ?? question.alternativas?.[1],
    question.alternativaC ?? question.alternativas?.[2],
    question.alternativaD ?? question.alternativas?.[3],
    question.alternativaE ?? question.alternativas?.[4],
  ];

  return (
    <div className="qd-page">
      <header className="qd-header">
        <button className="qd-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>Análise da Questão</h1>
      </header>

      <div className="qd-content">
        <div className="qd-card">
          <div className="qd-meta">
            <span className="qd-badge">{question.materia}</span>
            <span className="qd-badge qd-badge--diff">{question.dificuldade}</span>
          </div>

          <p className="qd-enunciado">{question.enunciado}</p>

          <div className="qd-options">
            {alternativas.map((alt, idx) => {
              const isCorrect = idx === question.respostaCorreta;
              const isSelected = idx === userChoice;
              return (
                <div
                  key={idx}
                  className={`qd-option ${isCorrect ? 'qd-option--correct' : ''} ${isSelected && !isCorrect ? 'qd-option--wrong' : ''}`}
                >
                  <span className="qd-option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="qd-option-text">{alt}</span>
                  {isCorrect && <CheckCircle2 size={20} className="qd-icon qd-icon--correct" />}
                  {isSelected && !isCorrect && <XCircle size={20} className="qd-icon qd-icon--wrong" />}
                </div>
              );
            })}
          </div>

          <div className="qd-explanation">
            <p className="qd-explanation-title">💡 Explicação da IA:</p>
            <p className="qd-explanation-text">{question.explicacao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
