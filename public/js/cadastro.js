let idEditando = null;

const formulario = document.getElementById('form-cadastro');

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const aula = {
    nome: document.getElementById('campo-nome').value,
    idade: document.getElementById('campo-idade').value,
    modalidade: document.getElementById('campo-modalidade').value,
    professor: document.getElementById('campo-professor').value,
    data: document.getElementById('campo-data').value,
    horario: document.getElementById('campo-horario').value,
    unidade: document.getElementById('campo-unidade').value
  };

  if (idEditando) {
    await fetch('/api/aulas/' + idEditando, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aula)
    });
    idEditando = null;
    document.getElementById('form-titulo').textContent = 'Nova Aula Experimental';
    document.getElementById('btn-salvar').textContent = 'Agendar Aula';
    alert('Aula atualizada com sucesso!');
  } else {
    await fetch('/api/aulas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aula)
    });
    alert('Aula agendada com sucesso!');
  }

  formulario.reset();
  navegarPara('lista');
  carregarLista();
});

function editarAula(aula) {
  document.getElementById('campo-nome').value = aula.nome;
  document.getElementById('campo-idade').value = aula.idade;
  document.getElementById('campo-modalidade').value = aula.modalidade;
  document.getElementById('campo-professor').value = aula.professor;
  document.getElementById('campo-data').value = aula.data;
  document.getElementById('campo-horario').value = aula.horario;
  document.getElementById('campo-unidade').value = aula.unidade;

  idEditando = aula.id;
  document.getElementById('form-titulo').textContent = 'Editar Aula';
  document.getElementById('btn-salvar').textContent = 'Salvar Alterações';

  navegarPara('cadastro');
}