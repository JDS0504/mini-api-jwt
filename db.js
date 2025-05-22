const { Pool } = require('pg');

// Configuración para Render PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://javier:cQyUx7nZd14AiS5iKJUBSb6vEOysODmg@dpg-d0nr9ak9c44c739sa5d0-a.oregon-postgres.render.com/mini_api',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;