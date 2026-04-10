require('dotenv').config();

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

const rsvpRouter = require('./routes/rsvp');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Seguridad ──
app.use(helmet());

// ── CORS ──
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost';
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, mismo servidor)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin) return callback(null, true);
    callback(new Error(`CORS: origen no permitido → ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──
app.use(express.json());

// ── Rutas ──
app.use('/api/rsvp', rsvpRouter);

// ── 404 catch-all ──
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada.' });
});

// ── Error handler global ──
app.use((err, _req, res, _next) => {
  console.error('[Error global]', err.message);
  res.status(500).json({ success: false, error: 'Error interno del servidor.' });
});

// ── Arranque ──
app.listen(PORT, () => {
  console.log(`🎉 Backend boda J&S corriendo en puerto ${PORT}`);
});
