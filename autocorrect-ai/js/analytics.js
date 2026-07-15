/**
 * AutoCorrect AI — Analytics Module
 * Canvas-based charts and writing statistics
 */

const Analytics = (() => {

  // Draw a line chart on a canvas element
  function drawLineChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    const {
      labels = [],
      datasets = [],
      padding = { top: 20, right: 20, bottom: 40, left: 45 },
      gridColor = 'rgba(255,255,255,0.06)',
      textColor = '#64748B',
      gridLines = 5,
    } = options;

    ctx.clearRect(0, 0, w, h);

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Find min/max
    let allValues = datasets.flatMap(d => d.data);
    const minVal = Math.min(0, ...allValues);
    const maxVal = Math.max(1, ...allValues);
    const range = maxVal - minVal || 1;

    const toX = i => padding.left + (i / Math.max(labels.length - 1, 1)) * chartW;
    const toY = v => padding.top + chartH - ((v - minVal) / range) * chartH;

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      // Y labels
      const val = Math.round(maxVal - (i / gridLines) * range);
      ctx.fillStyle = textColor;
      ctx.font = `${10 * window.devicePixelRatio}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // X Labels
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    labels.forEach((label, i) => {
      if (i % Math.ceil(labels.length / 7) !== 0 && i !== labels.length - 1) return;
      ctx.fillText(label, toX(i), h - padding.bottom + 18);
    });

    // Datasets
    datasets.forEach(dataset => {
      const { data, color = '#16A34A', fill = true, lineWidth = 2 } = dataset;
      if (!data.length) return;

      // Fill gradient
      if (fill) {
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        grad.addColorStop(0, color + '30');
        grad.addColorStop(1, color + '00');
        ctx.beginPath();
        data.forEach((v, i) => {
          const x = toX(i), y = toY(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(toX(data.length - 1), toY(minVal));
        ctx.lineTo(toX(0), toY(minVal));
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Line
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = toX(i), y = toY(v);
        if (i === 0) ctx.moveTo(x, y);
        else {
          // Smooth bezier
          const prev = { x: toX(i - 1), y: toY(data[i - 1]) };
          const cp1x = prev.x + (x - prev.x) / 3;
          const cp2x = x - (x - prev.x) / 3;
          ctx.bezierCurveTo(cp1x, prev.y, cp2x, y, x, y);
        }
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Dots
      data.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(toX(i), toY(v), 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim() || '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }

  // Draw a bar chart
  function drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    const {
      labels = [],
      colors = ['#16A34A', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4'],
      padding = { top: 20, right: 20, bottom: 40, left: 45 },
      gridColor = 'rgba(255,255,255,0.06)',
      textColor = '#64748B',
    } = options;

    ctx.clearRect(0, 0, w, h);

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const maxVal = Math.max(1, ...data);
    const barWidth = (chartW / data.length) * 0.6;
    const barGap = (chartW / data.length) * 0.4;

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = `10px Inter`;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (i / 4) * maxVal), padding.left - 6, y + 4);
    }

    // Bars
    data.forEach((val, i) => {
      const barH = (val / maxVal) * chartH;
      const x = padding.left + i * (barWidth + barGap) + barGap / 2;
      const y = padding.top + chartH - barH;
      const color = colors[i % colors.length];

      // Gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color + 'CC');
      grad.addColorStop(1, color + '44');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = textColor;
      ctx.font = `10px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barWidth / 2, h - padding.bottom + 14);
    });
  }

  // Draw donut chart
  function drawDonutChart(canvas, segments, options = {}) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    const { lineWidth = 20, gap = 0.03 } = options;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) / 2 - lineWidth;
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;

    let startAngle = -Math.PI / 2;

    segments.forEach(seg => {
      const slice = (seg.value / total) * (Math.PI * 2) - gap;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      startAngle += slice + gap;
    });
  }

  // Animate number counting
  function animateCount(el, target, duration = 1000) {
    const start = parseInt(el.textContent) || 0;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * ease).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Animate progress bar
  function animateProgress(el, targetPct, duration = 800) {
    el.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    requestAnimationFrame(() => {
      el.style.width = `${Math.min(100, Math.max(0, targetPct))}%`;
    });
  }

  // Animate score ring
  function animateScoreRing(svgPath, score, radius = 54) {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    svgPath.style.strokeDasharray = circumference;
    svgPath.style.strokeDashoffset = circumference;

    requestAnimationFrame(() => {
      svgPath.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      svgPath.style.strokeDashoffset = offset;
    });
  }

  // Generate analytics data
  function generateWeeklyData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      words: Math.floor(Math.random() * 800) + 200,
      mistakes: Math.floor(Math.random() * 25) + 5,
      score: Math.floor(Math.random() * 30) + 65,
    }));
  }

  function generateMonthlyData() {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      words: Math.floor(Math.random() * 1200) + 100,
      score: Math.floor(Math.random() * 25) + 70,
    }));
  }

  return {
    drawLineChart,
    drawBarChart,
    drawDonutChart,
    animateCount,
    animateProgress,
    animateScoreRing,
    generateWeeklyData,
    generateMonthlyData,
  };
})();

window.Analytics = Analytics;
