let todosEspera = [];
let idEsperaEditando = null;

async function iniciarEspera() {
  const resp = await fetch('/api/espera');
  todosEspera = await resp.json();
  document.getElementById('espera-subtitulo').textContent =
    todosEspera.length + ' alunos aguardando';
  renderizarEspera(todosEspera);

  document.getElementById('espera-busca').addEventListener('input', aplicarFiltros);
  document.getElementById('espera-filtro-modalidade').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const busca      = document.getElementById('espera-busca').value.toLowerCase();
  const modalidade = document.getElementById('espera-filtro-modalidade').value;

  const filtrados = todosEspera.filter(function(a) {
    const bateBusca      = a.nome.toLowerCase().includes(busca);
    const bateModalidade = modalidade === '' || a.modalidade === modalidade;
    return bateBusca && bateModalidade;
  });

  renderizarEspera(filtrados);
}

function renderizarEspera(lista) {
  const tbody = document.getElementById('tbody-espera');

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhum aluno na lista de espera.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(function(a) {
    const classe = classeModalidade(a.modalidade);
    const data   = new Date(a.data_cadastro + 'T00:00:00').toLocaleDateString('pt-BR');

    return `
      <tr>
        <td class="td-nome">${a.nome}</td>
        <td class="td-fraco">${a.idade || '—'}</td>
        <td><span class="modalidade-badge ${classe}">${a.modalidade}</span></td>
        <td class="td-fraco">${a.turma || '—'}</td>
        <td class="td-fraco">${a.nome_responsavel || '—'}</td>
        <td class="td-fraco">${a.contato}</td>
        <td class="td-fraco">${data}</td>
        <td>
          <button class="btn-acao" onclick='editarEspera(${JSON.stringify(a)})'>✎</button>
          <button class="btn-acao" onclick="deletarEspera(${a.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirFormEspera() {
  idEsperaEditando = null;
  document.getElementById('form-espera').reset();
  document.getElementById('espera-form-titulo').textContent = '● Adicionar à Lista de Espera';
  document.getElementById('espera-btn-salvar').textContent  = 'Adicionar à Lista';
  document.getElementById('modal-espera').style.display = 'block';
  document.getElementById('modal-espera').scrollIntoView({ behavior: 'smooth' });
}

function fecharFormEspera() {
  document.getElementById('modal-espera').style.display = 'none';
  document.getElementById('form-espera').reset();
  idEsperaEditando = null;
}

function editarEspera(aluno) {
  idEsperaEditando = aluno.id;
  document.getElementById('espera-nome').value        = aluno.nome;
  document.getElementById('espera-idade').value       = aluno.idade || '';
  document.getElementById('espera-responsavel').value = aluno.nome_responsavel || '';
  document.getElementById('espera-contato').value     = aluno.contato;
  document.getElementById('espera-modalidade').value  = aluno.modalidade;
  document.getElementById('espera-turma').value       = aluno.turma || '';
  document.getElementById('espera-observacao').value  = aluno.observacao || '';
  document.getElementById('espera-form-titulo').textContent = '● Editar Registro';
  document.getElementById('espera-btn-salvar').textContent  = 'Salvar Alterações';
  document.getElementById('modal-espera').style.display = 'block';
  document.getElementById('modal-espera').scrollIntoView({ behavior: 'smooth' });
}

async function deletarEspera(id) {
  const confirmar = confirm('Deseja remover este aluno da lista de espera?');
  if (!confirmar) return;
  await fetch('/api/espera/' + id, { method: 'DELETE' });
  iniciarEspera();
}

document.getElementById('form-espera').addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const dados = {
    nome:             document.getElementById('espera-nome').value,
    idade:            document.getElementById('espera-idade').value || null,
    nome_responsavel: document.getElementById('espera-responsavel').value,
    contato:          document.getElementById('espera-contato').value,
    modalidade:       document.getElementById('espera-modalidade').value,
    turma:            document.getElementById('espera-turma').value,
    observacao:       document.getElementById('espera-observacao').value
  };

  if (idEsperaEditando) {
    await fetch('/api/espera/' + idEsperaEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    alert('Registro atualizado com sucesso!');
  } else {
    await fetch('/api/espera', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    alert('Aluno adicionado à lista de espera!');
  }

  fecharFormEspera();
  iniciarEspera();
});

iniciarEspera();