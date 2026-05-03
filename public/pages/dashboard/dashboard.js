let calMesAtual = new Date().getMonth();
let calAnoAtual = new Date().getFullYear();

const nomesMeses = [
  'Janeiro','Fevereiro','Março','Abril',
  'Maio','Junho','Julho','Agosto',
  'Setembro','Outubro','Novembro','Dezembro'
];

const nomesDias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

async function iniciarDashboard() {
  const aulas = await buscarAulas();

  document.getElementById('metric-total').textContent = aulas.length;
  document.getElementById('metric-proximas').textContent = contarProximas(aulas);
  document.getElementById('metric-professores').textContent = contarProfessores(aulas);

  renderizarProximas(aulas);
  renderizarCalendario(aulas);

  document.getElementById('cal-anterior').addEventListener('click', async function() {
    calMesAtual--;
    if (calMesAtual < 0) { calMesAtual = 11; calAnoAtual--; }
    renderizarCalendario(await buscarAulas());
  });

  document.getElementById('cal-proximo').addEventListener('click', async function() {
    calMesAtual++;
    if (calMesAtual > 11) { calMesAtual = 0; calAnoAtual++; }
    renderizarCalendario(await buscarAulas());
  });
}

function contarProximas(aulas) {
  const hoje = new Date();
  const em7dias = new Date();
  em7dias.setDate(hoje.getDate() + 7);
  return aulas.filter(function(aula) {
    const d = new Date(aula.data + 'T00:00:00');
    return d >= hoje && d <= em7dias;
  }).length;
}

function contarProfessores(aulas) {
  const unicos = [...new Set(aulas.map(function(a) { return a.professor; }))];
  return unicos.length;
}

function renderizarProximas(aulas) {
  const container = document.getElementById('lista-proximas');
  const hoje = new Date();
  const proximas = aulas
    .filter(function(a) { return new Date(a.data + 'T00:00:00') >= hoje; })
    .slice(0, 5);

  if (proximas.length === 0) {
    container.innerHTML = '<div style="padding:1rem 1.25rem; color:var(--cor-texto-fraco); font-size:13px;">Nenhuma aula agendada.</div>';
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

function renderizarCalendario(aulas) {
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
  const totalDias   = new Date(calAnoAtual, calMesAtual + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    const v = document.createElement('div');
    v.className = 'cal-dia vazio';
    grid.appendChild(v);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const cell = document.createElement('div');
    cell.className = 'cal-dia';

    if (dia === hoje.getDate() && calMesAtual === hoje.getMonth() && calAnoAtual === hoje.getFullYear()) {
      cell.classList.add('hoje');
    }

    const num = document.createElement('span');
    num.textContent = dia;
    cell.appendChild(num);

    const dataStr = calAnoAtual + '-' +
      String(calMesAtual + 1).padStart(2, '0') + '-' +
      String(dia).padStart(2, '0');

    aulas.filter(function(a) { return a.data === dataStr; }).forEach(function(aula) {
      const ev = document.createElement('div');
      ev.className = 'cal-evento ' + classeModalidade(aula.modalidade);
      ev.textContent = aula.nome.split(' ')[0] + ' – ' + aula.modalidade;
      cell.appendChild(ev);
    });

    grid.appendChild(cell);
  }
}

iniciarDashboard();