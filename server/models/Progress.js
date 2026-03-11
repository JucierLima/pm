const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materia: {
    type: String,
    required: true
  },
  totalQuestoes: {
    type: Number,
    default: 0
  },
  acertos: {
    type: Number,
    default: 0
  },
  erros: {
    type: Number,
    default: 0
  },
  percentualAcertos: {
    type: Number,
    default: 0
  },
  sequenciaAcertos: {
    type: Number,
    default: 0
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
progressSchema.index({ usuario: 1, materia: 1 }, { unique: true });

// Calculate percentage method
progressSchema.methods.calcularPercentual = function() {
  if (this.totalQuestoes === 0) return 0;
  return Math.round((this.acertos / this.totalQuestoes) * 100);
};

module.exports = mongoose.model('Progress', progressSchema);

