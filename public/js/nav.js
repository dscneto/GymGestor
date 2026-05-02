const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(function (link) {
  link.addEventListener('click', function (evento) {
    evento.preventDefault();
    const paginaDestino = link.getAttribute('data-page');

    navItems.forEach(function (item) { item.classList.remove('active'); });
    pages.forEach(function (page) { page.classList.remove('active'); });

    link.classList.add('active');
    document.getElementById('page-' + paginaDestino).classList.add('active');

    if (paginaDestino === 'dashboard') carregarDashboard();
    if (paginaDestino === 'lista') carregarLista();
    if (paginaDestino === 'efetivos') carregarEfetivos();
  });
});