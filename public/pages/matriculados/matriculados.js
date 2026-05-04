let todosMatriculados = [];

async function iniciarMatriculados() {
  const resposta = await fetch('/api/alunos');
  todosMatriculados = await resposta.json();
  document.getElementById('mat-subtitulo').textContent =
    todosMatriculados.length + ' alunos cadastrados';
  renderizarMatriculados(todosMatriculados);
  
  document.getElementById('mat-busca').addEventListener('input', aplicarFiltros);
  document.getElementById('mat-filtro-unidade').addEventListener('change', aplicarFiltros);
  document.getElementById('mat-filtro-modalidade').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const busca = document.getElementById('mat-busca').value.toLowerCase();
  const unidade = document.getElementById('mat-filtro-unidade').value;
  
  const filtrados = todosMatriculados.filter(function(aluno) {
    const bateBusca = aluno.nome.toLowerCase().includes(busca);
    const bateUnidade = unidade === '' || aluno.unidade === unidade;
    return bateBusca && bateUnidade;
  });
  
  renderizarMatriculados(filtrados);
}

function renderizarMatriculados(alunos) {
  const tbody = document.getElementById('tbody-matriculados');
  
  if (alunos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhum aluno cadastrado.</td></tr>';
    return;
  }
  
  tbody.innerHTML = alunos.map(function(aluno) {
    return `
      <tr>
        <td class="td-nome">${aluno.nome}</td>
        <td class="td-fraco">${aluno.cpf}</td>
        <td class="td-fraco">${aluno.telefone || '—'}</td>
        <td class="td-fraco">${aluno.unidade}</td>
        <td class="td-fraco">—</td>
        <td class="td-fraco">${aluno.nome_responsavel || '—'}</td>
        <td>
          <button class="btn-acao" onclick='editarMatriculado(${JSON.stringify(aluno)})'>✎</button>
          <button class="btn-acao" onclick="deletarMatriculado(${aluno.id})">✕</button>
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