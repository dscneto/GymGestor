const navItems = document.querySelectorAll('.nav-item');

// Páginas e seus arquivos
const paginas = {
  dashboard: { html: 'pages/dashboard/dashboard.html', css: 'pages/dashboard/dashboard.css', js: 'pages/dashboard/dashboard.js' },
  experimentais: { html: 'pages/experimentais/experimentais.html', css: 'pages/experimentais/experimentais.css', js: 'pages/experimentais/experimentais.js' },
  lista: { html: 'pages/lista/lista.html', css: 'pages/lista/lista.css', js: 'pages/lista/lista.js' },
  matriculas: { html: 'pages/matriculas/matriculas.html', css: 'pages/matriculas/matriculas.css', js: 'pages/matriculas/matriculas.js' },
  matriculados: { html: 'pages/matriculas/matriculas.html', css: 'pages/matriculas/matriculas.css', js: 'pages/matriculas/matriculas.js' },
};

let jsAtual = null;

async function navegarPara(nomePagina) {
  const pagina = paginas[nomePagina];
  if (!pagina) return;
  
  // Atualiza menu ativo
  navItems.forEach(function(item) { item.classList.remove('active'); });
  const linkAtivo = document.querySelector('[data-page="' + nomePagina + '"]');
  if (linkAtivo) linkAtivo.classList.add('active');
  
  // Carrega CSS da página
  let linkCSS = document.getElementById('css-pagina');
  if (!linkCSS) {
    linkCSS = document.createElement('link');
    linkCSS.id = 'css-pagina';
    linkCSS.rel = 'stylesheet';
    document.head.appendChild(linkCSS);
  }
  linkCSS.href = pagina.css;
  
  // Carrega HTML da página
  const respostaHTML = await fetch(pagina.html);
  const html = await respostaHTML.text();
  document.getElementById('conteudo').innerHTML = html;
  
  // Remove JS anterior e carrega o novo
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
    const pagina = link.getAttribute('data-page');
    navegarPara(pagina);
  });
});

// Carrega dashboard ao iniciar
navegarPara('dashboard');