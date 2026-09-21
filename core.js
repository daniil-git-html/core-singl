/* ==========================================================================
   CORE.SINGL — CANVAS-СИСТЕМЫ
   1. Фоновое поле частиц (фиксированное, на всю страницу)
   2. Фоновый чертёж силуэта (синие линии на чёрном, как схема в HUD)
   3. Центральное ядро (hero-блок вверху главной страницы)
   4. Голо-фигура оператора (интро)
   Всё на чистом Canvas 2D — без WebGL/three.js, для лёгкости на телефоне.
   ========================================================================== */

const CoreFX = (() => {

  let reducedMotion = false;
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

  function setReducedMotion(v) { reducedMotion = v; }

  // Уровень баса музыки (0..1), обновляется из main.js через Web Audio
  // AnalyserNode. Центральное ядро использует это, чтобы "дышать" в такт.
  let audioLevel = 0;
  function setAudioLevel(v) { audioLevel = v; }

  // Смещение прокрутки страницы (px), для параллакса фонового чертежа.
  let scrollOffset = 0;
  function setScrollOffset(v) { scrollOffset = v; }

  /* ---------------------------------------------------------------
     1. ФОНОВОЕ ПОЛЕ ЧАСТИЦ
     --------------------------------------------------------------- */
  function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = window.innerWidth * dpr();
      h = canvas.height = window.innerHeight * dpr();
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      particles = Array.from({ length: count }, () => spawnParticle());
    }

    function spawnParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.4) * dpr(),
        vy: -(Math.random() * 0.12 + 0.03) * dpr(),
        vx: (Math.random() - 0.5) * 0.05 * dpr(),
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2
      };
    }

    let last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      if (reducedMotion) { draw(); return; }
      if (t - last < 33) return;
      last = t;
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      }
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#00e5ff';
      for (const p of particles) {
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     2. ФОНОВЫЙ ЧЕРТЁЖ — силуэт технологического костюма/фигуры,
     нарисованный тонкими синими линиями поверх всей длинной страницы,
     фиксирован относительно вьюпорта (мягко смещается при скролле —
     параллакс), создаёт ощущение "инженерного чертежа под интерфейсом".
     --------------------------------------------------------------- */
  function initBlueprint() {
    const canvas = document.getElementById('blueprint-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth * dpr();
      h = canvas.height = window.innerHeight * dpr();
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      draw();
    }

    // Абстрактный чертёж: силуэт фигуры/шлема из линий и дуг,
    // плюс несколько "измерительных" засечек и окружностей —
    // подчёркнуто инженерный, не буквальная копия чужого дизайна.
    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Лёгкий параллакс: фон смещается медленнее контента, создавая
      // ощущение глубины между чертежом и страницей поверх него.
      const parallax = scrollOffset * 0.12 * dpr();
      const cx = w * 0.78;
      const cy = h * 0.32 - parallax * 0.6;
      const scale = Math.min(w, h) * 0.34;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
      ctx.lineWidth = 1 * dpr();

      // контур "шлема" — набор дуг
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale * 0.42, scale * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy + scale * 0.05, scale * 0.3, scale * 0.36, 0, 0, Math.PI * 2);
      ctx.stroke();

      // визор
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.28, cy - scale * 0.02);
      ctx.quadraticCurveTo(cx, cy + scale * 0.14, cx + scale * 0.28, cy - scale * 0.02);
      ctx.stroke();

      // измерительные линии / засечки вокруг
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const r1 = scale * 0.62;
        const r2 = scale * (0.68 + (i % 3) * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }

      // внешняя пунктирная орбита
      ctx.setLineDash([4 * dpr(), 8 * dpr()]);
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // второй, меньший узел чертежа снизу-слева (плечевой блок/деталь)
      const cx2 = w * 0.12;
      const cy2 = h * 0.78 - parallax;
      const scale2 = scale * 0.6;
      ctx.beginPath();
      ctx.rect(cx2 - scale2 * 0.3, cy2 - scale2 * 0.22, scale2 * 0.6, scale2 * 0.44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx2 - scale2 * 0.3, cy2);
      ctx.lineTo(cx2 - scale2 * 0.5, cy2);
      ctx.moveTo(cx2 + scale2 * 0.3, cy2);
      ctx.lineTo(cx2 + scale2 * 0.5, cy2);
      ctx.stroke();
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(cx2, cy2 + i * scale2 * 0.15, scale2 * 0.05, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => { draw(); scrollTicking = false; });
    }, { passive: true });

    resize();
    window.addEventListener('resize', resize);
  }

  /* ---------------------------------------------------------------
     3. ЦЕНТРАЛЬНОЕ ЯДРО (hero-блок) — энергетическая сфера + кольца
     --------------------------------------------------------------- */
  let coreState = { color: '#00e5ff' };

  function setCoreColor(hex) { coreState.color = hex; }

  function initCentralCore() {
    const canvas = document.getElementById('core-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, cx, cy, radius;
    let orbiters = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width * dpr();
      h = canvas.height = rect.height * dpr();
      cx = w / 2; cy = h / 2;
      // Буфер даёт большой запас (см. CSS #core-canvas) — радиус ядра
      // берём заметно меньше половины буфера, чтобы glow/орбитеры
      // с большим запасом помещались и ничего не обрезалось краем canvas.
      radius = Math.min(w, h) * 0.13;
      if (orbiters.length === 0) {
        orbiters = Array.from({ length: 22 }, () => ({
          angle: Math.random() * Math.PI * 2,
          dist: radius * (1.7 + Math.random() * 1.3),
          speed: (Math.random() * 0.35 + 0.12) * (Math.random() < 0.5 ? 1 : -1) * 0.01,
          r: Math.random() * 1.5 + 0.6,
          tilt: Math.random() * 0.5 - 0.25,
          hue: Math.random()
        }));
      }
    }

    let rot = 0;
    function frame() {
      requestAnimationFrame(frame);
      if (!reducedMotion) rot += 0.0018;
      draw();
    }

    function hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    const accentColors = ['#00e5ff', '#ff3b4e', '#ffab2e', '#b26bff', '#2bffa8'];

    // Гранёный кристалл в центре ("новый элемент") — треугольная
    // призма из нескольких концентрических многоугольников с гранями,
    // а не гладкая сфера. Оригинальная абстрактная форма.
    function drawCrystal(R, r, g, b) {
      const sides = 3; // треугольная огранка
      const layers = [1, 0.62, 0.3];

      layers.forEach((mult, li) => {
        const rr = R * mult;
        const spin = rot * (li % 2 === 0 ? 1 : -1) * (0.5 + li * 0.25);
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = spin + (i / sides) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(a) * rr;
          const py = cy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.55 - li * 0.1 + audioLevel * 0.25})`;
        ctx.lineWidth = (1.3 - li * 0.2) * dpr();
        ctx.stroke();

        // грани — линии от вершин к центру, только на внешнем слое
        if (li === 0) {
          for (let i = 0; i < sides; i++) {
            const a = spin + (i / sides) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.18 + audioLevel * 0.15})`;
            ctx.lineWidth = 1 * dpr();
            ctx.stroke();
          }
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = hexToRgb(coreState.color);

      // Аудио-реактивность: пока играет музыка, audioLevel (0..1)
      // заставляет ядро слегка "дышать" в такт басам.
      const pulse = 1 + audioLevel * 0.22;
      const R = radius * pulse;

      // Мягкое общее свечение вокруг ядра
      const grad = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 3.2);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.22 + audioLevel * 0.12})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Единственное тонкое кольцо-стабилизатор вокруг кристалла
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot * 0.4);
      ctx.scale(1, 0.32);
      ctx.beginPath();
      ctx.arc(0, 0, R * 2.1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.32 + audioLevel * 0.15})`;
      ctx.lineWidth = (1 + audioLevel * 1.1) * dpr();
      ctx.stroke();
      ctx.restore();

      // Многоцветные частицы на безопасном расстоянии от края буфера
      for (const o of orbiters) {
        if (!reducedMotion) o.angle += o.speed * (1 + audioLevel * 1.4);
        const dist = o.dist * (1 + audioLevel * 0.1);
        const ex = cx + Math.cos(o.angle) * dist;
        const ey = cy + Math.sin(o.angle) * dist * 0.34 + Math.sin(o.angle * 2) * o.tilt * R * 0.25;
        const [ar, ag, ab] = hexToRgb(accentColors[Math.floor(o.hue * accentColors.length)]);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.75 + audioLevel * 0.2})`;
        ctx.arc(ex, ey, (o.r + audioLevel * 1.1) * dpr(), 0, Math.PI * 2);
        ctx.fill();
      }

      // Гранёный кристалл — "новый элемент" вместо гладкой сферы
      drawCrystal(R, r, g, b);

      // Яркое ядро-сердцевина внутри кристалла
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
      coreGrad.addColorStop(0, `rgba(255,255,255,0.95)`);
      coreGrad.addColorStop(0.4, `rgba(${r},${g},${b},0.85)`);
      coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.fillStyle = coreGrad;
      ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Сканирующая линия, ограниченная безопасной зоной внутри буфера
      const scanY = cy + Math.sin(rot * 1.3) * R * 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.9, scanY);
      ctx.lineTo(cx + R * 1.9, scanY);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.1)`;
      ctx.lineWidth = 1 * dpr();
      ctx.stroke();
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     4. ГОЛО-ФИГУРА ОПЕРАТОРА (интро)
     --------------------------------------------------------------- */
  function initHoloFigure() {
    const canvas = document.getElementById('holo-figure');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width * dpr();
      h = canvas.height = rect.height * dpr();
    }

    const skeleton = [
      { a: [0.5, 0.12], b: [0.5, 0.30] },
      { a: [0.5, 0.30], b: [0.32, 0.42] },
      { a: [0.5, 0.30], b: [0.68, 0.42] },
      { a: [0.32, 0.42], b: [0.27, 0.62] },
      { a: [0.68, 0.42], b: [0.73, 0.62] },
      { a: [0.5, 0.30], b: [0.5, 0.58] },
      { a: [0.5, 0.58], b: [0.38, 0.60] },
      { a: [0.5, 0.58], b: [0.62, 0.60] },
      { a: [0.38, 0.60], b: [0.36, 0.86] },
      { a: [0.62, 0.60], b: [0.64, 0.86] },
    ];
    const nodes = [
      [0.5, 0.10], [0.5, 0.30], [0.32, 0.42], [0.68, 0.42],
      [0.27, 0.62], [0.73, 0.62], [0.5, 0.58], [0.38, 0.60],
      [0.62, 0.60], [0.36, 0.86], [0.64, 0.86]
    ];
    // назначаем каждому узлу акцентный цвет — разные цвета вместо только синего
    const nodeColors = ['255,255,255', '0,229,255', '178,107,255', '255,171,46',
      '255,59,78', '255,59,78', '0,229,255', '43,255,168',
      '43,255,168', '255,171,46', '255,171,46'];

    let t = 0;
    function frame() {
      requestAnimationFrame(frame);
      if (!reducedMotion) t += 0.016;
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const cyan = '0,229,255';

      const headX = 0.5 * w, headY = 0.10 * h, headR = h * 0.045;
      ctx.beginPath();
      ctx.arc(headX, headY, headR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${cyan},0.85)`;
      ctx.lineWidth = 1.6 * dpr();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX, headY, headR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cyan},0.9)`;
      ctx.fill();

      ctx.lineWidth = 1.4 * dpr();
      for (const seg of skeleton) {
        ctx.beginPath();
        ctx.moveTo(seg.a[0] * w, seg.a[1] * h);
        ctx.lineTo(seg.b[0] * w, seg.b[1] * h);
        ctx.strokeStyle = `rgba(${cyan},0.5)`;
        ctx.stroke();
      }

      nodes.forEach(([nx, ny], i) => {
        const col = nodeColors[i] || cyan;
        ctx.beginPath();
        ctx.arc(nx * w, ny * h, 2.6 * dpr(), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.95)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx * w, ny * h, 7 * dpr(), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col},0.4)`;
        ctx.lineWidth = 1 * dpr();
        ctx.stroke();
      });

      const torsoX = 0.5 * w, torsoY = 0.42 * h;
      [0.16, 0.24].forEach((rr, i) => {
        ctx.save();
        ctx.translate(torsoX, torsoY);
        ctx.rotate(t * (i % 2 === 0 ? 1 : -1) * 0.6);
        ctx.scale(1, 0.3);
        ctx.beginPath();
        ctx.arc(0, 0, h * rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cyan},${0.3 - i * 0.08})`;
        ctx.lineWidth = 1 * dpr();
        ctx.stroke();
        ctx.restore();
      });

      const scanY = ((Math.sin(t * 0.7) + 1) / 2) * h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 14 * dpr(), 0, scanY + 14 * dpr());
      scanGrad.addColorStop(0, `rgba(${cyan},0)`);
      scanGrad.addColorStop(0.5, `rgba(${cyan},0.18)`);
      scanGrad.addColorStop(1, `rgba(${cyan},0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 14 * dpr(), w, 28 * dpr());
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     5. ЧАСТИЦЫ ЗА ПАЛЬЦЕМ — лёгкий голографический след при касании
     или движении мыши, полностью некликабельный слой поверх страницы.
     --------------------------------------------------------------- */
  function initTouchTrail() {
    const canvas = document.getElementById('trail-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    let lastX = null, lastY = null;

    function resize() {
      w = canvas.width = window.innerWidth * dpr();
      h = canvas.height = window.innerHeight * dpr();
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function spawn(x, y) {
      if (particles.length > 90) particles.splice(0, particles.length - 90);
      particles.push({
        x: x * dpr(), y: y * dpr(),
        r: (Math.random() * 2 + 1.2) * dpr(),
        a: 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15
      });
    }

    function onMove(clientX, clientY) {
      if (reducedMotion) return;
      const dx = lastX === null ? 999 : clientX - lastX;
      const dy = lastY === null ? 999 : clientY - lastY;
      if (Math.hypot(dx, dy) < 14) return; // разрежаем спавн по расстоянию
      lastX = clientX; lastY = clientY;
      spawn(clientX, clientY);
    }

    window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function frame() {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      if (particles.length === 0) return;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dpr();
        p.y += p.vy * dpr();
        p.a -= 0.028;
        p.r *= 0.985;
        if (p.a <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,229,255,${p.a * 0.7})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }

  return {
    initBackground, initBlueprint, initCentralCore, initHoloFigure, initTouchTrail,
    setCoreColor, setReducedMotion, setAudioLevel, setScrollOffset
  };
})();
