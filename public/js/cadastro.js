const formulario = document.getElementById('form-cadastro');

formulario.addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const novaAula = {
    nome:       document.getElementById('campo-nome').value,
    idade:      document.getElementById('campo-idade').value,
    modalidade: document.getElementById('campo-modalidade').value,
    professor:  document.getElementById('campo-professor').value,
    data:       document.getElementById('campo-data').value,
    horario:    document.getElementById('campo-horario').value
  };

  await fetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaAula)
  });

  formulario.reset();
  alert('Aula agendada com sucesso!');
  navegarPara('lista');
  carregarLista();
});