async function carregarLista() {
  const aulas = await buscarAulas();
  renderizarTabela(aulas);
}

function renderizarTabela(aulas) {
  const tbody = document.getElementById('tbody-alunos');

  if (aulas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color: var(--cor-texto-fraco);">Nenhuma aula cadastrada.</td></tr>';
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
        <td class="td-fraco">${dataFormatada}</td>
        <td class="td-fraco">${aula.horario}</td>
        <td>
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