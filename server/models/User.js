const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  apelido: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  senha: {
    type: String,
    required: true,
    minlength: 6
  },
  experiencia: {
    type: Number,
    default: 0
  },
  patente: {
    type: String,
    enum: ['Soldado', 'Cabo', 'Sargento', 'Tenente', 'Capitão', 'Major', 'Coronel'],
    default: 'Soldado'
  },
  nivel: {
    type: Number,
    default: 1
  },
  sequenciaDias: {
    type: Number,
    default: 0
  },
  ultimoAcesso: {
    type: Date,
    default: null
  },
  conquistas: [{
    type: String
  }],
  rankingPosicao: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.senha);
};

// Calculate patent based on experience
userSchema.methods.calcularPatente = function() {
  const exp = this.experiencia;
  if (exp >= 10000) return 'Coronel';
  if (exp >= 7000) return 'Major';
  if (exp >= 4500) return 'Capitão';
  if (exp >= 2500) return 'Tenente';
  if (exp >= 1000) return 'Sargento';
  if (exp >= 300) return 'Cabo';
  return 'Soldado';
};

// Calculate level based on experience
userSchema.methods.calcularNivel = function() {
  return Math.floor(this.experiencia / 100) + 1;
};

module.exports = mongoose.model('User', userSchema);

