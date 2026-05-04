let idMatriculaEditando = null;

// Preenche formulário se vier de edição
if (window._matriculaEditando) {
  const aluno = window._matriculaEditando;
  idMatriculaEditando = aluno.id;
  document.getElementById('mat-nome').value         = aluno.nome;
  document.getElementById('mat-nascimento').value   = aluno.data_nascimento;
  document.getElementById('mat-cpf').value          = aluno.cpf;
  document.getElementById('mat-telefone').value     = aluno.telefone || '';
  document.getElementById('mat-unidade').value      = aluno.unidade;
  document.getElementById('mat-resp-nome').value    = aluno.nome_responsavel || '';
  document.getElementById('mat-resp-contato').value = aluno.contato_responsavel || '';
  document.getElementById('mat-titulo').textContent     = 'Editar Matrícula';
  document.getElementById('mat-btn-salvar').textContent = 'Salvar Alterações';
  window._matriculaEditando = null;
}

async function atualizarHorarios() {
  const unidade    = document.getElementById('mat-unidade').value;
  const modalidade = document.getElementById('mat-modalidade').value;
  const container  = document.getElementById('container-horarios');

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
    const dias  = h.dias.split(',');
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
    nome:                document.getElementById('mat-nome').value,
    data_nascimento:     document.getElementById('mat-nascimento').value,
    cpf:                 document.getElementById('mat-cpf').value,
    telefone:            document.getElementById('mat-telefone').value,
    unidade:             document.getElementById('mat-unidade').value,
    nome_responsavel:    document.getElementById('mat-resp-nome').value,
    contato_responsavel: document.getElementById('mat-resp-contato').value
  };

  try {
    if (idMatriculaEditando) {
      // Atualiza dados pessoais do aluno
      const res = await fetch('/api/alunos/' + idMatriculaEditando, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aluno)
      });
      const dados = await res.json();
      console.log('Resposta edição:', dados);

      // Atualiza matrículas
      const modalidade    = document.getElementById('mat-modalidade').value;
      const dataMatricula = document.getElementById('mat-data').value;
      const vencimento    = document.getElementById('mat-vencimento').value;
      const container     = document.getElementById('container-horarios');
      const opcoes        = container.querySelectorAll('.horario-opcao');

      for (const opcao of opcoes) {
        const horarioId  = opcao.querySelector('[name^="horario_id_"]').value;
        const checkboxes = opcao.querySelectorAll('input[type="checkbox"]:checked');
        const valorInput = opcao.querySelector('[name^="valor_"]');
        const valor      = valorInput ? valorInput.value : null;

        if (checkboxes.length === 0) continue;

        const diasEscolhidos = Array.from(checkboxes).map(function(cb) {
          return cb.value;
        }).join(',');

        await fetch('/api/matriculas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aluno_id:          idMatriculaEditando,
            modalidade:        modalidade,
            professor:         document.getElementById('mat-professor').value,
            data_matricula:    dataMatricula,
            vencimento:        vencimento,
            horario_id:        horarioId,
            dias_escolhidos:   diasEscolhidos,
            valor_mensalidade: valor
          })
        });
      }

      alert('Aluno atualizado com sucesso!');
      idMatriculaEditando = null;

    } else {
      // Cadastra novo aluno
      const res = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aluno)
      });

      const dados = await res.json();
      console.log('Resposta cadastro:', dados);

      if (!dados.id) {
        alert('Erro ao cadastrar: ' + JSON.stringify(dados));
        return;
      }

      const id = dados.id;
      const modalidade    = document.getElementById('mat-modalidade').value;
      const dataMatricula = document.getElementById('mat-data').value;
      const vencimento    = document.getElementById('mat-vencimento').value;
      const container     = document.getElementById('container-horarios');
      const opcoes        = container.querySelectorAll('.horario-opcao');

      for (const opcao of opcoes) {
        const horarioId  = opcao.querySelector('[name^="horario_id_"]').value;
        const checkboxes = opcao.querySelectorAll('input[type="checkbox"]:checked');
        const valorInput = opcao.querySelector('[name^="valor_"]');
        const valor      = valorInput ? valorInput.value : null;

        if (checkboxes.length === 0) continue;

        const diasEscolhidos = Array.from(checkboxes).map(function(cb) {
          return cb.value;
        }).join(',');

        const resMatricula = await fetch('/api/matriculas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aluno_id:          id,
            modalidade:        modalidade,
            professor:         document.getElementById('mat-professor').value,
            data_matricula:    dataMatricula,
            vencimento:        vencimento,
            horario_id:        horarioId,
            dias_escolhidos:   diasEscolhidos,
            valor_mensalidade: valor
          })
        });

        const dadosMatricula = await resMatricula.json();
        console.log('Resposta matrícula:', dadosMatricula);
      }

      alert('Aluno matriculado com sucesso!');
    }

    navegarPara('matriculados');

  } catch (erro) {
    alert('Erro: ' + erro.message);
    console.error('Erro ao salvar:', erro);
  }
});