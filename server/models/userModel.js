const db = require('../database/usersDb');
const bcrypt = require('bcryptjs');

const findByNickname = (apelido) => {
  const stmt = db.prepare('SELECT * FROM users WHERE apelido = ?');
  return stmt.get(apelido);
};

const findById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
};

const createUser = (nome, apelido, passwordHash) => {
  const stmt = db.prepare(`
    INSERT INTO users (nome, apelido, password, patente, nivel, xp, sequenciaDias, ultimoAcesso)
    VALUES (?, ?, ?, 'Soldado', 1, 0, 0, CURRENT_TIMESTAMP)
  `);
  const info = stmt.run(nome, apelido, passwordHash);
  return findById(info.lastInsertRowid);
};

const updateLastAccessAndStreak = (userId, today, streak) => {
  const stmt = db.prepare(`UPDATE users SET ultimoAcesso = ?, sequenciaDias = ? WHERE id = ?`);
  stmt.run(today.toISOString(), streak, userId);
};

const updateXpAndLevel = (userId, xpGain) => {
  const user = findById(userId);
  if (!user) return;
  let newXp = (user.xp || 0) + xpGain;
  let newLevel = user.nivel || 1;
  const levelUpThreshold = 100;
  while (newXp >= newLevel * levelUpThreshold) {
    newXp -= newLevel * levelUpThreshold;
    newLevel++;
  }
  let patente = 'Soldado';
  if (newLevel >= 10) patente = 'Cabo';
  if (newLevel >= 20) patente = 'Sargento';
  if (newLevel >= 30) patente = 'Tenente';
  if (newLevel >= 40) patente = 'Capitão';
  if (newLevel >= 50) patente = 'Major';
  if (newLevel >= 60) patente = 'Coronel';
  const stmt = db.prepare(`UPDATE users SET xp = ?, nivel = ?, patente = ? WHERE id = ?`);
  stmt.run(newXp, newLevel, patente, userId);
};

const comparePassword = (plain, hash) => bcrypt.compareSync(plain, hash);

module.exports = {
  findByNickname,
  findById,
  createUser,
  updateLastAccessAndStreak,
  updateXpAndLevel,
  comparePassword,
};
