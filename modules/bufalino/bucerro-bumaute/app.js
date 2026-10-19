/* ===== Estado, UI y render — Recría Búfalo Bucerro-Bumaute (Levante) ===== */
const clone = (o) => JSON.parse(JSON.stringify(o));
let P = load() || clone(DEFAULTS);
let R = null;
let tab = 'rebano';
let charts = {};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const nf = (d = 0) => new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
const n0 = (v) => nf(0).format(Math.round(v || 0));
const n1 = (v) => nf(1).format(v || 0);
const n2 = (v) => nf(2).format(v || 0);
const money = (v) => (P.precios.moneda || '$') + ' ' + n0(v);
const sum = (arr, k) => arr.reduce((a, x) => a + (x[k] || 0), 0);

function save() { try { localStorage.setItem('calc-bucerro-bumaute-v1', JSON.stringify(P)); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem('calc-bucerro-bumaute-v1')); } catch (e) { return null; } }

/* ---------- Controles dinámicos ---------- */
function buildForraje() {
  const w = $('#forrajeWrap');
  w.innerHTML = P.forraje.map((f, i) => `
    <div class="rounded-xl border border-clay-200 p-2 space-y-2">
      <p class="text-xs font-semibold text-slate-600">${f.tipo}</p>
      <div class="grid grid-cols-2 gap-2">
        <label class="field"><span class="text-[11px]">Carga UA/ha</span>
          <input class="inp" type="number" step="0.5" min="0" data-forr="carga" data-i="${i}"></label>
        <label class="field"><span class="text-[11px]">Área (ha)</span>
          <input class="inp" type="number" step="0.01" min="0" data-forr="area" data-i="${i}"></label>
      </div>
    </div>`).join('');
}

/* ---------- Sincronizar inputs con el estado ---------- */
function fillInputs() {
  $('#comprasAnio').value = P.comprasAnio;
  $('#embarcaderoCant').value = (P.embarcaderoCant != null ? P.embarcaderoCant : 20);
  $('#mortUsada').value = Math.round((P.mortUsada || 0) * 1000) / 10;
  $('#years').value = P.years;
  $('#pesoInicial').value = P.pesoInicial;
  $('#pesoFinal').value = P.pesoFinal;
  $('#gdp').value = P.gdp;
  $('#pesoPromedioVenta').value = P.pesoPromedioVenta;
  $('#facBumaute').value = P.fc.bumauteLevante;
  $('#margenSeguridad').value = Math.round((P.margenSeguridad != null ? P.margenSeguridad : 0) * 100);
  $('#pCarne').value = P.precios.kgCarne;
  $$('[data-forr]').forEach((el) => { el.value = P.forraje[+el.dataset.i][el.dataset.forr]; });
  updateLevanteOut();
}

function updateLevanteOut() {
  const dias = P.gdp ? (P.pesoFinal - P.pesoInicial) / P.gdp : 0;
  $('#levanteOut').textContent = `Ciclo de levante: ${n0(dias)} días (${n1(dias / 30)} meses) para pasar de ${n0(P.pesoInicial)} a ${n0(P.pesoFinal)} kg.`;
}

function bindInputs() {
  const map = {
    comprasAnio: (v) => (P.comprasAnio = Math.max(1, v)),
    embarcaderoCant: (v) => (P.embarcaderoCant = Math.max(0, v)),
    mortUsada: (v) => (P.mortUsada = Math.max(0, v) / 100),
    years: (v) => (P.years = Math.min(20, Math.max(1, v))),
    pesoInicial: (v) => (P.pesoInicial = v),
    pesoFinal: (v) => (P.pesoFinal = v),
    gdp: (v) => (P.gdp = v || 0.6),
    pesoPromedioVenta: (v) => (P.pesoPromedioVenta = v),
    facBumaute: (v) => (P.fc.bumauteLevante = v),
    margenSeguridad: (v) => (P.margenSeguridad = Math.max(0, v) / 100),
    pCarne: (v) => (P.precios.kgCarne = v)
  };
  Object.keys(map).forEach((id) => {
    $('#' + id).addEventListener('input', (e) => { map[id](+e.target.value || 0); updateLevanteOut(); render(); });
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.forr) { P.forraje[+t.dataset.i][t.dataset.forr] = +t.value || 0; render(); }
  });

  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    renderTabs();
  });

  $('#btn-reset').addEventListener('click', () => {
    P = clone(DEFAULTS);
    buildForraje(); fillInputs(); render();
  });
  $('#btn-print').addEventListener('click', () => window.print());
  $('#btn-csv').addEventListener('click', exportCSV);
  $('#csvCarne').addEventListener('click', csvCarne);
}

/* ---------- KPIs ---------- */
function renderKPIs() {
  const kgTot = sum(R.produccion, 'pesoKg');
  const nTot = sum(R.rebano, 'ventas');
  const ing = sum(R.ingresos, 'total');
  const bal = R.forraje.balance;

  const items = [
    { t: 'Bumautes vendidos (' + P.years + ' años)', v: n0(nTot), s: n0(R.rebano[0].ventas) + ' por año' },
    { t: 'Carne acumulada', v: n0(kgTot) + ' kg', s: n1(R.produccion[0].pesoProm) + ' kg por bumaute' },
    { t: 'Ciclo de levante', v: n0(R.levante.dias) + ' días', s: n1(R.levante.meses) + ' meses de engorde' },
    ing > 0
      ? { t: 'Ingresos acumulados', v: money(ing), s: 'Venta de bumautes en pie' }
      : { t: 'Balance forrajero', v: n2(bal) + ' UA', s: bal >= 0 ? 'Oferta suficiente' : 'Déficit de forraje', c: bal >= 0 ? 'pos' : 'neg' }
  ];

  $('#kpis').innerHTML = items.map((k) => `
    <div class="kpi">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">${k.t}</p>
      <p class="kpi-val ${k.c || ''}">${k.v}</p>
      <p class="text-xs text-slate-500 mt-1">${k.s}</p>
    </div>`).join('');
}

/* ---------- Gráficos superiores ---------- */
function renderCharts() {
  const labels = R.rebano.map((f) => 'Año ' + f.anio);
  const base = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } }
  };

  charts.hato?.destroy();
  charts.hato = new Chart($('#chHato'), {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Bumautes vendidos', data: R.rebano.map((f) => f.ventas), backgroundColor: '#1f7a50' },
      { label: 'Mortalidad', data: R.rebano.map((f) => f.mortalidad), backgroundColor: '#c98a5e' }
    ] },
    options: { ...base, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } } }
  });

  charts.prod?.destroy();
  charts.prod = new Chart($('#chProd'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Kilogramos de bumaute (kg)', data: R.produccion.map((x) => x.pesoKg), backgroundColor: '#b98a5e' }] },
    options: { ...base, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: 'kg' } } } }
  });
}

/* ---------- Tablas ---------- */
function table(cols, rows, foot) {
  const th = cols.map((c) => `<th>${c.h}</th>`).join('');
  const tb = rows.map((r) => `<tr>${cols.map((c) => `<td>${c.f(r)}</td>`).join('')}</tr>`).join('');
  const tf = foot ? `<tfoot><tr>${foot.map((v) => `<td>${v}</td>`).join('')}</tr></tfoot>` : '';
  return `<p class="tbl-hint">Desliza la tabla horizontalmente para ver todos los años →</p><div class="tbl-wrap scroll-thin"><table class="tbl"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody>${tf}</table></div>`;
}

const TABLES = {
  rebano: () => table([
    { h: 'Año', f: (r) => r.anio },
    { h: 'Bucerros (compra)', f: (r) => n0(r.compras) },
    { h: 'Rebaño inicial', f: (r) => n0(r.rebInicial) },
    { h: 'Mortalidad', f: (r) => n0(r.mortalidad) },
    { h: 'Bumautes (venta)', f: (r) => n0(r.ventas) },
    { h: 'U.A.', f: (r) => n2(r.ua) }
  ], R.rebano, ['Total', n0(sum(R.rebano, 'compras')), n0(sum(R.rebano, 'rebInicial')), n0(sum(R.rebano, 'mortalidad')), n0(sum(R.rebano, 'ventas')), '—']),

  forraje: () => {
    const f = R.forraje;
    const rows = P.forraje.map((x) => ({ ...x, sust: x.carga * x.area }));
    const t1 = table([
      { h: 'Tipo de forraje', f: (r) => r.tipo },
      { h: 'Carga (UA/ha)', f: (r) => n1(r.carga) },
      { h: 'Área (ha)', f: (r) => n2(r.area) },
      { h: 'Sustentación (UA)', f: (r) => n2(r.sust) }
    ], rows, ['Total', '', n2(f.areaTotal), n2(f.oferta)]);

    const cls = f.balance >= 0 ? 'pos' : 'neg';
    const pct = Math.round((f.margen || 0) * 100);
    const demandaLabel = pct > 0 ? ('Demanda de diseño (+' + pct + '% margen)') : 'Demanda animal (régimen estable)';
    const balanceLabel = pct > 0 ? 'Balance de carga (con margen)' : 'Balance de carga';
    const cards = `
      <div class="grid gap-3 sm:grid-cols-4 p-4">
        ${[['Superficie total', n2(f.areaTotal) + ' ha'], ['Oferta forrajera', n2(f.oferta) + ' UA'],
           [demandaLabel, n2(f.demandaDiseno) + ' UA']]
          .map(([t, v]) => `<div class="rounded-xl bg-clay-50 border border-clay-200 p-3">
            <p class="text-[11px] uppercase tracking-wide text-slate-500">${t}</p>
            <p class="text-lg font-bold tabular-nums">${v}</p></div>`).join('')}
        <div class="rounded-xl bg-brand-50 border border-brand-200 p-3">
          <p class="text-[11px] uppercase tracking-wide text-slate-500">${balanceLabel}</p>
          <p class="text-lg font-bold tabular-nums ${cls}">${n2(f.balance)} UA</p>
        </div>
      </div>
      ${pct > 0 ? `<p class="px-4 -mt-1 text-[11px] text-slate-500">Demanda base (sin margen): <b>${n2(f.demanda)} UA</b> · Balance sin margen (hoja original): <b>${n2(f.balanceSinMargen)} UA</b>. La demanda de diseño aplica un ${pct}% de holgura sobre la demanda base.</p>` : ''}`;
    return cards + t1;
  },

  instalaciones: () => {
    const rows = R.instalaciones;
    const t = table([
      { h: 'Instalación', f: (r) => r.nombre },
      { h: 'Categoría', f: (r) => r.cat || '—' },
      { h: 'Cantidad', f: (r) => (r.cant != null ? n0(r.cant) : '—') },
      { h: 'm² por unidad', f: (r) => n1(r.m2) },
      { h: 'Área (m²)', f: (r) => `<b>${n1(r.area)}</b>` }
    ], rows, ['Total', '', '', '', `<b>${n1(R.instTotal)}</b> m²`]);
    const card = `
      <div class="grid gap-3 sm:grid-cols-3 p-4">
        <div class="rounded-xl bg-brand-50 border border-brand-200 p-3">
          <p class="text-[11px] uppercase tracking-wide text-slate-500">Área construida total</p>
          <p class="text-lg font-bold tabular-nums">${n1(R.instTotal)} m²</p></div>
        <div class="rounded-xl bg-clay-50 border border-clay-200 p-3">
          <p class="text-[11px] uppercase tracking-wide text-slate-500">Número de instalaciones</p>
          <p class="text-lg font-bold tabular-nums">${n0(rows.length)}</p></div>
        <div class="rounded-xl bg-clay-50 border border-clay-200 p-3">
          <p class="text-[11px] uppercase tracking-wide text-slate-500">Dimensionamiento</p>
          <p class="text-sm text-slate-600">Según el lote anual de levante</p></div>
      </div>`;
    return card + t;
  },

  ingresos: () => table([
    { h: 'Año', f: (r) => r.anio },
    { h: 'Carne', f: (r) => money(r.carne) },
    { h: 'Total', f: (r) => `<b>${money(r.total)}</b>` }
  ], R.ingresos, ['Total', money(sum(R.ingresos, 'carne')), `<b>${money(sum(R.ingresos, 'total'))}</b>`])
};

/* ---------- Cuadro de producción (formato de la hoja original) ---------- */
function cuadroCarneHTML() {
  const body = R.produccion.map((r) => `<tr>
    <td>${r.anio}</td><td>${n0(r.bumautes)}</td><td>${n1(r.pesoProm)}</td><td class="hl">${n0(r.pesoKg)}</td></tr>`).join('');
  return `<p class="tbl-hint">Desliza la tabla horizontalmente si no ves todas las columnas →</p>
  <div class="tbl-wrap scroll-thin"><table class="tbl">
    <thead><tr>
      <th>AÑO</th><th>Bumautes de levante</th><th>Peso promedio (kg)</th><th class="hl">Bumautes peso (kg)</th>
    </tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><td>Total</td><td>${n0(sum(R.produccion, 'bumautes'))}</td><td>—</td><td class="hl">${n0(sum(R.produccion, 'pesoKg'))}</td></tr></tfoot>
  </table></div>`;
}

function miniKPI(el, items) {
  $(el).innerHTML = items.map((k) => `
    <div class="rounded-xl bg-clay-50 border border-clay-200 p-3">
      <p class="text-[11px] uppercase tracking-wide text-slate-500">${k.t}</p>
      <p class="text-lg font-bold tabular-nums">${k.v}</p>
      <p class="text-[11px] text-slate-500">${k.s || ''}</p>
    </div>`).join('');
}

function renderCuadros() {
  $('#cuadroCarne').innerHTML = cuadroCarneHTML();

  const kgTot = sum(R.produccion, 'pesoKg');
  const nTot = sum(R.produccion, 'bumautes');
  miniKPI('#kpiCarne', [
    { t: 'Kilogramos totales', v: n0(kgTot) + ' kg', s: 'Suma de los ' + P.years + ' años' },
    { t: 'Bumautes vendidos', v: n0(nTot), s: n0(R.produccion[0].bumautes) + ' por año' },
    { t: 'Peso por bumaute', v: n1(R.produccion[0].pesoProm) + ' kg', s: 'Peso promedio de venta' },
    { t: 'Kilogramos por año', v: n0(R.produccion[0].pesoKg) + ' kg', s: 'Producción anual estable' }
  ]);

  const labels = R.produccion.map((x) => 'Año ' + x.anio);
  const base = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } }
  };

  charts.carne?.destroy();
  charts.carne = new Chart($('#chCarne'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Bumautes peso (kg)', data: R.produccion.map((x) => x.pesoKg), backgroundColor: '#b98a5e' }] },
    options: { ...base, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: 'kg' } } } }
  });
}

function descargar(nombre, filas) {
  const csv = '\uFEFF' + filas.map((f) => f.join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function csvCarne() {
  const rows = R.produccion.map((r) => [r.anio, r.bumautes, r.pesoProm.toFixed(1), r.pesoKg.toFixed(1)]);
  descargar('produccion-bumautes-levante.csv', [
    ['Producción de bumautes de levante'],
    ['AÑO', 'Bumautes de levante', 'Peso promedio (kg)', 'Bumautes peso (kg)'],
    ...rows
  ]);
}

function renderTabs() {
  $$('#tabs .tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#panels').innerHTML = TABLES[tab]();
}

/* ---------- Exportar CSV completo ---------- */
function exportCSV() {
  const secciones = [
    ['MOVIMIENTO DEL LOTE',
      ['Año', 'Bucerros (compra)', 'Rebaño inicial', 'Mortalidad', 'Bumautes (venta)', 'U.A.'],
      R.rebano.map((r) => [r.anio, r.compras, r.rebInicial, r.mortalidad, r.ventas, r.ua.toFixed(2)])],
    ['PRODUCCIÓN DE BUMAUTES',
      ['Año', 'Bumautes de levante', 'Peso promedio (kg)', 'Bumautes peso (kg)'],
      R.produccion.map((r) => [r.anio, r.bumautes, r.pesoProm.toFixed(1), r.pesoKg.toFixed(1)])],
    ['BALANCE FORRAJERO',
      ['Área total (ha)', 'Oferta (UA)', 'Demanda base (UA)', 'Margen (%)', 'Demanda de diseño (UA)', 'Balance con margen (UA)', 'Balance sin margen (UA)'],
      [[R.forraje.areaTotal.toFixed(2), R.forraje.oferta.toFixed(2), R.forraje.demanda.toFixed(2), Math.round((R.forraje.margen||0)*100), R.forraje.demandaDiseno.toFixed(2), R.forraje.balance.toFixed(2), R.forraje.balanceSinMargen.toFixed(2)]]],
    ['INGRESOS',
      ['Año', 'Carne', 'Total'],
      R.ingresos.map((r) => [r.anio, r.carne.toFixed(0), r.total.toFixed(0)])]
  ];
  let csv = '\uFEFF';
  secciones.forEach(([t, h, rows]) => {
    csv += t + '\n' + h.join(';') + '\n' + rows.map((r) => r.join(';')).join('\n') + '\n\n';
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'proyeccion-bucerro-bumaute.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- Ciclo principal ---------- */
function render() {
  R = calcular(P);
  /*__SNAP__*/ try {
    var _sf = (R && R.forraje) || {}, _sm = 0;
    var _pk = function (a, kk) { (a || []).forEach(function (x) { if (x && typeof x[kk] === 'number' && x[kk] > _sm) _sm = x[kk]; }); };
    _pk(R.carne, 'kgTotal'); _pk(R.produccion, 'pesoKg'); if (_sm === 0) _pk(R.carne, 'total');
    localStorage.setItem('calc-snap-bucerro-bumaute', JSON.stringify({ area: +(_sf.areaTotal || 0), oferta: +(_sf.oferta || 0), demanda: +(_sf.demanda || 0), meat: +_sm, inst: +((R && R.instTotal) || 0) }));
  } catch (e) {} /*__ENDSNAP__*/
  renderKPIs();
  renderCharts();
  renderTabs();
  renderCuadros();
  save();
}

buildForraje();
fillInputs();
bindInputs();
render();
