const express = require('express');
const router = express.Router();
const { getSessionQuestions } = require('../services/questionService');
const questionModel = require('../models/questionModel');
const { auth } = require('../middlewares/auth');
const usersDb = require('../database/usersDb');
const questionsDb = require('../database/questionsDb');

// Obter sessão de questões
router.get('/session', auth, async (req, res) => {
  try {
    const { materia, dificuldade, limit = 10, excludeIds, modo = 'estudo' } = req.query;
    if (!materia) return res.status(400).json({ error: 'Matéria é obrigatória' });
    const excludeArray = excludeIds ? excludeIds.split(',').map(Number) : [];
    const questions = await getSessionQuestions(materia, dificuldade, parseInt(limit), excludeArray, modo);
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar questões' });
  }
});

// GET /generate — verifica SQLite, chama Gemini se necessário, salva e retorna
router.get('/generate', auth, async (req, res) => {
  const { materia, dificuldade = 'Médio', modo = 'estudo' } = req.query;
  if (!materia) return res.status(400).json({ error: 'Matéria é obrigatória' });

  try {
    // 1. Tenta buscar questões existentes no SQLite
    let rows = questionsDb.prepare(`
      SELECT id, materia, assunto, dificuldade, enunciado,
             alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
             respostaCorreta, explicacao, anoConcurso, geradaPorIA
      FROM questions
      WHERE materia = ? AND dificuldade = ?
      ORDER BY RANDOM() LIMIT 10
    `).all(materia, dificuldade);

    // 2. Se banco vazio ou com poucas questões, chama o Gemini
    if (rows.length < 5) {
      const { generateQuestions } = require('../services/geminiService');
      const raw = await generateQuestions(materia, dificuldade, modo);

      // 3. Salva no SQLite usando o schema real da tabela (enunciado, alternativaA..E, respostaCorreta)
      const insert = questionsDb.prepare(`
        INSERT INTO questions
          (materia, assunto, dificuldade, enunciado,
           alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
           respostaCorreta, explicacao, anoConcurso, geradaPorIA)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      questionsDb.transaction((qs) => {
        for (const q of qs) {
          insert.run(
            q.materia, q.materia, q.dificuldade, q.pergunta,
            q.opcoes[0] || '', q.opcoes[1] || '', q.opcoes[2] || '',
            q.opcoes[3] || '', q.opcoes[4] || '',
            q.correta, q.explicacao, 2024, 1
          );
        }
      })(raw);

      // 4. Busca novamente após salvar
      rows = questionsDb.prepare(`
        SELECT id, materia, assunto, dificuldade, enunciado,
               alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
               respostaCorreta, explicacao, anoConcurso, geradaPorIA
        FROM questions WHERE materia = ? AND dificuldade = ? LIMIT 10
      `).all(materia, dificuldade);
    }

    // 5. Formata e remove respostaCorreta antes de enviar ao frontend
    const questions = rows.map(row => ({
      id: row.id,
      materia: row.materia,
      assunto: row.assunto,
      dificuldade: row.dificuldade,
      enunciado: row.enunciado,
      alternativas: [row.alternativaA, row.alternativaB, row.alternativaC, row.alternativaD, row.alternativaE],
      explicacao: row.explicacao,
      anoConcurso: row.anoConcurso,
      geradaPorIA: row.geradaPorIA === 1,
    }));

    res.json(questions);
  } catch (error) {
    console.error('Erro ao gerar questões:', error);
    res.status(500).json({ error: 'Falha ao carregar questões do edital.' });
  }
});

// GET /review/wrong — deve vir ANTES de /:id para o Express não confundir 'review' como id
router.get('/review/wrong', auth, (req, res) => {
  const userId = req.user.id;

  // Busca IDs das questões erradas no users.db
  const wrongIds = usersDb.prepare(`
    SELECT DISTINCT questionId FROM history
    WHERE userId = ? AND isCorrect = 0
    ORDER BY date DESC
    LIMIT 10
  `).all(userId).map(r => r.questionId);

  if (wrongIds.length === 0) return res.json({ questions: [] });

  // Busca os dados das questões no questions.db
  const placeholders = wrongIds.map(() => '?').join(',');
  const rows = questionsDb.prepare(`
    SELECT id, materia, assunto, dificuldade, enunciado,
           alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
           respostaCorreta, explicacao, anoConcurso, geradaPorIA
    FROM questions WHERE id IN (${placeholders})
  `).all(...wrongIds);

  const questions = rows.map(row => ({
    id: row.id,
    materia: row.materia,
    assunto: row.assunto,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    alternativas: [row.alternativaA, row.alternativaB, row.alternativaC, row.alternativaD, row.alternativaE],
    respostaCorreta: row.respostaCorreta,
    explicacao: row.explicacao,
    anoConcurso: row.anoConcurso,
    geradaPorIA: row.geradaPorIA === 1,
  }));

  res.json({ questions });
});

// POST /:id/answer — processar resposta do aluno
router.post('/:id/answer', auth, async (req, res) => {
  const questionId = parseInt(req.params.id);
  const { selectedAnswer, timeSpent, materia } = req.body;
  const userId = req.user.id;

  try {
    // Busca a questão para calcular isCorrect no backend (não confia no frontend)
    const row = questionsDb.prepare(
      'SELECT respostaCorreta, explicacao FROM questions WHERE id = ?'
    ).get(questionId);

    if (!row) return res.status(404).json({ error: 'Questão não encontrada' });

    const correta = selectedAnswer === row.respostaCorreta;

    usersDb.prepare(`
      INSERT INTO history (userId, questionId, selectedAnswer, isCorrect, timeSpent, materia, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, questionId, selectedAnswer, correta ? 1 : 0, timeSpent ?? 0, materia, new Date().toISOString());

    if (correta) {
      usersDb.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').run(userId);
    }

    res.json({
      correta,
      respostaCorreta: row.respostaCorreta,
      explicacao: row.explicacao,
      experienciaGanha: correta ? 10 : 0,
    });
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
    res.status(500).json({ error: 'Erro ao salvar resposta' });
  }
});

module.exports = router;
