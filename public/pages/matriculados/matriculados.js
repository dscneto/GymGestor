let todosMatriculados = [];

async function iniciarMatriculados() {
  const resp = await fetch('/api/alunos');
  todosMatriculados = await resp.json();
  
  document.getElementById('mat-subtitulo').textContent =
    todosMatriculados.length + ' alunos cadastrados';
  
  renderizarMatriculados(todosMatriculados);
  
  document.getElementById('mat-busca').addEventListener('input', aplicarFiltros);
  document.getElementById('mat-filtro-unidade').addEventListener('change', aplicarFiltros);
  document.getElementById('mat-filtro-modalidade').addEventListener('change', aplicarFiltros);
  document.getElementById('mat-filtro-status').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const busca = document.getElementById('mat-busca').value.toLowerCase();
  const unidade = document.getElementById('mat-filtro-unidade').value;
  const modalidade = document.getElementById('mat-filtro-modalidade').value;
  const status = document.getElementById('mat-filtro-status').value;
  
  const filtrados = todosMatriculados.filter(function(a) {
    const bateBusca = a.nome.toLowerCase().includes(busca);
    const bateUnidade = unidade === '' || a.unidade === unidade;
    const bateModalidade = modalidade === '' || a.modalidade === modalidade;
    const bateStatus = status === '' || a.status === status;
    return bateBusca && bateUnidade && bateModalidade && bateStatus;
  });
  
  renderizarMatriculados(filtrados);
}

function renderizarMatriculados(alunos) {
  const tbody = document.getElementById('tbody-matriculados');
  
  if (alunos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhum aluno encontrado.</td></tr>';
    return;
  }
  
  tbody.innerHTML = alunos.map(function(a) {
    const classe = classeModalidade(a.modalidade || '');
    const valor = a.valor_mensalidade ?
      'R$ ' + parseFloat(a.valor_mensalidade).toFixed(2) :
      '—';
    
    const statusClasse = a.status === 'ativo' ? 'status-ativo' : 'status-inativo';
    const statusLabel = a.status === 'ativo' ? 'Ativo' : 'Inativo';
    
    return `
      <tr>
        <td class="td-nome">${a.nome}</td>
        <td class="td-fraco">${a.telefone || '—'}</td>
        <td><span class="modalidade-badge ${classe}">${a.modalidade || '—'}</span></td>
        <td class="td-fraco">${a.nome_professor || '—'}</td>
        <td class="td-fraco">${a.unidade}</td>
        <td class="td-fraco">${a.vencimento ? 'Dia ' + a.vencimento : '—'}</td>
        <td class="td-fraco">${valor}</td>
        <td><span class="status-badge ${statusClasse}">${statusLabel}</span></td>
        <td>
          <button class="btn-acao" onclick='editarMatriculado(${JSON.stringify(a)})'>✎</button>
          <button class="btn-acao" onclick="deletarMatriculado(${a.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function editarMatriculado(aluno) {
  window._matriculaEditando = aluno;
  navegarPara('matriculas');
}

async function deletarMatriculado(id) {
  const confirmar = confirm('Deseja remover este aluno?');
  if (!confirmar) return;
  await fetch('/api/alunos/' + id, { method: 'DELETE' });
  iniciarMatriculados();
}

iniciarMatriculados();