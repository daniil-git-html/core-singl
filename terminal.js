/* ==========================================================================
   CORE.SINGL — ТЕРМИНАЛ СИСТЕМЫ
   Интерактивная командная строка в главном интерфейсе.
   ========================================================================== */

const Terminal = (() => {

  const d = CORE_DATA;
  let body, input;

  function print(text, cls = '') {
    const line = document.createElement('div');
    line.className = 't-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function printCmd(text) {
    const line = document.createElement('div');
    line.className = 't-line cmd';
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function scrollToSection(id) {
    const el = document.getElementById('sec-' + id);
    if (el) {
      close();
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }

  const COMMANDS = {
    help() {
      print('ДОСТУПНЫЕ КОМАНДЫ:', 'dim');
      ['profile', 'skills', 'performance', 'projects', 'network', 'status', 'about', 'clear']
        .forEach(c => print('  ' + c));
    },
    profile() {
      print('ОПЕРАТОР: ' + d.profile.displayName);
      print('СТРАНА: ' + d.profile.country);
      print('СТАТУС: АКТИВЕН', 'dim');
      print('ОСНОВНЫЕ ИНТЕРЕСЫ:', 'dim');
      d.profile.focus.forEach(f => print('  ' + f));
      scrollToSection('profile');
    },
    skills() {
      d.skills.forEach(s => print(s.name.padEnd(26, ' ') + s.level, 'dim'));
      scrollToSection('skills');
    },
    performance() {
      d.performance.lifts.forEach(l => print(l.name.padEnd(18, ' ') + l.value + ' ' + l.unit));
      print('ВЕС'.padEnd(18, ' ') + d.performance.bodyweight.value + ' ' + d.performance.bodyweight.unit, 'dim');
      scrollToSection('performance');
    },
    projects() {
      d.projects.forEach(p => { print(p.name + '  —  ' + p.status); });
      scrollToSection('projects');
    },
    network() {
      d.network.forEach(n => print(n.name.padEnd(14, ' ') + n.handle, 'dim'));
      scrollToSection('network');
    },
    status() {
      print('СТАТУС ЯДРА: СТАБИЛЕН');
      print('АКТИВНЫХ РАЗДЕЛОВ: 07', 'dim');
      print('ПРОЕКТОВ: ' + d.projects.length, 'dim');
      print('СИСТЕМА: ОНЛАЙН', 'dim');
    },
    about() {
      print(d.system.name + ' — ' + d.system.subtitle);
      print('Персональный интерфейс оператора. Введите "help" для команд.', 'dim');
    },
    clear() {
      body.innerHTML = '';
    },
    diana() {
      const p = d.projects.find(x => x.id === 'diana');
      print('D.I.A.N.A — ' + p.status);
      print(p.desc, 'dim');
    },
    depo() {
      const p = d.projects.find(x => x.id === 'depo');
      print('PROJECT DEPO — ' + p.status);
      print(p.desc, 'dim');
    },
    devmode() {
      print('АКТИВАЦИЯ РЕЖИМА ОТЛАДКИ...', 'ok');
      if (window.triggerDevMode) window.triggerDevMode();
    }
  };

  function handleInput(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printCmd(raw);
    if (COMMANDS[cmd]) {
      COMMANDS[cmd]();
    } else {
      print(`команда не распознана: "${cmd}"`, 'err');
      print('введите "help" для списка команд', 'dim');
    }
    if (Math.random() < 0.12) {
      const q = d.systemQuips[Math.floor(Math.random() * d.systemQuips.length)];
      print(q, 'dim');
    }
  }

  function open() {
    const layer = document.getElementById('sys-terminal-layer');
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 100);
  }

  function close() {
    const layer = document.getElementById('sys-terminal-layer');
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
  }

  function init() {
    body = document.getElementById('sys-terminal-body');
    input = document.getElementById('sys-terminal-input');

    print('ТЕРМИНАЛ СИСТЕМЫ — введите "help", чтобы начать', 'dim');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleInput(input.value);
        input.value = '';
      }
    });

    document.getElementById('sys-terminal-close').addEventListener('click', close);
    document.getElementById('sys-terminal-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('sys-terminal-layer').classList.contains('is-open')) close();
    });
  }

  return { init, open, close };
})();
