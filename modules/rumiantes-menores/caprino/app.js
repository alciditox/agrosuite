/* ===== Estado, UI y render — Modalidad Caprina (Cabra-Cabritón) ===== */
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

function save() { try { localStorage.setItem('calc-caprino-v1', JSON.stringify(P)); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem('calc-caprino-v1')); } catch (e) { return null; } }

/* ---------- Controles dinámicos ---------- */
const FC_LABELS = {
  cabra: 'Cabra', cabro: 'Cabro', cabritones: 'Cabritón (macho)',
  cabritonas: 'Cabritona (hembra retenida)', cabritos: 'Cabrito lactante'
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

/* columnas de indicadores: pct=true se edita como % ; los demás como número */
const IND_COLS = [
  ['paric', 'Partos/año', true],
  ['crias', 'Crías por cabra', false],
  ['descCabras', 'Descarte cabras', true],
  ['descCabritonas', 'Descarte cabritonas', true],
  ['mCabra', 'Mort. cabras', true],
  ['mCabritona', 'Mort. cabritonas', true],
  ['mCabritos', 'Mort. cabritos(as)', true],
  ['mCabro', 'Mort. cabros', true]
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
  $('#compraCabras').value = P.compraCabras;
  $('#cabrasPorCabro').value = P.cabrasPorCabro;
  $('#aniosUsoCabro').value = P.aniosUsoCabro;
  $('#years').value = P.years;
  $('#paricGlobal').value = Math.round((P.ind[0].paric || 0) * 100);
  $('#criasGlobal').value = P.ind[0].crias;
  $('#pctHembras').value = Math.round((P.pctHembras || 0.5) * 100);
  $('#nivel').value = P.leche.nivel;
  $('#lactancia').value = P.lactancia;
  $('#litrosPorKgQueso').value = P.litrosPorKgQueso;
  $('#destQueso').value = P.destino.queso;
  $('#destOut').textContent = `${P.destino.queso}% queso · ${100 - P.destino.queso}% leche`;
  $('#pesoCabritones').value = P.pesoCabritones;
  $('#pesoCabritonas').value = P.pesoCabritonas;
  $('#pesoCabra').value = P.pesoCabra;
  $('#pesoCabro').value = P.pesoCabro;
  $('#pCarne').value = P.precios.kgCarne;
  $('#pQueso').value = P.precios.kgQueso;
  $('#pLeche').value = P.precios.litroLeche;
  $$('[data-fc]').forEach((el) => { el.value = P.fc[el.dataset.fc]; });
  $$('[data-forr]').forEach((el) => { el.value = P.forraje[+el.dataset.i][el.dataset.forr]; });
  renderLecheGrids();
}

function renderLecheGrids() {
  ['bajo', 'medio', 'alto'].forEach((lvl) => {
    const box = document.querySelector(`[data-leche-grid="${lvl}"]`);
    if (!box) return;
    box.classList.toggle('hidden', lvl !== P.leche.nivel);
    const serie = P.leche[lvl] || [];
    box.innerHTML = serie.map((v, i) =>
      `<label class="field"><span class="text-[11px]">Año ${i + 1} · litros/cabra/día</span>` +
      `<input type="number" min="0" step="0.1" class="inp" data-leche-lvl="${lvl}" data-leche="${i}" value="${v}"></label>`
    ).join('');
  });
}

function bindInputs() {
  const map = {
    compraCabras: (v) => (P.compraCabras = Math.max(1, v)),
    cabrasPorCabro: (v) => (P.cabrasPorCabro = Math.max(1, v)),
    aniosUsoCabro: (v) => (P.aniosUsoCabro = Math.min(10, Math.max(1, v))),
    years: (v) => (P.years = Math.min(10, Math.max(1, v))),
    lactancia: (v) => (P.lactancia = Math.max(1, v)),
    litrosPorKgQueso: (v) => (P.litrosPorKgQueso = v || 5),
    pesoCabritones: (v) => (P.pesoCabritones = v),
    pesoCabritonas: (v) => (P.pesoCabritonas = v),
    pesoCabra: (v) => (P.pesoCabra = v),
    pesoCabro: (v) => (P.pesoCabro = v),
    pCarne: (v) => (P.precios.kgCarne = v),
    pQueso: (v) => (P.precios.kgQueso = v),
    pLeche: (v) => (P.precios.litroLeche = v)
  };
  Object.keys(map).forEach((id) => {
    $('#' + id).addEventListener('input', (e) => { map[id](+e.target.value || 0); render(); });
  });

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
  $('#pctHembras').addEventListener('input', (e) => {
    P.pctHembras = Math.min(1, Math.max(0, (+e.target.value || 0) / 100));
    render();
  });

  $('#nivel').addEventListener('change', (e) => {
    P.leche.nivel = e.target.value;
    renderLecheGrids();
    render();
  });

  $('#destQueso').addEventListener('input', (e) => {
    const q = +e.target.value;
    P.destino.queso = q;
    P.destino.leche = 100 - q;
    $('#destOut').textContent = `${q}% queso · ${100 - q}% leche`;
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
    else if (t.dataset.lecheLvl !== undefined && t.dataset.lecheLvl !== null && t.hasAttribute('data-leche-lvl')) {
      P.leche[t.dataset.lecheLvl][+t.dataset.leche] = +t.value || 0;
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
  $('#csvQueso').addEventListener('click', csvQueso);
}

/* ---------- KPIs ---------- */
function renderKPIs() {
  const last = R.rebano[R.rebano.length - 1];
  const kgCarne = sum(R.carne, 'kgTotal');
  const kgQueso = sum(R.leche, 'kgQueso');
  const litros = sum(R.leche, 'litros');
  const ing = sum(R.ingresos, 'total');
  const bal = R.forraje.balance;

  const items = [
    { t: 'Rebaño final (año ' + last.anio + ')', v: n0(last.total), s: n2(last.ua) + ' unidades animales' },
    { t: 'Carne acumulada', v: n0(kgCarne) + ' kg', s: 'Ventas a matadero (' + P.years + ' años)' },
    { t: 'Queso acumulado', v: n0(kgQueso) + ' kg', s: n0(litros) + ' litros producidos' },
    ing > 0
      ? { t: 'Ingresos acumulados', v: money(ing), s: 'Carne + leche/queso' }
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
      { label: 'Cabras', data: R.rebano.map((f) => f.invCabras), backgroundColor: '#1f7a50' },
      { label: 'Cabritonas (reposición)', data: R.rebano.map((f) => f.invCabritonas), backgroundColor: '#54b382' },
      { label: 'Cabros', data: R.rebano.map((f) => f.invCabros), backgroundColor: '#b98a5e' }
    ]
  };

  charts.hato?.destroy();
  charts.hato = new Chart($('#chHato'), {
    type: 'bar', data: stack,
    options: { ...base, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } } }
  });

  const prod = {
    labels,
    datasets: [
      { type: 'bar', label: 'Carne (kg)', data: R.carne.map((x) => x.kgTotal), backgroundColor: '#b98a5e', yAxisID: 'y' },
      { type: 'line', label: 'Queso (kg)', data: R.leche.map((x) => x.kgQueso), borderColor: '#1f7a50', backgroundColor: '#1f7a50', tension: .35, yAxisID: 'y1' }
    ]
  };
  charts.prod?.destroy();
  charts.prod = new Chart($('#chProd'), {
    data: prod,
    options: {
      ...base,
      scales: {
        x: { grid: { display: false } },
        y: { position: 'left', beginAtZero: true, title: { display: true, text: 'kg carne' } },
        y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'kg queso' } }
      }
    }
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
    { h: 'Compra cabras', f: (r) => n0(r.compraCabras) },
    { h: 'Compra cabros', f: (r) => n0(r.compraCabros) },
    { h: 'Cabras inicial', f: (r) => n0(r.cabrasIni) },
    { h: 'Cabros inicial', f: (r) => n0(r.cabrosIni) },
    { h: 'Nac. cabritas', f: (r) => n0(r.natCabritas) },
    { h: 'Nac. cabritos', f: (r) => n0(r.natCabritos) },
    { h: 'Mort. cabras', f: (r) => n0(r.mortCabras) },
    { h: 'Mort. cabritonas', f: (r) => n0(r.mortCabritonas) },
    { h: 'Mort. cabritas', f: (r) => n0(r.mortCabritas) },
    { h: 'Mort. cabritos', f: (r) => n0(r.mortCabritos) },
    { h: 'Mort. cabros', f: (r) => n0(r.mortCabros) },
    { h: 'Venta cabras', f: (r) => n0(r.ventaCabras) },
    { h: 'Venta cabritonas', f: (r) => n0(r.ventaCabritonas) },
    { h: 'Venta cabritones', f: (r) => n0(r.ventaCabritones) },
    { h: 'Venta cabros', f: (r) => n0(r.ventaCabros) },
    { h: 'Inv. cabras', f: (r) => n0(r.invCabras) },
    { h: 'Inv. cabritonas', f: (r) => n0(r.invCabritonas) },
    { h: 'Inv. cabros', f: (r) => n0(r.invCabros) },
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
      { h: 'Cantidad', f: (r) => (r.cant != null ? n1(r.cant) : '—') },
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
          <p class="text-sm text-slate-600">Según rebaño en régimen estabilizado (último año)</p></div>
      </div>`;
    return card + t;
  },

  ingresos: () => table([
    { h: 'Año', f: (r) => r.anio },
    { h: 'Carne', f: (r) => money(r.carne) },
    { h: 'Queso', f: (r) => money(r.queso) },
    { h: 'Leche', f: (r) => money(r.leche) },
    { h: 'Total', f: (r) => `<b>${money(r.total)}</b>` }
  ], R.ingresos, ['Total', money(sum(R.ingresos, 'carne')), money(sum(R.ingresos, 'queso')), money(sum(R.ingresos, 'leche')), `<b>${money(sum(R.ingresos, 'total'))}</b>`])
};

/* ---------- Cuadro de producción de carne (formato de la hoja) ---------- */
const CAT_CARNE = [
  { g: 'Cabritones de engorde', n: 'nCabritones', p: 'pCabritones', kg: 'kgCabritones', color: '#b98a5e' },
  { g: 'Cabritonas de descarte', n: 'nCabritonas', p: 'pCabritonas', kg: 'kgCabritonas', color: '#54b382' },
  { g: 'Cabras de descarte', n: 'nCabras', p: 'pCabra', kg: 'kgCabras', color: '#1f7a50' },
  { g: 'Cabros de descarte', n: 'nCabros', p: 'pCabro', kg: 'kgCabros', color: '#94a3b8' }
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

function cuadroQuesoHTML() {
  const body = R.leche.map((r) => `<tr>
    <td>${r.anio}</td><td>${n0(r.cabrasOrdeno)}</td><td>${n1(r.nivelDia)}</td><td>${n0(r.litros)}</td>
    <td>${n0(r.litrosVenta)}</td><td class="hl">${n1(r.kgQueso)}</td></tr>`).join('');
  return `<p class="tbl-hint">Desliza la tabla horizontalmente si no ves todas las columnas →</p>
  <div class="tbl-wrap scroll-thin"><table class="tbl">
    <thead><tr>
      <th>AÑO</th><th>Cabras en ordeño</th><th>Litros/cabra/día</th><th>Producción anual (litros leche/año)</th>
      <th>Litros de leche para la venta (l)</th><th class="hl">Kilogramos de queso para la venta (kg)</th>
    </tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><td>Total</td><td>—</td><td>—</td><td>${n0(sum(R.leche, 'litros'))}</td>
      <td>${n0(sum(R.leche, 'litrosVenta'))}</td><td class="hl">${n1(sum(R.leche, 'kgQueso'))}</td></tr></tfoot>
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
  $('#cuadroQueso').innerHTML = cuadroQuesoHTML();

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

  const lts = sum(R.leche, 'litros');
  const kgQ = sum(R.leche, 'kgQueso');
  const mejorQ = R.leche.reduce((a, x) => (x.kgQueso > a.kgQueso ? x : a), R.leche[0]);
  miniKPI('#kpiQueso', [
    { t: 'Litros producidos', v: n0(lts) + ' l', s: 'Lactancia de ' + n0(P.lactancia) + ' días' },
    { t: 'Queso para venta', v: n1(kgQ) + ' kg', s: n1(P.litrosPorKgQueso) + ' litros por kg' },
    { t: 'Leche vendida como leche', v: n0(sum(R.leche, 'litrosVenta')) + ' l', s: n0(P.destino.leche) + ' % de la producción' },
    { t: 'Mejor año de queso', v: 'Año ' + mejorQ.anio, s: n1(mejorQ.kgQueso) + ' kg' }
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

  charts.queso?.destroy();
  charts.queso = new Chart($('#chQueso'), {
    data: {
      labels: R.leche.map((x) => 'Año ' + x.anio),
      datasets: [
        { type: 'bar', label: 'Litros producidos', data: R.leche.map((x) => x.litros), backgroundColor: '#8ab0d0', yAxisID: 'y' },
        { type: 'line', label: 'Queso (kg)', data: R.leche.map((x) => x.kgQueso), borderColor: '#1f7a50', backgroundColor: '#1f7a50', tension: .35, yAxisID: 'y1' }
      ]
    },
    options: {
      ...base,
      scales: {
        x: { grid: { display: false } },
        y: { position: 'left', beginAtZero: true, title: { display: true, text: 'litros' } },
        y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'kg queso' } }
      }
    }
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
  descargar('produccion-carne-caprino.csv', [h1, h2, ...rows]);
}

function csvQueso() {
  const rows = R.leche.map((r) => [r.anio, r.cabrasOrdeno, r.nivelDia.toFixed(1), r.litros.toFixed(0), r.litrosVenta.toFixed(0), r.kgQueso.toFixed(1)]);
  descargar('produccion-leche-queso-caprino.csv', [
    ['Producción de leche / queso'],
    ['AÑO', 'Cabras en ordeño', 'Litros/cabra/día', 'Producción anual (litros leche/año)', 'Litros de leche para la venta (l)', 'Kilogramos de queso para la venta (kg)'],
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
    ['MOVIMIENTO DE REBAÑO',
      ['Año', 'Cabras inicial', 'Cabros inicial', 'Nac. cabritas', 'Nac. cabritos', 'Venta cabritones', 'Venta cabritonas', 'Venta cabras', 'Venta cabros', 'Inv. total', 'U.A.'],
      R.rebano.map((r) => [r.anio, r.cabrasIni, r.cabrosIni, r.natCabritas, r.natCabritos, r.ventaCabritones, r.ventaCabritonas, r.ventaCabras, r.ventaCabros, r.total, r.ua.toFixed(3)])],
    ['PRODUCCIÓN DE CARNE (kg)',
      ['Año', 'kg cabritones', 'kg cabritonas', 'kg cabras', 'kg cabros', 'kg totales'],
      R.carne.map((r) => [r.anio, r.kgCabritones.toFixed(1), r.kgCabritonas.toFixed(1), r.kgCabras.toFixed(1), r.kgCabros.toFixed(1), r.kgTotal.toFixed(1)])],
    ['PRODUCCIÓN DE LECHE / QUESO',
      ['Año', 'Litros producidos', 'Litros venta', 'kg queso'],
      R.leche.map((r) => [r.anio, r.litros.toFixed(0), r.litrosVenta.toFixed(0), r.kgQueso.toFixed(1)])],
    ['BALANCE FORRAJERO',
      ['Área total (ha)', 'Oferta (UA)', 'Demanda (UA)', 'Balance (UA)'],
      [[R.forraje.areaTotal.toFixed(2), R.forraje.oferta.toFixed(2), R.forraje.demanda.toFixed(3), R.forraje.balance.toFixed(3)]]],
    ['INGRESOS',
      ['Año', 'Carne', 'Queso', 'Leche', 'Total'],
      R.ingresos.map((r) => [r.anio, r.carne.toFixed(0), r.queso.toFixed(0), r.leche.toFixed(0), r.total.toFixed(0)])]
  ];
  let csv = '\uFEFF';
  secciones.forEach(([t, h, rows]) => {
    csv += t + '\n' + h.join(';') + '\n' + rows.map((r) => r.join(';')).join('\n') + '\n\n';
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'proyeccion-caprino.csv';
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
    localStorage.setItem('calc-snap-caprino', JSON.stringify({ area: +(_sf.areaTotal || 0), oferta: +(_sf.oferta || 0), demanda: +(_sf.demanda || 0), meat: +_sm, inst: +((R && R.instTotal) || 0) }));
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
