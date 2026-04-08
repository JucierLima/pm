const questionModel = require('../models/questionModel');
const { generateQuestions } = require('./geminiService');
const { validateQuestion } = require('../utils/questionValidator');

// Mapeia o formato da IA (pergunta/opcoes/correta) para o schema do banco (enunciado/alternativas/respostaCorreta)
const mapToDbSchema = (q) => ({
  materia: q.materia,
  assunto: q.materia,          // IA não retorna assunto separado; usa matéria como fallback
  dificuldade: q.dificuldade,
  enunciado: q.pergunta,
  alternativas: q.opcoes,
  respostaCorreta: q.correta,
  explicacao: q.explicacao,
  anoConcurso: 2024,
  geradaPorIA: true,
});

const getSessionQuestions = async (materia, dificuldade = 'Médio', limit = 10, excludeIds = [], modo = 'estudo') => {
  // 1. Sempre tenta o banco primeiro
  let questions = questionModel.getSessionQuestions(materia, dificuldade, limit, excludeIds);

  // 2. Só chama a IA se realmente faltar questões
  if (questions.length < limit) {
    try {
      const raw = await generateQuestions(materia, dificuldade, modo);
      const mapped = raw.map(mapToDbSchema);

      const valid = mapped.filter((q, i) => {
        const { valid, errors } = validateQuestion(q);
        if (!valid) console.error(`Questão ${i} inválida:`, errors);
        return valid;
      });

      if (valid.length > 0) {
        questionModel.insertMany(valid);
        // Rebusca após inserir para incluir as novas
        questions = questionModel.getSessionQuestions(materia, dificuldade, limit, excludeIds);
      }
    } catch (aiError) {
      // IA falhou (quota, rede, JSON inválido) — usa o que já tem no banco
      console.error('IA indisponível, usando questões do cache:', aiError.message);
    }
  }

  if (questions.length === 0) {
    throw new Error(`Nenhuma questão disponível para ${materia} (${dificuldade})`);
  }

  // Remove respostaCorreta antes de enviar ao frontend
  return questions.map(({ respostaCorreta, ...rest }) => rest);
};

module.exports = { getSessionQuestions };
