let todosEfetivos = [];
let idEfetivoEditando = null;

async function carregarEfetivos() {
  const resposta = await fetch('/api/alunos');
    todosEfetivos = await resposta.json();
      document.getElementById('efetivos-subtitulo').textContent =
          todosEfetivos.length + ' alunos cadastrados';
            renderizarEfetivos(todosEfetivos);
              ativarFiltrosEfetivos();
              }

              function ativarFiltrosEfetivos() {
                document.getElementById('efetivos-busca').addEventListener('input', aplicarFiltrosEfetivos);
                  document.getElementById('efetivos-unidade').addEventListener('change', aplicarFiltrosEfetivos);
                    document.getElementById('efetivos-modalidade').addEventListener('change', aplicarFiltrosEfetivos);
                    }

                    function aplicarFiltrosEfetivos() {
                      const busca   = document.getElementById('efetivos-busca').value.toLowerCase();
                        const unidade = document.getElementById('efetivos-unidade').value;

                          const filtrados = todosEfetivos.filter(function(aluno) {
                              const bateBusca   = aluno.nome.toLowerCase().includes(busca);
                                  const bateUnidade = unidade === '' || aluno.unidade === unidade;
                                      return bateBusca && bateUnidade;
                                        });

                                          renderizarEfetivos(filtrados);
                                          }

                                          function renderizarEfetivos(alunos) {
                                            const tbody = document.getElementById('tbody-efetivos');

                                              if (alunos.length === 0) {
                                                  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color: var(--cor-texto-fraco);">Nenhum aluno cadastrado.</td></tr>';
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
                                                                                                                                      <button class="btn-acao" onclick='editarEfetivo(${JSON.stringify(aluno)})'>✎</button>
                                                                                                                                                <button class="btn-acao" onclick="deletarEfetivo(${aluno.id})">✕</button>
                                                                                                                                                        </td>
                                                                                                                                                              </tr>
                                                                                                                                                                  `;
                                                                                                                                                                    }).join('');
                                                                                                                                                                    }

                                                                                                                                                                    async function deletarEfetivo(id) {
                                                                                                                                                                      const confirmar = confirm('Deseja remover este aluno?');
                                                                                                                                                                        if (!confirmar) return;
                                                                                                                                                                          await fetch('/api/alunos/' + id, { method: 'DELETE' });
                                                                                                                                                                            carregarEfetivos();
                                                                                                                                                                            }

                                                                                                                                                                            // ================================
                                                                                                                                                                            // FORMULÁRIO
                                                                                                                                                                            // ================================

                                                                                                                                                                            function abrirFormEfetivo() {
                                                                                                                                                                              idEfetivoEditando = null;
                                                                                                                                                                                document.getElementById('form-efetivo').reset();
                                                                                                                                                                                  document.getElementById('container-horarios').innerHTML = '';
                                                                                                                                                                                    document.getElementById('ef-form-titulo').textContent = 'Cadastrar Novo Aluno';
                                                                                                                                                                                      document.getElementById('ef-btn-salvar').textContent = 'Cadastrar Aluno';
                                                                                                                                                                                        document.getElementById('modal-efetivo').style.display = 'block';
                                                                                                                                                                                        }

                                                                                                                                                                                        function fecharFormEfetivo() {
                                                                                                                                                                                          document.getElementById('modal-efetivo').style.display = 'none';
                                                                                                                                                                                            document.getElementById('form-efetivo').reset();
                                                                                                                                                                                              document.getElementById('container-horarios').innerHTML = '';
                                                                                                                                                                                                idEfetivoEditando = null;
                                                                                                                                                                                                }

                                                                                                                                                                                                function editarEfetivo(aluno) {
                                                                                                                                                                                                  idEfetivoEditando = aluno.id;

                                                                                                                                                                                                    document.getElementById('ef-nome').value          = aluno.nome;
                                                                                                                                                                                                      document.getElementById('ef-nascimento').value    = aluno.data_nascimento;
                                                                                                                                                                                                        document.getElementById('ef-cpf').value           = aluno.cpf;
                                                                                                                                                                                                          document.getElementById('ef-telefone').value      = aluno.telefone || '';
                                                                                                                                                                                                            document.getElementById('ef-unidade').value       = aluno.unidade;
                                                                                                                                                                                                              document.getElementById('ef-resp-nome').value     = aluno.nome_responsavel || '';
                                                                                                                                                                                                                document.getElementById('ef-resp-contato').value  = aluno.contato_responsavel || '';

                                                                                                                                                                                                                  document.getElementById('ef-form-titulo').textContent = 'Editar Aluno';
                                                                                                                                                                                                                    document.getElementById('ef-btn-salvar').textContent  = 'Salvar Alterações';
                                                                                                                                                                                                                      document.getElementById('modal-efetivo').style.display = 'block';
                                                                                                                                                                                                                        document.getElementById('modal-efetivo').scrollIntoView({ behavior: 'smooth' });
                                                                                                                                                                                                                        }

                                                                                                                                                                                                                        async function atualizarHorarios() {
                                                                                                                                                                                                                          const unidade    = document.getElementById('ef-unidade').value;
                                                                                                                                                                                                                            const modalidade = document.getElementById('ef-modalidade').value;
                                                                                                                                                                                                                              const container  = document.getElementById('container-horarios');

                                                                                                                                                                                                                                if (!unidade || !modalidade) {
                                                                                                                                                                                                                                    container.innerHTML = '';
                                                                                                                                                                                                                                        return;
                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                            const resp = await fetch('/api/horarios?unidade=' + unidade + '&modalidade=' + modalidade);
                                                                                                                                                                                                                                              const horarios = await resp.json();

                                                                                                                                                                                                                                                if (horarios.length === 0) {
                                                                                                                                                                                                                                                    container.innerHTML = '<div style="color: var(--cor-texto-fraco); font-size: 13px;">Nenhum horário disponível.</div>';
                                                                                                                                                                                                                                                        return;
                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                            container.innerHTML = horarios.map(function(h) {
                                                                                                                                                                                                                                                                const diasDisponiveis = h.dias.split(',');
                                                                                                                                                                                                                                                                    const turmaLabel = h.turma ? ` — ${h.turma}` : '';

                                                                                                                                                                                                                                                                        const checkboxesDias = diasDisponiveis.map(function(dia) {
                                                                                                                                                                                                                                                                              return `
                                                                                                                                                                                                                                                                                      <label style="display:inline-flex; align-items:center; gap:4px; margin-right:10px; font-size:13px; cursor:pointer;">
                                                                                                                                                                                                                                                                                                <input type="checkbox" name="dia_${h.id}" value="${dia}"> ${dia}
                                                                                                                                                                                                                                                                                                        </label>
                                                                                                                                                                                                                                                                                                              `;
                                                                                                                                                                                                                                                                                                                  }).join('');

                                                                                                                                                                                                                                                                                                                      return `
                                                                                                                                                                                                                                                                                                                            <div class="horario-opcao" style="background: var(--cor-fundo); border: 1px solid var(--cor-borda); border-radius: 8px; padding: 12px