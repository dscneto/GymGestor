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
  return await resposta.json();
}

function alternarTema() {
  const atual = document.body.getAttribute('data-tema');
  if (atual === 'escuro') {
    document.body.removeAttribute('data-tema');
    document.getElementById('tema-label').textContent = 'Tema Claro';
    document.getElementById('tema-icone').className   = 'ph ph-sun';
    localStorage.setItem('tema', 'claro');
  } else {
    document.body.setAttribute('data-tema', 'escuro');
    document.getElementById('tema-label').textContent = 'Tema Escuro';
    document.getElementById('tema-icone').className   = 'ph ph-moon';
    localStorage.setItem('tema', 'escuro');
  }
}

// Aplica tema salvo ao carregar
(function() {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    document.body.setAttribute('data-tema', 'escuro');
  }
})();