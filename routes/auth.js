const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET } = require('../middlewares/auth');
const router = express.Router();

// Sanitizar texto (XSS básico)
function sanitizar(texto) {
  return texto
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Sanitizar datos
    const usernameSafe = sanitizar(username);
    const emailSafe = sanitizar(email);
    
    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    
    // Guardar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [usernameSafe, emailSafe, hashPassword]
    );
    
    res.status(201).json({
      mensaje: 'Usuario registrado',
      usuario: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const usuario = result.rows[0];
    
    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;