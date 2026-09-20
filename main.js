/* ==========================================================================
   CORE.SINGL — ТОЧКА ВХОДА
   ========================================================================== */

(function () {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyReducedMotion(on) {
    document.body.classList.toggle('reduced-motion', on);
    CoreFX.setReducedMotion(on);
  }

  function initHudData() {
    document.getElementById('hud-status').textContent = CORE_DATA.system.status;
    document.getElementById('hud-location').textContent = CORE_DATA.system.location;
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  /* Раздел появляется в зоне видимости -> подсветить, запустить анимации */
  function initScrollObserver() {
    const sections = document.querySelectorAll('.hud-section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(s => s.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          const sectionId = entry.target.dataset.section;
          Modules.animateSection(sectionId);
        }
      });
    }, { threshold: 0.18 });
    sections.forEach(s => io.observe(s));
  }

  function initTerminalOpen() {
    document.getElementById('btn-terminal').addEventListener('click', () => {
      Terminal.open();
    });
  }

  /* ---------------------------------------------------------------
     Фоновая музыка: умеренная громкость, зацикленная, играет пока
     пользователь на сайте или пока не выключит кнопкой. Браузеры
     блокируют автовоспроизведение со звуком без жеста пользователя,
     поэтому запуск привязан к нажатию на стартовую кнопку интро
     (см. initStartGate) — она и есть тот самый жест. После этого
     доступен обычный ручной тумблер вкл/выкл.
     Если файла assets/paranoid.mp3 (или theme.mp3) нет — кнопка
     просто ничего не делает, без ошибок в остальной части сайта.
     --------------------------------------------------------------- */
  function initMusic() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('btn-music');
    if (!audio || !btn) return { start: () => {} };

    audio.volume = 0.35;
    let musicOn = false;
    let userToggledOff = false; // явный отказ пользователя — не запускать снова автоматически
    let analyserSetUp = false;
    let analyser = null;
    let freqData = null;

    function updateBtn() {
      btn.setAttribute('aria-pressed', String(musicOn));
      const label = btn.querySelector('.sys-btn-label');
      if (label) label.textContent = musicOn ? 'МУЗЫКА ВКЛ' : 'МУЗЫКА ВЫКЛ';
    }

    // Web Audio анализатор — питает аудио-реактивность центрального ядра
    // (CoreFX.setAudioLevel). Создаётся один раз, при первом успешном
    // воспроизведении (требует пользовательского жеста для AudioContext).
    function setupAnalyser() {
      if (analyserSetUp) return;
      analyserSetUp = true;
      try {
        const AudioContextCls = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCls) return;
        const ctx = new AudioContextCls();
        const source = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        freqData = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        function tick() {
          requestAnimationFrame(tick);
          if (!musicOn || !analyser) { CoreFX.setAudioLevel(0); return; }
          analyser.getByteFrequencyData(freqData);
          // усредняем низкие частоты (басы) — первые ~8 бинов
          let sum = 0;
          const bassRange = Math.min(8, freqData.length);
          for (let i = 0; i < bassRange; i++) sum += freqData[i];
          const level = Math.min(1, (sum / bassRange) / 190);
          CoreFX.setAudioLevel(level);
        }
        requestAnimationFrame(tick);
      } catch (e) {
        // Web Audio недоступен/заблокирован — просто без аудио-реактивности
      }
    }

    function attemptPlay() {
      if (userToggledOff) return;
      audio.play()
        .then(() => { musicOn = true; updateBtn(); setupAnalyser(); })
        .catch(() => { musicOn = false; updateBtn(); }); // нет файла или автозапуск заблокирован — тихо игнорируем
    }

    btn.addEventListener('click', () => {
      if (musicOn) {
        audio.pause();
        musicOn = false;
        userToggledOff = true;
        CoreFX.setAudioLevel(0);
        updateBtn();
      } else {
        userToggledOff = false;
        attemptPlay();
      }
    });

    updateBtn();

    // start() вызывается из стартовой кнопки интро — это и есть
    // пользовательский жест, разрешающий автовоспроизведение со звуком.
    return { start: attemptPlay };
  }

  /* ---------------------------------------------------------------
     Стартовый экран интро: одна кнопка одновременно включает музыку
     (по умолчанию, как и просили — сразу вкл) и запускает саму
     последовательность интро.
     --------------------------------------------------------------- */
  function initStartGate(startMusic) {
    const gateBtn = document.getElementById('btn-start-scan');
    if (!gateBtn) return;
    gateBtn.addEventListener('click', () => {
      startMusic();
      IntroFX.start();
    }, { once: true });
  }

  /* ---------------------------------------------------------------
     Полоса сканирования сбоку — показывает процент прокрутки страницы.
     --------------------------------------------------------------- */
  function initScanProgress() {
    const fill = document.getElementById('scan-progress-fill');
    const label = document.getElementById('scan-progress-label');
    if (!fill || !label) return;
    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      fill.style.height = pct + '%';
      label.textContent = 'SCAN ' + Math.round(pct) + '%';
      CoreFX.setScrollOffset(window.scrollY);
    }

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });

    update();
  }

  /* ---------------------------------------------------------------
     DEV MODE — пасхалка. Долгое нажатие (600мс) на ядро на главном
     экране открывает декоративный "режим отладки" на полторы секунды.
     Также доступно через скрытую команду терминала "devmode".
     --------------------------------------------------------------- */
  function initDevModeEasterEgg() {
    const overlay = document.getElementById('dev-mode-overlay');
    const target = document.getElementById('hero-stage');
    if (!overlay) return;
    let hideTimer = null;

    function trigger() {
      overlay.classList.add('is-shown');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => overlay.classList.remove('is-shown'), 1500);
    }
    window.triggerDevMode = trigger; // доступно для terminal.js

    if (!target) return;
    let pressTimer = null;
    function startPress() { pressTimer = setTimeout(trigger, 600); }
    function cancelPress() { clearTimeout(pressTimer); }

    target.addEventListener('pointerdown', startPress);
    target.addEventListener('pointerup', cancelPress);
    target.addEventListener('pointerleave', cancelPress);
    target.addEventListener('pointercancel', cancelPress);
  }

  function init() {
    initHudData();
    applyReducedMotion(prefersReducedMotion);

    CoreFX.initBackground();
    CoreFX.initBlueprint();
    CoreFX.initHoloFigure();
    CoreFX.initTouchTrail();

    Modules.renderAll();
    Terminal.init();
    initTerminalOpen();
    initScrollObserver();
    const music = initMusic();
    initScanProgress();
    initDevModeEasterEgg();

    window.addEventListener('core:intro-complete', () => {
      CoreFX.initCentralCore();
    }, { once: true });

    IntroFX.init();
    initStartGate(music.start);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
