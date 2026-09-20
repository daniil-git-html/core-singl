/* ==========================================================================
   CORE.SINGL — СЦЕНАРИЙ ИНТРО
   Этапы: сигнал -> поиск/анализ -> подтверждение -> рассеивание данных
   вниз по разделам -> передача управления главной странице.
   ========================================================================== */

const IntroFX = (() => {

  let skipped = false;
  let reducedMotion = false;
  const timers = [];

  function delay(fn, ms) {
    // Если skip уже произошёл — выполняем сразу (синхронно в микротаске),
    // а не откладываем: иначе висящие await-промисы в run() никогда не
    // разрешатся, и finish() не будет вызван из основной цепочки.
    if (skipped) {
      Promise.resolve().then(fn);
      return null;
    }
    const id = setTimeout(() => { if (!skipped) fn(); }, ms);
    timers.push(id);
    return id;
  }

  function clearAllTimers() {
    timers.forEach(clearTimeout);
    timers.length = 0;
  }

  function typeLine(el, text, speed = 28) {
    return new Promise((resolve) => {
      if (reducedMotion) { el.textContent = text; resolve(); return; }
      el.classList.add('is-typing');
      let i = 0;
      el.textContent = '';
      const step = () => {
        if (skipped) { el.textContent = text; el.classList.remove('is-typing'); resolve(); return; }
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          const id = setTimeout(step, speed);
          timers.push(id);
        } else {
          el.classList.remove('is-typing');
          resolve();
        }
      };
      step();
    });
  }

  function appendTermLine(container, text, cls = '') {
    const line = document.createElement('div');
    line.className = 't-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
    return line;
  }

  function showStage(n) {
    document.querySelectorAll('.intro-stage').forEach(s => s.classList.remove('is-active'));
    const stage = document.querySelector(`.intro-stage[data-stage="${n}"]`);
    if (stage) stage.classList.add('is-active');
  }

  /* ---------------------------------------------------------------
     Плавающие окна поиска
     --------------------------------------------------------------- */
  function buildWindows() {
    const wrap = document.getElementById('floating-windows');
    const d = CORE_DATA;

    const windows = [
      {
        id: 1, color: 'cyan', title: 'ПОИСК В СЕТИ',
        html: `<div class="fw-row"><span>Поиск</span><span>${d.system.name}</span></div>
               <div class="fw-row"><span>Личность</span><span class="fw-status">НАЙДЕНА</span></div>
               <div class="fw-row"><span>Связи</span><span>сканирование...</span></div>`
      },
      {
        id: 2, color: 'cyan', title: 'АНАЛИЗ GITHUB',
        html: `<div class="fw-row"><span>Репозиторий</span><span class="fw-status">ОБНАРУЖЕН</span></div>
               <div class="fw-row"><span></span><span>D.I.A.N.A</span></div>
               <div class="fw-row"><span></span><span>DEPOT PROJECT</span></div>
               <div class="fw-row"><span>Источник</span><span class="fw-status">ПОДТВЕРЖДЁН</span></div>`
      },
      {
        id: 3, color: 'purple', title: 'СОЦИАЛЬНЫЕ СЕТИ',
        html: d.network.map(n => `<div class="fw-row"><span>${n.name}</span><span class="fw-status">НАЙДЕНО</span></div>`).join('')
      },
      {
        id: 4, color: 'red', title: 'ФИЗИЧЕСКИЕ ДАННЫЕ',
        html: d.performance.lifts.map(l => `<div class="fw-row"><span>${l.name}</span><span>${l.value} ${l.unit}</span></div>`).join('') +
              `<div class="fw-row"><span>ВЕС</span><span>${d.performance.bodyweight.value} ${d.performance.bodyweight.unit}</span></div>`
      },
      {
        id: 5, color: 'amber', title: 'ТЕХНИЧЕСКИЙ ПРОФИЛЬ',
        html: `<div class="fw-row"><span>ЖД СИСТЕМЫ</span><span class="fw-status">ОБНАРУЖЕНО</span></div>
               <div class="fw-row"><span>ПАУЭРЛИФТИНГ</span><span class="fw-status">ОБНАРУЖЕНО</span></div>
               <div class="fw-row"><span>VIBE CODING</span><span class="fw-status">ОБНАРУЖЕНО</span></div>
               <div class="fw-row"><span>ВИДЕОМОНТАЖ</span><span class="fw-status">ОБНАРУЖЕНО</span></div>`
      }
    ];

    windows.forEach(w => {
      const el = document.createElement('div');
      el.className = `f-window color-${w.color}`;
      el.dataset.w = w.id;
      el.innerHTML = `<div class="f-window-title">${w.title}</div>${w.html}`;
      wrap.appendChild(el);
    });
  }

  function revealWindowsSequentially() {
    const els = document.querySelectorAll('.f-window');
    els.forEach((el, i) => {
      delay(() => el.classList.add('is-shown'), 250 * i);
    });
  }

  const TERMINAL_SCRIPT = [
    { t: 'инициализация протокола обнаружения', cls: '' },
    { t: 'сканирование публичной сети...', cls: 'dim' },
    { t: 'поиск цифрового следа', cls: 'dim' },
    { t: 'определение профиля оператора', cls: 'dim' },
    { t: 'сигнал оператора найден', cls: 'ok' },
    { t: 'сопоставление данных...', cls: 'dim' },
    { t: 'анализ паттернов...', cls: 'dim' },
    { t: 'построение профиля оператора...', cls: 'dim' },
    { t: 'сопоставление проектов...', cls: 'dim' },
    { t: 'анализ навыков...', cls: 'dim' },
    { t: 'уровень уверенности: высокий', cls: 'ok' },
    { t: 'профиль подтверждён', cls: 'ok' },
  ];

  async function runTerminalScript() {
    const body = document.getElementById('intro-terminal-body');
    for (const line of TERMINAL_SCRIPT) {
      if (skipped) return;
      appendTermLine(body, line.t, line.cls);
      await new Promise(r => {
        const id = setTimeout(r, reducedMotion ? 10 : 420);
        timers.push(id);
      });
    }
  }

  function revealHoloTags() {
    document.querySelectorAll('.holo-tag').forEach((tag, i) => {
      delay(() => tag.classList.add('is-shown'), 300 + i * 180);
    });
  }

  /* ---------------------------------------------------------------
     Стадия 05 — данные разлетаются вниз к разделам страницы.
     Создаём "осколки" (маленькие цветные HUD-карточки-лейблы),
     летящие от центра к позиции соответствующей секции на реальной
     странице, затем показываем главный интерфейс и скроллим к самому
     верху (hero), чтобы пользователь начал листать вниз сам.
     --------------------------------------------------------------- */
  function buildDispersalShards() {
    const wrap = document.getElementById('dispersal-shards');
    const groups = [
      { label: 'ПРОФИЛЬ ОПЕРАТОРА', color: 'cyan', target: 'sec-profile' },
      { label: 'ФИЗИЧЕСКИЕ ДАННЫЕ', color: 'red', target: 'sec-performance' },
      { label: 'ТЕХНИЧЕСКИЕ НАВЫКИ', color: 'cyan', target: 'sec-skills' },
      { label: 'КОГНИТИВНЫЙ ПРОФИЛЬ', color: 'purple', target: 'sec-cognitive' },
      { label: 'ИНЖЕНЕРНЫЕ СИСТЕМЫ', color: 'amber', target: 'sec-engineering' },
      { label: 'D.I.A.N.A / DEPOT', color: 'cyan', target: 'sec-projects' },
      { label: 'СОЦИАЛЬНЫЕ СВЯЗИ', color: 'green', target: 'sec-network' },
    ];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    groups.forEach((g, i) => {
      const el = document.createElement('div');
      el.className = `dispersal-shard color-${g.color}`;
      el.textContent = g.label;
      // старт — у центра, с небольшим случайным разбросом
      const angle = (i / groups.length) * Math.PI * 2;
      const startX = cx + Math.cos(angle) * 40;
      const startY = cy + Math.sin(angle) * 40;
      el.style.left = startX + 'px';
      el.style.top = startY + 'px';
      wrap.appendChild(el);

      // конечная позиция — низ экрана, по вертикали разнесены,
      // создаёт ощущение "падения" данных к своим разделам
      const endY = window.innerHeight + 60;
      const endX = window.innerWidth * (0.15 + 0.7 * (i / (groups.length - 1)));

      delay(() => {
        el.classList.add('is-flying');
        el.style.left = endX + 'px';
        el.style.top = endY + 'px';
        el.style.opacity = '0';
      }, 120 * i);
    });
  }

  /* ---------------------------------------------------------------
     Главная последовательность
     --------------------------------------------------------------- */
  async function run() {
    reducedMotion = document.body.classList.contains('reduced-motion');

    if (reducedMotion) {
      showStage('01');
      await new Promise(r => setTimeout(r, 150));
      showStage('02');
      buildWindows();
      document.querySelectorAll('.f-window').forEach(el => el.classList.add('is-shown'));
      document.getElementById('holo-figure-wrap').classList.add('is-shown');
      document.querySelectorAll('.holo-tag').forEach(t => t.classList.add('is-shown'));
      const body = document.getElementById('intro-terminal-body');
      TERMINAL_SCRIPT.forEach(l => appendTermLine(body, l.t, l.cls));
      await new Promise(r => setTimeout(r, 250));
      showStage('04');
      document.getElementById('confidence-fill').style.width = '98%';
      document.getElementById('confidence-pct').textContent = '98%';
      document.getElementById('access-granted').classList.add('is-shown');
      await new Promise(r => setTimeout(r, 300));
      showStage('05');
      await new Promise(r => setTimeout(r, 300));
      finish();
      return;
    }

    // --- Стадия 01: сигнал ---
    showStage('01');
    const lines = document.querySelectorAll('#stage-01 .intro-line');
    await new Promise(r => delay(r, 900));
    await typeLine(lines[0], 'СИГНАЛ СИСТЕМЫ ОБНАРУЖЕН', 34);
    await new Promise(r => delay(r, 400));
    await typeLine(lines[1], 'ЗАПУСК ПРОТОКОЛА ОБНАРУЖЕНИЯ...', 22);
    await new Promise(r => delay(r, 700));

    // --- Стадия 02: поиск + анализ ---
    showStage('02');
    buildWindows();
    runTerminalScript();
    delay(revealWindowsSequentially, 300);
    delay(() => {
      document.getElementById('holo-figure-wrap').classList.add('is-shown');
      revealHoloTags();
    }, 1400);

    await new Promise(r => delay(r, 6600));

    // --- Стадия 04: подтверждение профиля ---
    showStage('04');
    const wideLine = document.querySelector('#stage-04 .intro-line--wide');
    const brandLine = document.querySelector('#stage-04 .intro-line--brand');
    await typeLine(wideLine, 'ОПЕРАТОР ИДЕНТИФИЦИРОВАН', 30);
    brandLine.textContent = CORE_DATA.system.name;
    await new Promise(r => delay(r, 500));

    delay(() => {
      const fill = document.getElementById('confidence-fill');
      const pct = document.getElementById('confidence-pct');
      fill.style.width = '98%';
      let start = 0;
      const step = () => {
        if (skipped) return;
        start += 3;
        if (start >= 98) start = 98;
        pct.textContent = start + '%';
        if (start < 98) { const id = setTimeout(step, 25); timers.push(id); }
      };
      step();
    }, 100);

    await new Promise(r => delay(r, 2000));
    document.getElementById('access-granted').classList.add('is-shown');
    await new Promise(r => delay(r, 1300));

    // --- Стадия 05: рассеивание данных вниз по разделам ---
    showStage('05');
    buildDispersalShards();
    await new Promise(r => delay(r, 1900));

    finish();
  }

  function finish() {
    if (document.body.classList.contains('intro-done')) return;
    document.body.classList.add('intro-done');
    document.getElementById('intro').setAttribute('aria-hidden', 'true');
    document.getElementById('main-interface').setAttribute('aria-hidden', 'false');
    // Явно снимаем is-active со всех стадий: у .intro-stage.is-active
    // задан pointer-events:auto, который перебивает родительский
    // pointer-events:none на .intro и может перехватывать клики по
    // главной странице, если стадия осталась активной.
    document.querySelectorAll('.intro-stage.is-active').forEach(s => s.classList.remove('is-active'));
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('core:intro-complete'));
  }

  function skip() {
    if (skipped) return;
    skipped = true;
    clearAllTimers();
    finish();
  }

  function init() {
    // Подготовка: вешаем обработчик кнопки "Пропустить" заранее, но
    // саму последовательность интро не запускаем — она стартует по
    // явному нажатию на кнопку запуска (start()), см. стартовый экран.
    document.getElementById('btn-skip').addEventListener('click', skip);
  }

  function start() {
    if (document.body.classList.contains('intro-started')) return;
    document.body.classList.add('intro-started');
    // Стартовый экран (стадия 00) больше не нужен — снимаем его
    // активность на всякий случай (run() тоже уберёт его через
    // showStage('01'), это подстраховка).
    const gate = document.getElementById('stage-00');
    if (gate) gate.classList.remove('is-active');

    // Любая непредвиденная ошибка в run() не должна оставлять страницу
    // заблокированной интро-слоем — при сбое доводим до финального
    // состояния в любом случае.
    run().catch((err) => {
      console.error('IntroFX.run() упал с ошибкой, завершаем интро принудительно:', err);
      finish();
    });
    // Предохранитель: интро в самом длинном сценарии укладывается
    // в ~14 секунд. Если по любой причине finish() не был вызван за
    // 20 секунд, страница не должна оставаться заблокированной.
    setTimeout(() => {
      if (!document.body.classList.contains('intro-done')) {
        console.warn('Интро не завершилось штатно за 20с — принудительное завершение.');
        finish();
      }
    }, 20000);
  }

  return { init, start, skip };
})();
