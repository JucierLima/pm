const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { auth, generateToken } = require('../middlewares/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { nome, apelido, senha } = req.body;

    if (!nome || !apelido || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha muito curta (mín. 6 caracteres).' });
    }

    const existingUser = userModel.findByNickname(apelido);
    if (existingUser) {
      return res.status(400).json({ error: 'Apelido já em uso. Escolha outro.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = userModel.createUser(nome, apelido, hashedPassword);

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Soldado recrutado com sucesso! 💪',
      token,
      user: {
        id: newUser.id,
        nome: newUser.nome,
        apelido: newUser.apelido,
        patente: newUser.patente || 'Soldado',
        nivel: newUser.nivel || 1,
        xp: newUser.xp || 0,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { apelido, senha } = req.body;

    if (!apelido || !senha) {
      return res.status(400).json({ error: 'Apelido e senha obrigatórios.' });
    }

    const user = userModel.findByNickname(apelido);
    if (!user) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    const isMatch = await bcrypt.compare(senha, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    // Atualizar streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let sequenciaDias = user.sequenciaDias || 1;

    if (user.ultimoAcesso) {
      const last = new Date(user.ultimoAcesso);
      last.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        sequenciaDias = (user.sequenciaDias || 0) + 1;
      } else if (diff > 1) {
        sequenciaDias = 1;
      }
    }

    userModel.updateLastAccessAndStreak(user.id, today, sequenciaDias);

    const token = generateToken(user.id);

    res.json({
      message: `Bem-vindo de volta, ${user.patente || 'Soldado'} ${user.nome}!`,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        apelido: user.apelido,
        patente: user.patente || 'Soldado',
        nivel: user.nivel || 1,
        xp: user.xp || 0,
        sequenciaDias,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// Me
router.get('/me', auth, async (req, res) => {
  try {
    const user = userModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({
      id: user.id,
      nome: user.nome,
      apelido: user.apelido,
      patente: user.patente || 'Soldado',
      nivel: user.nivel || 1,
      xp: user.xp || 0,
      sequenciaDias: user.sequenciaDias || 0,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro ao carregar perfil.' });
  }
});

module.exports = router;
