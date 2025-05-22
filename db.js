const { Pool } = require('pg');

// Configuración para Railway PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://postgres:YourPassword@junction.proxy.rlwy.net:12345/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;