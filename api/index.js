// Vercel Serverless Function para o backend
const path = require('path');

// Importar o app do servidor
const serverPath = path.join(__dirname, '..', 'server', 'dist', 'index.js');

try {
  const app = require(serverPath);
  module.exports = app;
} catch (error) {
  console.error('Erro ao carregar servidor:', error);
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message 
    });
  };
}
