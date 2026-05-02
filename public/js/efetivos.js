let todosEfetivos = [];

async function carregarEfetivos() {
  const resposta = await fetch('/api/alunos');
  todosEfetivos = await resposta.json();
  document.getElementById('efetivos-subtitulo').textContent =
    todosEfetivos.length + ' alunos cadastrados';
  renderizarEfetivos(todosEfetivos);
  ativarFiltrosEfetivos();
}

function ativarFiltrosEfetivos() {
  document.getElementById('efetivos-busca').addEventListener('input', aplicarFiltrosEfetivos);
  document.getElementById('efetivos-unidade').addEventListener('change', aplicarFiltrosEfetivos);
  document.getElementById('efetivos-modalidade').addEventListener('change', aplicarFiltrosEfetivos);
}

function aplicarFiltrosEfetivos() {
  const busca     = document.getElementById('efetivos-busca').value.toLowerCase();
  const unidade   = document.getElementById('efetivos-unidade').value;
  const modalidade = document.getElementById('efetivos-modalidade').value;

  const filtrados = todosEfetivos.filter(function(aluno) {
    const bateBusca   = aluno.nome.toLowerCase().includes(busca);
    const bateUnidade = unidade === '' || aluno.unidade === unidade;
    return bateBusca && bateUnidade;
  });

  renderizarEfetivos(filtrados);
}

async function renderizarEfetivos(alunos) {
  const tbody = document.getElementById('tbody-efetivos');

  if (alunos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color: var(--cor-texto-fraco);">Nenhum aluno cadastrado.</td></tr>';
    return;
  }

  // Busca matrículas de cada aluno
  const linhas = await Promise.all(alunos.map(async function(aluno) {
    const resp = await fetch('/api/alunos/' + aluno.id);
    const dados = await resp.json();
    const matriculas = dados.matriculas || [];

    const badges = matriculas.map(function(m) {
      return `<span class="modalidade-badge ${classeModalidade(m.modalidade)}">${m.modalidade}</span>`;
    }).join(' ');

    return `
      <tr>
        <td class="td-nome">${aluno.nome}</td>
        <td class="td-fraco">${aluno.cpf}</td>
        <td class="td-fraco">${aluno.telefone || '—'}</td>
        <td class="td-fraco">${aluno.unidade}</td>
        <td>${badges || '—'}</td>
        <td class="td-fraco">${aluno.nome_responsavel || '—'}</td>
        <td>
          <button class="btn-acao" onclick="deletarEfetivo(${aluno.id})">✕</button>
        </td>
      </tr>
    `;
  }));

  tbody.innerHTML = linhas.join('');
}

async function deletarEfetivo(id) {
  const confirmar = confirm('Deseja remover este aluno?');
  if (!confirmar) return;
  await fetch('/api/alunos/' + id, { method: 'DELETE' });
  carregarEfetivos();
}

function abrirFormEfetivo() {
  document.getElementById('modal-efetivo').style.display = 'block';
}

function fecharFormEfetivo() {
  document.getElementById('modal-efetivo').style.display = 'none';
  document.getElementById('form-efetivo').reset();
}

document.getElementById('form-efetivo').addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const aluno = {
    nome:               document.getElementById('ef-nome').value,
    data_nascimento:    document.getElementById('ef-nascimento').value,
    cpf:                document.getElementById('ef-cpf').value,
    telefone:           document.getElementById('ef-telefone').value,
    unidade:            document.getElementById('ef-unidade').value,
    nome_responsavel:   document.getElementById('ef-resp-nome').value,
    contato_responsavel: document.getElementById('ef-resp-contato').value
  };

  const resAluno = await fetch('/api/alunos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aluno)
  });

  const { id } = await resAluno.json();

  const matricula = {
    aluno_id:       id,
    modalidade:     document.getElementById('ef-modalidade').value,
    professor:      document.getElementById('ef-professor').value,
    data_matricula: document.getElementById('ef-data-matricula').value,
    vencimento:     document.getElementById('ef-vencimento').value
  };

  await fetch('/api/matriculas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matricula)
  });

  fecharFormEfetivo();
  alert('Aluno cadastrado com sucesso!');
  carregarEfetivos();
});