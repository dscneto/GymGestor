// Verifica autenticação
(function() {
  const token = localStorage.getItem('token');
  if (!token && !window.location.pathname.includes('login')) {
    window.location.href = '/login.html';
    return;
  }

  // Aplica tema salvo
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    document.body.setAttribute('data-tema', 'escuro');
  }
})();

// Adiciona token em todas as requisições
const _fetch = window.fetch;
window.fetch = function(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  const token = localStorage.getItem('token');
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  return _fetch(url, options);
};

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

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('perfil');
  localStorage.removeItem('nome');
  window.location.href = '/login.html';
}

// Preenche nome e perfil na sidebar
document.addEventListener('DOMContentLoaded', function() {
  const nome   = localStorage.getItem('nome');
  const perfil = localStorage.getItem('perfil');
  if (nome)   document.getElementById('usuario-nome').textContent   = nome;
  if (perfil) document.getElementById('usuario-perfil').textContent = perfil === 'admin' ? 'Administrador' : 'Professor';
});