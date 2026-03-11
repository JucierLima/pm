const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

// Get global ranking
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const ranking = await User.find()
      .sort({ experiencia: -1 })
      .limit(parseInt(limit))
      .select('apelido patente nivel experiencia')
      .lean();

    // Add position to each user
    const rankingWithPosition = ranking.map((user, index) => ({
      posicao: index + 1,
      apelido: user.apelido,
      patente: user.patente,
      nivel: user.nivel,
      experiencia: user.experiencia
    }));

    res.json(rankingWithPosition);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
});

// Get user position in ranking
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Count how many users have more experience
    const position = await User.countDocuments({
      experiencia: { $gt: user.experiencia }
    }) + 1;

    const totalUsers = await User.countDocuments();

    // Get surrounding users
    const aboveUsers = await User.find({
      experiencia: { $gt: user.experiencia }
    })
      .sort({ experiencia: 1 })
      .limit(2)
      .select('apelido patente nivel experiencia');

    const belowUsers = await User.find({
      experiencia: { $lt: user.experiencia }
    })
      .sort({ experiencia: -1 })
      .limit(2)
      .select('apelido patente nivel experiencia');

    res.json({
      posicao: position,
      totalUsuarios: totalUsers,
      apelido: user.apelido,
      patente: user.patente,
      nivel: user.nivel,
      experiencia: user.experiencia,
      acima: aboveUsers.reverse(),
      abaixo: belowUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar posição no ranking.' });
  }
});

// Get ranking by subject
router.get('/materia/:materia', async (req, res) => {
  try {
    const { materia } = req.params;
    const { limit = 20 } = req.query;
    
    // This would require a more complex aggregation
    // For now, return a message that this feature needs implementation
    res.json({
      message: `Ranking por ${materia} em desenvolvimento.`,
      nota: 'Esta funcionalidade requer rastreamento adicional por matéria.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking por matéria.' });
  }
});

// Get top performers of the week
router.get('/semana', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // This would require tracking weekly XP
    // For now, return overall ranking with a note
    const ranking = await User.find()
      .sort({ experiencia: -1 })
      .limit(10)
      .select('apelido patente nivel experiencia');

    res.json({
      message: 'Ranking semanal em desenvolvimento.',
      top10: ranking
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking semanal.' });
  }
});

module.exports = router;

