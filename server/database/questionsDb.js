const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'questions.db'));
console.log('✅ questions.db conectado');

db.exec(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia TEXT NOT NULL,
    assunto TEXT NOT NULL,
    dificuldade TEXT NOT NULL,
    enunciado TEXT NOT NULL,
    alternativaA TEXT NOT NULL,
    alternativaB TEXT NOT NULL,
    alternativaC TEXT NOT NULL,
    alternativaD TEXT NOT NULL,
    alternativaE TEXT NOT NULL,
    respostaCorreta INTEGER CHECK(respostaCorreta IN (0,1,2,3,4)),
    explicacao TEXT NOT NULL,
    anoConcurso INTEGER DEFAULT 2024,
    geradaPorIA BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    vezesRespondida INTEGER DEFAULT 0,
    vezesAcertada INTEGER DEFAULT 0
)`);

module.exports = db;
