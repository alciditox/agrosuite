/* =====================================================================
   AgroSuite 360° · Motor Gráfico Vectorial Ligero (SVG & Canvas)
   Sin dependencias externas. 100% autónomo, responsive y ultra-rápido.
   ===================================================================== */

const AgroCharts = (() => {
  // Helpers para creación de SVG
  const NS = 'http://www.w3.org/2000/svg';
  const createSvg = (w, h, viewBox) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', viewBox || `0 0 ${w} ${h}`);
    svg.style.overflow = 'visible';
    svg.style.display = 'block';
    return svg;
  };

  /**
   * Tacómetro / Gauge circular de balance o indicador
   * opts: { container, value, min, max, label, units, okThreshold }
   */
  function renderGauge(opts) {
    const { container, value, min = -50, max = 50, label = 'Balance', units = 'UA', okThreshold = 0 } = opts;
    if (!container) return;
    container.innerHTML = '';

    const width = 240;
    const height = 150;
    const cx = 120;
    const cy = 125;
    const r = 85;

    const svg = createSvg(width, height);

    // Mapear valor a ángulo (-140° a +140°, 0° al centro arriba)
    const clamped = Math.max(min, Math.min(max, value));
    const pct = (clamped - min) / (max - min);
    const startAngle = -140 * (Math.PI / 180);
    const endAngle = 140 * (Math.PI / 180);
    const totalAngle = endAngle - startAngle;
    const needleAngle = startAngle + pct * totalAngle;

    // Arco de fondo (Track)
    const arcPath = (a0, a1, radius) => {
      const x0 = cx + radius * Math.sin(a0);
      const y0 = cy - radius * Math.cos(a0);
      const x1 = cx + radius * Math.sin(a1);
      const y1 = cy - radius * Math.cos(a1);
      const largeArc = a1 - a0 > Math.PI ? 1 : 0;
      return `M ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1}`;
    };

    // Fondo gris
    const bgArc = document.createElementNS(NS, 'path');
    bgArc.setAttribute('d', arcPath(startAngle, endAngle, r));
    bgArc.setAttribute('fill', 'none');
    bgArc.setAttribute('stroke', '#e2e8f0');
    bgArc.setAttribute('stroke-width', '14');
    bgArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(bgArc);

    // Zona de déficit (Rojo: desde min hasta okThreshold)
    const zeroPct = (okThreshold - min) / (max - min);
    const zeroAngle = startAngle + zeroPct * totalAngle;

    const deficitArc = document.createElementNS(NS, 'path');
    deficitArc.setAttribute('d', arcPath(startAngle, zeroAngle, r));
    deficitArc.setAttribute('fill', 'none');
    deficitArc.setAttribute('stroke', '#fca5a5');
    deficitArc.setAttribute('stroke-width', '14');
    deficitArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(deficitArc);

    // Zona de superávit (Verde: desde okThreshold hasta max)
    const surplusArc = document.createElementNS(NS, 'path');
    surplusArc.setAttribute('d', arcPath(zeroAngle, endAngle, r));
    surplusArc.setAttribute('fill', 'none');
    surplusArc.setAttribute('stroke', '#86efac');
    surplusArc.setAttribute('stroke-width', '14');
    surplusArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(surplusArc);

    // Arco activo coloreado según estado
    const isOk = value >= okThreshold;
    const activeColor = isOk ? '#166534' : '#dc2626';

    // Aguja
    const nx = cx + (r - 10) * Math.sin(needleAngle);
    const ny = cy - (r - 10) * Math.cos(needleAngle);

    const needle = document.createElementNS(NS, 'line');
    needle.setAttribute('x1', cx);
    needle.setAttribute('y1', cy);
    needle.setAttribute('x2', nx);
    needle.setAttribute('y2', ny);
    needle.setAttribute('stroke', activeColor);
    needle.setAttribute('stroke-width', '4');
    needle.setAttribute('stroke-linecap', 'round');
    svg.appendChild(needle);

    // Pivote central
    const pivotBg = document.createElementNS(NS, 'circle');
    pivotBg.setAttribute('cx', cx);
    pivotBg.setAttribute('cy', cy);
    pivotBg.setAttribute('r', '8');
    pivotBg.setAttribute('fill', activeColor);
    svg.appendChild(pivotBg);

    const pivotDot = document.createElementNS(NS, 'circle');
    pivotDot.setAttribute('cx', cx);
    pivotDot.setAttribute('cy', cy);
    pivotDot.setAttribute('r', '3');
    pivotDot.setAttribute('fill', '#ffffff');
    svg.appendChild(pivotDot);

    // Texto del valor
    const textVal = document.createElementNS(NS, 'text');
    textVal.setAttribute('x', cx);
    textVal.setAttribute('y', cy - 18);
    textVal.setAttribute('text-anchor', 'middle');
    textVal.setAttribute('font-size', '20');
    textVal.setAttribute('font-weight', '800');
    textVal.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    textVal.setAttribute('fill', activeColor);
    textVal.textContent = (value > 0 ? '+' : '') + value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' ' + units;
    svg.appendChild(textVal);

    // Texto de etiqueta
    const textLbl = document.createElementNS(NS, 'text');
    textLbl.setAttribute('x', cx);
    textLbl.setAttribute('y', cy + 20);
    textLbl.setAttribute('text-anchor', 'middle');
    textLbl.setAttribute('font-size', '11');
    textLbl.setAttribute('font-weight', '600');
    textLbl.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    textLbl.setAttribute('fill', '#64748b');
    textLbl.textContent = label + ' · ' + (isOk ? 'SUPERÁVIT' : 'DÉFICIT');
    svg.appendChild(textLbl);

    container.appendChild(svg);
  }

  /**
   * Gráfico de barras comparativo
   * opts: { container, categories, series: [{ name, color, data }] }
   */
  function renderBarComparison(opts) {
    const { container, categories = [], series = [] } = opts;
    if (!container || !categories.length || !series.length) return;
    container.innerHTML = '';

    const width = 460;
    const height = 180;
    const padL = 40;
    const padR = 20;
    const padT = 20;
    const padB = 30;

    let maxVal = 0;
    series.forEach((s) => s.data.forEach((v) => { if (v > maxVal) maxVal = v; }));
    maxVal = maxVal > 0 ? maxVal * 1.15 : 10;

    const svg = createSvg(width, height);

    // Líneas guía horizontales
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const val = (maxVal / gridLines) * i;
      const y = padT + (height - padT - padB) * (1 - i / gridLines);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', padL);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padR);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e2e8f0');
      line.setAttribute('stroke-dasharray', i === 0 ? '0' : '3,3');
      svg.appendChild(line);

      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', padL - 6);
      lbl.setAttribute('y', y + 3);
      lbl.setAttribute('text-anchor', 'end');
      lbl.setAttribute('font-size', '9');
      lbl.setAttribute('fill', '#94a3b8');
      lbl.textContent = Math.round(val);
      svg.appendChild(lbl);
    }

    const plotW = width - padL - padR;
    const catW = plotW / categories.length;
    const barW = Math.min(22, (catW - 12) / series.length);

    categories.forEach((cat, cIdx) => {
      const groupX = padL + cIdx * catW;

      // Etiqueta de categoría
      const cLbl = document.createElementNS(NS, 'text');
      cLbl.setAttribute('x', groupX + catW / 2);
      cLbl.setAttribute('y', height - 10);
      cLbl.setAttribute('text-anchor', 'middle');
      cLbl.setAttribute('font-size', '10.5');
      cLbl.setAttribute('font-weight', '600');
      cLbl.setAttribute('fill', '#475569');
      cLbl.textContent = cat;
      svg.appendChild(cLbl);

      // Barras de cada serie
      series.forEach((s, sIdx) => {
        const val = s.data[cIdx] || 0;
        const barH = (val / maxVal) * (height - padT - padB);
        const bx = groupX + (catW - series.length * barW) / 2 + sIdx * barW;
        const by = height - padB - barH;

        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', bx);
        rect.setAttribute('y', by);
        rect.setAttribute('width', barW - 2);
        rect.setAttribute('height', Math.max(1, barH));
        rect.setAttribute('fill', s.color);
        rect.setAttribute('rx', '3');
        rect.innerHTML = `<title>${s.name}: ${val.toFixed(1)}</title>`;
        svg.appendChild(rect);
      });
    });

    container.appendChild(svg);
  }

  /**
   * Gráfico de líneas interactivo a 10 años
   * opts: { container, labels, series: [{ name, color, data }] }
   */
  function renderLineChart(opts) {
    const { container, labels = [], series = [] } = opts;
    if (!container || !labels.length || !series.length) return;
    container.innerHTML = '';

    const width = 500;
    const height = 190;
    const padL = 45;
    const padR = 20;
    const padT = 20;
    const padB = 30;

    let maxVal = 0;
    series.forEach((s) => s.data.forEach((v) => { if (v > maxVal) maxVal = v; }));
    maxVal = maxVal > 0 ? maxVal * 1.15 : 10;

    const svg = createSvg(width, height);
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Gridlines
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = (maxVal / steps) * i;
      const y = padT + plotH * (1 - i / steps);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', padL);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padR);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#f1f5f9');
      svg.appendChild(line);

      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', padL - 6);
      lbl.setAttribute('y', y + 3);
      lbl.setAttribute('text-anchor', 'end');
      lbl.setAttribute('font-size', '9');
      lbl.setAttribute('fill', '#94a3b8');
      lbl.textContent = Math.round(val);
      svg.appendChild(lbl);
    }

    // X axis labels
    labels.forEach((l, i) => {
      const x = padL + (i / (labels.length - 1)) * plotW;
      const lbl = document.createElementNS(NS, 'text');
      lbl.setAttribute('x', x);
      lbl.setAttribute('y', height - 10);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('font-size', '10');
      lbl.setAttribute('fill', '#64748b');
      lbl.textContent = l;
      svg.appendChild(lbl);
    });

    // Curvas
    series.forEach((s) => {
      let pathD = '';
      const points = [];
      s.data.forEach((val, i) => {
        const x = padL + (i / (labels.length - 1)) * plotW;
        const y = padT + plotH * (1 - val / maxVal);
        points.push({ x, y, val });
        pathD += (i === 0 ? 'M ' : ' L ') + x + ' ' + y;
      });

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', pathD);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', s.color);
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);

      // Puntos
      points.forEach((pt) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', pt.x);
        c.setAttribute('cy', pt.y);
        c.setAttribute('r', '3.5');
        c.setAttribute('fill', '#fff');
        c.setAttribute('stroke', s.color);
        c.setAttribute('stroke-width', '2');
        c.innerHTML = `<title>${s.name}: ${pt.val}</title>`;
        svg.appendChild(c);
      });
    });

    container.appendChild(svg);
  }

  return { renderGauge, renderBarComparison, renderLineChart };
})();

if (typeof module !== 'undefined') module.exports = AgroCharts;
