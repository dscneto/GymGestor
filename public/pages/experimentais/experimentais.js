let idEditando = null;

const form = document.getElementById('form-experimental');

form.addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const aula = {
    nome:       document.getElementById('exp-nome').value,
    idade:      document.getElementById('exp-idade').value,
    modalidade: document.getElementById('exp-modalidade').value,
    professor:  document.getElementById('exp-professor').value,
    data:       document.getElementById('exp-data').value,
    horario:    document.getElementById('exp-horario').value,
    unidade:    document.getElementById('exp-unidade').value
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

  form.reset();
  navegarPara('lista');
});

// Preenche o formulário se vier de uma edição
if (window._aulaEditando) {
  const aula = window._aulaEditando;
  idEditando = aula.id;
  document.getElementById('exp-nome').value       = aula.nome;
  document.getElementById('exp-idade').value      = aula.idade;
  document.getElementById('exp-modalidade').value = aula.modalidade;
  document.getElementById('exp-professor').value  = aula.professor;
  document.getElementById('exp-data').value       = aula.data;
  document.getElementById('exp-horario').value    = aula.horario;
  document.getElementById('exp-unidade').value    = aula.unidade;
  document.getElementById('exp-titulo').textContent     = 'Editar Aula Experimental';
  document.getElementById('exp-btn-salvar').textContent = 'Salvar Alterações';
  window._aulaEditando = null;
}