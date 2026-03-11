const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  materia: {
    type: String,
    required: true,
    enum: [
      'Língua Portuguesa',
      'Raciocínio Lógico',
      'Informática',
      'Direito Constitucional',
      'Direitos Humanos',
      'História de Pernambuco',
      'Legislação Extravagante',
      'Legislação PMPE'
    ]
  },
  assunto: {
    type: String,
    required: true
  },
  dificuldade: {
    type: String,
    enum: ['Fácil', 'Médio', 'Difícil'],
    required: true
  },
  enunciado: {
    type: String,
    required: true
  },
  alternativas: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 5;
      },
      message: 'Devem haver exatamente 5 alternativas'
    }
  },
  respostaCorreta: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  explicacao: {
    type: String,
    required: true
  },
  anoConcurso: {
    type: Number,
    required: true
  },
  instituicao: {
    type: String,
    default: 'PMPE'
  },
  vezesRespondida: {
    type: Number,
    default: 0
  },
  vezesAcertada: {
    type: Number,
    default: 0
  },
  geradaPorIA: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
questionSchema.index({ materia: 1, dificuldade: 1, _id: 1 });

module.exports = mongoose.model('Question', questionSchema);

