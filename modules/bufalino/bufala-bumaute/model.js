/* ===== Modelo ganadero bovino – Modalidad Vaca–Maute =====
   Réplica de la hoja de cálculo “Modalidad_vaca_maute”.

   Lógica de la modalidad:
   - Los machos NO se venden al destete: se levantan un año más y se
     venden como “mautes de levante” (peso fijo editable, 210 kg por
     defecto).
   - Las hembras siguen el ciclo becerra → mauta → novilla → vaca.
   - Los toros reproductores se usan 5 años y luego se venden (descarte de
     toros “a los 5 años de uso”).
   - Unidades animales según los factores de conversión del predio. */

// Excel redondea 0.5 alejándose del cero (JS Math.round no)
const xRound = (n, d = 0) => {
  const f = Math.pow(10, d);
  const v = n * f;
  return (v < 0 ? -Math.round(-v) : Math.round(v)) / f;
};
const xDown = (n) => Math.floor(n);
const xUp = (n) => Math.ceil(n);
const num = (v) => (Number.isFinite(+v) ? +v : 0);

/* Parámetros por defecto tomados de la hoja de cálculo */
const DEFAULTS = {
  compraVacas: 25,
  vacasPorToro: 25,
  aniosUsoToro: 5,
  years: 10,
  // indicadores por año (año 1 = primer elemento)
  //  paric   : % de pariciones de vacas
  //  descV   : descarte de vacas
  //  descN   : descarte de novillas
  //  mAdult  : mortalidad de adultos (vacas / novillas)
  //  mMaute  : mortalidad de mautes (as) y toros
  //  mBec    : mortalidad de becerros (as)
  ind: [
    { paric: 0.70, descV: 0.00, descN: 0.00, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.00, descN: 0.00, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.10, descN: 0.10, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.15, descN: 0.10, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.20, descN: 0.20, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.20, descN: 0.20, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.25, descN: 0.25, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.25, descN: 0.25, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.25, descN: 0.25, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 },
    { paric: 0.75, descV: 0.25, descN: 0.25, mAdult: 0.01, mMaute: 0.02, mBec: 0.05 }
  ],
  // factores de conversión a Unidades Animales (UA)
  fc: { toro: 1.7, vaca: 1.3, novilla: 1.0, maute: 0.56, becerro: 0.4, becerra: 0.4 },
  // pesos de venta (kg). El peso de la búfala es la base del predio.
  pesoVaca: 600,
  pesoToro: 760,
  pesoNovilla: 450,
  pesoMaute: 250,
  // producción diaria de leche (lt/búfala/día) por año y nivel
  leche: {
    nivel: 'bajo',
    bajo:  [5, 5, 5, 6, 6, 6, 6, 6, 6, 6],
    medio: [6, 7, 8, 10, 10, 10, 10, 10, 10, 10],
    alto:  [10, 12, 14, 15, 15, 15, 15, 15, 15, 15]
  },
  lactancia: 270,
  litrosPorKgQueso: 5.5,
  destino: { queso: 100, leche: 0 },
  forraje: [
    { tipo: 'Pasto Cultivado Secano', carga: 2, area: 29.75 },
    { tipo: 'Pasto Natural / Sabana', carga: 1, area: 0 },
    { tipo: 'Pasto de Corte', carga: 15, area: 0 },
    { tipo: 'Banco de Proteína', carga: 6, area: 0 }
  ],
  precios: { kgCarne: 0, kgQueso: 0, litroLeche: 0, moneda: '$' }
};

/* ---- Núcleo de cálculo: movimiento de rebaño, carne, leche ---- */
function calcular(p) {
  const N = p.years;
  const vpt = num(p.vacasPorToro) || 25;
  const usoToro = Math.max(1, Math.round(num(p.aniosUsoToro) || 5));

  // Semilla año 0 (todo en cero, como en la hoja original)
  const seed = {
    anio: 0, compraVacas: 0, compraToros: 0, vacasIni: 0, torosIni: 0,
    natHembras: 0, natMachos: 0, mortBecerros: 0, mortBecerras: 0,
    mortMautes: 0, mortMautas: 0, mortVacas: 0, mortNovillas: 0, mortToros: 0,
    ventaNovillas: 0, ventaMautes: 0, ventaVacas: 0, ventaToros: 0,
    invToros: 0, invVacas: 0, invBecerros: 0, invBecerras: 0, invMautas: 0, invNovillas: 0,
    total: 0, ua: 0
  };

  const all = [seed]; // all[y] = año y (0..N)
  const r = [];       // filas visibles (año 1..N)

  for (let y = 1; y <= N; y++) {
    const ind = p.ind[Math.min(y - 1, p.ind.length - 1)];
    const prev = all[y - 1];
    const f = { anio: y };

    // rebaño inicial de vacas
    if (y === 1) {
      f.compraVacas = num(p.compraVacas);
      f.vacasIni = f.compraVacas;
    } else {
      f.compraVacas = 0;
      f.vacasIni = prev.invVacas + prev.invNovillas;
    }
    f.torosIni = xUp(f.vacasIni / vpt);

    // natalidad
    f.natHembras = xDown((f.vacasIni * num(ind.paric)) / 2);
    f.natMachos = xUp((f.vacasIni * num(ind.paric)) / 2);

    // mortalidad de crías (réplica exacta de la hoja)
    f.mortBecerros = xRound(f.natHembras * num(ind.mBec));
    f.mortBecerras = xRound(f.natMachos * num(ind.mBec));
    // mortalidad al pasar a maute (usa el inventario de crías del año anterior)
    f.mortMautes = xRound(prev.invBecerros * num(ind.mMaute));
    f.mortMautas = xRound(prev.invBecerras * num(ind.mMaute));
    // mortalidad de adultos
    f.mortVacas = xRound(f.vacasIni * num(ind.mAdult));
    f.mortNovillas = xRound(prev.invNovillas * num(ind.mAdult));
    f.mortToros = xRound(f.torosIni * num(ind.mMaute));

    // ventas
    f.ventaNovillas = xRound((prev.invMautas - f.mortNovillas) * num(ind.descN));
    f.ventaMautes = prev.invBecerros - f.mortMautes; // machos levantados a maute y vendidos
    f.ventaVacas = xRound((f.vacasIni - f.mortVacas) * num(ind.descV));

    // compra (reposición) de toros
    if (y === 1) {
      f.compraToros = xRound(f.compraVacas / vpt);
    } else {
      f.compraToros = f.torosIni - (prev.torosIni - prev.mortToros) + prev.ventaToros;
    }
    // venta de toros: se venden los comprados hace `usoToro` años
    const idxCompra = y - usoToro + 1;
    f.ventaToros = (idxCompra >= 1) ? all[idxCompra].compraToros : 0;

    // inventario final
    f.invToros = f.torosIni; // en la hoja el inventario de toros se mantiene en el nivel objetivo
    f.invVacas = f.vacasIni - f.mortVacas - f.ventaVacas;
    f.invBecerros = f.natMachos - f.mortBecerros;
    f.invBecerras = f.natHembras - f.mortBecerras;
    f.invMautas = prev.invBecerras - f.mortMautas;
    f.invNovillas = prev.invMautas - f.mortNovillas - f.ventaNovillas;

    f.total = f.invToros + f.invVacas + f.invBecerros + f.invBecerras + f.invMautas + f.invNovillas;
    f.ua = f.invToros * num(p.fc.toro) + f.invVacas * num(p.fc.vaca) +
           f.invBecerros * num(p.fc.becerro) + f.invBecerras * num(p.fc.becerra) +
           f.invMautas * num(p.fc.maute) + f.invNovillas * num(p.fc.novilla);

    all.push(f);
    r.push(f);
  }

  // carne (pesos fijos de venta)
  const peso = {
    maute: num(p.pesoMaute),
    toro: num(p.pesoToro),
    novilla: num(p.pesoNovilla),
    vaca: num(p.pesoVaca)
  };
  const carne = r.map((f) => {
    const kgMaute = f.ventaMautes * peso.maute;
    const kgToro = f.ventaToros * peso.toro;
    const kgNov = f.ventaNovillas * peso.novilla;
    const kgVaca = f.ventaVacas * peso.vaca;
    return {
      anio: f.anio,
      nMautes: f.ventaMautes, pMaute: peso.maute, kgMautes: kgMaute,
      nToros: f.ventaToros, pToro: peso.toro, kgToros: kgToro,
      nNovillas: f.ventaNovillas, pNovilla: peso.novilla, kgNovillas: kgNov,
      nVacas: f.ventaVacas, pVaca: peso.vaca, kgVacas: kgVaca,
      kgTotal: kgMaute + kgToro + kgNov + kgVaca
    };
  });

  // leche / queso
  const serie = p.leche[p.leche.nivel] || p.leche.bajo;
  const leche = r.map((f, i) => {
    const ind = p.ind[Math.min(i, p.ind.length - 1)];
    const litros = f.vacasIni * num(ind.paric) * num(serie[i]) * num(p.lactancia);
    const litrosVenta = litros * (num(p.destino.leche) / 100);
    const kgQueso = (litros / num(p.litrosPorKgQueso)) * (num(p.destino.queso) / 100);
    return { anio: f.anio, litros, litrosVenta, kgQueso, vacasOrdeno: xRound(f.vacasIni * num(ind.paric)) };
  });

  // balance forrajero
  const areaTotal = p.forraje.reduce((a, x) => a + num(x.area), 0);
  const oferta = p.forraje.reduce((a, x) => a + num(x.carga) * num(x.area), 0);
  // la demanda se toma del año de máxima carga (régimen estabilizado)
  let anioPico = r.length ? r[0].anio : 0, demanda = 0;
  r.forEach((f) => { if (f.ua > demanda) { demanda = f.ua; anioPico = f.anio; } });
  const anioRef = anioPico, uaPico = demanda;
  const forraje = { areaTotal, oferta, demanda, anioRef, anioPico, uaPico, balance: oferta - demanda };

  // instalaciones (dimensionamiento según años de régimen de la hoja)
  const yi = (yr) => r[Math.min(yr - 1, r.length - 1)] || seed;
  const y6 = yi(6), y7 = yi(7);
  const vacasProd = y7.vacasIni * 0.75;
  const becerreraN = y7.natHembras + y7.natMachos;
  const corralAdultos = y6.invVacas + y6.invToros + y6.invNovillas;
  const instBase = [
    { nombre: 'Corral', cat: 'adultos', cant: corralAdultos, m2: 3 },
    { nombre: 'Embarcadero / pre-embarcadero', cat: 'búfalas y búfalos', cant: 20, m2: 2 },
    { nombre: 'Búfalera con corral', cat: 'búfalas en producción', cant: vacasProd, m2: 15 },
    { nombre: 'Bucerrera de lactantes', cat: 'bucerros', cant: becerreraN, m2: 2.5 },
    { nombre: 'Bucerrera de destetados', cat: 'bucerros', cant: becerreraN, m2: 3.5 },
    { nombre: 'Sala de ordeño (1/3 búfalas)', cat: 'búfalas en producción', cant: vacasProd / 3, m2: 2.5 },
    { nombre: 'Corral de espera (1/3 búfalas)', cat: 'búfalas en producción', cant: vacasProd / 3, m2: 2 },
    { nombre: 'Cuarto de leche', cat: '', cant: null, m2: 25 },
    { nombre: 'Procesamiento lácteo', cat: '', cant: null, m2: 80 },
    { nombre: 'Procesamiento cárnico', cat: '', cant: null, m2: 80 },
    { nombre: 'Almacén de alimento', cat: '', cant: null, m2: 80 },
    { nombre: 'Depósito de medicamentos', cat: '', cant: null, m2: 12 },
    { nombre: 'Depósito de insumos', cat: '', cant: null, m2: 80 },
    { nombre: 'Maquinaria y equipos', cat: '', cant: null, m2: 60 }
  ];
  const instalaciones = instBase.map((x) => ({
    ...x,
    area: (x.cant != null) ? x.cant * x.m2 : x.m2
  }));
  const instTotal = instalaciones.reduce((a, x) => a + x.area, 0);

  // ingresos (opcional)
  const pr = p.precios || {};
  const ingresos = r.map((f, i) => {
    const carneV = carne[i].kgTotal * num(pr.kgCarne);
    const quesoV = leche[i].kgQueso * num(pr.kgQueso);
    const lecheV = leche[i].litrosVenta * num(pr.litroLeche);
    return { anio: f.anio, carne: carneV, queso: quesoV, leche: lecheV, total: carneV + quesoV + lecheV };
  });

  return { rebano: r, carne, leche, forraje, instalaciones, instTotal, ingresos, peso };
}

if (typeof module !== 'undefined') module.exports = { calcular, DEFAULTS, xRound };
