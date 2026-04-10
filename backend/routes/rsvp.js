const express = require('express');
const db = require('../database');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─────────────────────────────────────────
   POST /api/rsvp  — confirmar asistencia
───────────────────────────────────────── */
router.post('/', (req, res) => {
  try {
    const { nombre, email, telefono, asistencia, acompanantes, alergias, mensaje, invitado } = req.body;

    // Validación
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es obligatorio.' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'El email no es válido.' });
    }
    if (asistencia === undefined || asistencia === null || asistencia === '') {
      return res.status(400).json({ success: false, error: 'Indica si asistirás o no.' });
    }

    const asiste = asistencia === 'si' || asistencia === true || asistencia === 1 ? 1 : 0;
    const numAcompanantes = asiste ? Math.max(0, parseInt(acompanantes, 10) || 0) : 0;

    // Upsert: si el email ya existe, actualiza; si no, inserta
    const existing = db.prepare('SELECT id FROM rsvp WHERE email = ?').get(email.toLowerCase());

    if (existing) {
      db.prepare(`
        UPDATE rsvp SET
          nombre       = ?,
          telefono     = ?,
          asiste       = ?,
          acompanantes = ?,
          alergias     = ?,
          mensaje      = ?,
          invitado     = ?,
          created_at   = datetime('now')
        WHERE email = ?
      `).run(
        nombre.trim(),
        telefono?.trim() || null,
        asiste,
        numAcompanantes,
        alergias?.trim() || null,
        mensaje?.trim() || null,
        invitado?.trim() || null,
        email.toLowerCase()
      );
    } else {
      db.prepare(`
        INSERT INTO rsvp (nombre, email, telefono, asiste, acompanantes, alergias, mensaje, invitado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nombre.trim(),
        email.toLowerCase(),
        telefono?.trim() || null,
        asiste,
        numAcompanantes,
        alergias?.trim() || null,
        mensaje?.trim() || null,
        invitado?.trim() || null
      );
    }

    return res.status(200).json({
      success: true,
      message: `¡Confirmación recibida! Gracias, ${nombre.trim()}.`,
    });

  } catch (err) {
    console.error('[POST /api/rsvp]', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
});

/* ─────────────────────────────────────────
   GET /api/rsvp  — listar confirmaciones
   Requiere: Authorization: Bearer <API_KEY>
───────────────────────────────────────── */
router.get('/', (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!process.env.API_KEY || token !== process.env.API_KEY) {
    return res.status(401).json({ success: false, error: 'No autorizado.' });
  }

  try {
    const rows = db.prepare('SELECT * FROM rsvp ORDER BY created_at DESC').all();

    const totals = {
      confirmados:      rows.filter(r => r.asiste === 1).length,
      no_vienen:        rows.filter(r => r.asiste === 0).length,
      total_personas:   rows.filter(r => r.asiste === 1).reduce((sum, r) => sum + 1 + r.acompanantes, 0),
      total_respuestas: rows.length,
    };

    return res.status(200).json({ success: true, totals, data: rows });

  } catch (err) {
    console.error('[GET /api/rsvp]', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
});

module.exports = router;
