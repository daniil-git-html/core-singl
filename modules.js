/* ==========================================================================
   CORE.SINGL — ЗАПОЛНЕНИЕ РАЗДЕЛОВ ДАННЫМИ
   Разделы уже существуют в разметке (index.html) как часть длинной
   HUD-страницы. Здесь мы просто заполняем их из CORE_DATA.
   ========================================================================== */

const Modules = (() => {

  const d = CORE_DATA;

  function tag(text, extra = '') {
    return `<span class="mp-tag" ${extra}>${text}</span>`;
  }

  function renderProfile() {
    document.getElementById('mp-profile-name').textContent = d.profile.displayName;
    document.getElementById('mp-profile-id').textContent = `SYSTEM ID · ${d.profile.systemId} — ${d.profile.country}`;
    document.getElementById('mp-profile-desc').textContent = d.profile.description;
    document.getElementById('mp-profile-focus').innerHTML = d.profile.focus.map(f => tag(f)).join('');
    document.getElementById('mp-profile-goal').textContent = `ГЛАВНАЯ ЦЕЛЬ — ${d.profile.mainGoal}`;
    document.getElementById('mp-profile-note').textContent = d.profile.note;
    document.getElementById('mp-profile-interests').innerHTML = d.profile.interests.map(i => tag(i)).join('');
  }

  function renderPerformance() {
    const statsEl = document.getElementById('mp-perf-stats');
    const total = d.performance.lifts.reduce((s, l) => s + l.value, 0);
    statsEl.innerHTML = `
      <div class="mp-stat">
        <div class="mp-stat-value">${d.performance.height.value}<span class="mp-stat-unit">${d.performance.height.unit}</span></div>
        <div class="mp-stat-label mono">${d.performance.height.label}</div>
      </div>
      <div class="mp-stat">
        <div class="mp-stat-value">${d.performance.bodyweight.value}<span class="mp-stat-unit">${d.performance.bodyweight.unit}</span></div>
        <div class="mp-stat-label mono">${d.performance.bodyweight.label}</div>
      </div>
      <div class="mp-stat">
        <div class="mp-stat-value">${total}<span class="mp-stat-unit">КГ</span></div>
        <div class="mp-stat-label mono">СУММА ПОКАЗАТЕЛЕЙ СИЛЫ</div>
      </div>
      <div class="mp-stat">
        <div class="mp-stat-value mp-stat-value--small">${d.performance.directive.join(' · ')}</div>
        <div class="mp-stat-label mono">ДИРЕКТИВА</div>
      </div>
    `;

    const CIRC = 283;
    const liftsEl = document.getElementById('mp-perf-lifts');
    liftsEl.innerHTML = d.performance.lifts.map(l => {
      const pct = Math.min(1, l.value / l.max);
      const offset = CIRC - CIRC * pct;
      return `
        <div class="mp-lift">
          <div class="mp-lift-ring">
            <svg viewBox="0 0 100 100">
              <circle class="mp-lift-ring-bg" cx="50" cy="50" r="45"></circle>
              <circle class="mp-lift-ring-fill" cx="50" cy="50" r="45" data-offset="${offset}" style="stroke-dashoffset:${CIRC}"></circle>
            </svg>
            <div class="mp-lift-value"><b>${l.value}</b><span>${l.unit}</span></div>
          </div>
          <div class="mp-lift-name mono">${l.name}</div>
        </div>`;
    }).join('');
  }

  function renderSkills() {
    document.getElementById('mp-skill-levels').textContent = d.skillLevels.join('  →  ');
    const total = 4;
    document.getElementById('mp-skills-list').innerHTML = d.skills.map(s => {
      const filled = Math.round(s.levelIndex);
      const segs = Array.from({ length: total }, (_, i) =>
        `<div class="mp-skill-bar-seg ${i < filled ? 'is-filled' : ''}"></div>`
      ).join('');
      return `
        <div class="mp-skill color-${s.color}">
          <div class="mp-skill-head">
            <span class="mp-skill-name">${s.name}</span>
            <span class="mp-skill-level mono">${s.level}</span>
          </div>
          <div class="mp-skill-bar">${segs}</div>
          <div class="mp-skill-desc">${s.desc}</div>
        </div>`;
    }).join('');
  }

  function renderCognitive() {
    document.getElementById('mp-cognitive-list').innerHTML = d.cognitive.map(c => `
      <div class="mp-cog">
        <div class="mp-cog-head">
          <span class="mp-cog-name">${c.name}</span>
          <span class="mp-cog-level mono">${c.level}</span>
        </div>
        <div class="mp-cog-bar"><div class="mp-cog-bar-fill" data-value="${c.value}"></div></div>
        ${c.desc ? `<div class="mp-cog-desc">${c.desc}</div>` : ''}
      </div>`).join('');
  }

  function renderEngineering() {
    document.getElementById('mp-eng-sub').textContent = d.engineering.specialtyEn;
    document.getElementById('mp-eng-institution').textContent = d.engineering.institution;
    document.getElementById('mp-eng-specialty-ru').textContent = d.engineering.specialtyRu;
    document.getElementById('mp-eng-specialty-en').textContent = d.engineering.specialtyEn;
    document.getElementById('mp-eng-systems').innerHTML = d.engineering.systems.map(s =>
      tag(s, 'style="border-color:var(--amber); color:var(--amber)"')
    ).join('');
    document.getElementById('mp-eng-site').textContent = d.engineering.trainingSite;
  }

  function renderProjects() {
    document.getElementById('mp-projects-list').innerHTML = d.projects.map(p => `
      <div class="mp-project color-${p.statusColor}" data-project="${p.id}">
        <div class="mp-project-head">
          <span class="mp-project-name">${p.name}</span>
          <span class="mp-project-status mono">${p.status}</span>
        </div>
        <p class="mp-project-desc">${p.desc}</p>
        <div class="mp-tag-row">${p.tech.map(t => tag(t)).join('')}</div>
        <a class="mp-project-link mono" href="${p.link}" target="_blank" rel="noopener">
          <span>${p.linkLabel}</span><span class="mp-project-link-arrow">→</span>
        </a>
      </div>`).join('');
  }

  function renderNetwork() {
    document.getElementById('mp-network-graph').innerHTML = d.network.map(n => `
      <a class="mp-net-row color-${n.color}" href="${n.link}" target="_blank" rel="noopener">
        <span class="mp-net-row-dot mono">${n.name.slice(0, 2)}</span>
        <span class="mp-net-row-text">
          <span class="mp-net-row-name mono">${n.name}</span>
          <span class="mp-net-row-handle mono">${n.handle}</span>
        </span>
        <span class="mp-net-row-arrow">→</span>
      </a>`).join('');
  }

  /* Заполнить все разделы сразу (вызывается один раз при загрузке) */
  function renderAll() {
    renderProfile();
    renderPerformance();
    renderSkills();
    renderCognitive();
    renderEngineering();
    renderProjects();
    renderNetwork();
  }

  /* Анимации, которые запускаются, когда раздел появляется в зоне видимости */
  function animateSection(sectionId) {
    const el = document.getElementById('sec-' + sectionId);
    if (!el) return;
    if (sectionId === 'performance') {
      el.querySelectorAll('.mp-lift-ring-fill').forEach(ring => {
        ring.style.strokeDashoffset = ring.dataset.offset;
      });
    }
    if (sectionId === 'cognitive') {
      el.querySelectorAll('.mp-cog-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.value + '%';
      });
    }
  }

  return { renderAll, animateSection };
})();
