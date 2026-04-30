const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('database.db');

// Permite receber JSON nas requisições
app.use(express.json());

// Serve os arquivos da pasta public (html, css, js)
app.use(express.static(path.join(__dirname, 'public')));

// Cria a tabela no banco se ainda não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS aulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    idade INTEGER NOT NULL,
    modalidade TEXT NOT NULL,
    professor TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL
  )
`);

// ROTA: buscar todas as aulas
app.get('/api/aulas', function(req, res) {
  const aulas = db.prepare('SELECT * FROM aulas ORDER BY data, horario').all();
  res.json(aulas);
});

// ROTA: cadastrar nova aula
app.post('/api/aulas', function(req, res) {
  const { nome, idade, modalidade, professor, data, horario } = req.body;
  const resultado = db.prepare(`
    INSERT INTO aulas (nome, idade, modalidade, professor, data, horario)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome, idade, modalidade, professor, data, horario);
  res.json({ id: resultado.lastInsertRowid });
});

// ROTA: deletar uma aula
app.delete('/api/aulas/:id', function(req, res) {
  db.prepare('DELETE FROM aulas WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Inicia o servidor na porta 3000
app.listen(3000, function() {
  console.log('Servidor rodando em http://localhost:3000');
});