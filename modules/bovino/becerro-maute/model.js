/* =====================================================================
   Modelo determinístico de la Modalidad Recría / Levante Becerro–Maute
   Réplica exacta de la hoja de cálculo original (10 años de proyección).
   Compra de becerros de levante, engorde a maute y venta · balance
   forrajero · instalaciones. Operación de flujo (compra y venta anual).
   ===================================================================== */

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function xRound(v) { return Math.round(num(v)); }   // ROUND de la hoja

const DEFAULTS = {
  comprasAnio: 14,        // becerros-maute comprados por año
  embarcaderoCant: 20,    // capacidad del embarcadero/pre-embarcadero (valor fijo de la hoja)
  years: 10,
  // mortalidad aplicada al lote de levante (tasa de mautes en la hoja)
  mortMaute: 0.03,
  mortAdultos: 0.01,      // referencia (no interviene en el flujo de levante)
  mortBecerros: 0.05,     // referencia
  // parámetros de levante (ganancia diaria de peso)
  pesoInicial: 162,       // kg de entrada (becerro)
  pesoFinal: 212,         // kg de salida (maute)
  gdp: 0.5,               // ganancia diaria de peso (kg/día)
  pesoPromedioVenta: 210, // peso promedio de venta del maute (kg)
  // factor de conversión a Unidades Animales del maute de levante
  fc: { novillosCeba: 1, novillosLevante: 0.75, mauteLevante: 0.47, becerroLevante: 0.36 },
  forraje: [
    { tipo: 'Pasto Cultivado Secano', carga: 2, area: 3.4 },
    { tipo: 'Pasto Natural / Sabana', carga: 1, area: 0 },
    { tipo: 'Pasto de Corte', carga: 15, area: 0 },
    { tipo: 'Banco de Proteina', carga: 6, area: 0 }
  ],
  precios: { kgCarne: 0, moneda: '$' }
};

function calcular(p) {
  const N = Math.max(1, Math.round(num(p.years)) || 10);
  const compras = xRound(p.comprasAnio);
  const mort = num(p.mortMaute);
  const facM = num(p.fc.mauteLevante);
  const pesoVenta = num(p.pesoPromedioVenta);

  const rebano = [];
  for (let y = 1; y <= N; y++) {
    const rebInicial = compras;                 // D = C (compra) — operación de flujo
    const mortalidad = xRound(rebInicial * mort);
    const ventas = rebInicial - mortalidad;
    const ua = ventas * facM;
    rebano.push({ anio: y, compras, rebInicial, mortalidad, ventas, ua });
  }

  // producción de mautes de levante
  const produccion = rebano.map((f) => ({
    anio: f.anio, mautes: f.ventas, pesoProm: pesoVenta, pesoKg: f.ventas * pesoVenta
  }));

  // parámetros de levante derivados
  const dias = num(p.gdp) ? (num(p.pesoFinal) - num(p.pesoInicial)) / num(p.gdp) : 0;
  const meses = dias / 30;
  const levante = { dias, meses, pesoInicial: num(p.pesoInicial), pesoFinal: num(p.pesoFinal), gdp: num(p.gdp) };

  // balance forrajero (demanda = UA del año 1, régimen estable)
  const areaTotal = p.forraje.reduce((a, x) => a + num(x.area), 0);
  const oferta = p.forraje.reduce((a, x) => a + num(x.carga) * num(x.area), 0);
  const demanda = rebano.length ? rebano[0].ua : 0;
  const anioRef = rebano.length ? rebano[0].anio : 0;
  const forraje = {
    areaTotal, oferta, demanda, anioRef,
    balance: oferta - demanda               // balance forrajero (oferta - demanda)
  };

  // instalaciones (dimensionadas al lote anual)
  const instBase = [
    { nombre: 'Corral', cat: 'Mautes', cant: compras, m2: 2.5 },
    { nombre: 'Embarcadero / pre-embarcadero', cat: 'Mautes', cant: (p.embarcaderoCant != null ? xRound(p.embarcaderoCant) : 20), m2: 1.5 },
    { nombre: 'Corral resguardo', cat: 'Mautes', cant: compras, m2: 12 },
    { nombre: 'Almacén de alimento', cat: '', cant: null, m2: 80 },
    { nombre: 'Depósito de medicamentos', cat: '', cant: null, m2: 12 },
    { nombre: 'Depósito de insumos', cat: '', cant: null, m2: 80 },
    { nombre: 'Maquinaria y equipos', cat: '', cant: null, m2: 60 }
  ];
  const instalaciones = instBase.map((x) => ({ ...x, area: (x.cant != null) ? x.cant * x.m2 : x.m2 }));
  const instTotal = instalaciones.reduce((a, x) => a + x.area, 0);

  // ingresos (opcional)
  const pr = p.precios || {};
  const ingresos = rebano.map((f, i) => {
    const total = produccion[i].pesoKg * num(pr.kgCarne);
    return { anio: f.anio, carne: total, total };
  });

  return { rebano, produccion, levante, forraje, instalaciones, instTotal, ingresos };
}

if (typeof module !== 'undefined') module.exports = { calcular, DEFAULTS, xRound };
