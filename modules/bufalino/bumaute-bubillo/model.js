/* =====================================================================
   Modelo determinístico de la Modalidad Recría / Levante Búfalo
   Bumaute–Bubillo. Réplica exacta de la hoja de cálculo original (10 años).
   Compra de bumautes, levante a bubillo y venta · balance forrajero ·
   instalaciones. Operación de flujo (compra y venta anual).
   ===================================================================== */

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
function xRound(v) { return Math.round(num(v)); }   // ROUND de la hoja

const DEFAULTS = {
  comprasAnio: 12,        // bumautes-bubillo comprados por año
  embarcaderoCant: 20,    // capacidad del embarcadero/pre-embarcadero (valor fijo de la hoja)
  margenSeguridad: 0,     // margen de seguridad aplicado a la demanda forrajera (holgura)
  years: 10,
  // mortalidad aplicada al lote (la hoja usa la tasa de adultos = 0.01)
  mortUsada: 0.01,
  mortAdultos: 0.01,      // referencia
  mortBumautes: 0.02,     // referencia
  mortBucerros: 0.05,     // referencia
  // parámetros de levante (ganancia diaria de peso)
  pesoInicial: 250,       // kg de entrada (bumaute)
  pesoFinal: 351,         // kg de salida (bubillo)
  gdp: 0.65,              // ganancia diaria de peso (kg/día)
  pesoPromedioVenta: 351, // peso promedio de venta del bubillo (kg)
  // factor de conversión a Unidades Animales del bubillo de levante
  fc: { bubilloCeba: 1.07, bubilloLevanteBase: 1, bubilloLevante: 0.78, bumauteLevante: 0.54, bucerroLevante: 0.4 },
  forraje: [
    { tipo: 'Pasto Cultivado Secano', carga: 2, area: 4.8 },
    { tipo: 'Pasto Natural / Sabana', carga: 1, area: 0 },
    { tipo: 'Pasto de Corte', carga: 15, area: 0 },
    { tipo: 'Banco de Proteina', carga: 6, area: 0 }
  ],
  precios: { kgCarne: 0, moneda: '$' }
};

function calcular(p) {
  const N = Math.max(1, Math.round(num(p.years)) || 10);
  const compras = xRound(p.comprasAnio);
  const mort = num(p.mortUsada);
  const facB = num(p.fc.bubilloLevante);
  const pesoVenta = num(p.pesoPromedioVenta);

  const rebano = [];
  for (let y = 1; y <= N; y++) {
    const rebInicial = compras;                 // D = C (compra) — operación de flujo
    const mortalidad = xRound(rebInicial * mort);
    const ventas = rebInicial - mortalidad;
    const ua = ventas * facB;
    rebano.push({ anio: y, compras, rebInicial, mortalidad, ventas, ua });
  }

  // producción de bubillos de levante
  const produccion = rebano.map((f) => ({
    anio: f.anio, bubillos: f.ventas, pesoProm: pesoVenta, pesoKg: f.ventas * pesoVenta
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
  // margen de seguridad: se incrementa la demanda de diseño para dejar holgura
  const margen = num(p.margenSeguridad);
  const demandaDiseno = demanda * (1 + margen);
  const forraje = {
    areaTotal, oferta, demanda, anioRef,
    margen, demandaDiseno,
    balance: oferta - demandaDiseno,        // balance con holgura
    balanceSinMargen: oferta - demanda      // balance segun la hoja original
  };

  // instalaciones (dimensionadas al lote anual)
  const instBase = [
    { nombre: 'Corral', cat: 'Bubillos', cant: compras, m2: 3 },
    { nombre: 'Embarcadero / pre-embarcadero', cat: 'Bubillos', cant: (p.embarcaderoCant != null ? xRound(p.embarcaderoCant) : 20), m2: 2 },
    { nombre: 'Corral resguardo', cat: 'Bubillos', cant: compras, m2: 20 },
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
