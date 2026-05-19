let todosAniversarios = [];
const mesAtual = new Date().getMonth() + 1;
const diaAtual = new Date().getDate();

const nomesMeses = [
  'Janeiro','Fevereiro','Março','Abril',
  'Maio','Junho','Julho','Agosto',
  'Setembro','Outubro','Novembro','Dezembro'
];

const classeProfessor = {
  'Jiu-Jitsu': 'aniv-prof-bjj',
  'Muay Thai':  'aniv-prof-mt',
  'Karatê':     'aniv-prof-kt',
  'Ninjutsu':   'aniv-prof-nj',
  'Krav Maga':  'aniv-prof-kv'
};

const classeAluno = {
  'Jiu-Jitsu': 'aniv-aluno-bjj',
  'Muay Thai':  'aniv-aluno-mt',
  'Karatê':     'aniv-aluno-kt',
  'Ninjutsu':   'aniv-aluno-nj',
  'Krav Maga':  'aniv-aluno-kv'
};

async function iniciarAniversarios() {
  const [resProfessores, resAlunos] = await Promise.all([
    fetch('/api/professores'),
    fetch('/api/alunos')
  ]);

  const professores = await resProfessores.json();
  const alunos      = await resAlunos.json();

  todosAniversarios = [];

  // Adiciona professores
  professores.forEach(function(p) {
    if (!p.data_nascimento) return;
    const mods = p.modalidades ? p.modalidades.split(',') : [''];
    mods.forEach(function(mod) {
      todosAniversarios.push({
        nome:            p.nome,
        data_nascimento: p.data_nascimento,
        tipo:            'professor',
        modalidade:      mod.trim(),
        unidade:         p.unidades
      });
    });
  });

  // Adiciona alunos — modalidade já está na tabela unificada
  alunos.forEach(function(a) {
    if (!a.data_nascimento) return;
    todosAniversarios.push({
      nome:            a.nome,
      data_nascimento: a.data_nascimento,
      tipo:            'aluno',
      modalidade:      a.modalidade || '',
      unidade:         a.unidade
    });
  });

  // Ordena por mês e dia
  todosAniversarios.sort(function(a, b) {
    const [, mesA, diaA] = a.data_nascimento.split('-').map(Number);
    const [, mesB, diaB] = b.data_nascimento.split('-').map(Number);
    return mesA !== mesB ? mesA - mesB : diaA - diaB;
  });

  document.getElementById('aniv-subtitulo').textContent =
    todosAniversarios.length + ' aniversários cadastrados';

  // Seta filtro para mês atual
  document.getElementById('aniv-filtro-mes').value = mesAtual;

  document.getElementById('aniv-filtro-mes').addEventListener('change', aplicarFiltros);
  document.getElementById('aniv-filtro-tipo').addEventListener('change', aplicarFiltros);
  document.getElementById('aniv-filtro-modalidade').addEventListener('change', aplicarFiltros);

  aplicarFiltros();
}

function aplicarFiltros() {
  const mes        = parseInt(document.getElementById('aniv-filtro-mes').value);
  const tipo       = document.getElementById('aniv-filtro-tipo').value;
  const modalidade = document.getElementById('aniv-filtro-modalidade').value;

  let filtrados = todosAniversarios.filter(function(a) {
    const mesAniv        = parseInt(a.data_nascimento.split('-')[1]);
    const bateMes        = mes === 0 || mesAniv === mes;
    const bateTipo       = tipo === '' || a.tipo === tipo;
    const bateModalidade = modalidade === '' || a.modalidade === modalidade;
    return bateMes && bateTipo && bateModalidade;
  });

  // Aniversários este mês
  const estesMes = todosAniversarios.filter(function(a) {
    return parseInt(a.data_nascimento.split('-')[1]) === mesAtual;
  });

  const secaoEsteMes = document.getElementById('aniv-este-mes');
  if (estesMes.length > 0 && mes === mesAtual) {
    secaoEsteMes.style.display = 'block';
    renderizarCards('lista-este-mes', estesMes);
  } else {
    secaoEsteMes.style.display = 'none';
  }

  renderizarCards('lista-aniversarios', filtrados);
}

function renderizarCards(containerId, lista) {
  const container = document.getElementById(containerId);

  if (lista.length === 0) {
    container.innerHTML = '<div class="vazio">Nenhum aniversário encontrado.</div>';
    return;
  }

  container.innerHTML = lista.map(function(a) {
    const partes  = a.data_nascimento.split('-');
    const dia     = partes[2];
    const mes     = parseInt(partes[1]);
    const ano     = partes[0];
    const idade   = new Date().getFullYear() - parseInt(ano);
    const ehHoje  = parseInt(dia) === diaAtual && mes === mesAtual;
    const nomeMes = nomesMeses[mes - 1];

    const classeBase = a.tipo === 'professor'
      ? (classeProfessor[a.modalidade] || 'aniv-prof-bjj')
      : (classeAluno[a.modalidade]     || 'aniv-aluno-bjj');

    const tipoLabel = a.tipo === 'professor' ? 'Professor' : 'Aluno';

    return `
      <div class="aniv-card ${classeBase}">
        <div class="aniv-tipo">${tipoLabel}</div>
        <div class="aniv-nome">${a.nome}</div>
        <div class="aniv-data">${dia} de ${nomeMes} — ${idade} anos</div>
        <div class="aniv-modalidade">${a.modalidade || '—'}</div>
        ${ehHoje ? '<div class="aniv-hoje">🎂 Hoje!</div>' : ''}
      </div>
    `;
  }).join('');
}

iniciarAniversarios();