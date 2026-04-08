const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'users.db'));
console.log('✅ users.db conectado');

db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    apelido TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    patente TEXT DEFAULT 'Soldado',
    nivel INTEGER DEFAULT 1,
    sequenciaDias INTEGER DEFAULT 0,
    ultimoAcesso DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario INTEGER,
    materia TEXT,
    totalQuestoes INTEGER DEFAULT 0,
    acertos INTEGER DEFAULT 0,
    erros INTEGER DEFAULT 0,
    percentualAcertos INTEGER DEFAULT 0,
    ultimaAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES users(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario INTEGER,
    materia TEXT,
    modo TEXT CHECK(modo IN ('estudo','desafio','simulado')),
    questoes TEXT,
    totalQuestoes INTEGER,
    acertos INTEGER DEFAULT 0,
    erros INTEGER DEFAULT 0,
    percentual INTEGER DEFAULT 0,
    experienciaGanha INTEGER DEFAULT 0,
    tempoTotal INTEGER DEFAULT 0,
    questoesErradas TEXT,
    completed BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario) REFERENCES users(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    selectedAnswer INTEGER NOT NULL,
    isCorrect BOOLEAN NOT NULL DEFAULT 0,
    timeSpent INTEGER DEFAULT 0,
    materia TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
)`);

module.exports = db;
