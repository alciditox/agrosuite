/* =====================================================================
   Modelo determinístico de la Modalidad Ovina (Oveja–Cordero)
   Réplica exacta de la hoja de cálculo original (5 años de proyección).
   Producción de carne (matadero) · balance forrajero · instalaciones.
   ===================================================================== */

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function xRound(v) { return Math.round(num(v)); }   // ROUND de la hoja (medios hacia arriba)

/* Parámetros por defecto tomados de la hoja de cálculo */
const DEFAULTS = {
  compraOvejas: 25,
  ovejasPorCarnero: 25,   // relación de monta (para el carnero inicial)
  carnerosPorAnio: 1,     // carneros de reposición comprados cada año
  aniosUsoCarnero: 5,     // vida útil del carnero (se vende al cumplirla)
  gestacionMeses: 5,      // usado para dimensionar las parideras
  years: 5,
  // indicadores por año (año 1 = primer elemento)
  //  paric     : % de pariciones al año (ovejas que paren)
  //  crias     : número de crías por oveja y año (1.5 partos × 1.5 crías)
  //  mOveja    : mortalidad de ovejas
  //  mCordera  : mortalidad de corderas (crías hembra)
  //  mBorrego  : mortalidad de borregos/as (crías destetadas)
  //  mCarnero  : mortalidad de carneros
  //  descOveja : descarte de ovejas
  //  descCorderas : descarte (venta) de corderas/borregas
  ind: [
    { paric: 0.75, crias: 2.25, mOveja: 0.04, mCordera: 0.05, mBorrego: 0.06, mCarnero: 0.03, descOveja: 0.10, descCorderas: 0.80 },
    { paric: 0.75, crias: 2.25, mOveja: 0.03, mCordera: 0.04, mBorrego: 0.05, mCarnero: 0.03, descOveja: 0.10, descCorderas: 0.80 },
    { paric: 0.75, crias: 2.25, mOveja: 0.03, mCordera: 0.03, mBorrego: 0.04, mCarnero: 0.02, descOveja: 0.10, descCorderas: 0.80 },
    { paric: 0.75, crias: 2.25, mOveja: 0.02, mCordera: 0.03, mBorrego: 0.03, mCarnero: 0.02, descOveja: 0.10, descCorderas: 0.80 },
    { paric: 0.75, crias: 2.25, mOveja: 0.02, mCordera: 0.03, mBorrego: 0.03, mCarnero: 0.02, descOveja: 0.10, descCorderas: 0.80 }
  ],
  // factores de conversión a Unidades Animales (UA = peso vivo / 450 kg)
  fc: { oveja: 0.13, carnero: 0.18, borrego: 0.098, borrega: 0.078, cordero: 0.0325 },
  // pesos de venta a matadero (kg)
  pesoCordero: 44.1,  // cordero de engorde (macho) vendido como borrego
  pesoCordera: 35.1,  // cordera/borrega de descarte (hembra)
  pesoOveja: 58.5,    // oveja de descarte
  pesoCarnero: 81,    // carnero de descarte
  forraje: [
    { tipo: 'Pasto Cultivado Secano', carga: 2, area: 1.96 },
    { tipo: 'Pasto Natural / Sabana', carga: 1, area: 0 },
    { tipo: 'Pasto de Corte', carga: 15, area: 0 },
    { tipo: 'Banco de Proteína', carga: 6, area: 0 }
  ],
  precios: { kgCarne: 0, moneda: '$' }
};

/* ---- Núcleo de cálculo: movimiento de rebaño y carne ---- */
function calcular(p) {
  const N = Math.max(1, Math.round(num(p.years)) || 5);
  const opc = num(p.ovejasPorCarnero) || 25;
  const usoCarnero = Math.max(1, Math.round(num(p.aniosUsoCarnero) || 5));
  const compraCarneroAnual = Math.max(0, Math.round(num(p.carnerosPorAnio)));

  // Semilla año 0 (todo en cero, como en la hoja original)
  const seed = {
    anio: 0, compraOvejas: 0, compraCarneros: 0, ovejasIni: 0, carnerosIni: 0,
    natHembras: 0, natMachos: 0,
    mortOvejas: 0, mortCorderas: 0, mortBorregas: 0, mortBorregos: 0, mortCarneros: 0,
    ventaOvejas: 0, ventaCorderas: 0, ventaCorderos: 0, ventaCarneros: 0,
    invOvejas: 0, invCorderas: 0, invCarneros: 0, total: 0, ua: 0
  };

  const all = [seed];
  const r = [];

  for (let y = 1; y <= N; y++) {
    const ind = p.ind[Math.min(y - 1, p.ind.length - 1)];
    const prev = all[y - 1];
    const f = { anio: y };

    // rebaño inicial de ovejas
    if (y === 1) {
      f.compraOvejas = num(p.compraOvejas);
      f.ovejasIni = f.compraOvejas;
    } else {
      f.compraOvejas = 0;
      f.ovejasIni = prev.invOvejas + prev.invCorderas; // reposición con corderas retenidas
    }

    // carneros: 1 inicial y reposición anual, con venta al cumplir su vida útil
    if (y === 1) {
      f.compraCarneros = xRound(f.ovejasIni / opc) || 1;
      f.carnerosIni = f.compraCarneros;
    } else {
      f.compraCarneros = compraCarneroAnual;
      f.carnerosIni = prev.invCarneros + f.compraCarneros;
    }

    // natalidad (50 % hembras / 50 % machos)
    const camada = f.ovejasIni * num(ind.paric) * num(ind.crias);
    f.natHembras = xRound(camada * 0.5);
    f.natMachos = xRound(camada * 0.5);

    // mortalidad de hembras: corderas y luego borregas (dos etapas)
    f.mortCorderas = xRound(f.natHembras * num(ind.mCordera));
    const hembrasTrasCordera = f.natHembras - f.mortCorderas;
    f.mortBorregas = xRound(hembrasTrasCordera * num(ind.mBorrego));
    const hembrasVivas = f.natHembras - f.mortCorderas - f.mortBorregas;
    // mortalidad de machos (borregos)
    f.mortBorregos = xRound(f.natMachos * num(ind.mBorrego));
    const machosVivos = f.natMachos - f.mortBorregos;
    // mortalidad de adultos
    f.mortOvejas = xRound(f.ovejasIni * num(ind.mOveja));
    f.mortCarneros = xRound(f.carnerosIni * num(ind.mCarnero));

    // ventas
    f.ventaOvejas = xRound(f.ovejasIni * num(ind.descOveja));          // descarte de ovejas
    f.ventaCorderas = xRound(hembrasVivas * num(ind.descCorderas));    // venta de corderas/borregas
    f.ventaCorderos = machosVivos;                                    // todos los machos a matadero
    const idxCompra = y - usoCarnero + 1;
    f.ventaCarneros = (idxCompra >= 1) ? all[idxCompra].compraCarneros : 0;

    // inventario final
    f.invOvejas = f.ovejasIni - f.mortOvejas - f.ventaOvejas;
    f.invCorderas = hembrasVivas - f.ventaCorderas;                   // hembras de reposición
    f.invCarneros = f.carnerosIni - f.mortCarneros - f.ventaCarneros;

    f.total = f.invOvejas + f.invCorderas + f.invCarneros;
    // las corderas retenidas se valoran a factor de borrega (0.078)
    f.ua = f.invOvejas * num(p.fc.oveja) + f.invCarneros * num(p.fc.carnero) +
           f.invCorderas * num(p.fc.borrega);

    all.push(f);
    r.push(f);
  }

  // carne (producción para matadero)
  const peso = {
    cordero: num(p.pesoCordero), cordera: num(p.pesoCordera),
    oveja: num(p.pesoOveja), carnero: num(p.pesoCarnero)
  };
  const carne = r.map((f) => {
    const kgCorderos = f.ventaCorderos * peso.cordero;
    const kgCorderas = f.ventaCorderas * peso.cordera;
    const kgOvejas = f.ventaOvejas * peso.oveja;
    const kgCarneros = f.ventaCarneros * peso.carnero;
    return {
      anio: f.anio,
      nCorderos: f.ventaCorderos, pCordero: peso.cordero, kgCorderos,
      nCorderas: f.ventaCorderas, pCordera: peso.cordera, kgCorderas,
      nOvejas: f.ventaOvejas, pOveja: peso.oveja, kgOvejas,
      nCarneros: f.ventaCarneros, pCarnero: peso.carnero, kgCarneros,
      kgTotal: kgCorderos + kgCorderas + kgOvejas + kgCarneros
    };
  });

  // balance forrajero (demanda = UA del último año, régimen estabilizado)
  const areaTotal = p.forraje.reduce((a, x) => a + num(x.area), 0);
  const oferta = p.forraje.reduce((a, x) => a + num(x.carga) * num(x.area), 0);
  const idxRef = r.length - 1;
  const demanda = r.length ? r[idxRef].ua : 0;
  const anioRef = r.length ? r[idxRef].anio : 0;
  let anioPico = anioRef, uaPico = 0;
  r.forEach((f) => { if (f.ua > uaPico) { uaPico = f.ua; anioPico = f.anio; } });
  const forraje = { areaTotal, oferta, demanda, anioRef, anioPico, uaPico, balance: oferta - demanda };

  // instalaciones (dimensionadas al régimen estabilizado / pico del rebaño)
  const maxInv = (k) => r.reduce((m, f) => Math.max(m, f[k] || 0), 0);
  const indRef = p.ind[Math.min(N - 1, p.ind.length - 1)];
  const ovejasRef = maxInv('invOvejas');
  const ovejaConCordero = xRound(ovejasRef * num(indRef.paric));
  const ovejaGestanteSeca = Math.max(0, ovejasRef - ovejaConCordero);
  const corderosEngorde = maxInv('natHembras') + maxInv('natMachos');
  const sementales = maxInv('carnerosIni');
  const parideras = xRound(ovejaConCordero * num(p.gestacionMeses) / 12);
  const corralManejo = maxInv('total');

  const instBase = [
    { nombre: 'Aprisco — oveja gestante / seca', cat: 'Oveja gestante / seca', cant: ovejaGestanteSeca, m2: 1.8 },
    { nombre: 'Aprisco — oveja con cordero', cat: 'Oveja con cordero (lactancia)', cant: ovejaConCordero, m2: 2.2 },
    { nombre: 'Aprisco — corderos destetados', cat: 'Corderos destetados / engorde', cant: corderosEngorde, m2: 0.8 },
    { nombre: 'Aprisco — sementales', cat: 'Sementales / carneros', cant: sementales, m2: 3.5 },
    { nombre: 'Parideras (maternidad)', cat: 'Paridera individual', cant: parideras, m2: 2.5 },
    { nombre: 'Corral de manejo / manga', cat: 'Manejo general y triaje', cant: corralManejo, m2: 0.7 },
    { nombre: 'Almacén de alimento', cat: '', cant: null, m2: 80 },
    { nombre: 'Procesamiento cárnico', cat: '', cant: null, m2: 80 },
    { nombre: 'Depósito de medicamentos', cat: '', cant: null, m2: 12 },
    { nombre: 'Depósito de insumos', cat: '', cant: null, m2: 80 },
    { nombre: 'Maquinaria y equipos', cat: '', cant: null, m2: 60 }
  ];
  const instalaciones = instBase.map((x) => ({
    ...x, area: (x.cant != null) ? x.cant * x.m2 : x.m2
  }));
  const instTotal = instalaciones.reduce((a, x) => a + x.area, 0);

  // ingresos (opcional)
  const pr = p.precios || {};
  const ingresos = r.map((f, i) => {
    const total = carne[i].kgTotal * num(pr.kgCarne);
    return { anio: f.anio, carne: total, total };
  });

  return { rebano: r, carne, forraje, instalaciones, instTotal, ingresos, peso };
}

if (typeof module !== 'undefined') module.exports = { calcular, DEFAULTS, xRound };
