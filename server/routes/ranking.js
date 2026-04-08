const express = require('express');
const router = express.Router();
const db = require('../database/usersDb');
const { auth } = require('../middlewares/auth');

// Get global ranking — consulta real no SQLite
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const rows = db.prepare(`
      SELECT apelido, patente, nivel, xp AS experiencia
      FROM users
      ORDER BY xp DESC, nivel DESC
      LIMIT ?
    `).all(parseInt(limit));

    const ranking = rows.map((row, i) => ({ posicao: i + 1, ...row }));
    res.json({ ranking });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ranking.' });
  }
});

// Get user position in ranking
router.get('/me', auth, async (req, res) => {
  try {
    const countAbove = db.prepare(
      'SELECT COUNT(*) AS count FROM users WHERE xp > ?'
    ).get(req.user.xp).count;

    const totalUsuarios = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

    res.json({
      posicao: countAbove + 1,
      totalUsuarios,
      apelido: req.user.apelido,
      patente: req.user.patente || 'Soldado',
      nivel: req.user.nivel || 1,
      experiencia: req.user.xp || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar posição no ranking.' });
  }
});

module.exports = router;
