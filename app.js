const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const recursosRoutes = require('./routes/recursos');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear tablas automáticamente
async function crearTablas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recursos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        is_public BOOLEAN DEFAULT false,
        version INT DEFAULT 1,
        user_id INT REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.log('Error creando tablas:', error.message);
  }
}

// Middlewares
app.use(express.json());

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones'
});

app.use(limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/recursos', recursosRoutes);

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('API JWT - PostgreSQL funcionando en Render!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
  crearTablas(); // Crear tablas al iniciar
});