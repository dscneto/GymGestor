function classeModalidade(modalidade) {
  const mapa = {
    'Jiu-Jitsu': 'evento-bjj',
    'Muay Thai': 'evento-mt',
    'Karatê': 'evento-kt',
    'Ninjutsu': 'evento-nj',
    'Krav Maga': 'evento-kv'
  };
  return mapa[modalidade] || 'evento-bjj';
}

async function buscarAulas() {
  const resposta = await fetch('/api/aulas');
  const aulas = await resposta.json();
  return aulas;
}

function navegarPara(pagina) {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  navItems.forEach(function (item) { item.classList.remove('active'); });
  pages.forEach(function (page) { page.classList.remove('active'); });
  document.querySelector('[data-page="' + pagina + '"]').classList.add('active');
  document.getElementById('page-' + pagina).classList.add('active');
}