const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// Conexão com o banco — usa a variável de ambiente no Railway,
// ou o banco local se estiver rodando na sua máquina
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  family: 4
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
app.get('/api/aulas', async function (req, res) {
  const resultado = await pool.query('SELECT * FROM aulas ORDER BY data, horario');
  res.json(resultado.rows);
});

// ROTA: cadastrar nova aula
app.post('/api/aulas', async function (req, res) {
  const { nome, idade, modalidade, professor, data, horario, unidade } = req.body;
  const resultado = await pool.query(
    'INSERT INTO aulas (nome, idade, modalidade, professor, data, horario, unidade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, idade, modalidade, professor, data, horario, unidade]
  );
  res.json({ id: resultado.rows[0].id });
});

// ROTA: atualizar uma aula
app.put('/api/aulas/:id', async function (req, res) {
  const { nome, idade, modalidade, professor, data, horario, unidade } = req.body;
  await pool.query(
    'UPDATE aulas SET nome=$1, idade=$2, modalidade=$3, professor=$4, data=$5, horario=$6, unidade=$7 WHERE id=$8',
    [nome, idade, modalidade, professor, data, horario, unidade, req.params.id]
  );
  res.json({ ok: true });
});

// ROTA: deletar uma aula
app.delete('/api/aulas/:id', async function (req, res) {
  await pool.query('DELETE FROM aulas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// ROTAS — ALUNOS EFETIVOS
// ================================

// Buscar todos os alunos
app.get('/api/alunos', async function (req, res) {
  const resultado = await pool.query('SELECT * FROM alunos ORDER BY nome');
  res.json(resultado.rows);
});

// Buscar um aluno com suas matrículas
app.get('/api/alunos/:id', async function (req, res) {
  const aluno = await pool.query('SELECT * FROM alunos WHERE id = $1', [req.params.id]);
  const matriculas = await pool.query('SELECT * FROM matriculas WHERE aluno_id = $1', [req.params.id]);
  res.json({ ...aluno.rows[0], matriculas: matriculas.rows });
});

// Cadastrar novo aluno
app.post('/api/alunos', async function (req, res) {
  const { nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel } = req.body;
  const resultado = await pool.query(
    'INSERT INTO alunos (nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel]
  );
  res.json({ id: resultado.rows[0].id });
});

// Atualizar aluno
app.put('/api/alunos/:id', async function (req, res) {
  const { nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel } = req.body;
  await pool.query(
    'UPDATE alunos SET nome=$1, data_nascimento=$2, cpf=$3, telefone=$4, unidade=$5, nome_responsavel=$6, contato_responsavel=$7 WHERE id=$8',
    [nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel, req.params.id]
  );
  res.json({ ok: true });
});

// Deletar aluno
app.delete('/api/alunos/:id', async function (req, res) {
  await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// ROTAS — MATRÍCULAS
// ================================

// Adicionar matrícula
app.post('/api/matriculas', async function (req, res) {
  const { aluno_id, modalidade, professor, data_matricula, vencimento } = req.body;
  const resultado = await pool.query(
    'INSERT INTO matriculas (aluno_id, modalidade, professor, data_matricula, vencimento, status_pagamento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [aluno_id, modalidade, professor, data_matricula, vencimento, 'em dia']
  );
  res.json({ id: resultado.rows[0].id });
});

// Atualizar status de pagamento
app.put('/api/matriculas/:id', async function (req, res) {
  const { status_pagamento } = req.body;
  await pool.query(
    'UPDATE matriculas SET status_pagamento=$1 WHERE id=$2',
    [status_pagamento, req.params.id]
  );
  res.json({ ok: true });
});

// Deletar matrícula
app.delete('/api/matriculas/:id', async function (req, res) {
  await pool.query('DELETE FROM matriculas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Buscar horários por unidade e modalidade
app.get('/api/horarios', async function (req, res) {
  const { unidade, modalidade } = req.query;
  const resultado = await pool.query(
    'SELECT * FROM horarios WHERE unidade = $1 AND modalidade = $2 ORDER BY horario',
    [unidade, modalidade]
  );
  res.json(resultado.rows);
});

// Buscar pagamentos por mês e ano
app.get('/api/pagamentos', async function(req, res) {
  const { mes, ano } = req.query;
  const resultado = await pool.query(`
    SELECT p.*, m.vencimento, m.valor_mensalidade, m.modalidade, m.professor,
           a.nome, a.unidade
    FROM pagamentos p
    JOIN matriculas m ON p.matricula_id = m.id
    JOIN alunos a ON m.aluno_id = a.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY m.vencimento, a.nome
  `, [mes, ano]);
  res.json(resultado.rows);
});

// Buscar vencimentos do mês (cria pagamentos se não existirem)
app.post('/api/pagamentos/gerar', async function(req, res) {
  const { mes, ano } = req.body;

  // Busca todas as matrículas ativas
  const matriculas = await pool.query('SELECT * FROM matriculas');

  for (const m of matriculas.rows) {
    await pool.query(`
      INSERT INTO pagamentos (matricula_id, mes, ano, status)
      VALUES ($1, $2, $3, 'pendente')
      ON CONFLICT (matricula_id, mes, ano) DO NOTHING
    `, [m.id, mes, ano]);
  }

  // Retorna os pagamentos do mês
  const resultado = await pool.query(`
    SELECT p.*, m.vencimento, m.valor_mensalidade, m.modalidade, m.professor,
           a.nome, a.unidade
    FROM pagamentos p
    JOIN matriculas m ON p.matricula_id = m.id
    JOIN alunos a ON m.aluno_id = a.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY m.vencimento, a.nome
  `, [mes, ano]);

  res.json(resultado.rows);
});

// Atualizar status do pagamento
app.put('/api/pagamentos/:id', async function(req, res) {
  const { status, data_pagamento } = req.body;
  await pool.query(
    'UPDATE pagamentos SET status=$1, data_pagamento=$2 WHERE id=$3',
    [status, data_pagamento, req.params.id]
  );
  res.json({ ok: true });
});

// Inicia o servidor
const PORTA = process.env.PORT || 3000;
app.listen(PORTA, async function () {
  await iniciarBanco();
  console.log('Servidor rodando na porta ' + PORTA);
});