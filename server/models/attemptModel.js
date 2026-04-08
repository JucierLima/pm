const db = require('../database/usersDb');

const createAttempt = (data) => {
  const {
    usuario, materia, modo, questoes, totalQuestoes,
    acertos, erros, percentual, experienciaGanha,
    tempoTotal, questoesErradas, completed
  } = data;

  const stmt = db.prepare(`
    INSERT INTO attempts (
      usuario, materia, modo, questoes, totalQuestoes,
      acertos, erros, percentual, experienciaGanha,
      tempoTotal, questoesErradas, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    usuario, materia, modo, JSON.stringify(questoes), totalQuestoes,
    acertos, erros, percentual, experienciaGanha,
    tempoTotal, JSON.stringify(questoesErradas), completed ? 1 : 0
  );
  return info.lastInsertRowid;
};

const getAttemptsByUser = (usuario, limit = 10, page = 1) => {
  const offset = (page - 1) * limit;
  const stmt = db.prepare(`
    SELECT * FROM attempts WHERE usuario = ? AND completed = 1
    ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `);
  const rows = stmt.all(usuario, limit, offset);
  const total = db.prepare('SELECT COUNT(*) as count FROM attempts WHERE usuario = ? AND completed = 1').get(usuario).count;
  return {
    attempts: rows.map(row => ({
      ...row,
      questoes: JSON.parse(row.questoes),
      questoesErradas: JSON.parse(row.questoesErradas),
      completed: row.completed === 1,
    })),
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const getStatistics = async (usuario) => {
  const totalAttempts = db.prepare('SELECT COUNT(*) as count FROM attempts WHERE usuario = ? AND completed = 1').get(usuario).count;
  const totalQuestions = db.prepare('SELECT SUM(totalQuestoes) as total FROM attempts WHERE usuario = ? AND completed = 1').get(usuario).total || 0;
  const accuracy = db.prepare(`
    SELECT SUM(acertos) as acertos, SUM(totalQuestoes) as total
    FROM attempts WHERE usuario = ? AND completed = 1
  `).get(usuario);
  const overallAccuracy = accuracy.total ? Math.round((accuracy.acertos / accuracy.total) * 100) : 0;

  const bySubject = db.prepare(`
    SELECT materia, SUM(acertos) as acertos, SUM(totalQuestoes) as total
    FROM attempts WHERE usuario = ? AND completed = 1
    GROUP BY materia
  `).all(usuario);
  const subjectsWithPercent = bySubject.map(s => ({
    ...s,
    percentual: s.total ? Math.round((s.acertos / s.total) * 100) : 0,
  }));
  const sorted = [...subjectsWithPercent].sort((a,b) => b.percentual - a.percentual);
  const strongest = sorted[0] || null;
  const weakest = sorted[sorted.length-1] || null;

  return {
    totalAttempts,
    totalQuestions,
    overallAccuracy,
    bySubject: subjectsWithPercent,
    strongest,
    weakest,
  };
};

module.exports = {
  createAttempt,
  getAttemptsByUser,
  getStatistics,
};
