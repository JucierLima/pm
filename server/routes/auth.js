const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, generateToken } = require('../middlewares/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { nome, apelido, senha } = req.body;

    // Validation
    if (!nome || !apelido || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Check if nickname already exists
    const existingUser = await User.findOne({ apelido: apelido.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Este apelido já está em uso.' });
    }

    // Create user
    const user = new User({
      nome,
      apelido: apelido.toLowerCase(),
      senha,
      experiencia: 0,
      patente: 'Soldado',
      nivel: 1
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      token,
      user: {
        id: user._id,
        nome: user.nome,
        apelido: user.apelido,
        patente: user.patente,
        nivel: user.nivel,
        experiencia: user.experiencia
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao realizar cadastro.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { apelido, senha } = req.body;

    if (!apelido || !senha) {
      return res.status(400).json({ error: 'Preencha apelido e senha.' });
    }

    // Find user
    const user = await User.findOne({ apelido: apelido.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    // Check password
    const isMatch = await user.comparePassword(senha);
    if (!isMatch) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.ultimoAcesso) {
      const lastAccess = new Date(user.ultimoAcesso);
      lastAccess.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - lastAccess) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.sequenciaDias += 1;
      } else if (diffDays > 1) {
        user.sequenciaDias = 1;
      }
    } else {
      user.sequenciaDias = 1;
    }
    
    user.ultimoAcesso = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: `Bem-vindo ${user.patente} ${user.nome}!`,
      token,
      user: {
        id: user._id,
        nome: user.nome,
        apelido: user.apelido,
        patente: user.patente,
        nivel: user.nivel,
        experiencia: user.experiencia,
        sequenciaDias: user.sequenciaDias
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      nome: user.nome,
      apelido: user.apelido,
      patente: user.patente,
      nivel: user.nivel,
      experiencia: user.experiencia,
      sequenciaDias: user.sequenciaDias,
      conquistas: user.conquistas
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { nome, apelido } = req.body;
    const user = req.user;

    if (nome) user.nome = nome;
    if (apelido && apelido !== user.apelido) {
      const existingUser = await User.findOne({ apelido: apelido.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Este apelido já está em uso.' });
      }
      user.apelido = apelido.toLowerCase();
    }

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: {
        id: user._id,
        nome: user.nome,
        apelido: user.apelido,
        patente: user.patente,
        nivel: user.nivel,
        experiencia: user.experiencia
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;

