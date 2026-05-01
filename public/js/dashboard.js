let calMesAtual = new Date().getMonth();
let calAnoAtual = new Date().getFullYear();

const nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

async function carregarDashboard() {
  const aulas = await buscarAulas();

  document.getElementById('metric-total').textContent = aulas.length;
  document.getElementById('metric-proximas').textContent = contarProximas(aulas);
  document.getElementById('metric-professores').textContent = contarProfessores(aulas);

  renderizarProximas(aulas);
  renderizarCalendario();
}

function contarProximas(aulas) {
  const hoje = new Date();
  const em7dias = new Date();
  em7dias.setDate(hoje.getDate() + 7);

  return aulas.filter(function(aula) {
    const dataAula = new Date(aula.data + 'T00:00:00');
    return dataAula >= hoje && dataAula <= em7dias;
  }).length;
}

function contarProfessores(aulas) {
  const professores = aulas.map(function(aula) { return aula.professor; });
  const unicos = [...new Set(professores)];
  return unicos.length;
}

function renderizarProximas(aulas) {
  const container = document.getElementById('lista-proximas');
  const hoje = new Date();

  const proximas = aulas
    .filter(function(aula) { return new Date(aula.data + 'T00:00:00') >= hoje; })
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

async function renderizarCalendario() {
  const aulas = await buscarAulas();
  const hoje = new Date();

  document.getElementById('cal-mes-titulo').textContent =
    nomesMeses[calMesAtual] + ' ' + calAnoAtual;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  nomesDias.forEach(function(dia) {
    const dow = document.createElement('div');
    dow.className = 'cal-dow';
    dow.textContent = dia;
    grid.appendChild(dow);
  });

  const primeiroDia = new Date(calAnoAtual, calMesAtual, 1).getDay();
  const totalDias = new Date(calAnoAtual, calMesAtual + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'cal-dia vazio';
    grid.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const cell = document.createElement('div');
    cell.className = 'cal-dia';

    if (
      dia === hoje.getDate() &&
      calMesAtual === hoje.getMonth() &&
      calAnoAtual === hoje.getFullYear()
    ) {
      cell.classList.add('hoje');
    }

    const numDia = document.createElement('span');
    numDia.textContent = dia;
    cell.appendChild(numDia);

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

document.getElementById('cal-anterior').addEventListener('click', function() {
  calMesAtual--;
  if (calMesAtual < 0) { calMesAtual = 11; calAnoAtual--; }
  renderizarCalendario();
});

document.getElementById('cal-proximo').addEventListener('click', function() {
  calMesAtual++;
  if (calMesAtual > 11) { calMesAtual = 0; calAnoAtual++; }
  renderizarCalendario();
});