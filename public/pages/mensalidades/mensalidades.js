let mesMensalidade  = new Date().getMonth() + 1;
let anoMensalidade  = new Date().getFullYear();
let todosPagamentos = [];

const nomesMeses = [
  'Janeiro','Fevereiro','Março','Abril',
  'Maio','Junho','Julho','Agosto',
  'Setembro','Outubro','Novembro','Dezembro'
];

const nomesDias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

async function iniciarMensalidades() {
  await gerarPagamentos();

  document.getElementById('mens-anterior').addEventListener('click', async function() {
    mesMensalidade--;
    if (mesMensalidade < 1) { mesMensalidade = 12; anoMensalidade--; }
    await gerarPagamentos();
  });

  document.getElementById('mens-proximo').addEventListener('click', async function() {
    mesMensalidade++;
    if (mesMensalidade > 12) { mesMensalidade = 1; anoMensalidade++; }
    await gerarPagamentos();
  });

  document.getElementById('mens-busca').addEventListener('input', aplicarFiltros);
  document.getElementById('mens-filtro-unidade').addEventListener('change', aplicarFiltros);
  document.getElementById('mens-filtro-modalidade').addEventListener('change', aplicarFiltros);
  document.getElementById('mens-filtro-status').addEventListener('change', aplicarFiltros);
}

async function gerarPagamentos() {
  const resp = await fetch('/api/pagamentos/gerar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mes: mesMensalidade, ano: anoMensalidade })
  });

  todosPagamentos = await resp.json();

  document.getElementById('mens-subtitulo').textContent =
    todosPagamentos.length + ' mensalidades em ' +
    nomesMeses[mesMensalidade - 1] + ' ' + anoMensalidade;

  renderizarCalendario();
  renderizarTabela(todosPagamentos);
}

function renderizarCalendario() {
  document.getElementById('mens-mes-titulo').textContent =
    nomesMeses[mesMensalidade - 1] + ' ' + anoMensalidade;

  const grid  = document.getElementById('mens-cal-grid');
  const hoje  = new Date();
  grid.innerHTML = '';

  // Cabeçalho dias da semana
  nomesDias.forEach(function(dia) {
    const dow = document.createElement('div');
    dow.className = 'cal-dow';
    dow.textContent = dia;
    grid.appendChild(dow);
  });

  const primeiroDia = new Date(anoMensalidade, mesMensalidade - 1, 1).getDay();
  const totalDias   = new Date(anoMensalidade, mesMensalidade, 0).getDate();

  // Células vazias
  for (let i = 0; i < primeiroDia; i++) {
    const v = document.createElement('div');
    v.className = 'cal-dia vazio';
    grid.appendChild(v);
  }

  // Dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    const cell = document.createElement('div');
    cell.className = 'cal-dia';

    if (
      dia === hoje.getDate() &&
      mesMensalidade === hoje.getMonth() + 1 &&
      anoMensalidade === hoje.getFullYear()
    ) {
      cell.classList.add('hoje');
    }

    const num = document.createElement('span');
    num.textContent = dia;
    cell.appendChild(num);

    // Vencimentos deste dia
    const vencimentos = todosPagamentos.filter(function(p) {
      return parseInt(p.vencimento) === dia;
    });

    vencimentos.forEach(function(p) {
      const badge = document.createElement('div');
      badge.className = 'venc-badge ' + (p.status === 'pago' ? 'venc-pago' : 'venc-pendente');
      badge.title = p.nome + ' — ' + p.modalidade;
      badge.textContent = p.nome.split(' ')[0][0];
      cell.appendChild(badge);
    });

    grid.appendChild(cell);
  }
}

function aplicarFiltros() {
  const busca      = document.getElementById('mens-busca').value.toLowerCase();
  const unidade    = document.getElementById('mens-filtro-unidade').value;
  const modalidade = document.getElementById('mens-filtro-modalidade').value;
  const status     = document.getElementById('mens-filtro-status').value;

  const filtrados = todosPagamentos.filter(function(p) {
    const bateBusca      = p.nome.toLowerCase().includes(busca);
    const bateUnidade    = unidade    === '' || p.unidade    === unidade;
    const bateModalidade = modalidade === '' || p.modalidade === modalidade;
    const bateStatus     = status     === '' || p.status     === status;
    return bateBusca && bateUnidade && bateModalidade && bateStatus;
  });

  renderizarTabela(filtrados);
}

function renderizarTabela(pagamentos) {
  const tbody = document.getElementById('tbody-mensalidades');

  if (pagamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--cor-texto-fraco);">Nenhuma mensalidade encontrada.</td></tr>';
    return;
  }

  tbody.innerHTML = pagamentos.map(function(p) {
    const valor = p.valor_mensalidade
      ? 'R$ ' + parseFloat(p.valor_mensalidade).toFixed(2)
      : '—';

    const statusClasse = p.status === 'pago' ? 'status-pago' : 'status-pendente';
    const statusLabel  = p.status === 'pago' ? 'Pago' : 'Pendente';
    const btnLabel     = p.status === 'pago' ? 'Desmarcar' : 'Marcar Pago';

    return `
      <tr>
        <td class="td-nome">${p.nome}</td>
        <td class="td-fraco">${p.modalidade}</td>
        <td class="td-fraco">${p.professor}</td>
        <td class="td-fraco">${p.unidade}</td>
        <td class="td-fraco">Dia ${p.vencimento}</td>
        <td class="td-fraco">${valor}</td>
        <td><span class="status-badge ${statusClasse}">${statusLabel}</span></td>
        <td>
          <button class="btn-acao" onclick="alternarPagamento(${p.id}, '${p.status}')">
            ${btnLabel}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function alternarPagamento(id, statusAtual) {
  const novoStatus     = statusAtual === 'pago' ? 'pendente' : 'pago';
  const dataPagamento  = novoStatus === 'pago'
    ? new Date().toISOString().split('T')[0]
    : null;

  await fetch('/api/pagamentos/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus, data_pagamento: dataPagamento })
  });

  await gerarPagamentos();
}

iniciarMensalidades();