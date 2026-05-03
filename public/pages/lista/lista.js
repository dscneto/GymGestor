let todasAulas = [];

async function iniciarLista() {
  todasAulas = await buscarAulas();
  document.getElementById('lista-subtitulo').textContent =
    todasAulas.length + ' aulas registradas';
  renderizarTabela(todasAulas);
  
  document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros);
  document.getElementById('filtro-modalidade').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-professor').addEventListener('change', aplicarFiltros);
  document.getElementById('filtro-unidade').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const busca = document.getElementById('filtro-busca').value.toLowerCase();
  const modalidade = document.getElementById('filtro-modalidade').value;
  const professor = document.getElementById('filtro-professor').value;
  const unidade = document.getElementById('filtro-unidade').value;
  
  const filtradas = todasAulas.filter(function(aula) {
    const bateBusca = aula.nome.toLowerCase().includes(busca) ||
      aula.professor.toLowerCase().includes(busca);
    const bateModalidade = modalidade === '' || aula.modalidade === modalidade;
    const bateProfessor = professor === '' || aula.professor === professor;
    const bateUnidade = unidade === '' || aula.unidade === unidade;
    return bateBusca && bateModalidade && bateProfessor && bateUnidade;
  });
  
  renderizarTabela(filtradas);
}

function renderizarTabela(aulas) {
  const tbody = document.getElementById('tbody-lista');
  
  if (aulas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhuma aula encontrada.</td></tr>';
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
        <td class="td-fraco">${aula.unidade || '—'}</td>
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

function editarAula(aula) {
  window._aulaEditando = aula;
  navegarPara('experimentais');
}

async function deletarAula(id) {
  const confirmar = confirm('Deseja remover esta aula?');
  if (!confirmar) return;
  await fetch('/api/aulas/' + id, { method: 'DELETE' });
  iniciarLista();
}

iniciarLista();