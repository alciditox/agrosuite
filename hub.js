/* ===== Panel Central de Calculadoras Agropecuarias · AgroSuite 360° ===== */

const CATS = [
  {
    id: 'bovino', titulo: 'Bovino', color: '#166534', chip: '#dcfce7', chipTxt: '#166534', ic: '🐂',
    items: [
      { k: 'vaca-becerro', t: 'Vaca – Becerro', d: 'Cría: nacimiento y destete del becerro.', path: 'modules/bovino/vaca-becerro/index.html' },
      { k: 'becerro-maute', t: 'Becerro – Maute', d: 'Levante temprano hasta la etapa de maute.', path: 'modules/bovino/becerro-maute/index.html' },
      { k: 'vaca-maute', t: 'Vaca – Maute', d: 'Cría y levante hasta maute en un solo módulo.', path: 'modules/bovino/vaca-maute/index.html' },
      { k: 'maute-novillo', t: 'Maute – Novillo', d: 'Levante del maute hasta novillo.', path: 'modules/bovino/maute-novillo/index.html' },
      { k: 'novillo-ceba', t: 'Novillo – Ceba', d: 'Ceba final del novillo para venta en pie.', path: 'modules/bovino/novillo-ceba/index.html' },
      { k: 'vaca-novillo', t: 'Vaca – Novillo (ciclo completo)', d: 'Ciclo integral: de la vaca al novillo cebado.', path: 'modules/bovino/vaca-novillo/index.html' }
    ]
  },
  {
    id: 'bufalino', titulo: 'Bufalino', color: '#7c3aed', chip: '#ede9fe', chipTxt: '#6d28d9', ic: '🐃',
    items: [
      { k: 'bufala-bucerro', t: 'Búfala – Bucerro', d: 'Cría: nacimiento y destete del bucerro.', path: 'modules/bufalino/bufala-bucerro/index.html' },
      { k: 'bucerro-bumaute', t: 'Bucerro – Bumaute', d: 'Levante temprano hasta bumaute.', path: 'modules/bufalino/bucerro-bumaute/index.html' },
      { k: 'bufala-bumaute', t: 'Búfala – Bumaute', d: 'Cría y levante hasta bumaute integrados.', path: 'modules/bufalino/bufala-bumaute/index.html' },
      { k: 'bumaute-bubillo', t: 'Bumaute – Bubillo', d: 'Levante del bumaute hasta bubillo.', path: 'modules/bufalino/bumaute-bubillo/index.html' },
      { k: 'bubillo-ceba', t: 'Bubillo – Ceba', d: 'Ceba final del bubillo para venta en pie.', path: 'modules/bufalino/bubillo-ceba/index.html' },
      { k: 'bufala-bubillo', t: 'Búfala – Bubillo (ciclo completo)', d: 'Ciclo integral: de la búfala al bubillo cebado.', path: 'modules/bufalino/bufala-bubillo/index.html' }
    ]
  },
  {
    id: 'menores', titulo: 'Pequeños Rumiantes', color: '#b45309', chip: '#fef3c7', chipTxt: '#b45309', ic: '🐐',
    items: [
      { k: 'ovino', t: 'Ovino', d: 'Producción ovina de carne y lana.', path: 'modules/rumiantes-menores/ovino/index.html' },
      { k: 'caprino', t: 'Caprino', d: 'Producción caprina de carne y leche.', path: 'modules/rumiantes-menores/caprino/index.html' }
    ]
  },
  {
    id: 'porcino', titulo: 'Porcino', color: '#db2777', chip: '#fce7f3', chipTxt: '#be185d', ic: '🐷',
    items: [
      { k: 'porcino-ciclo-completo-conc', t: 'Ciclo Completo · Concentrado', d: 'Planificación integral de cría, levante y engorde (105 kg) con 100% concentrado.', path: 'modules/porcino/ciclo-completo-concentrado.html' },
      { k: 'porcino-ciclo-completo-yuca', t: 'Ciclo Completo · Concentrado + Yuca', d: 'Ciclo integral porcino alternando concentrado con yuca forrajera para ahorro en costos.', path: 'modules/porcino/ciclo-completo-concentrado-yuca.html' },
      { k: 'porcino-cria-conc', t: 'Cría de Lechones · Concentrado', d: 'Fase reproductiva: partos, lechones destetados y reemplazos con concentrado.', path: 'modules/porcino/cria-lechones-concentrado.html' },
      { k: 'porcino-cria-yuca', t: 'Cría de Lechones · Concentrado + Yuca', d: 'Cría y reproducción porcina suplementada con ensilaje y raíz de yuca.', path: 'modules/porcino/cria-lechones-concentrado-yuca.html' },
      { k: 'porcino-engorde-conc', t: 'Ceba y Engorde · Concentrado', d: 'Engorde intensivo de cerdos para venta en pie con concentrado comercial.', path: 'modules/porcino/engorde-concentrado.html' },
      { k: 'porcino-engorde-yuca', t: 'Ceba y Engorde · Concentrado + Yuca', d: 'Engorde y finalización a mercado combinando concentrado con yuca.', path: 'modules/porcino/engorde-concentrado-yuca.html' }
    ]
  },
  {
    id: 'avicultura', titulo: 'Avicultura', color: '#2563eb', chip: '#dbeafe', chipTxt: '#1d4ed8', ic: '🐔',
    items: [
      { k: 'aves-ponedoras', t: 'Aves Ponedoras · Manejo General', d: 'Dimensionamiento de postura, curvas de postura, consumo de alimento y huevos.', path: 'modules/especies-menores/aves-ponedoras.html' },
      { k: 'ponedora-pastoreo', t: 'Ponedoras en Pastoreo', d: 'Sistema agroecológico semi-intensivo con acceso a pasturas y forraje verde.', path: 'modules/especies-menores/ponedora-pastoreo.html' },
      { k: 'ponedora-jaula', t: 'Ponedoras en Jaula', d: 'Sistema intensivo comercial en batería para alta producción de huevo.', path: 'modules/especies-menores/ponedora-jaula.html' },
      { k: 'gallinas-criollas', t: 'Gallinas Criollas / Campo', d: 'Producción de traspatio y campo: rusticidad, huevo criollo y carne.', path: 'modules/especies-menores/gallinas-criollas.html' },
      { k: 'pollo-engorde', t: 'Pollo de Engorde', d: 'Cálculo de lotes de broiler: conversión alimenticia, mortandad y carne.', path: 'modules/especies-menores/pollo-engorde.html' },
      { k: 'codornices', t: 'Codornices (Coturnicultura)', d: 'Producción coturnícola intensiva de huevo y carne con alta densidad.', path: 'modules/especies-menores/codornices.html' },
      { k: 'pato-pastoreo', t: 'Patos en Pastoreo / Forraje', d: 'Cría y engorde de patos aprovechando pastos y espejos de agua.', path: 'modules/especies-menores/pato-pastoreo.html' }
    ]
  },
  {
    id: 'alternativas', titulo: 'Acuicultura, Alternativos y Circular', color: '#059669', chip: '#d1fae5', chipTxt: '#047857', ic: '🌱',
    items: [
      { k: 'granja-circular', t: 'Granja Integrada y Economía Circular', d: 'Sinergias de ciclo cerrado: reciclaje de deyecciones, lombricultura y biofertilización.', path: 'modules/circular/index.html' },
      { k: 'piscicultura-laguna', t: 'Piscicultura en Laguna / Estanque', d: 'Cultivo semi-intensivo en estanques de tierra (alevines, biomasa, FCA y cosecha).', path: 'modules/especies-menores/piscicultura-laguna.html' },
      { k: 'piscicultura-tanques', t: 'Piscicultura en Tanques Geomembrana', d: 'Cultivo intensivo/super-intensivo con aireación y recambio de agua.', path: 'modules/especies-menores/piscicultura-tanques.html' },
      { k: 'apicultura', t: 'Apicultura (5 Núcleos & Subproductos)', d: 'Proyección apícola: colmenas, miel (botellas 750 ml), cera, polen y propóleo.', path: 'modules/especies-menores/apicultura.html' },
      { k: 'cunicultura', t: 'Cunicultura (Conejos)', d: 'Producción de conejos: madres, gazapos por camada y carne.', path: 'modules/especies-menores/cunicultura.html' },
      { k: 'lombricultura', t: 'Lombricultura (Humus & Lombriz)', d: 'Producción de abono orgánico sólido, lixiviado y biomasa de lombriz roja.', path: 'modules/especies-menores/lombricultura.html' }
    ]
  }
];

const byKey = {};
CATS.forEach((c) => c.items.forEach((i) => { byKey[i.k] = { ...i, cat: c }; }));
const total = Object.keys(byKey).length;

const MODULES_DATA = {
  'vaca-becerro': { area: 21.6, oferta: 43.2, demanda: 43.05, meat: 7270, inst: 1010.4 },
  'becerro-maute': { area: 3.4, oferta: 6.8, demanda: 6.58, meat: 2940, inst: 465 },
  'vaca-maute': { area: 23.25, oferta: 46.5, demanda: 46.35, meat: 7870, inst: 1010.4 },
  'maute-novillo': { area: 4.6, oferta: 9.2, demanda: 9, meat: 4050, inst: 472 },
  'novillo-ceba': { area: 5.1, oferta: 10.2, demanda: 10, meat: 4500, inst: 437 },
  'vaca-novillo': { area: 26.3, oferta: 52.6, demanda: 52.4, meat: 9400, inst: 1010.4 },
  'bufala-bucerro': { area: 27.5, oferta: 55, demanda: 54.76, meat: 9070, inst: 1120.4 },
  'bucerro-bumaute': { area: 3.9, oferta: 7.8, demanda: 7.56, meat: 3402, inst: 524 },
  'bufala-bumaute': { area: 29.75, oferta: 59.5, demanda: 59.26, meat: 9910, inst: 1120.4 },
  'bumaute-bubillo': { area: 4.8, oferta: 9.6, demanda: 9.36, meat: 4212, inst: 548 },
  'bubillo-ceba': { area: 5.45, oferta: 10.9, demanda: 10.7, meat: 4815, inst: 502 },
  'bufala-bubillo': { area: 33.1, oferta: 66.2, demanda: 65.98, meat: 11950, inst: 1123.4 },
  'ovino': { area: 1.96, oferta: 3.92, demanda: 3.762, meat: 1665, inst: 445.1 },
  'caprino': { area: 1.6, oferta: 3.2, demanda: 2.964, meat: 1296, inst: 546.5 }
};

let currentClimate = 'normal';
let margen = (() => {
  const v = parseFloat(localStorage.getItem('hub-margen-forrajero'));
  return Number.isFinite(v) && v >= 0 ? v : 15;
})();

const fmt = (n, d = 1) => new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n || 0);
const fmt0 = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

const $ = (s, r = document) => r.querySelector(s);
const frame = $('#frame');
const home = $('#home');
const topTitle = $('#topTitle');
const openBtn = $('#openBtn');

/* ---- Sidebar nav ---- */
function buildNav(filter = '') {
  const q = filter.trim().toLowerCase();
  const wrap = $('#navlist');
  wrap.innerHTML = '';
  const homeBtn = document.createElement('button');
  homeBtn.className = 'navitem' + (current ? '' : ' active');
  homeBtn.innerHTML = '<span class="dot"></span> Inicio / Todas (' + total + ')';
  homeBtn.addEventListener('click', () => showHome());
  wrap.appendChild(homeBtn);

  const manualBtn = document.createElement('button');
  manualBtn.className = 'navitem' + (current === '__manual__' ? ' active' : '');
  manualBtn.innerHTML = '<span class="dot"></span> 📘 Manual de uso';
  manualBtn.addEventListener('click', () => openManual());
  wrap.appendChild(manualBtn);

  CATS.forEach((c) => {
    const items = c.items.filter((i) => !q || i.t.toLowerCase().includes(q) || i.d.toLowerCase().includes(q) || c.titulo.toLowerCase().includes(q));
    if (!items.length) return;
    const t = document.createElement('div');
    t.className = 'grp__title';
    t.textContent = `${c.ic} ${c.titulo}`;
    wrap.appendChild(t);
    items.forEach((i) => {
      const b = document.createElement('button');
      b.className = 'navitem' + (current === i.k ? ' active' : '');
      b.style.setProperty('--c', c.color);
      b.innerHTML = `<span class="dot" style="color:${c.color}"></span><span>${i.t}</span>`;
      b.addEventListener('click', () => openCalc(i.k));
      wrap.appendChild(b);
    });
  });
}

/* ---- Home cards ---- */
function buildHome() {
  const c = $('#cats');
  c.innerHTML = '';
  CATS.forEach((cat) => {
    const sec = document.createElement('section');
    sec.className = 'cat';
    sec.innerHTML = `<h3><span class="bar" style="background:${cat.color}"></span>${cat.ic} ${cat.titulo} (${cat.items.length})</h3>`;
    const g = document.createElement('div');
    g.className = 'grid';
    cat.items.forEach((i) => {
      const card = document.createElement('button');
      card.className = 'card';
      card.innerHTML = `
        <div class="card__ic" style="background:${cat.chip};color:${cat.chipTxt}">${cat.ic}</div>
        <h4>${i.t}</h4>
        <p>${i.d}</p>
        <span class="tag" style="background:${cat.chip};color:${cat.chipTxt}">Abrir módulo →</span>`;
      card.addEventListener('click', () => openCalc(i.k));
      g.appendChild(card);
    });
    sec.appendChild(g);
    c.appendChild(sec);
  });
  if ($('#statTotal')) $('#statTotal').textContent = total;
  if ($('#statGrupos')) $('#statGrupos').textContent = CATS.length;
}

/* ---- Resumen global de indicadores ---- */
let sumFocus = '';
let sumTableOpen = true;

function modData(k) {
  const base = MODULES_DATA[k] || { area: 0, oferta: 0, demanda: 0, meat: 0, inst: 0 };
  let live = null;
  const storageKey = typeof AgroFarms !== 'undefined' ? AgroFarms.farmKey('calc-snap-' + k) : 'calc-snap-' + k;
  try { live = JSON.parse(localStorage.getItem(storageKey)); } catch (e) { live = null; }
  if (live && typeof live === 'object') {
    return {
      area: Number.isFinite(+live.area) ? +live.area : base.area,
      oferta: Number.isFinite(+live.oferta) ? +live.oferta : base.oferta,
      demanda: Number.isFinite(+live.demanda) ? +live.demanda : base.demanda,
      meat: Number.isFinite(+live.meat) ? +live.meat : base.meat,
      inst: Number.isFinite(+live.inst) ? +live.inst : base.inst,
      live: true
    };
  }
  return { ...base, live: false };
}

function computeRows() {
  const m = margen / 100;
  const rows = [];
  Object.keys(MODULES_DATA).forEach((k) => {
    const it = byKey[k];
    if (!it) return;
    const d = modData(k);
    const demM = d.demanda * (1 + m);
    const bal = d.oferta - demM;
    const avg = d.area > 0 ? d.oferta / d.area : 0;
    const req = avg > 0 ? demM / avg : 0;
    rows.push({ k, t: it.t, catId: it.cat.id, color: it.cat.color, cat: it.cat.titulo, live: d.live,
      area: d.area, oferta: d.oferta, demanda: d.demanda, meat: d.meat, inst: d.inst, avg, demM, bal, req });
  });
  return rows;
}

function totalsOf(rows) {
  const T = rows.reduce((a, r) => {
    a.area += r.area; a.oferta += r.oferta; a.dem += r.demanda; a.demM += r.demM;
    a.req += r.req; a.meat += r.meat; a.inst += r.inst; return a;
  }, { area: 0, oferta: 0, dem: 0, demM: 0, req: 0, meat: 0, inst: 0 });
  T.bal = T.oferta - T.demM;
  T.extra = Math.max(0, T.req - T.area);
  T.ok = T.bal >= 0;
  return T;
}

function buildSummary() {
  const allRows = computeRows();
  const anyLive = allRows.some((r) => r.live);

  const isGroup = sumFocus.indexOf('grp:') === 0;
  const groupId = isGroup ? sumFocus.slice(4) : null;
  const isModule = sumFocus && !isGroup && byKey[sumFocus];

  const scopeRows = isGroup ? allRows.filter((r) => r.catId === groupId)
    : isModule ? allRows.filter((r) => r.k === sumFocus)
    : allRows;
  const T = totalsOf(scopeRows);

  // Simulación climática (Fase 2)
  const climRes = typeof AgroAdvisor !== 'undefined'
    ? AgroAdvisor.simulateClimate(T, currentClimate)
    : { scenario: { name: 'Normal', icon: '☀️' }, balanceAjustado: T.bal, ofertaAjustada: T.oferta, ok: T.ok, deficitUA: 0 };

  const scopeName = isGroup ? (CATS.find((c) => c.id === groupId) || {}).titulo
    : isModule ? byKey[sumFocus].t : null;
  const kpiCtx = isGroup ? 'del grupo ' + scopeName
    : isModule ? 'del módulo ' + scopeName
    : 'de los ' + allRows.length + ' módulos forrajeros';

  const kpis = [
    { t: 'Área forrajera total', v: fmt(T.area) + ' ha', s: 'Superficie ' + kpiCtx },
    { t: 'Oferta forrajera base', v: fmt(T.oferta) + ' UA', s: 'Capacidad de sostenimiento' },
    { t: 'Oferta ajustada clima', v: fmt(climRes.ofertaAjustada) + ' UA', s: `${climRes.scenario.icon} ${climRes.scenario.name}` },
    { t: 'Demanda con margen', v: fmt(T.demM) + ' UA', s: 'Demanda ' + fmt(T.dem) + ' UA + ' + fmt0(margen) + '% margen' },
    { t: 'Balance climático', v: (climRes.ok ? '+' : '') + fmt(climRes.balanceAjustado) + ' UA', s: climRes.ok ? 'Superávit ecológico' : 'Déficit crítico', neg: !climRes.ok },
    { t: 'Producción de carne', v: fmt0(T.meat) + ' kg', s: 'Producción pico anual proyectada' },
    { t: 'Instalaciones', v: fmt0(T.inst) + ' m²', s: 'Superficie construida requerida' },
    { t: isGroup || isModule ? 'Módulos en el ámbito' : 'Módulos forrajeros', v: String(scopeRows.length), s: isGroup ? scopeName : isModule ? scopeName : 'Bovinos, Bufalinos y Ovinos/Caprinos' }
  ];

  $('#sumKpis').innerHTML = kpis.map((k) => `
    <div class="sumkpi${k.neg ? ' sumkpi--neg' : ''}">
      <p class="sumkpi__t">${k.t}</p>
      <p class="sumkpi__v">${k.v}</p>
      <p class="sumkpi__s">${k.s}</p>
    </div>`).join('');

  // Renderizar Gráficos Vectoriales (Fase 1)
  if (typeof AgroCharts !== 'undefined') {
    AgroCharts.renderGauge({
      container: $('#chartGauge'),
      value: climRes.balanceAjustado,
      min: -Math.max(30, Math.abs(climRes.balanceAjustado) * 1.5),
      max: Math.max(30, Math.abs(climRes.balanceAjustado) * 1.5),
      label: 'Balance Forrajero',
      units: 'UA',
      okThreshold: 0
    });

    AgroCharts.renderBarComparison({
      container: $('#chartBars'),
      categories: ['Oferta Clima', 'Demanda Base', 'Demanda +Margen'],
      series: [
        { name: 'Unidades Animales (UA)', color: climRes.ok ? '#166534' : '#dc2626', data: [climRes.ofertaAjustada, T.dem, T.demM] }
      ]
    });
  }

  // Renderizar Auditoría Zootécnica y Agronómica (Fase 2)
  if (typeof AgroAdvisor !== 'undefined' && $('#expertAudit')) {
    const findings = AgroAdvisor.auditPastoralSystem(T, climRes);
    $('#expertAudit').innerHTML = findings.map((f) => `
      <div class="audit-item audit-item--${f.type}">
        <div class="audit-badge">${f.badge}</div>
        <div class="audit-body">
          <h5>${f.title}</h5>
          <p>${f.desc}</p>
          <div class="audit-action"><strong>Recomendación:</strong> ${f.action}</div>
        </div>
      </div>
    `).join('');
  }

  // Controles
  const forageCats = CATS.filter((c) => c.items.some((i) => MODULES_DATA[i.k]));
  const grpOpts = '<optgroup label="Grupos forrajeros">' +
    forageCats.map((c) => `<option value="grp:${c.id}"${sumFocus === 'grp:' + c.id ? ' selected' : ''}>${c.ic} ${c.titulo} (grupo)</option>`).join('') +
    '</optgroup>';
  const modOpts = forageCats.map((c) => `<optgroup label="${c.titulo}">` +
    c.items.filter((i) => MODULES_DATA[i.k]).map((i) => `<option value="${i.k}"${sumFocus === i.k ? ' selected' : ''}>${i.t}</option>`).join('') +
    '</optgroup>').join('');
  const opts = '<option value="">Todos los módulos de pastoreo</option>' + grpOpts + modOpts;

  $('#sumControls').innerHTML = `
    <label class="sumsel"><span>Ver</span>
      <select id="sumSel">${opts}</select></label>
    <span class="sumlive ${anyLive ? 'on' : ''}"><span class="sumlive__dot"></span>${anyLive ? 'Reflejando cambios en vivo de las calculadoras' : 'Mostrando valores de referencia'}</span>
    <button class="sumbtn" id="sumRefresh" type="button">↻ Actualizar</button>`;
  $('#sumSel').addEventListener('change', (e) => { sumFocus = e.target.value; buildSummary(); });
  $('#sumRefresh').addEventListener('click', () => buildSummary());

  if (isModule) {
    const r = scopeRows[0];
    const ok = r.bal >= 0;
    const extra = Math.max(0, r.req - r.area);
    const cells = [
      ['Área forrajera', fmt(r.area) + ' ha'],
      ['Oferta forrajera', fmt(r.oferta) + ' UA'],
      ['Demanda base', fmt(r.demanda) + ' UA'],
      ['Demanda con margen (' + fmt0(margen) + '%)', fmt(r.demM) + ' UA'],
      ['Área requerida con margen', fmt(r.req) + ' ha' + (extra > 0.01 ? ' (+' + fmt(extra) + ' ha)' : '')],
      ['Producción de carne', fmt0(r.meat) + ' kg/año'],
      ['Instalaciones', fmt0(r.inst) + ' m²']
    ];
    $('#sumTable').innerHTML = `
      <div class="sumdetail">
        <div class="sumdetail__head">
          <span class="dot" style="background:${r.color}"></span>
          <div><h4>${r.t}</h4><p>${r.cat}${r.live ? ' · datos en vivo' : ' · valores de referencia'}</p></div>
          <span class="badge ${ok ? 'badge--ok' : 'badge--bad'}">${ok ? 'Superávit ' + fmt(r.bal) + ' UA' : 'Déficit ' + fmt(r.bal) + ' UA'}</span>
          <button class="sumbtn" data-open="${r.k}" type="button">Abrir calculadora →</button>
        </div>
        <div class="sumdetail__grid">
          ${cells.map(([t, v]) => `<div><p class="sumkpi__t">${t}</p><p class="sumdetail__v">${v}</p></div>`).join('')}
        </div>
      </div>`;
    $('#sumTable').querySelector('[data-open]').addEventListener('click', (e) => openCalc(e.currentTarget.dataset.open));
    return;
  }

  const groupsToShow = isGroup ? forageCats.filter((c) => c.id === groupId) : forageCats;
  const foldTitle = isGroup ? 'Detalle del grupo ' + scopeName + ' (' + scopeRows.length + ')'
    : 'Detalle por módulo y grupo forrajero (' + allRows.length + ')';

  const rowHtml = (r) => {
    const ok = r.bal >= 0;
    return `<tr>
      <td><button class="sumlink" data-open="${r.k}"><span class="dot" style="background:${r.color}"></span>${r.t}${r.live ? '<em class="livedot" title="Datos en vivo"></em>' : ''}</button></td>
      <td class="r">${fmt(r.area)}</td>
      <td class="r">${fmt(r.oferta)}</td>
      <td class="r">${fmt(r.demanda)}</td>
      <td class="r"><b>${fmt(r.demM)}</b></td>
      <td class="r">${fmt(r.req)}</td>
      <td class="r ${ok ? 'pos' : 'neg'}">${ok ? '+' : ''}${fmt(r.bal)}</td>
      <td class="c"><span class="badge ${ok ? 'badge--ok' : 'badge--bad'}">${ok ? 'Superávit' : 'Déficit'}</span></td>
    </tr>`;
  };

  const bodySections = groupsToShow.map((c) => {
    const gr = allRows.filter((r) => r.catId === c.id);
    if (!gr.length) return '';
    const gt = totalsOf(gr);
    return `
      <tr class="sumgrp"><td colspan="8"><span class="dot" style="background:${c.color}"></span>${c.ic} ${c.titulo}</td></tr>
      ${gr.map(rowHtml).join('')}
      <tr class="sumsub">
        <td>Subtotal ${c.titulo}</td>
        <td class="r">${fmt(gt.area)}</td><td class="r">${fmt(gt.oferta)}</td>
        <td class="r">${fmt(gt.dem)}</td><td class="r"><b>${fmt(gt.demM)}</b></td>
        <td class="r">${fmt(gt.req)}</td>
        <td class="r ${gt.ok ? 'pos' : 'neg'}">${gt.ok ? '+' : ''}${fmt(gt.bal)}</td><td></td>
      </tr>`;
  }).join('');

  $('#sumTable').innerHTML = `
    <details class="sumfold"${sumTableOpen ? ' open' : ''}>
      <summary>${foldTitle} — desplegar / contraer</summary>
      <div class="sumtbl-wrap">
        <table class="sumtbl">
          <thead><tr>
            <th>Módulo</th><th class="r">Área (ha)</th><th class="r">Oferta (UA)</th>
            <th class="r">Demanda (UA)</th><th class="r">Demanda +margen (UA)</th>
            <th class="r">Área requerida (ha)</th><th class="r">Balance (UA)</th><th class="c">Estado</th>
          </tr></thead>
          <tbody>${bodySections}</tbody>
          <tfoot><tr>
            <td>${isGroup ? 'Total ' + scopeName : 'Total general'}</td><td class="r">${fmt(T.area)}</td><td class="r">${fmt(T.oferta)}</td>
            <td class="r">${fmt(T.dem)}</td><td class="r"><b>${fmt(T.demM)}</b></td>
            <td class="r">${fmt(T.req)}</td>
            <td class="r ${T.ok ? 'pos' : 'neg'}">${T.ok ? '+' : ''}${fmt(T.bal)}</td><td></td>
          </tr></tfoot>
        </table>
      </div>
    </details>
    <p class="sumnote">UA = Unidades Animales. El balance considera el margen (${fmt0(margen)}%) y el estrés hídrico seleccionado. El punto verde indica datos modificados en las calculadoras de la finca activa.</p>`;

  const det = $('#sumTable .sumfold');
  if (det) det.addEventListener('toggle', () => { sumTableOpen = det.open; });
  $('#sumTable').querySelectorAll('[data-open]').forEach((b) => {
    b.addEventListener('click', () => openCalc(b.dataset.open));
  });
}

/* ---- Gestión Multi-Predio & Respaldo (Fase 3) ---- */
function initFarmsUI() {
  if (typeof AgroFarms === 'undefined') return;
  const sel = $('#farmSelect');
  if (!sel) return;

  function refreshList() {
    const list = AgroFarms.getFarms();
    const active = AgroFarms.getActiveFarmId();
    sel.innerHTML = list.map((f) => `<option value="${f.id}"${f.id === active ? ' selected' : ''}>${f.name}</option>`).join('');
  }

  refreshList();
  sel.addEventListener('change', (e) => {
    AgroFarms.setActiveFarmId(e.target.value);
    buildSummary();
  });

  $('#btnAddFarm').addEventListener('click', () => {
    const name = prompt('Ingrese el nombre del nuevo predio o hacienda:');
    if (name && name.trim()) {
      AgroFarms.addFarm(name.trim());
      refreshList();
      buildSummary();
    }
  });

  $('#btnBackup').addEventListener('click', () => {
    AgroFarms.exportBackup();
  });

  $('#btnRestore').addEventListener('click', () => {
    $('#fileRestore').click();
  });

  $('#fileRestore').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = AgroFarms.importBackup(evt.target.result);
      if (res.ok) {
        alert(`Respaldo restaurado exitosamente (${res.count} registros).`);
        refreshList();
        buildSummary();
      } else {
        alert('Error al restaurar respaldo: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  $('#btnPrintDossier').addEventListener('click', () => {
    window.print();
  });

  window.addEventListener('farmchange', () => {
    refreshList();
    buildSummary();
  });
}

/* ---- Navegación ---- */
let current = null;
function openCalc(k) {
  const it = byKey[k];
  if (!it) return;
  current = k;
  frame.src = it.path;
  frame.classList.remove('hidden');
  home.classList.add('hidden');
  topTitle.innerHTML = `${it.t}<small>${it.cat.ic} ${it.cat.titulo}</small>`;
  openBtn.href = it.path;
  openBtn.classList.remove('hidden');
  location.hash = k;
  buildNav($('#search').value);
  if (window.innerWidth <= 720) $('#side').classList.add('collapsed');
}

function showHome() {
  current = null;
  frame.classList.add('hidden');
  frame.src = 'about:blank';
  home.classList.remove('hidden');
  topTitle.innerHTML = 'Panel de calculadoras<small>Selecciona un módulo para empezar</small>';
  openBtn.classList.add('hidden');
  location.hash = '';
  buildNav($('#search').value);
  buildSummary();
}

function openManual() {
  current = '__manual__';
  frame.src = 'manual.html';
  frame.classList.remove('hidden');
  home.classList.add('hidden');
  topTitle.innerHTML = 'Manual de uso<small>Guía del sistema de calculadoras ganaderas</small>';
  openBtn.href = 'manual.html';
  openBtn.classList.remove('hidden');
  location.hash = 'manual';
  buildNav($('#search').value);
  if (window.innerWidth <= 720) $('#side').classList.add('collapsed');
}

/* ---- Eventos ---- */
$('#toggle').addEventListener('click', () => $('#side').classList.toggle('collapsed'));
$('#search').addEventListener('input', (e) => buildNav(e.target.value));
$('#brandHome').addEventListener('click', showHome);

$('#climateSelect').addEventListener('change', (e) => {
  currentClimate = e.target.value;
  buildSummary();
});

$('#margen').value = margen;
$('#margen').addEventListener('input', (e) => {
  let v = parseFloat(e.target.value);
  if (!Number.isFinite(v) || v < 0) v = 0;
  if (v > 100) v = 100;
  margen = v;
  localStorage.setItem('hub-margen-forrajero', String(margen));
  buildSummary();
});

initFarmsUI();
buildHome();
buildSummary();
buildNav();

/* ---- Actualización reactiva ---- */
window.addEventListener('storage', (e) => {
  if (!e.key || e.key.indexOf('calc-snap-') >= 0 || e.key.indexOf('calc-') >= 0) buildSummary();
});
window.addEventListener('focus', () => buildSummary());
document.addEventListener('visibilitychange', () => { if (!document.hidden) buildSummary(); });

function snapFingerprint() {
  let s = margen + '|' + currentClimate + '|' + (typeof AgroFarms !== 'undefined' ? AgroFarms.getActiveFarmId() : '') + '|';
  Object.keys(MODULES_DATA).forEach((k) => {
    const key = typeof AgroFarms !== 'undefined' ? AgroFarms.farmKey('calc-snap-' + k) : 'calc-snap-' + k;
    s += k + '=' + (localStorage.getItem(key) || '') + ';';
  });
  return s;
}
let _snapFp = snapFingerprint();
setInterval(() => {
  const fp = snapFingerprint();
  if (fp !== _snapFp) { _snapFp = fp; buildSummary(); }
}, 1000);

const init = location.hash.replace('#', '');
if (init === 'manual') openManual();
else if (init && byKey[init]) openCalc(init);
else showHome();
