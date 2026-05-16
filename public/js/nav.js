const navItems = document.querySelectorAll('.nav-item');

const paginas = {
  dashboard:    { html: 'pages/dashboard/dashboard.html',         js: 'pages/dashboard/dashboard.js'         },
  experimentais:{ html: 'pages/experimentais/experimentais.html', js: 'pages/experimentais/experimentais.js' },
  lista:        { html: 'pages/lista/lista.html',                 js: 'pages/lista/lista.js'                 },
  matriculas:   { html: 'pages/matriculas/matriculas.html',       js: 'pages/matriculas/matriculas.js'       },
  matriculados: { html: 'pages/matriculados/matriculados.html',   js: 'pages/matriculados/matriculados.js'   },
  mensalidades: { html: 'pages/mensalidades/mensalidades.html',   js: 'pages/mensalidades/mensalidades.js'   },
};

let jsAtual = null;

function ativarCSS(nomePagina) {
  // Desativa todos os CSS de páginas
  document.querySelectorAll('link[data-page]').forEach(function(link) {
    link.disabled = true;
  });

  // Ativa só o CSS da página atual
  const cssAtivo = document.querySelector('link[data-page="' + nomePagina + '"]');
  if (cssAtivo) cssAtivo.disabled = false;
}

async function navegarPara(nomePagina) {
  const pagina = paginas[nomePagina];
  if (!pagina) return;

  // Salva página na URL
  window.location.hash = nomePagina;

  // Atualiza menu ativo
  navItems.forEach(function(item) { item.classList.remove('active'); });
  const linkAtivo = document.querySelector('[data-page="' + nomePagina + '"]');
  if (linkAtivo) linkAtivo.classList.add('active');

  // Ativa CSS da página ANTES de carregar o HTML
  ativarCSS(nomePagina);

  // Carrega HTML
  const respostaHTML = await fetch(pagina.html);
  const html = await respostaHTML.text();
  document.getElementById('conteudo').innerHTML = html;

  // Remove JS anterior e carrega novo
  if (jsAtual) jsAtual.remove();
  const script = document.createElement('script');
  script.src = pagina.js + '?v=' + Date.now();
  document.body.appendChild(script);
  jsAtual = script;
}

// Cliques no menu
navItems.forEach(function(link) {
  link.addEventListener('click', function(evento) {
    evento.preventDefault();
    navegarPara(link.getAttribute('data-page'));
  });
});

// Carrega página salva na URL ou dashboard
const paginaInicial = window.location.hash.replace('#', '') || 'dashboard';
navegarPara(paginaInicial);