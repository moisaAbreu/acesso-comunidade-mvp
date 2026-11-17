const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve a pasta com o HTML/JS

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// RF01: Rota de Inscrição (Gera Token para QR Code)
app.post('/api/inscrever', async (req, res) => {
  const { nome, telefone, restricao } = req.body;
  const token = 'TOKEN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const nomeLimpo = nome ? nome.trim() : '';
const telefoneLimpo = telefone ? telefone.trim() : '';

if (!nomeLimpo || !telefoneLimpo) {
  return res.status(400).json({ erro: 'Nome e telefone são obrigatórios.' });
}

  try {
    const result = await pool.query(
      'INSERT INTO inscricoes (nome, telefone, restricao_alimentar, qr_code_token) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, telefone, restricao || 'Nenhuma', token]
    );
    res.json({ sucesso: true, dados: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: 'Erro ao cadastrar inscrição.' });
  }
});

// RF03: Rota de Check-in da Portaria (Validar QR Code)
app.post('/api/checkin', async (req, res) => {
  const { token } = req.body;

  try {
    const busca = await pool.query('SELECT * FROM inscricoes WHERE qr_code_token = $1', [token]);

    if (busca.rows.length === 0) {
      return res.status(404).json({ valido: false, mensagem: 'CREDENCIAL INVÁLIDA' });
    }

    const participante = busca.rows[0];

    if (participante.status_entrada) {
      return res.status(400).json({ 
        valido: false, 
        mensagem: 'CREDENCIAL JÁ UTILIZADA',
        nome: participante.nome 
      });
    }

    await pool.query('UPDATE inscricoes SET status_entrada = TRUE WHERE id = $1', [participante.id]);

    return res.json({
      valido: true,
      mensagem: 'ENTRADA LIBERADA',
      nome: participante.nome,
      restricao: participante.restricao_alimentar
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ valido: false, mensagem: 'ERRO NO SERVIDOR' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));