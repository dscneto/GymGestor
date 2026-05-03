let todosMatriculados = [];
let idMatriculaEditando = null;

// Define qual view mostrar
const hash = window.location.hash;
if (hash === '#matriculados') {
  document.getElementById('view-form').style.display = 'none';
  document.getElementById('view-lista').style.display = 'block';
  iniciarMatriculados();
} else {
  document.getElementById('view-form').style.display = 'block';
  document.getElementById('view-lista').style.display = 'none';
  
  // Preenche formulário se vier de edição
  if (window._matriculaEditando) {
    const aluno = window._matriculaEditando;
    idMatriculaEditando = aluno.id;
    document.getElementById('mat-nome').value = aluno.nome;
    document.getElementById('mat-nascimento').value = aluno.data_nascimento;
    document.getElementById('mat-cpf').value = aluno.cpf;
    document.getElementById('mat-telefone').value = aluno.telefone || '';
    document.getElementById('mat-unidade').value = aluno.unidade;
    document.getElementById('mat-resp-nome').value = aluno.nome_responsavel || '';
    document.getElementById('mat-resp-contato').value = aluno.contato_responsavel || '';
    document.getElementById('mat-titulo').textContent = 'Editar Matrícula';
    document.getElementById('mat-btn-salvar').textContent = 'Salvar Alterações';
    window._matriculaEditando = null;
  }
}

// ================================
// FORMULÁRIO
// ================================

async function atualizarHorarios() {
  const unidade = document.getElementById('mat-unidade').value;
  const modalidade = document.getElementById('mat-modalidade').value;
  const container = document.getElementById('container-horarios');
  
  if (!unidade || !modalidade) {
    container.innerHTML = '';
    return;
  }
  
  const resp = await fetch('/api/horarios?unidade=' + unidade + '&modalidade=' + modalidade);
  const horarios = await resp.json();
  
  if (horarios.length === 0) {
    container.innerHTML = '<div style="color:var(--cor-texto-fraco); font-size:13px;">Nenhum horário disponível.</div>';
    return;
  }
  
  container.innerHTML = horarios.map(function(h) {
    const dias = h.dias.split(',');
    const turma = h.turma ? ' — ' + h.turma : '';
    
    const checkboxes = dias.map(function(dia) {
      return `
        <label>
          <input type="checkbox" name="dia_${h.id}" value="${dia}"> ${dia}
        </label>
      `;
    }).join('');
    
    return `
      <div class="horario-opcao">
        <div class="horario-titulo">${h.horario}h${turma}</div>
        <div class="horario-dias-label">Dias que irá treinar:</div>
        <div class="horario-checkboxes">${checkboxes}</div>
        <div class="form-group">
          <label class="form-label">Valor da mensalidade (R$)</label>
          <input class="form-input" type="number" step="0.01" name="valor_${h.id}" placeholder="Ex: 150.00">
        </div>
        <input type="hidden" name="horario_id_${h.id}" value="${h.id}">
      </div>
    `;
  }).join('');
}

document.getElementById('form-matricula').addEventListener('submit', async function(evento) {
  evento.preventDefault();
  
  const aluno = {
    nome: document.getElementById('mat-nome').value,
    data_nascimento: document.getElementById('mat-nascimento').value,
    cpf: document.getElementById('mat-cpf').value,
    telefone: document.getElementById('mat-telefone').value,
    unidade: document.getElementById('mat-unidade').value,
    nome_responsavel: document.getElementById('mat-resp-nome').value,
    contato_responsavel: document.getElementById('mat-resp-contato').value
  };
  
  if (idMatriculaEditando) {
    await fetch('/api/alunos/' + idMatriculaEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno)
    });
    alert('Aluno atualizado com sucesso!');
    idMatriculaEditando = null;
    
  } else {
    const res = await fetch('/api/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno)
    });
    
    const { id } = await res.json();
    const modalidade = document.getElementById('mat-modalidade').value;
    const dataMatricula = document.getElementById('mat-data').value;
    const vencimento = document.getElementById('mat-vencimento').value;
    const container = document.getElementById('container-horarios');
    const opcoes = container.querySelectorAll('.horario-opcao');
    
    for (const opcao of opcoes) {
      const horarioId = opcao.querySelector('[name^="horario_id_"]').value;
      const checkboxes = opcao.querySelectorAll('input[type="checkbox"]:checked');
      const valorInput = opcao.querySelector('[name^="valor_"]');
      const valor = valorInput ? valorInput.value : null;
      
      if (checkboxes.length === 0) continue;
      
      const diasEscolhidos = Array.from(checkboxes).map(function(cb) {
        return cb.value;
      }).join(',');
      
      await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: id,
          modalidade: modalidade,
          professor: document.getElementById('mat-professor').value,
          data_matricula: dataMatricula,
          vencimento: vencimento,
          horario_id: horarioId,
          dias_escolhidos: diasEscolhidos,
          valor_mensalidade: valor
        })
      });
    }
    
    alert('Aluno matriculado com sucesso!');
  }
  
  navegarPara('matriculados');
});

// ================================
// LISTA DE MATRICULADOS
// ================================

async function iniciarMatriculados() {
  const resposta = await fetch('/api/alunos');
  todosMatriculados = await resposta.json();
  document.getElementById('mat-subtitulo').textContent =
    todosMatriculados.length + ' alunos cadastrados';
  renderizarMatriculados(todosMatriculados);
  
  document.getElementById('mat-busca').addEventListener('input', aplicarFiltrosMatriculados);
  document.getElementById('mat-filtro-unidade').addEventListener('change', aplicarFiltrosMatriculados);
  document.getElementById('mat-filtro-modalidade').addEventListener('change', aplicarFiltrosMatriculados);
}

function aplicarFiltrosMatriculados() {
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