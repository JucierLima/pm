const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  materia: {
    type: String,
    required: true
  },
  descricao: {
    type: String
  },
  ordem: {
    type: Number,
    default: 0
  },
  ativo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);

