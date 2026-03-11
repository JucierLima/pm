const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

// Get user progress for all subjects
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ usuario: req.user._id });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso.' });
  }
});

// Get progress for specific subject
router.get('/:materia', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ 
      usuario: req.user._id, 
      materia: req.params.materia 
    });
    
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
    const attempt = new Attempt({
      usuario: req.user._id,
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

    await attempt.save();

    // Update user experience
    const user = req.user;
    user.experiencia += experienciaGanha;
    user.patente = user.calcularPatente();
    user.nivel = user.calcularNivel();
    await user.save();

    // Update progress for this subject
    let progress = await Progress.findOne({ 
      usuario: req.user._id, 
      materia 
    });

    if (!progress) {
      progress = new Progress({
        usuario: req.user._id,
        materia,
        totalQuestoes: questoes.length,
        acertos,
        erros: questoes.length - acertos,
        percentualAcertos: Math.round((acertos / questoes.length) * 100)
      });
    } else {
      progress.totalQuestoes += questoes.length;
      progress.acertos += acertos;
      progress.erros += erros;
      progress.percentualAcertos = Math.round((progress.acertos / progress.totalQuestoes) * 100);
      progress.ultimaAtualizacao = new Date();
    }

    await progress.save();

    // Check for achievements
    const achievements = [];
    
    // First attempt
    const totalAttempts = await Attempt.countDocuments({ usuario: req.user._id });
    if (totalAttempts === 1) {
      achievements.push('Primeiro passo');
    }
    
    // Streak achievements
    if (user.sequenciaDias >= 7) achievements.push('Semana de aço');
    if (user.sequenciaDias >= 30) achievements.push('Mês de campeão');
    
    // Master subject (90%+ in a subject)
    if (progress.percentualAcertos >= 90) {
      achievements.push(`Mestre em ${materia}`);
    }

    res.json({
      message: 'Resultado salvo com sucesso!',
      attempt,
      user: {
        experiencia: user.experiencia,
        patente: user.patente,
        nivel: user.nivel
      },
      achievements,
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
    
    const attempts = await Attempt.find({ usuario: req.user._id, completed: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('questoes.questao', 'materia dificuldade');

    const total = await Attempt.countDocuments({ usuario: req.user._id, completed: true });

    res.json({
      attempts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

// Get study statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Total attempts
    const totalAttempts = await Attempt.countDocuments({ usuario: user._id, completed: true });
    
    // Total questions answered
    const totalQuestions = await Attempt.aggregate([
      { $match: { usuario: user._id, completed: true } },
      { $group: { _id: null, total: { $sum: '$totalQuestoes' } } }
    ]);
    
    // Overall accuracy
    const accuracyData = await Attempt.aggregate([
      { $match: { usuario: user._id, completed: true } },
      { $group: { 
        _id: null, 
        totalAcertos: { $sum: '$acertos' },
        totalQuestoes: { $sum: '$totalQuestoes' }
      } }
    ]);
    
    // By subject
    const bySubject = await Attempt.aggregate([
      { $match: { usuario: user._id, completed: true } },
      { $group: { 
        _id: '$materia', 
        acertos: { $sum: '$acertos' },
        total: { $sum: '$totalQuestoes' }
      } },
      { $addFields: { percentual: { $round: [{ $multiply: [{ $divide: ['$acertos', '$total'] }, 100] }, 0] } } }
    ]);

    // Strongest and weakest subjects
    const sortedBySubject = [...bySubject].sort((a, b) => b.percentual - a.percentual);
    const strongest = sortedBySubject[0] || null;
    const weakest = sortedBySubject[sortedBySubject.length - 1] || null;

    res.json({
      totalAttempts,
      totalQuestions: totalQuestions[0]?.total || 0,
      overallAccuracy: accuracyData[0] ? Math.round((accuracyData[0].totalAcertos / accuracyData[0].totalQuestoes) * 100) : 0,
      bySubject,
      strongest,
      weakest,
      streak: user.sequenciaDias,
      level: user.nivel,
      experience: user.experiencia,
      rank: user.patente
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

module.exports = router;

