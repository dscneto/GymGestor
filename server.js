const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// Conexão com o banco — usa a variável de ambiente no Railway,
// ou o banco local se estiver rodando na sua máquina
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cria a tabela se não existir
async function iniciarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS aulas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      idade INTEGER NOT NULL,
      modalidade TEXT NOT NULL,
      professor TEXT NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL
    )
  `);
  console.log('Banco de dados pronto!');
}

// ROTA: buscar todas as aulas
app.get('/api/aulas', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM aulas ORDER BY data, horario');
  res.json(resultado.rows);
});

// ROTA: cadastrar nova aula
app.post('/api/aulas', async function(req, res) {
  const { nome, idade, modalidade, professor, data, horario } = req.body;
  const resultado = await pool.query(
    'INSERT INTO aulas (nome, idade, modalidade, professor, data, horario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [nome, idade, modalidade, professor, data, horario]
  );
  res.json({ id: resultado.rows[0].id });
});

// ROTA: atualizar uma aula
app.put('/api/aulas/:id', async function(req, res) {
  const { nome, idade, modalidade, professor, data, horario } = req.body;
  await pool.query(
    'UPDATE aulas SET nome=$1, idade=$2, modalidade=$3, professor=$4, data=$5, horario=$6 WHERE id=$7',
    [nome, idade, modalidade, professor, data, horario, req.params.id]
  );
  res.json({ ok: true });
});

// ROTA: deletar uma aula
app.delete('/api/aulas/:id', async function(req, res) {
  await pool.query('DELETE FROM aulas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Inicia o servidor
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, async function() {
  await iniciarBanco();
  console.log('Servidor rodando na porta ' + PORTA);
});