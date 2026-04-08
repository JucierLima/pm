const db = require('../database/usersDb');

const getProgressByUser = (usuario) => {
  const stmt = db.prepare('SELECT * FROM progress WHERE usuario = ?');
  return stmt.all(usuario);
};

const getProgressBySubject = (usuario, materia) => {
  const stmt = db.prepare('SELECT * FROM progress WHERE usuario = ? AND materia = ?');
  return stmt.get(usuario, materia);
};

const updateProgress = (usuario, materia, acertos, total) => {
  const existing = getProgressBySubject(usuario, materia);
  if (!existing) {
    const stmt = db.prepare(`
      INSERT INTO progress (usuario, materia, totalQuestoes, acertos, erros, percentualAcertos)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const erros = total - acertos;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
    stmt.run(usuario, materia, total, acertos, erros, percentual);
  } else {
    const novoTotal = existing.totalQuestoes + total;
    const novosAcertos = existing.acertos + acertos;
    const novosErros = existing.erros + (total - acertos);
    const novoPercentual = novoTotal > 0 ? Math.round((novosAcertos / novoTotal) * 100) : 0;
    const stmt = db.prepare(`
      UPDATE progress
      SET totalQuestoes = ?, acertos = ?, erros = ?, percentualAcertos = ?, ultimaAtualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(novoTotal, novosAcertos, novosErros, novoPercentual, existing.id);
  }
};

module.exports = {
  getProgressByUser,
  getProgressBySubject,
  updateProgress,
};
