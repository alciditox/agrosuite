/* ===== Estado, UI y render — Modalidad Ovina (Oveja-Cordero) ===== */
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

function save() { try { localStorage.setItem('calc-ovino-v1', JSON.stringify(P)); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem('calc-ovino-v1')); } catch (e) { return null; } }

/* ---------- Controles dinámicos ---------- */
const FC_LABELS = {
  oveja: 'Oveja', carnero: 'Carnero', borrego: 'Borrego (macho)',
  borrega: 'Borrega (hembra retenida)', cordero: 'Cordero lactante'
};

function buildFactores() {
  const w = $('#fcWrap');
  w.innerHTML = Object.keys(FC_LABELS).map((k) => `
    <label class="field">
      <span class="text-[11px]">${FC_LABELS[k]} · UA</span>
      <input class="inp" type="number" step="0.001" min="0" data-fc="${k}">
    </label>`).join('');
}

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

/* columnas de indicadores: pct=true se muestra/edita como % ; los demás como número */
const IND_COLS = [
  ['paric', 'Pariciones/año', true],
  ['crias', 'Crías por oveja', false],
  ['descOveja', 'Descarte ovejas', true],
  ['descCorderas', 'Descarte corderas', true],
  ['mOveja', 'Mort. ovejas', true],
  ['mCordera', 'Mort. corderas', true],
  ['mBorrego', 'Mort. borregos/as', true],
  ['mCarnero', 'Mort. carneros', true]
];

function buildIndicadores() {
  const head = IND_COLS.map((c) => `<th>${c[1]}${c[2] ? ' (%)' : ''}</th>`).join('');
  const rows = P.ind.map((r, i) => `<tr><td>Año ${i + 1}</td>${
    IND_COLS.map((c) => {
      const val = c[2] ? Math.round(r[c[0]] * 100) : r[c[0]];
      const step = c[2] ? '1' : '0.05';
      return `<td><input class="inp text-right" type="number" step="${step}" min="0"
        data-ind="${c[0]}" data-i="${i}" data-pct="${c[2] ? 1 : 0}" value="${val}"></td>`;
    }).join('')
  }</tr>`).join('');
  $('#indWrap').innerHTML = `<table class="tbl"><thead><tr><th>Año</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------- Sincronizar inputs con el estado ---------- */
function fillInputs() {
  $('#compraOvejas').value = P.compraOvejas;
  $('#ovejasPorCarnero').value = P.ovejasPorCarnero;
  $('#carnerosPorAnio').value = P.carnerosPorAnio;
  $('#aniosUsoCarnero').value = P.aniosUsoCarnero;
  $('#years').value = P.years;
  $('#paricGlobal').value = Math.round((P.ind[0].paric || 0) * 100);
  $('#criasGlobal').value = P.ind[0].crias;
  $('#gestacionMeses').value = P.gestacionMeses;
  $('#pesoCordero').value = P.pesoCordero;
  $('#pesoCordera').value = P.pesoCordera;
  $('#pesoOveja').value = P.pesoOveja;
  $('#pesoCarnero').value = P.pesoCarnero;
  $('#pCarne').value = P.precios.kgCarne;
  $$('[data-fc]').forEach((el) => { el.value = P.fc[el.dataset.fc]; });
  $$('[data-forr]').forEach((el) => { el.value = P.forraje[+el.dataset.i][el.dataset.forr]; });
}

function bindInputs() {
  const map = {
    compraOvejas: (v) => (P.compraOvejas = Math.max(1, v)),
    ovejasPorCarnero: (v) => (P.ovejasPorCarnero = Math.max(1, v)),
    carnerosPorAnio: (v) => (P.carnerosPorAnio = Math.max(0, v)),
    aniosUsoCarnero: (v) => (P.aniosUsoCarnero = Math.min(10, Math.max(1, v))),
    years: (v) => (P.years = Math.min(10, Math.max(1, v))),
    gestacionMeses: (v) => (P.gestacionMeses = Math.max(1, v)),
    pesoCordero: (v) => (P.pesoCordero = v),
    pesoCordera: (v) => (P.pesoCordera = v),
    pesoOveja: (v) => (P.pesoOveja = v),
    pesoCarnero: (v) => (P.pesoCarnero = v),
    pCarne: (v) => (P.precios.kgCarne = v)
  };
  Object.keys(map).forEach((id) => {
    $('#' + id).addEventListener('input', (e) => { map[id](+e.target.value || 0); render(); });
  });

  // valores globales que se aplican a todos los años
  $('#paricGlobal').addEventListener('input', (e) => {
    const v = (+e.target.value || 0) / 100;
    P.ind.forEach((r) => (r.paric = v));
    render();
  });
  $('#criasGlobal').addEventListener('input', (e) => {
    const v = +e.target.value || 0;
    P.ind.forEach((r) => (r.crias = v));
    render();
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.fc) { P.fc[t.dataset.fc] = +t.value || 0; render(); }
    else if (t.dataset.forr) { P.forraje[+t.dataset.i][t.dataset.forr] = +t.value || 0; render(); }
    else if (t.dataset.ind) {
      const v = +t.value || 0;
      P.ind[+t.dataset.i][t.dataset.ind] = t.dataset.pct === '1' ? v / 100 : v;
      render();
    }
  });

  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    renderTabs();
  });

  $('#btn-ind').addEventListener('click', () => { buildIndicadores(); $('#modal').classList.remove('hidden'); });
  $('#modal').addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) $('#modal').classList.add('hidden'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#modal').classList.add('hidden'); });

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
  const last = R.rebano[R.rebano.length - 1];
  const kgCarne = sum(R.carne, 'kgTotal');
  const nVend = R.carne.reduce((a, c) => a + c.nCorderos + c.nCorderas + c.nOvejas + c.nCarneros, 0);
  const ing = sum(R.ingresos, 'total');
  const bal = R.forraje.balance;

  const items = [
    { t: 'Rebaño final (año ' + last.anio + ')', v: n0(last.total), s: n1(last.ua) + ' unidades animales' },
    { t: 'Carne acumulada', v: n0(kgCarne) + ' kg', s: 'Ventas a matadero (' + P.years + ' años)' },
    { t: 'Animales a matadero', v: n0(nVend), s: 'Corderos, corderas y descartes' },
    ing > 0
      ? { t: 'Ingresos acumulados', v: money(ing), s: 'Venta de carne en pie' }
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

  const stack = {
    labels,
    datasets: [
      { label: 'Ovejas', data: R.rebano.map((f) => f.invOvejas), backgroundColor: '#1f7a50' },
      { label: 'Corderas (reposición)', data: R.rebano.map((f) => f.invCorderas), backgroundColor: '#54b382' },
      { label: 'Carneros', data: R.rebano.map((f) => f.invCarneros), backgroundColor: '#b98a5e' }
    ]
  };

  charts.hato?.destroy();
  charts.hato = new Chart($('#chHato'), {
    type: 'bar', data: stack,
    options: { ...base, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } } }
  });

  charts.prod?.destroy();
  charts.prod = new Chart($('#chProd'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Carne a matadero (kg)', data: R.carne.map((x) => x.kgTotal), backgroundColor: '#b98a5e' }] },
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
    { h: 'Compra ovejas', f: (r) => n0(r.compraOvejas) },
    { h: 'Compra carneros', f: (r) => n0(r.compraCarneros) },
    { h: 'Ovejas inicial', f: (r) => n0(r.ovejasIni) },
    { h: 'Carneros inicial', f: (r) => n0(r.carnerosIni) },
    { h: 'Nat. hembras', f: (r) => n0(r.natHembras) },
    { h: 'Nat. machos', f: (r) => n0(r.natMachos) },
    { h: 'Mort. corderas', f: (r) => n0(r.mortCorderas) },
    { h: 'Mort. borregas', f: (r) => n0(r.mortBorregas) },
    { h: 'Mort. borregos', f: (r) => n0(r.mortBorregos) },
    { h: 'Mort. ovejas', f: (r) => n0(r.mortOvejas) },
    { h: 'Mort. carneros', f: (r) => n0(r.mortCarneros) },
    { h: 'Venta ovejas', f: (r) => n0(r.ventaOvejas) },
    { h: 'Venta corderas', f: (r) => n0(r.ventaCorderas) },
    { h: 'Venta corderos', f: (r) => n0(r.ventaCorderos) },
    { h: 'Venta carneros', f: (r) => n0(r.ventaCarneros) },
    { h: 'Inv. ovejas', f: (r) => n0(r.invOvejas) },
    { h: 'Inv. corderas', f: (r) => n0(r.invCorderas) },
    { h: 'Inv. carneros', f: (r) => n0(r.invCarneros) },
    { h: 'Total', f: (r) => `<b>${n0(r.total)}</b>` },
    { h: 'U.A.', f: (r) => n2(r.ua) }
  ], R.rebano),

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
    const cards = `
      <div class="grid gap-3 sm:grid-cols-4 p-4">
        ${[['Superficie total', n2(f.areaTotal) + ' ha'], ['Oferta forrajera', n2(f.oferta) + ' UA'],
           ['Demanda animal (año ' + f.anioRef + ', régimen estabilizado)', n2(f.demanda) + ' UA']]
          .map(([t, v]) => `<div class="rounded-xl bg-clay-50 border border-clay-200 p-3">
            <p class="text-[11px] uppercase tracking-wide text-slate-500">${t}</p>
            <p class="text-lg font-bold tabular-nums">${v}</p></div>`).join('')}
        <div class="rounded-xl bg-brand-50 border border-brand-200 p-3">
          <p class="text-[11px] uppercase tracking-wide text-slate-500">Balance de carga</p>
          <p class="text-lg font-bold tabular-nums ${cls}">${n2(f.balance)} UA</p>
        </div>
      </div>`;
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
          <p class="text-sm text-slate-600">Según rebaño en régimen estabilizado</p></div>
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
const CAT_CARNE = [
  { g: 'Corderos de engorde', n: 'nCorderos', p: 'pCordero', kg: 'kgCorderos', color: '#b98a5e' },
  { g: 'Corderas de descarte', n: 'nCorderas', p: 'pCordera', kg: 'kgCorderas', color: '#54b382' },
  { g: 'Ovejas de descarte', n: 'nOvejas', p: 'pOveja', kg: 'kgOvejas', color: '#1f7a50' },
  { g: 'Carneros de descarte', n: 'nCarneros', p: 'pCarnero', kg: 'kgCarneros', color: '#94a3b8' }
];

function cuadroCarneHTML() {
  const g1 = CAT_CARNE.map((c) => `<th colspan="3" class="grp">${c.g}</th>`).join('');
  const g2 = CAT_CARNE.map(() => '<th>Nº animales</th><th>Peso prom. (kg)</th><th>Total (kg)</th>').join('');
  const body = R.carne.map((r) => `<tr><td>${r.anio}</td>` +
    CAT_CARNE.map((c) => `<td>${n0(r[c.n])}</td><td>${n2(r[c.p])}</td><td>${n0(r[c.kg])}</td>`).join('') +
    `<td><b>${n0(r.kgTotal)}</b></td></tr>`).join('');
  const foot = '<tfoot><tr><td>Total</td>' +
    CAT_CARNE.map((c) => `<td>${n0(sum(R.carne, c.n))}</td><td>—</td><td>${n0(sum(R.carne, c.kg))}</td>`).join('') +
    `<td><b>${n0(sum(R.carne, 'kgTotal'))}</b></td></tr></tfoot>`;
  return `<p class="tbl-hint">Desliza la tabla horizontalmente para ver todas las categorías →</p>
  <div class="tbl-wrap scroll-thin"><table class="tbl tbl-grp tbl-carne">
    <thead>
      <tr><th rowspan="2">AÑO</th>${g1}<th rowspan="2">Kilogramos totales</th></tr>
      <tr>${g2}</tr>
    </thead>
    <tbody>${body}</tbody>${foot}
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

  const kgTot = sum(R.carne, 'kgTotal');
  const nTot = CAT_CARNE.reduce((a, c) => a + sum(R.carne, c.n), 0);
  const mejor = R.carne.reduce((a, x) => (x.kgTotal > a.kgTotal ? x : a), R.carne[0]);
  const mayorCat = CAT_CARNE.map((c) => ({ g: c.g, v: sum(R.carne, c.kg) })).sort((a, b) => b.v - a.v)[0];
  miniKPI('#kpiCarne', [
    { t: 'Kilogramos totales', v: n0(kgTot) + ' kg', s: 'Suma de los ' + P.years + ' años' },
    { t: 'Animales vendidos', v: n0(nTot), s: 'Engorde y descarte' },
    { t: 'Mejor año', v: 'Año ' + mejor.anio, s: n0(mejor.kgTotal) + ' kg' },
    { t: 'Categoría principal', v: mayorCat.g, s: n0(mayorCat.v) + ' kg (' + n1(kgTot ? (mayorCat.v / kgTot) * 100 : 0) + ' %)' }
  ]);

  const labels = R.carne.map((x) => 'Año ' + x.anio);
  const base = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } }
  };

  charts.carne?.destroy();
  charts.carne = new Chart($('#chCarne'), {
    type: 'bar',
    data: { labels, datasets: CAT_CARNE.map((c) => ({ label: c.g, data: R.carne.map((x) => x[c.kg]), backgroundColor: c.color })) },
    options: { ...base, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, title: { display: true, text: 'kg' } } } }
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
  const h1 = ['Producción de carne a matadero'];
  const h2 = ['AÑO'].concat(...CAT_CARNE.map((c) => [c.g, 'Peso promedio (kg)', 'Total (kg)'])).concat(['Kilogramos totales']);
  const rows = R.carne.map((r) => [r.anio].concat(...CAT_CARNE.map((c) => [r[c.n], r[c.p].toFixed(2), r[c.kg].toFixed(1)])).concat([r.kgTotal.toFixed(1)]));
  descargar('produccion-carne-ovino.csv', [h1, h2, ...rows]);
}

function renderTabs() {
  $$('#tabs .tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#panels').innerHTML = TABLES[tab]();
}

/* ---------- Exportar CSV completo ---------- */
function exportCSV() {
  const secciones = [
    ['MOVIMIENTO DE REBAÑO',
      ['Año', 'Ovejas inicial', 'Carneros inicial', 'Nat. hembras', 'Nat. machos', 'Venta corderos', 'Venta corderas', 'Venta ovejas', 'Venta carneros', 'Inv. total', 'U.A.'],
      R.rebano.map((r) => [r.anio, r.ovejasIni, r.carnerosIni, r.natHembras, r.natMachos, r.ventaCorderos, r.ventaCorderas, r.ventaOvejas, r.ventaCarneros, r.total, r.ua.toFixed(2)])],
    ['PRODUCCIÓN DE CARNE (kg)',
      ['Año', 'kg corderos', 'kg corderas', 'kg ovejas', 'kg carneros', 'kg totales'],
      R.carne.map((r) => [r.anio, r.kgCorderos.toFixed(1), r.kgCorderas.toFixed(1), r.kgOvejas.toFixed(1), r.kgCarneros.toFixed(1), r.kgTotal.toFixed(1)])],
    ['BALANCE FORRAJERO',
      ['Área total (ha)', 'Oferta (UA)', 'Demanda (UA)', 'Balance (UA)'],
      [[R.forraje.areaTotal.toFixed(2), R.forraje.oferta.toFixed(2), R.forraje.demanda.toFixed(2), R.forraje.balance.toFixed(2)]]],
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
  a.download = 'proyeccion-ovino.csv';
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
    localStorage.setItem('calc-snap-ovino', JSON.stringify({ area: +(_sf.areaTotal || 0), oferta: +(_sf.oferta || 0), demanda: +(_sf.demanda || 0), meat: +_sm, inst: +((R && R.instTotal) || 0) }));
  } catch (e) {} /*__ENDSNAP__*/
  renderKPIs();
  renderCharts();
  renderTabs();
  renderCuadros();
  save();
}

buildFactores();
buildForraje();
fillInputs();
bindInputs();
render();
