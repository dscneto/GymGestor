let idEditando = null;

async function carregarProfessores(seletorId) {
  const resp = await fetch('/api/professores');
  const professores = await resp.json();
  const select = document.getElementById(seletorId);

  select.innerHTML = '<option value="">Selecione o professor</option>';
  professores.forEach(function(p) {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nome;
    select.appendChild(option);
  });
}

async function iniciarExperimentais() {
  await carregarProfessores('exp-professor');

  // Preenche formulário se vier de edição
  if (window._aulaEditando) {
    const aula = window._aulaEditando;
    idEditando = aula.id;
    document.getElementById('exp-nome').value       = aula.nome;
    document.getElementById('exp-idade').value      = aula.idade;
    document.getElementById('exp-modalidade').value = aula.modalidade;
    document.getElementById('exp-professor').value  = aula.professor_id;
    document.getElementById('exp-data').value       = aula.data;
    document.getElementById('exp-horario').value    = aula.horario;
    document.getElementById('exp-unidade').value    = aula.unidade;
    document.getElementById('exp-titulo').textContent     = 'Editar Aula Experimental';
    document.getElementById('exp-btn-salvar').textContent = 'Salvar Alterações';
    window._aulaEditando = null;
  }

  document.getElementById('form-experimental').addEventListener('submit', async function(evento) {
    evento.preventDefault();

    const aula = {
      nome:         document.getElementById('exp-nome').value,
      idade:        document.getElementById('exp-idade').value,
      modalidade:   document.getElementById('exp-modalidade').value,
      professor_id: document.getElementById('exp-professor').value,
      data:         document.getElementById('exp-data').value,
      horario:      document.getElementById('exp-horario').value,
      unidade:      document.getElementById('exp-unidade').value
    };

    if (idEditando) {
      await fetch('/api/aulas/' + idEditando, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aula)
      });
      alert('Aula atualizada com sucesso!');
      idEditando = null;
    } else {
      await fetch('/api/aulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aula)
      });
      alert('Aula agendada com sucesso!');
    }

    navegarPara('lista');
  });
}

iniciarExperimentais();