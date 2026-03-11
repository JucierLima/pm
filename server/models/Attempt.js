const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materia: {
    type: String
  },
  modo: {
    type: String,
    enum: ['estudo', 'desafio', 'simulado'],
    required: true
  },
  questoes: [{
    questao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    respostaUsuario: Number,
    correta: Boolean
  }],
  totalQuestoes: {
    type: Number,
    required: true
  },
  acertos: {
    type: Number,
    default: 0
  },
  erros: {
    type: Number,
    default: 0
  },
  percentual: {
    type: Number,
    default: 0
  },
  experienciaGanha: {
    type: Number,
    default: 0
  },
  tempoTotal: {
    type: Number, // em segundos
    default: 0
  },
  questoesErradas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);

