// ================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ================================

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(function(link) {
  link.addEventListener('click', function(evento) {
    evento.preventDefault();

    const paginaDestino = link.getAttribute('data-page');

    navItems.forEach(function(item) { item.classList.remove('active'); });
    pages.forEach(function(page) { page.classList.remove('active'); });

    link.classList.add('active');
    document.getElementById('page-' + paginaDestino).classList.add('active');

    // Atualiza os dados ao trocar de página
    if (paginaDestino === 'dashboard') carregarDashboard();
    if (paginaDestino === 'lista') carregarLista();
  });
});

// ================================
// CARREGAR AULAS DO BANCO
// ================================

async function buscarAulas() {
  const resposta = await fetch('/api/aulas');
  const aulas = await resposta.json();
  return aulas;
}

// ================================
// DASHBOARD
// ================================

async function carregarDashboard() {
  const aulas = await buscarAulas();

  // Atualiza os cards de métricas
  document.getElementById('metric-total').textContent = aulas.length;
  document.getElementById('metric-proximas').textContent = contarProximas(aulas);
  document.getElementById('metric-professores').textContent = contarProfessores(aulas);

  // Atualiza a lista de próximas aulas
  renderizarProximas(aulas);
}

function contarProximas(aulas) {
  const hoje = new Date();
  const em7dias = new Date();
  em7dias.setDate(hoje.getDate() + 7);

  return aulas.filter(function(aula) {
    const dataAula = new Date(aula.data);
    return dataAula >= hoje && dataAula <= em7dias;
  }).length;
}

function renderizarProximas(aulas) {
  const container = document.getElementById('lista-proximas');
  const hoje = new Date();

  const proximas = aulas
    .filter(function(aula) { return new Date(aula.data) >= hoje; })
    .slice(0, 5);

  if (proximas.length === 0) {
    container.innerHTML = '<div style="padding: 1rem 1.25rem; color: var(--cor-texto-fraco); font-size: 13px;">Nenhuma aula agendada.</div>';
    return;
  }

  container.innerHTML = proximas.map(function(aula) {
    const data = new Date(aula.data + 'T00:00:00');
    const dia = data.getDate();
    const nomeDia = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const classe = classeModalidade(aula.modalidade);

    return `
      <div class="aula-row">
        <div class="data-box">
          <div class="data-num">${dia}</div>
          <div class="data-dia">${nomeDia}</div>
        </div>
        <div>
          <div class="aula-nome">${aula.nome}</div>
          <div class="aula-prof">${aula.professor}</div>
        </div>
        <span class="modalidade-badge ${classe}">${aula.modalidade}</span>
        <div class="aula-horario">${aula.horario}</div>
      </div>
    `;
  }).join('');
}

// ================================
// FORMULÁRIO DE CADASTRO
// ================================

const formulario = document.getElementById('form-cadastro');

formulario.addEventListener('submit', async function(evento) {
  evento.preventDefault();

  const novaAula = {
    nome:       document.getElementById('campo-nome').value,
    idade:      document.getElementById('campo-idade').value,
    modalidade: document.getElementById('campo-modalidade').value,
    professor:  document.getElementById('campo-professor').value,
    data:       document.getElementById('campo-data').value,
    horario:    document.getElementById('campo-horario').value
  };

  await fetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaAula)
  });

  formulario.reset();
  alert('Aula agendada com sucesso!');

  // Vai para a lista após salvar
  navItems.forEach(function(item) { item.classList.remove('active'); });
  pages.forEach(function(page) { page.classList.remove('active'); });
  document.querySelector('[data-page="lista"]').classList.add('active');
  document.getElementById('page-lista').classList.add('active');
  carregarLista();
});

// ================================
// LISTA DE ALUNOS
// ================================

async function carregarLista() {
  const aulas = await buscarAulas();
  renderizarTabela(aulas);
}

function renderizarTabela(aulas) {
  const tbody = document.getElementById('tbody-alunos');

  if (aulas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color: var(--cor-texto-fraco);">Nenhuma aula cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = aulas.map(function(aula) {
    const classe = classeModalidade(aula.modalidade);
    const dataFormatada = new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR');

    return `
      <tr>
        <td class="td-nome">${aula.nome}</td>
        <td class="td-fraco">${aula.idade}</td>
        <td><span class="modalidade-badge ${classe}">${aula.modalidade}</span></td>
        <td class="td-fraco">${aula.professor}</td>
        <td class="td-fraco">${dataFormatada}</td>
        <td class="td-fraco">${aula.horario}</td>
        <td>
          <button class="btn-acao" onclick="deletarAula(${aula.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deletarAula(id) {
  const confirmar = confirm('Deseja remover esta aula?');
  if (!confirmar) return;

  await fetch('/api/aulas/' + id, { method: 'DELETE' });
  carregarLista();
}

// ================================
// UTILITÁRIOS
// ================================

function classeModalidade(modalidade) {
  const mapa = {
    'Jiu-Jitsu':  'evento-bjj',
    'Muay Thai':  'evento-mt',
    'Karatê':     'evento-kt',
    'Ninjutsu':   'evento-nj',
    'Krav Maga':  'evento-kv'
  };
  return mapa[modalidade] || 'evento-bjj';
}

// ================================
// CALENDÁRIO DINÂMICO
// ================================

let calMesAtual = new Date().getMonth();
let calAnoAtual = new Date().getFullYear();

const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

async function renderizarCalendario() {
  const aulas = await buscarAulas();
  const hoje = new Date();

  // Título do mês
  document.getElementById('cal-mes-titulo').textContent =
    nomesMeses[calMesAtual] + ' ' + calAnoAtual;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  // Cabeçalho com os dias da semana
  nomesDias.forEach(function(dia) {
    const dow = document.createElement('div');
    dow.className = 'cal-dow';
    dow.textContent = dia;
    grid.appendChild(dow);
  });

  // Primeiro dia do mês e total de dias
  const primeiroDia = new Date(calAnoAtual, calMesAtual, 1).getDay();
  const totalDias = new Date(calAnoAtual, calMesAtual + 1, 0).getDate();

  // Células vazias antes do dia 1
  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'cal-dia vazio';
    grid.appendChild(vazio);
  }

  // Dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const cell = document.createElement('div');
    cell.className = 'cal-dia';

    // Marca o dia de hoje
    if (
      dia === hoje.getDate() &&
      calMesAtual === hoje.getMonth() &&
      calAnoAtual === hoje.getFullYear()
    ) {
      cell.classList.add('hoje');
    }

    // Número do dia
    const numDia = document.createElement('span');
    numDia.textContent = dia;
    cell.appendChild(numDia);

    // Aulas deste dia
    const dataStr = calAnoAtual + '-' +
      String(calMesAtual + 1).padStart(2, '0') + '-' +
      String(dia).padStart(2, '0');

    const aulasDoDia = aulas.filter(function(aula) {
      return aula.data === dataStr;
    });

    aulasDoDia.forEach(function(aula) {
      const evento = document.createElement('div');
      evento.className = 'cal-evento ' + classeModalidade(aula.modalidade);
      evento.textContent = aula.nome.split(' ')[0] + ' – ' + aula.modalidade;
      cell.appendChild(evento);
    });

    grid.appendChild(cell);
  }
}

// Botões de navegação do calendário
document.getElementById('cal-anterior').addEventListener('click', function() {
  calMesAtual--;
  if (calMesAtual < 0) {
    calMesAtual = 11;
    calAnoAtual--;
  }
  renderizarCalendario();
});

document.getElementById('cal-proximo').addEventListener('click', function() {
  calMesAtual++;
  if (calMesAtual > 11) {
    calMesAtual = 0;
    calAnoAtual++;
  }
  renderizarCalendario();
});

// Carrega o dashboard ao iniciar
async function carregarDashboard() {
  const aulas = await buscarAulas();

  document.getElementById('metric-total').textContent = aulas.length;
  document.getElementById('metric-proximas').textContent = contarProximas(aulas);

  renderizarProximas(aulas);
  renderizarCalendario();
}

function contarProfessores(aulas) {
    const professores = aulas.map(function(aula) { return aula.professor; });
      const unicos = [...new Set(professores)];
        return unicos.length;
}