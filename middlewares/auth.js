const jwt = require('jsonwebtoken');
const JWT_SECRET = 'clave_secreta_jwt';

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  
  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { verificarToken, JWT_SECRET };