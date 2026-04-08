const validateQuestion = (question) => {
  const { materia, assunto, dificuldade, enunciado, alternativas, respostaCorreta, explicacao, anoConcurso } = question;
  
  const errors = [];
  
  if (!materia || typeof materia !== 'string') errors.push('Invalid materia');
  if (!assunto || typeof assunto !== 'string') errors.push('Invalid assunto');
  if (!['Fácil', 'Médio', 'Difícil'].includes(dificuldade)) errors.push('Invalid dificuldade');
  if (!enunciado || typeof enunciado !== 'string' || enunciado.length < 10) errors.push('Invalid enunciado');
  if (!Array.isArray(alternativas) || alternativas.length !== 5) errors.push('Must have exactly 5 alternatives');
  if (typeof respostaCorreta !== 'number' || respostaCorreta < 0 || respostaCorreta > 4) errors.push('Invalid respostaCorreta');
  if (!explicacao || typeof explicacao !== 'string' || explicacao.length < 10) errors.push('Invalid explicacao');
  if (!anoConcurso || typeof anoConcurso !== 'number') errors.push('Invalid anoConcurso');
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = { validateQuestion };

