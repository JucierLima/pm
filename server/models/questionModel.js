const db = require('../database/questionsDb');

const getSessionQuestions = (materia, dificuldade, limit, excludeIds = []) => {
  let sql = `
    SELECT id, materia, assunto, dificuldade, enunciado,
           alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
           respostaCorreta, explicacao, anoConcurso, geradaPorIA
    FROM questions
    WHERE materia = ? AND dificuldade = ?
  `;
  const params = [materia, dificuldade];
  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => '?').join(',');
    sql += ` AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }
  sql += ` ORDER BY RANDOM() LIMIT ?`;
  params.push(limit);
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows.map(row => ({
    id: row.id,
    materia: row.materia,
    assunto: row.assunto,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    alternativas: [
      row.alternativaA,
      row.alternativaB,
      row.alternativaC,
      row.alternativaD,
      row.alternativaE,
    ],
    respostaCorreta: row.respostaCorreta,
    explicacao: row.explicacao,
    anoConcurso: row.anoConcurso,
    geradaPorIA: row.geradaPorIA === 1,
  }));
};

const getQuestionById = (id) => {
  const stmt = db.prepare(`
    SELECT id, materia, assunto, dificuldade, enunciado,
           alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
           respostaCorreta, explicacao, anoConcurso, geradaPorIA
    FROM questions WHERE id = ?
  `);
  const row = stmt.get(id);
  if (!row) return null;
  return {
    id: row.id,
    materia: row.materia,
    assunto: row.assunto,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    alternativas: [
      row.alternativaA,
      row.alternativaB,
      row.alternativaC,
      row.alternativaD,
      row.alternativaE,
    ],
    respostaCorreta: row.respostaCorreta,
    explicacao: row.explicacao,
    anoConcurso: row.anoConcurso,
    geradaPorIA: row.geradaPorIA === 1,
  };
};

const insertMany = (questions) => {
  const insert = db.prepare(`
    INSERT INTO questions (
      materia, assunto, dificuldade, enunciado,
      alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
      respostaCorreta, explicacao, anoConcurso, geradaPorIA
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const transaction = db.transaction((questions) => {
    for (const q of questions) {
      const alternativas = q.alternativas;
      const altA = alternativas[0] || '';
      const altB = alternativas[1] || '';
      const altC = alternativas[2] || '';
      const altD = alternativas[3] || '';
      const altE = alternativas[4] || '';
      insert.run(
        q.materia, q.assunto, q.dificuldade, q.enunciado,
        altA, altB, altC, altD, altE,
        q.respostaCorreta, q.explicacao, q.anoConcurso || 2024,
        q.geradaPorIA ? 1 : 0
      );
    }
  });
  transaction(questions);
};

const getQuestionsByIds = (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT id, materia, assunto, dificuldade, enunciado,
           alternativaA, alternativaB, alternativaC, alternativaD, alternativaE,
           respostaCorreta, explicacao, anoConcurso, geradaPorIA
    FROM questions WHERE id IN (${placeholders})
  `);
  const rows = stmt.all(...ids);
  return rows.map(row => ({
    id: row.id,
    materia: row.materia,
    assunto: row.assunto,
    dificuldade: row.dificuldade,
    enunciado: row.enunciado,
    alternativas: [row.alternativaA, row.alternativaB, row.alternativaC, row.alternativaD, row.alternativaE],
    respostaCorreta: row.respostaCorreta,
    explicacao: row.explicacao,
    anoConcurso: row.anoConcurso,
    geradaPorIA: row.geradaPorIA === 1,
  }));
};

const updateStats = (id, correta) => {
  const stmt = db.prepare(`
    UPDATE questions
    SET vezesRespondida = vezesRespondida + 1,
        vezesAcertada   = vezesAcertada + ?
    WHERE id = ?
  `);
  stmt.run(correta ? 1 : 0, id);
};

module.exports = {
  getSessionQuestions,
  getQuestionById,
  getQuestionsByIds,
  updateStats,
  insertMany,
};
