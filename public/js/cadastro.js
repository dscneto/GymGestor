function registrarFormCadastro() {
    const formulario = document.getElementById('form-cadastro');
      if (!formulario) return;

        formulario.addEventListener('submit', async function(evento) {
            evento.preventDefault();

                const aula = {
                      nome:       document.getElementById('campo-nome').value,
                            idade:      document.getElementById('campo-idade').value,
                                  modalidade: document.getElementById('campo-modalidade').value,
                                        professor:  document.getElementById('campo-professor').value,
                                              data:       document.getElementById('campo-data').value,
                                                    horario:    document.getElementById('campo-horario').value,
                                                          unidade:    document.getElementById('campo-unidade').value
                                                              };

                                                                  if (idEditando) {
                                                                        await fetch('/api/aulas/' + idEditando, {
                                                                                method: 'PUT',
                                                                                        headers: { 'Content-Type': 'application/json' },
                                                                                                body: JSON.stringify(aula)
                                                                                                      });
                                                                                                            idEditando = null;
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
                                                                                                                                                                              });
                                                                                                                                                                              }

                                                                                                                                                                              let idEditando = null;

                                                                                                                                                                              function editarAula(aula) {
                                                                                                                                                                                navegarPara('cadastro').then(function() {
                                                                                                                                                                                    document.getElementById('campo-nome').value       = aula.nome;
                                                                                                                                                                                        document.getElementById('campo-idade').value      = aula.idade;
                                                                                                                                                                                            document.getElementById('campo-modalidade').value = aula.modalidade;
                                                                                                                                                                                                document.getElementById('campo-professor').value  = aula.professor;
                                                                                                                                                                                                    document.getElementById('campo-data').value       = aula.data;
                                                                                                                                                                                                        document.getElementById('campo-horario').value    = aula.horario;
                                                                                                                                                                                                            document.getElementById('campo-unidade').value    = aula.unidade;

                                                                                                                                                                                                                idEditando = aula.id;
                                                                                                                                                                                                                    document.getElementById('form-titulo').textContent = 'Editar Aula';
                                                                                                                                                                                                                        document.getElementById('btn-salvar').textContent  = 'Salvar Alterações';
                                                                                                                                                                                                                          });
                                                                                                                                                                                                                          }
}