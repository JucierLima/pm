const express = require('express');
const router = express.Router();
const progressModel = require('../models/progressModel');
const attemptModel = require('../models/attemptModel');
const userModel = require('../models/userModel');
const { auth } = require('../middlewares/auth');

// Get user progress for all subjects
router.get('/', auth, async (req, res) => {
  try {
    const progress = progressModel.getProgressByUser(req.userId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso.' });
  }
});

// Get progress for specific subject
router.get('/:materia', auth, async (req, res) => {
  try {
    const progress = progressModel.getProgressBySubject(req.userId, req.params.materia);
    
    if (!progress) {
      return res.json({
        materia: req.params.materia,
        totalQuestoes: 0,
        acertos: 0,
        erros: 0,
        percentualAcertos: 0
      });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso da matéria.' });
  }
});

// Save attempt result
router.post('/attempt', auth, async (req, res) => {
  try {
    const { materia, modo, questoes, acertos, erros, experienciaGanha, tempoTotal, questoesErradas } = req.body;

    // Create attempt record
    attemptModel.createAttempt({
      usuario: req.userId,
      materia,
      modo,
      questoes,
      totalQuestoes: questoes.length,
      acertos,
      erros,
      percentual: Math.round((acertos / questoes.length) * 100),
      experienciaGanha,
      tempoTotal,
      questoesErradas,
      completed: true
    });

    // Update user XP (simplified - full logic in model)
    userModel.updateXpAndLevel(req.userId, experienciaGanha);

    // Update progress for this subject
    progressModel.updateProgress(req.userId, materia, acertos, questoes.length);

    res.json({
      message: 'Resultado salvo com sucesso!',
      nextQuestions: questoesErradas
    });
  } catch (error) {
    console.error('Erro ao salvar tentativa:', error);
    res.status(500).json({ error: 'Erro ao salvar resultado.' });
  }
});

// Get attempt history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const history = attemptModel.getAttemptsByUser(req.userId, parseInt(limit), parseInt(page));

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

// Get study statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await attemptModel.getStatistics(req.userId);
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

module.exports = router;
