// Seleciona todos os links da sidebar e todas as páginas
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Para cada link, adiciona um "ouvinte" de clique
navItems.forEach(function(link) {

  link.addEventListener('click', function(evento) {
    evento.preventDefault(); // evita o # aparecer na URL

    // Pega o nome da página destino (ex: "dashboard", "cadastro")
    const paginaDestino = link.getAttribute('data-page');

    // Remove "active" de todos os links e páginas
    navItems.forEach(function(item) { item.classList.remove('active'); });
    pages.forEach(function(page) { page.classList.remove('active'); });

    // Adiciona "active" só no link clicado e na página correspondente
    link.classList.add('active');
    document.getElementById('page-' + paginaDestino).classList.add('active');
  });

});