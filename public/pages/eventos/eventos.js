let todosEventos = [];
let idEventoEditando = null;

async function iniciarEventos() {
  const resp = await fetch('/api/eventos');
  todosEventos = await resp.json();
  document.getElementById('eventos-subtitulo').textContent =
    todosEventos.length + ' eventos cadastrados';
  renderizarEventos(todosEventos);
}

function renderizarEventos(eventos) {
  const tbody = document.getElementById('tbody-eventos');

  if (eventos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhum evento cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = eventos.map(function(e) {
    const dataFormatada = new Date(e.data + 'T00:00:00').toLocaleDateString('pt-BR');
    const unidade = e.unidade
      ? `<span class="unidade-badge">${e.unidade}</span>`
      : '<span class="unidade-badge">Todas</span>';

    return `
      <tr>
        <td class="td-nome">${e.titulo}</td>
        <td class="td-fraco">${dataFormatada}</td>
        <td>${unidade}</td>
        <td class="td-desc">${e.descricao || '—'}</td>
        <td>
          <button class="btn-acao" onclick='editarEvento(${JSON.stringify(e)})'>✎</button>
          <button class="btn-acao" onclick="deletarEvento(${e.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirFormEvento() {
  idEventoEditando = null;
  document.getElementById('form-evento').reset();
  document.getElementById('evento-form-titulo').textContent = '● Novo Evento';
  document.getElementById('evento-btn-salvar').textContent  = 'Cadastrar Evento';
  document.getElementById('modal-evento').style.display = 'block';
  document.getElementById('modal-evento').scrollIntoView({ behavior: 'smooth' });
}

function fecharFormEvento() {
  document.getElementById('modal-evento').style.display = 'none';
  document.getElementById('form-evento').reset();
  idEventoEditando = null;
}

function editarEvento(evento) {
  idEventoEditando = evento.id;
  document.getElementById('evento-titulo').value    = evento.titulo;
  document.getElementById('evento-data').value      = evento.data;
  document.getElementById('evento-unidade').value   = evento.unidade || '';
  document.getElementById('evento-descricao').value = evento.descricao || '';
  document.getElementById('evento-form-titulo').textContent = '● Editar Evento';
  document.getElementById('evento-btn-salvar').textContent  = 'Salvar Alterações';
  document.getElementById('modal-evento').style.display = 'block';
  document.getElementById('modal-evento').scrollIntoView({ behavior: 'smooth' });
}

async function deletarEvento(id) {
  const confirmar = confirm('Deseja remover este evento?');
  if (!confirmar) return;
  await fetch('/api/eventos/' + id, { method: 'DELETE' });
  iniciarEventos();
}

document.getElementById('form-evento').addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const dados = {
    titulo:    document.getElementById('evento-titulo').value,
    data:      document.getElementById('evento-data').value,
    unidade:   document.getElementById('evento-unidade').value,
    descricao: document.getElementById('evento-descricao').value
  };

  if (idEventoEditando) {
    await fetch('/api/eventos/' + idEventoEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    alert('Evento atualizado com sucesso!');
  } else {
    await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    alert('Evento cadastrado com sucesso!');
  }

  fecharFormEvento();
  iniciarEventos();
});

iniciarEventos();
