/* =====================================================================
   Modelo determinístico de la Modalidad Caprina (Cabra–Cabritón)
   Réplica exacta de la hoja de cálculo original (5 años de proyección).
   Producción de carne (matadero) + leche/queso · balance forrajero ·
   instalaciones (incluye área láctea).
   ===================================================================== */

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function xRound(v) { return Math.round(num(v)); }   // ROUND de la hoja

const DEFAULTS = {
  compraCabras: 25,
  cabrasPorCabro: 20,     // relación de monta (D = ROUND(cabras/20))
  aniosUsoCabro: 5,       // vida útil del cabro (se vende al cumplirla)
  years: 5,
  // indicadores por año (año 1 = primer elemento). Valores en fracción.
  //  paric        : % de partos al año
  //  crias        : número de crías por cabra y año (1.5 partos × 1.5)
  //  mCabra       : mortalidad de cabras adultas
  //  mCabritona   : mortalidad de cabritonas (aplicada a las cabritas nacidas)
  //  mCabritos    : mortalidad de cabritos(as) — crías destetadas
  //  mCabro       : mortalidad de cabros (machos reproductores)
  //  descCabras   : descarte de cabras
  //  descCabritonas : descarte (venta) de cabritonas
  ind: [
    { paric: 0.75, crias: 2.25, mCabra: 0.04, mCabritona: 0.05, mCabritos: 0.06, mCabro: 0.03, descCabras: 0.10, descCabritonas: 0.80 },
    { paric: 0.75, crias: 2.25, mCabra: 0.03, mCabritona: 0.04, mCabritos: 0.05, mCabro: 0.03, descCabras: 0.10, descCabritonas: 0.80 },
    { paric: 0.75, crias: 2.25, mCabra: 0.03, mCabritona: 0.03, mCabritos: 0.04, mCabro: 0.02, descCabras: 0.10, descCabritonas: 0.80 },
    { paric: 0.75, crias: 2.25, mCabra: 0.02, mCabritona: 0.03, mCabritos: 0.03, mCabro: 0.02, descCabras: 0.10, descCabritonas: 0.80 },
    { paric: 0.75, crias: 2.25, mCabra: 0.02, mCabritona: 0.03, mCabritos: 0.03, mCabro: 0.02, descCabras: 0.10, descCabritonas: 0.80 }
  ],
  // % de crías hembra / macho (50/50 en la hoja)
  pctHembras: 0.5,
  // factores de conversión a Unidades Animales (UA = peso vivo / 450 kg)
  fc: { cabra: 0.1, cabro: 0.15, cabritones: 0.072, cabritonas: 0.066, cabritos: 0.026 },
  // pesos de venta a matadero (kg) = factor × 450
  pesoCabritones: 32.4,  // cabrito de engorde (macho) a matadero
  pesoCabritonas: 29.7,  // cabritona de descarte (hembra)
  pesoCabra: 45,         // cabra de descarte
  pesoCabro: 67.5,       // cabro de descarte
  // leche / queso
  leche: {
    nivel: 'bajo',
    bajo:  [0.5, 1.0, 1.5, 1.5, 1.5],   // lt/cabra/día por año
    medio: [1.5, 1.8, 2.0, 2.0, 2.0],
    alto:  [2.0, 2.5, 3.0, 3.5, 3.5]
  },
  lactancia: 120,          // días de lactancia
  litrosPorKgQueso: 5,
  destino: { queso: 100, leche: 0 },   // % de la producción
  forraje: [
    { tipo: 'Pasto Cultivado Secano', carga: 2, area: 1.6 },
    { tipo: 'Pasto Natural / Sabana', carga: 1, area: 0 },
    { tipo: 'Pasto de Corte', carga: 15, area: 0 },
    { tipo: 'Banco de Proteina', carga: 6, area: 0 }
  ],
  precios: { kgCarne: 0, kgQueso: 0, litroLeche: 0, moneda: '$' }
};

function calcular(p) {
  const N = Math.max(1, Math.round(num(p.years)) || 5);
  const ratio = Math.max(1, num(p.cabrasPorCabro) || 20);
  const usoCabro = Math.max(1, Math.round(num(p.aniosUsoCabro) || 5));
  const pctH = num(p.pctHembras) || 0.5;
  const pctM = 1 - pctH;

  const seed = {
    anio: 0, compraCabras: 0, compraCabros: 0, cabrasIni: 0, cabrosIni: 0,
    natCabritas: 0, natCabritos: 0,
    mortCabras: 0, mortCabritonas: 0, mortCabritas: 0, mortCabritos: 0, mortCabros: 0,
    ventaCabras: 0, ventaCabritonas: 0, ventaCabritones: 0, ventaCabros: 0,
    invCabras: 0, invCabritonas: 0, invCabros: 0, total: 0, ua: 0
  };

  const all = [seed];
  const r = [];

  for (let y = 1; y <= N; y++) {
    const ind = p.ind[Math.min(y - 1, p.ind.length - 1)];
    const prev = all[y - 1];
    const f = { anio: y };

    // cabras (rebo inicial)
    if (y === 1) {
      f.compraCabras = num(p.compraCabras);
      f.cabrasIni = f.compraCabras;            // E = R0 + S0 + C = 0 + 0 + compra
    } else {
      f.compraCabras = 0;
      f.cabrasIni = prev.invCabras + prev.invCabritonas;  // E = Rprev + Sprev
    }

    // cabros: compra = ROUND(cabras / ratio) ; inicial = compra + inv previo
    if (y === 1) {
      f.compraCabros = xRound(f.compraCabras / ratio);
    } else {
      f.compraCabros = xRound(f.cabrasIni / ratio);
    }
    f.cabrosIni = f.compraCabros + prev.invCabros;

    // nacimientos (50 % hembras / 50 % machos)
    const camada = f.cabrasIni * num(ind.paric) * num(ind.crias);
    f.natCabritas = xRound(camada * pctH);
    f.natCabritos = xRound(camada * pctM);

    // mortalidades (dos tasas paralelas sobre las cabritas nacidas)
    f.mortCabras = xRound(f.cabrasIni * num(ind.mCabra));
    f.mortCabritonas = xRound(f.natCabritas * num(ind.mCabritona));  // G * G%
    f.mortCabritas = xRound(f.natCabritas * num(ind.mCabritos));     // G * H%
    f.mortCabritos = xRound(f.natCabritos * num(ind.mCabritos));     // H * H%
    f.mortCabros = xRound(f.cabrosIni * num(ind.mCabro));

    // ventas
    f.ventaCabras = xRound(f.cabrasIni * num(ind.descCabras));                 // N = ROUND(E * J%)
    const hembrasVivas = f.natCabritas - f.mortCabritas - f.mortCabritonas;    // (G - K - J)
    f.ventaCabritonas = xRound(hembrasVivas * num(ind.descCabritonas));        // O = ROUND((G-K-J)*K%)
    f.ventaCabritones = f.natCabritos - f.mortCabritos;                        // P = H - L (todos a matadero)
    const idxCompra = y - usoCabro + 1;
    f.ventaCabros = (idxCompra >= 1) ? all[idxCompra].compraCabros : 0;        // Q (venta al cumplir vida útil)

    // inventario final
    f.invCabras = f.cabrasIni - f.mortCabras - f.ventaCabras;                  // R
    f.invCabritonas = f.natCabritas - f.mortCabritonas - f.mortCabritas - f.ventaCabritonas; // S
    f.invCabros = f.cabrosIni - f.mortCabros - f.ventaCabros;                  // T

    f.total = f.invCabras + f.invCabritonas + f.invCabros;                     // U
    f.ua = f.invCabras * num(p.fc.cabra) + f.invCabritonas * num(p.fc.cabritonas) +
           f.invCabros * num(p.fc.cabro);                                      // V

    all.push(f);
    r.push(f);
  }

  // carne (producción para matadero)
  const peso = {
    cabritones: num(p.pesoCabritones), cabritonas: num(p.pesoCabritonas),
    cabra: num(p.pesoCabra), cabro: num(p.pesoCabro)
  };
  const carne = r.map((f) => {
    const kgCabritones = f.ventaCabritones * peso.cabritones;
    const kgCabritonas = f.ventaCabritonas * peso.cabritonas;
    const kgCabras = f.ventaCabras * peso.cabra;
    const kgCabros = f.ventaCabros * peso.cabro;
    return {
      anio: f.anio,
      nCabritones: f.ventaCabritones, pCabritones: peso.cabritones, kgCabritones,
      nCabritonas: f.ventaCabritonas, pCabritonas: peso.cabritonas, kgCabritonas,
      nCabras: f.ventaCabras, pCabra: peso.cabra, kgCabras,
      nCabros: f.ventaCabros, pCabro: peso.cabro, kgCabros,
      kgTotal: kgCabritones + kgCabritonas + kgCabras + kgCabros
    };
  });

  // leche / queso
  const nivel = (p.leche && p.leche.nivel) || 'bajo';
  const serie = (p.leche && p.leche[nivel]) || [];
  const lact = num(p.lactancia) || 120;
  const lkg = num(p.litrosPorKgQueso) || 5;
  const qPct = num(p.destino.queso) / 100;
  const lPct = num(p.destino.leche) / 100;
  const leche = r.map((f, i) => {
    const nivelDia = num(serie[i]);
    const litros = f.invCabras * nivelDia * lact;        // R = Cabra inv final × lt/día × lactancia
    const litrosVenta = litros * lPct;
    const kgQueso = (litros / lkg) * qPct;
    return { anio: f.anio, cabrasOrdeno: f.invCabras, nivelDia, litros, litrosVenta, kgQueso };
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

  // instalaciones (dimensionadas al último año de la proyección, como en la hoja)
  const last = r[r.length - 1] || seed;
  const indLast = p.ind[Math.min(N - 1, p.ind.length - 1)];
  const cabraLactGest = xRound(last.cabrasIni * num(indLast.paric));   // D50 = ROUND(E37 * paric%)
  const cabraSeca = Math.max(0, last.cabrasIni - cabraLactGest);       // D51 = E37 - D50
  const cabritosEngorde = last.ventaCabritones;                        // D52 = C46 (= P37)
  const semental = last.cabrosIni;                                     // D53 = F37
  const parideras = cabraLactGest / 3;                                 // D54 = D50/3
  const cabritera = last.natCabritas + last.natCabritos;               // D55 = G37 + H37
  const corralManejo = last.total;                                     // D56 = U37
  const salaOrdeno = cabraLactGest / 3;                                // D57 = D50/3
  const corralEspera = cabraLactGest / 3;                              // D58 = D50/3

  const instBase = [
    { nombre: 'Aprisco techado', cat: 'Cabra en lactancia / gestante', cant: cabraLactGest, m2: 1.5 },
    { nombre: 'Aprisco techado', cat: 'Cabra seca / primas', cant: cabraSeca, m2: 1.4 },
    { nombre: 'Aprisco techado', cat: 'Cabritos en crecimiento / engorde', cant: cabritosEngorde, m2: 0.8 },
    { nombre: 'Aprisco techado', cat: 'Semental / macho reproductor', cant: semental, m2: 3 },
    { nombre: 'Parideras / maternidad', cat: 'Módulo individual (0 a 7 días)', cant: parideras, m2: 2 },
    { nombre: 'Cabritera (cunas / lactancia)', cat: 'Colectivo (lotes por edad)', cant: cabritera, m2: 0.5 },
    { nombre: 'Corral de manejo / manga', cat: 'Manejo general y triaje', cant: corralManejo, m2: 0.7 },
    { nombre: 'Sala de ordeño (1/3 cabras)', cat: 'Cabra en lactancia', cant: salaOrdeno, m2: 0.6 },
    { nombre: 'Corral de espera (1/3 cabras)', cat: 'Cabra en lactancia', cant: corralEspera, m2: 0.6 },
    { nombre: 'Cuarto de leche', cat: '', cant: null, m2: 25 },
    { nombre: 'Procesamiento lácteo', cat: '', cant: null, m2: 80 },
    { nombre: 'Procesamiento cárnico', cat: '', cant: null, m2: 80 },
    { nombre: 'Almacén de alimento', cat: '', cant: null, m2: 80 },
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
    const iCarne = carne[i].kgTotal * num(pr.kgCarne);
    const iQueso = leche[i].kgQueso * num(pr.kgQueso);
    const iLeche = leche[i].litrosVenta * num(pr.litroLeche);
    return { anio: f.anio, carne: iCarne, queso: iQueso, leche: iLeche, total: iCarne + iQueso + iLeche };
  });

  return { rebano: r, carne, leche, forraje, instalaciones, instTotal, ingresos, peso };
}

if (typeof module !== 'undefined') module.exports = { calcular, DEFAULTS, xRound };
