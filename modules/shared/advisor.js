/* =====================================================================
   AgroSuite 360° · Asesor Zootécnico Experto & Simulador de Estrés Climático
   Diagnóstico heurístico y proyecciones de resiliencia en tiempo real.
   ===================================================================== */

const AgroAdvisor = (() => {
  // Factores de reducción o aumento según estrés climático
  const CLIMATE_SCENARIOS = {
    normal: { name: 'Clima Normal / Promedio', factor: 1.0, icon: '☀️', desc: 'Régimen pluviométrico habitual del predio.' },
    mild_drought: { name: 'Sequía Leve / Veranillo (-15%)', factor: 0.85, icon: '⛅', desc: 'Déficit hídrico de 1-2 meses. Ligero retraso de rebrotes.' },
    mod_drought: { name: 'Sequía Moderada (-30%)', factor: 0.70, icon: '🍂', desc: 'Sequía prolongada de 3 a 4 meses. Pasturas senescentes y baja proteína.' },
    sev_drought: { name: 'Sequía Severa / Fenómeno El Niño (-45%)', factor: 0.55, icon: '🏜️', desc: 'Estrés hídrico crítico >5 meses. Alto riesgo de sobrepastoreo y pérdida de peso.' },
    wet_year: { name: 'Año Muy Lluvioso / Niña (+20%)', factor: 1.20, icon: '🌧️', desc: 'Abundancia forrajera pero riesgo de lavado de nutrientes y pisoteo por encharcamiento.' }
  };

  /**
   * Simula el impacto forrajero del escenario climático
   */
  function simulateClimate(totals, scenarioKey = 'normal') {
    const sc = CLIMATE_SCENARIOS[scenarioKey] || CLIMATE_SCENARIOS.normal;
    const ofertaAjustada = totals.oferta * sc.factor;
    const balanceAjustado = ofertaAjustada - totals.demM;
    const deficitUA = Math.max(0, -balanceAjustado);

    // 1 UA = 450 kg peso vivo -> consumo aprox 2.5% a 3% de PV en Materia Seca (MS) = ~11.5 kg MS/día
    const kgMsPorDiaDeficit = deficitUA * 11.5;
    const sacosHenoMesDeficit = (kgMsPorDiaDeficit * 30) / 12; // fardo estándar 12-14 kg MS

    // Cabezas a descargar para equilibrar (asumiendo promedio 0.8 UA/cabeza)
    const cabezasADescargar = deficitUA > 0 ? Math.ceil(deficitUA / 0.8) : 0;

    return {
      scenario: sc,
      ofertaOriginal: totals.oferta,
      ofertaAjustada,
      balanceAjustado,
      deficitUA,
      kgMsPorDiaDeficit,
      sacosHenoMesDeficit,
      cabezasADescargar,
      ok: balanceAjustado >= 0
    };
  }

  /**
   * Genera el dictamen zootécnico y agronómico en base al balance y los indicadores
   */
  function auditPastoralSystem(totals, climateResult) {
    const findings = [];
    const cargaActual = totals.area > 0 ? totals.dem / totals.area : 0;

    // 1. Diagnóstico de Carga Animal Global
    if (cargaActual > 2.2) {
      findings.push({
        type: 'critical',
        badge: 'Carga Elevada',
        title: `Carga animal alta (${cargaActual.toFixed(2)} UA/ha)`,
        desc: 'Una carga superior a 2.2 UA/ha exige pastos mejorados de alta biomasa (ej. Mombasa, Toledo) y rotación intensiva. Sin fertilización periódica o riego, el pastizal corre alto riesgo de degradación.',
        action: 'Revisar división de potreros (rotación Voisin) o incorporar bancos forrajeros de corte.'
      });
    } else if (cargaActual < 0.6 && totals.area > 5) {
      findings.push({
        type: 'warning',
        badge: 'Subutilización',
        title: `Baja presión de pastoreo (${cargaActual.toFixed(2)} UA/ha)`,
        desc: 'El forraje podría lignificarse o encañuelarse por falta de consumo oportuno, perdiendo digestibilidad y proteína cruda.',
        action: 'Aumentar carga con lotes de levante temporal o ensilar el forraje excedente.'
      });
    } else {
      findings.push({
        type: 'good',
        badge: 'Carga Equilibrada',
        title: `Carga dentro del rango técnico (${cargaActual.toFixed(2)} UA/ha)`,
        desc: 'La densidad de animales se adapta bien a pasturas cultivadas en secano, favoreciendo la persistencia de las praderas.',
        action: 'Mantener periodos de descanso de 28 a 35 días según época climática.'
      });
    }

    // 2. Diagnóstico del Balance Forrajero con Margen
    if (climateResult && !climateResult.ok) {
      findings.push({
        type: 'critical',
        badge: 'Déficit Climático',
        title: `Déficit de ${climateResult.deficitUA.toFixed(1)} UA bajo escenario: ${climateResult.scenario.name}`,
        desc: `Falta forraje para cubrir el consumo de diseño. Se requerirían aproximadamente ${Math.round(climateResult.kgMsPorDiaDeficit)} kg de Materia Seca diarios (equivalente a ~${Math.round(climateResult.sacosHenoMesDeficit)} pacas de heno o ensilaje al mes) para evitar pérdida de peso.`,
        action: `Estrategia sugerida: Descargar temporalmente ~${climateResult.cabezasADescargar} animales de menor valor zootécnico (novillos listos o vacas viejas) o suministrar ensilaje de maíz/sorgo.`
      });
    } else if (totals.bal < 0) {
      findings.push({
        type: 'warning',
        badge: 'Margen Ajustado',
        title: 'El margen de seguridad supera la oferta actual',
        desc: 'La oferta cubre el rebaño base pero queda en déficit al aplicar el margen preventivo. En épocas secas el ganado sufrirá restricción nutricional.',
        action: 'Establecer 1 a 2 hectáreas de banco de proteína con Leucaena leucocephala o Matarratón (Gliricidia sepium).'
      });
    } else {
      findings.push({
        type: 'good',
        badge: 'Resiliencia Forrajera',
        title: 'Superávit forrajero confortable',
        desc: 'El sistema dispone de suficiente biomasa para sostener a los animales incluso con el margen de seguridad activo.',
        action: 'Excelente colchón forrajero. Conservar remanentes como heno o silo para contingencias.'
      });
    }

    return findings;
  }

  return { CLIMATE_SCENARIOS, simulateClimate, auditPastoralSystem };
})();

if (typeof module !== 'undefined') module.exports = AgroAdvisor;
