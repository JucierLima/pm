const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth } = require('../middlewares/auth');

// Get all questions (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { materia, dificuldade, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (materia) filter.materia = materia;
    if (dificuldade) filter.dificuldade = dificuldade;

    const questions = await Question.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-respostaCorreta');

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões.' });
  }
});

// Get questions for study session (10 random questions)
router.get('/session', auth, async (req, res) => {
  try {
    const { materia, dificuldade } = req.query;
    
    const filter = { materia, dificuldade };
    
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          materia: 1,
          assunto: 1,
          dificuldade: 1,
          enunciado: 1,
          alternativas: 1,
          anoConcurso: 1
        }
      }
    ]);

    // If not enough questions, get more with different difficulties
    if (questions.length < 10) {
      const additionalQuestions = await Question.aggregate([
        { $match: { materia } },
        { $sample: { size: 10 - questions.length } },
        {
          $project: {
            _id: 1,
            materia: 1,
            assunto: 1,
            dificuldade: 1,
            enunciado: 1,
            alternativas: 1,
            anoConcurso: 1
          }
        }
      ]);
      questions.push(...additionalQuestions);
    }

    res.json({ questions });
  } catch (error) {
    console.error('Erro ao buscar sessão de questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões para sessão.' });
  }
});

// Get single question by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('-respostaCorreta');
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada.' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar questão.' });
  }
});

// Create new question (admin)
router.post('/', auth, async (req, res) => {
  try {
    const { materia, assunto, dificuldade, enunciado, alternativas, respostaCorreta, explicacao, anoConcurso, instituicao } = req.body;

    // Validation
    if (!materia || !assunto || !dificuldade || !enunciado || !alternativas || respostaCorreta === undefined || !explicacao) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (alternativas.length !== 5) {
      return res.status(400).json({ error: 'Devem haver exatamente 5 alternativas.' });
    }

    const question = new Question({
      materia,
      assunto,
      dificuldade,
      enunciado,
      alternativas,
      respostaCorreta,
      explicacao,
      anoConcurso: anoConcurso || new Date().getFullYear(),
      instituicao: instituicao || 'PMPE'
    });

    await question.save();

    res.status(201).json({
      message: 'Questão criada com sucesso!',
      question
    });
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    res.status(500).json({ error: 'Erro ao criar questão.' });
  }
});

// Answer question and get result
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { respostaUsuario } = req.body;
    const questionId = req.params.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada.' });
    }

    const correta = respostaUsuario === question.respostaCorreta;

    // Update question stats
    question.vezesRespondida += 1;
    if (correta) {
      question.vezesAcertada += 1;
    }
    await question.save();

    res.json({
      correta,
      respostaCorreta: question.respostaCorreta,
      explicacao: question.explicacao,
      experienciaGanha: correta ? 10 : 2
    });
  } catch (error) {
    console.error('Erro ao responder questão:', error);
    res.status(500).json({ error: 'Erro ao processar resposta.' });
  }
});

// Get questions by wrong answers for review
router.get('/review/wrong', auth, async (req, res) => {
  try {
    const { questionIds } = req.body;
    
    if (!questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({ error: 'IDs das questões não fornecidos.' });
    }

    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('-respostaCorreta');

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar questões para revisão.' });
  }
});

// AI Question Generator (Placeholder)
router.post('/generate-ai', auth, async (req, res) => {
  try {
    const { materia, assunto, dificuldade } = req.body;

    // Placeholder for AI integration (OpenAI, etc.)
    // For now, return a template for manual filling
    const templateQuestion = {
      materia,
      assunto,
      dificuldade,
      enunciado: 'Esta é uma questão gerada por IA (funcionalidade em desenvolvimento)',
      alternativas: [
        'Alternativa A (gerada por IA)',
        'Alternativa B (gerada por IA)',
        'Alternativa C (gerada por IA)',
        'Alternativa D (gerada por IA)',
        'Alternativa E (gerada por IA)'
      ],
      respostaCorreta: 0,
      explicacao: 'Explicação gerada por IA (funcionalidade em desenvolvimento)',
      anoConcurso: new Date().getFullYear(),
      geradaPorIA: true
    };

    res.json({
      message: 'Template de IA gerado. Funcionalidade completa em breve!',
      question: templateQuestion
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar questão com IA.' });
  }
});

// Get subjects list
router.get('/meta/subjects', async (req, res) => {
  try {
    const subjects = [
      { nome: 'Gramática', materia: 'Língua Portuguesa' },
      { nome: 'Interpretação de Texto', materia: 'Língua Portuguesa' },
      { nome: 'Redação', materia: 'Líuguagem Escrita' },
      { nome: 'Raciocínio Lógico', materia: 'Raciocínio Lógico' },
      { nome: 'Matemática', materia: 'Raciocínio Lógico' },
      { nome: 'Informática Básica', materia: 'Informática' },
      { nome: 'Redes e Internet', materia: 'Informática' },
      { nome: 'Segurança da Informação', materia: 'Informática' },
      { nome: 'Direitos Fundamentais', materia: 'Direito Constitutional' },
      { nome: 'Princípios Constitucionais', materia: 'Direito Constitucional' },
      { nome: 'Direitos Civis e Políticos', materia: 'Direitos Humanos' },
      { nome: 'Tratados Internacionais', materia: 'Direitos Humanos' },
      { nome: 'História Colonial', materia: 'História de Pernambuco' },
      { nome: 'História Política', materia: 'História de Pernambuco' },
      { nome: 'Legislação Estadual', materia: 'Legislação Extravagante' },
      { nome: 'Estatutos', materia: 'Legislação Extravagante' },
      { nome: 'Código Penal Militar', materia: 'Legislação PMPE' },
      { nome: 'Estatuto do PMPE', materia: 'Legislação PMPE' }
    ];

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar disciplinas.' });
  }
});

module.exports = router;

