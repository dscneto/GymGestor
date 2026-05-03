const navItems = document.querySelectorAll('.nav-item');

async function carregarPagina(nome) {
  const resposta = await fetch('/pages/' + nome + '.html');
    const html = await resposta.text();
      document.getElementById('conteudo').innerHTML = html;
      }

      async function navegarPara(pagina) {
        navItems.forEach(function(item) { item.classList.remove('active'); });
          const link = document.querySelector('[data-page="' + pagina + '"]');
            if (link) link.classList.add('active');

              await carregarPagina(pagina);

                if (pagina === 'dashboard') carregarDashboard();
                  if (pagina === 'lista')     { carregarLista(); registrarFiltros(); }
                    if (pagina === 'cadastro')  registrarFormCadastro();
                      if (pagina === 'efetivos')  { carregarEfetivos(); registrarFormEfetivo(); }
                      }

                      navItems.forEach(function(link) {
                        link.addEventListener('click', async function(evento) {
                            evento.preventDefault();
                                const pagina = link.getAttribute('data-page');
                                    await navegarPara(pagina);
                                      });
                                      });

                                      // Carrega o dashboard ao iniciar
                                      navegarPara('dashboard');