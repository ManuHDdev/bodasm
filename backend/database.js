const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'boda.db'));

// Rendimiento: WAL mode
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS rsvp (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre       TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    telefono     TEXT,
    asiste       INTEGER NOT NULL,
    acompanantes INTEGER DEFAULT 0,
    alergias     TEXT,
    mensaje      TEXT,
    invitado     TEXT,
    created_at   TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
