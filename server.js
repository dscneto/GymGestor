const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  family: 4
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================================
// BANCO DE DADOS
// ================================

async function iniciarBanco() {
  console.log('Banco de dados pronto!');
}

// ================================
// PROFESSORES
// ================================

app.get('/api/professores', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM professores ORDER BY nome');
  res.json(resultado.rows);
});

app.post('/api/professores', async function(req, res) {
  const { nome, telefone, data_nascimento, unidades, modalidades } = req.body;
  const resultado = await pool.query(
    'INSERT INTO professores (nome, telefone, data_nascimento, unidades, modalidades) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [nome, telefone, data_nascimento, unidades, modalidades]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/professores/:id', async function(req, res) {
  const { nome, telefone, data_nascimento, unidades, modalidades } = req.body;
  await pool.query(
    'UPDATE professores SET nome=$1, telefone=$2, data_nascimento=$3, unidades=$4, modalidades=$5 WHERE id=$6',
    [nome, telefone, data_nascimento, unidades, modalidades, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/professores/:id', async function(req, res) {
  await pool.query('DELETE FROM professores WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// AULAS EXPERIMENTAIS
// ================================

app.get('/api/aulas', async function(req, res) {
  const resultado = await pool.query(`
    SELECT a.*, p.nome AS nome_professor
    FROM aulas a
    LEFT JOIN professores p ON a.professor_id = p.id
    ORDER BY a.data, a.horario
  `);
  res.json(resultado.rows);
});

app.post('/api/aulas', async function(req, res) {
  const { nome, idade, modalidade, professor_id, data, horario, unidade } = req.body;
  const resultado = await pool.query(
    'INSERT INTO aulas (nome, idade, modalidade, professor_id, data, horario, unidade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, idade, modalidade, professor_id, data, horario, unidade]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/aulas/:id', async function(req, res) {
  const { nome, idade, modalidade, professor_id, data, horario, unidade } = req.body;
  await pool.query(
    'UPDATE aulas SET nome=$1, idade=$2, modalidade=$3, professor_id=$4, data=$5, horario=$6, unidade=$7 WHERE id=$8',
    [nome, idade, modalidade, professor_id, data, horario, unidade, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/aulas/:id', async function(req, res) {
  await pool.query('DELETE FROM aulas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// HORÁRIOS
// ================================

app.get('/api/horarios', async function(req, res) {
  const { unidade, modalidade } = req.query;
  const resultado = await pool.query(
    'SELECT * FROM horarios WHERE unidade = $1 AND modalidade = $2 ORDER BY horario',
    [unidade, modalidade]
  );
  res.json(resultado.rows);
});

// ================================
// ALUNOS
// ================================

app.get('/api/alunos', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM alunos ORDER BY nome');
  res.json(resultado.rows);
});

app.get('/api/alunos/:id', async function(req, res) {
  const aluno = await pool.query('SELECT * FROM alunos WHERE id = $1', [req.params.id]);
  const matriculas = await pool.query(`
    SELECT m.*, p.nome AS nome_professor
    FROM matriculas m
    LEFT JOIN professores p ON m.professor_id = p.id
    WHERE m.aluno_id = $1
  `, [req.params.id]);
  res.json({ ...aluno.rows[0], matriculas: matriculas.rows });
});

app.post('/api/alunos', async function(req, res) {
  const { nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel } = req.body;
  const resultado = await pool.query(
    'INSERT INTO alunos (nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/alunos/:id', async function(req, res) {
  const { nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel } = req.body;
  await pool.query(
    'UPDATE alunos SET nome=$1, data_nascimento=$2, cpf=$3, telefone=$4, unidade=$5, nome_responsavel=$6, contato_responsavel=$7 WHERE id=$8',
    [nome, data_nascimento, cpf, telefone, unidade, nome_responsavel, contato_responsavel, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/alunos/:id', async function(req, res) {
  await pool.query('DELETE FROM alunos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// MATRÍCULAS
// ================================

app.get('/api/matriculas', async function(req, res) {
  const resultado = await pool.query(`
    SELECT m.*, a.nome, a.unidade, p.nome AS nome_professor
    FROM matriculas m
    JOIN alunos a ON m.aluno_id = a.id
    LEFT JOIN professores p ON m.professor_id = p.id
    ORDER BY a.nome
  `);
  res.json(resultado.rows);
});

app.post('/api/matriculas', async function(req, res) {
  const { aluno_id, professor_id, modalidade, data_matricula, vencimento, valor_mensalidade, horario_id, dias_escolhidos } = req.body;
  const resultado = await pool.query(
    'INSERT INTO matriculas (aluno_id, professor_id, modalidade, data_matricula, vencimento, valor_mensalidade, horario_id, dias_escolhidos, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
    [aluno_id, professor_id, modalidade, data_matricula, vencimento, valor_mensalidade, horario_id, dias_escolhidos, 'ativo']
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/matriculas/:id', async function(req, res) {
  const { professor_id, modalidade, data_matricula, vencimento, valor_mensalidade, horario_id, dias_escolhidos, status } = req.body;
  await pool.query(
    'UPDATE matriculas SET professor_id=$1, modalidade=$2, data_matricula=$3, vencimento=$4, valor_mensalidade=$5, horario_id=$6, dias_escolhidos=$7, status=$8 WHERE id=$9',
    [professor_id, modalidade, data_matricula, vencimento, valor_mensalidade, horario_id, dias_escolhidos, status, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/matriculas/:id', async function(req, res) {
  await pool.query('DELETE FROM matriculas WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// PAGAMENTOS
// ================================

app.get('/api/pagamentos', async function(req, res) {
  const { mes, ano } = req.query;
  const resultado = await pool.query(`
    SELECT p.*, m.vencimento, m.valor_mensalidade, m.modalidade,
           pr.nome AS professor, a.nome, a.unidade
    FROM pagamentos p
    JOIN matriculas m ON p.matricula_id = m.id
    LEFT JOIN professores pr ON m.professor_id = pr.id
    JOIN alunos a ON m.aluno_id = a.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY m.vencimento, a.nome
  `, [mes, ano]);
  res.json(resultado.rows);
});

app.post('/api/pagamentos/gerar', async function(req, res) {
  const { mes, ano } = req.body;
  const matriculas = await pool.query('SELECT * FROM matriculas WHERE status = $1', ['ativo']);

  for (const m of matriculas.rows) {
    await pool.query(`
      INSERT INTO pagamentos (matricula_id, mes, ano, status)
      VALUES ($1, $2, $3, 'pendente')
      ON CONFLICT (matricula_id, mes, ano) DO NOTHING
    `, [m.id, mes, ano]);
  }

  const resultado = await pool.query(`
    SELECT p.*, m.vencimento, m.valor_mensalidade, m.modalidade,
           pr.nome AS professor, a.nome, a.unidade
    FROM pagamentos p
    JOIN matriculas m ON p.matricula_id = m.id
    LEFT JOIN professores pr ON m.professor_id = pr.id
    JOIN alunos a ON m.aluno_id = a.id
    WHERE p.mes = $1 AND p.ano = $2
    ORDER BY m.vencimento, a.nome
  `, [mes, ano]);

  res.json(resultado.rows);
});

app.put('/api/pagamentos/:id', async function(req, res) {
  const { status, data_pagamento } = req.body;
  await pool.query(
    'UPDATE pagamentos SET status=$1, data_pagamento=$2 WHERE id=$3',
    [status, data_pagamento, req.params.id]
  );
  res.json({ ok: true });
});

// ================================
// EVENTOS
// ================================

app.get('/api/eventos', async function(req, res) {
  const resultado = await pool.query('SELECT * FROM eventos ORDER BY data');
  res.json(resultado.rows);
});

app.post('/api/eventos', async function(req, res) {
  const { titulo, data, descricao, unidade } = req.body;
  const resultado = await pool.query(
    'INSERT INTO eventos (titulo, data, descricao, unidade) VALUES ($1, $2, $3, $4) RETURNING id',
    [titulo, data, descricao, unidade]
  );
  res.json({ id: resultado.rows[0].id });
});

app.put('/api/eventos/:id', async function(req, res) {
  const { titulo, data, descricao, unidade } = req.body;
  await pool.query(
    'UPDATE eventos SET titulo=$1, data=$2, descricao=$3, unidade=$4 WHERE id=$5',
    [titulo, data, descricao, unidade, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/eventos/:id', async function(req, res) {
  await pool.query('DELETE FROM eventos WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ================================
// SERVIDOR
// ================================

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, async function() {
  await iniciarBanco();
  console.log('Servidor rodando na porta ' + PORTA);
});