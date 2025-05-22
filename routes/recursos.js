const express = require('express');
const pool = require('../db');
const { verificarToken } = require('../middlewares/auth');
const router = express.Router();

// Sanitizar texto (XSS básico)
function sanitizar(texto) {
  if (typeof texto !== 'string') return texto;
  return texto.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// API v1 - Obtener recursos públicos (público)
router.get('/v1/publicos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recursos WHERE is_public = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener recursos' });
  }
});

// API v1 - Crear recurso (privado)
router.post('/v1/recursos', verificarToken, async (req, res) => {
  try {
    const { title, content, is_public } = req.body;
    
    const result = await pool.query(
      'INSERT INTO recursos (title, content, is_public, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [sanitizar(title), sanitizar(content), is_public, req.usuario.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear recurso' });
  }
});

// API v2 - Obtener recursos con más información (público)
router.get('/v2/publicos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT r.*, u.username FROM recursos r JOIN usuarios u ON r.user_id = u.id WHERE r.is_public = true'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener recursos' });
  }
});

module.exports = router;