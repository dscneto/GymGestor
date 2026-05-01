let todasAulas = [];

async function carregarLista() {
  todasAulas = await buscarAulas();
  atualizarSubtitulo();
  renderizarTabela(todasAulas);
  ativarFiltros();
}

function atualizarSubtitulo() {
  document.getElementById('lista-subtitulo').textContent =
    todasAulas.length + ' aulas registradas';
}

function ativarFiltros() {
  const inputBusca      = document.getElementById('filtro-busca');
  const selectModalidade = document.getElementById('filtro-modalidade');
  const selectProfessor  = document.getElementById('filtro-professor');

  inputBusca.addEventListener('input', aplicarFiltros);
  selectModalidade.addEventListener('change', aplicarFiltros);
  selectProfessor.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const busca       = document.getElementById('filtro-busca').value.toLowerCase();
  const modalidade  = document.getElementById('filtro-modalidade').value;
  const professor   = document.getElementById('filtro-professor').value;

  const filtradas = todasAulas.filter(function(aula) {
    const bateBusca = aula.nome.toLowerCase().includes(busca) ||
                      aula.professor.toLowerCase().includes(busca);
    const bateModalidade = modalidade === '' || aula.modalidade === modalidade;
    const bateProfessor  = professor === ''  || aula.professor === professor;

    return bateBusca && bateModalidade && bateProfessor;
  });

  renderizarTabela(filtradas);
}

function renderizarTabela(aulas) {
  const tbody = document.getElementById('tbody-alunos');

  if (aulas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 1.5rem; color: var(--cor-texto-fraco);">Nenhuma aula encontrada.</td></tr>';
    return;
  }

  tbody.innerHTML = aulas.map(function(aula) {
    const classe = classeModalidade(aula.modalidade);
    const dataFormatada = new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR');

    return `
      <tr>
        <td class="td-nome">${aula.nome}</td>
        <td class="td-fraco">${aula.idade}</td>
        <td><span class="modalidade-badge ${classe}">${aula.modalidade}</span></td>
        <td class="td-fraco">${aula.professor}</td>
        <td class="td-fraco">${aula.unidade || 'Candeias'}</td>
        <td class="td-fraco">${dataFormatada}</td>
        <td class="td-fraco">${aula.horario}</td>
        <td>
          <button class="btn-acao" onclick='editarAula(${JSON.stringify(aula)})'>✎</button>
          <button class="btn-acao" onclick="deletarAula(${aula.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deletarAula(id) {
  const confirmar = confirm('Deseja remover esta aula?');
  if (!confirmar) return;
  await fetch('/api/aulas/' + id, { method: 'DELETE' });
  carregarLista();
}