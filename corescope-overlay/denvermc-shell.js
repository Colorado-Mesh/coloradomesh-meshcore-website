/* denvermc-shell.js — Colorado Mesh overlay on top of CoreScope.
 *
 * Goals:
 *   - Default /map to a polished Colorado Mesh live-map shell that
 *     hides nonessential CoreScope chrome.
 *   - Default the route to #/live whenever the user lands on /map.
 *   - Provide a clear, accessible control to expose the full CoreScope
 *     analyzer (#/packets, #/nodes, #/channels, #/analytics, #/perf,
 *     etc.) without leaving the page.
 *   - Provide a zero-distraction "Focus" mode that strips every piece
 *     of chrome down to map + nodes, with a single discoverable exit.
 *   - Stay friendly to upstream CoreScope updates: only touches body
 *     classes and DOM elements it owns; never edits vendor files.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__denvermcShell) return; // singleton across SPA mounts
  window.__denvermcShell = { version: 2 };

  var PATH_PREFIX = '/map';
  var STORAGE_KEY = 'denvermc.shell.userPreference';
  var DEFAULT_HASH = '#/live';
  var BRAND_LOGO_SRC = '/logo.png'; // Served by Next app (public/logo.png)

  // Where Colorado Mesh's site root lives. This overlay is served from
  // the same origin as the Next app via nginx, so a relative path works.
  var SITE_HOME_HREF = '/';

  // -- Path detection ---------------------------------------------------
  function isMapPath() {
    var p = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    return p === PATH_PREFIX || p.indexOf(PATH_PREFIX + '/') === 0;
  }

  function currentHashRoute() {
    var h = window.location.hash || '';
    if (!h || h === '#' || h === '#/') return '';
    var stripped = h.replace(/^#/, '').split('?')[0];
    return stripped;
  }

  function isLiveRoute() {
    var r = currentHashRoute();
    return r === '' || r === '/' || r === '/live' || r.indexOf('/live/') === 0;
  }

  // -- User preference --------------------------------------------------
  // Stored values: 'minimal' | 'analyzer' | null (default = minimal on live).
  // Note: 'focus' is intentionally transient — entering Focus mode does
  // not write a preference; ESC / exit pill return the operator to the
  // last persistent mode (minimal by default).
  function readPreference() {
    try { return window.localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  }
  function writePreference(value) {
    try {
      if (value == null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch { /* ignore quota/private-mode */ }
  }

  // -- Default route redirect: /map -> /map#/live -----------------------
  function ensureDefaultRoute() {
    if (!isMapPath()) return;
    var h = window.location.hash;
    if (!h || h === '#' || h === '#/') {
      window.location.replace(
        window.location.pathname + window.location.search + DEFAULT_HASH
      );
    }
  }

  // -- Mode resolution --------------------------------------------------
  // Focus is a transient session-only flag layered on top of persistent
  // mode (minimal | analyzer). When focus is active and we're on the live
  // route, the UI renders as `focus` regardless of persistent mode.
  var focusActive = false;

  function resolveMode() {
    if (!isMapPath()) return 'off';
    if (focusActive && isLiveRoute()) return 'focus';
    if (!isLiveRoute()) return 'analyzer';
    var pref = readPreference();
    if (pref === 'analyzer') return 'analyzer';
    return 'minimal';
  }

  // -- Shell DOM (idempotent) -------------------------------------------
  var topbarEl = null;
  var statusEl = null;
  var fabEl = null;
  var focusBtnEl = null;
  var analyzerToggleBtnEl = null;
  var focusExitEl = null;

  function svgIcon(d, viewBox) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox || '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'denvermc-btn__icon');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
    return svg;
  }

  function buildBrandMark() {
    // Real Colorado Mesh logo (served by Next public/). Falls back to a
    // CSS gradient if the image fails to load so the brand never breaks.
    var mark = document.createElement('span');
    mark.className = 'denvermc-topbar__mark';
    mark.setAttribute('aria-hidden', 'true');

    var img = document.createElement('img');
    img.className = 'denvermc-topbar__mark-img';
    img.src = BRAND_LOGO_SRC;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.width = 32;
    img.height = 32;
    img.addEventListener('error', function () {
      mark.classList.add('denvermc-topbar__mark--fallback');
      img.remove();
    });
    mark.appendChild(img);
    return mark;
  }

  function buildTopbar() {
    if (topbarEl) return topbarEl;

    var bar = document.createElement('header');
    bar.className = 'denvermc-topbar';
    bar.setAttribute('role', 'banner');
    bar.setAttribute('aria-label', 'Colorado Mesh live map');

    // Brand — left
    var brand = document.createElement('a');
    brand.className = 'denvermc-topbar__brand';
    brand.href = SITE_HOME_HREF;
    brand.setAttribute('aria-label', 'Colorado Mesh — back to main site');
    brand.title = 'Back to Colorado Mesh';

    var mark = buildBrandMark();

    var titleWrap = document.createElement('span');
    titleWrap.className = 'denvermc-topbar__title';
    var main = document.createElement('span');
    main.className = 'denvermc-topbar__title-main';
    main.textContent = 'Colorado Mesh';
    var sub = document.createElement('span');
    sub.className = 'denvermc-topbar__title-sub';
    sub.textContent = 'Live network map';
    titleWrap.appendChild(main);
    titleWrap.appendChild(sub);

    brand.appendChild(mark);
    brand.appendChild(titleWrap);

    var spacer = document.createElement('span');
    spacer.className = 'denvermc-topbar__spacer';

    var actions = document.createElement('div');
    actions.className = 'denvermc-topbar__actions';

    // Status pill
    var status = document.createElement('span');
    status.className = 'denvermc-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('data-state', 'pending');
    var statusDot = document.createElement('span');
    statusDot.className = 'denvermc-status__dot';
    statusDot.setAttribute('aria-hidden', 'true');
    var statusLabel = document.createElement('span');
    statusLabel.className = 'denvermc-status__label';
    statusLabel.textContent = 'Connecting';
    status.appendChild(statusDot);
    status.appendChild(statusLabel);
    statusEl = status;

    var divider = document.createElement('span');
    divider.className = 'denvermc-topbar__divider';
    divider.setAttribute('aria-hidden', 'true');

    // Focus mode (visible only when on the live route — only meaningful
    // when there is actually a map to focus on).
    var focusBtn = document.createElement('button');
    focusBtn.type = 'button';
    focusBtn.className = 'denvermc-btn denvermc-btn--ghost denvermc-btn--icon-only-sm';
    focusBtn.id = 'denvermcFocusBtn';
    focusBtn.setAttribute('aria-label', 'Enter focus mode — map and nodes only');
    focusBtn.title = 'Focus mode (map only)';
    focusBtn.appendChild(svgIcon(
      // fullscreen / corners-out glyph
      'M1.5 1.5h4v1.5h-2.5v2.5h-1.5v-4zm9 0h4v4h-1.5v-2.5h-2.5v-1.5zm-9 9h1.5v2.5h2.5v1.5h-4v-4zm11 0h1.5v4h-4v-1.5h2.5v-2.5z',
      '0 0 16 16'
    ));
    var focusLabel = document.createElement('span');
    focusLabel.className = 'denvermc-btn__label denvermc-btn__label--sm-hide';
    focusLabel.textContent = 'Focus';
    focusBtn.appendChild(focusLabel);
    focusBtn.addEventListener('click', function () {
      setFocus(true);
    });
    focusBtnEl = focusBtn;

    // Analyzer toggle (Full analyzer ↔ Minimal map — same button, label
    // & state flip with active mode so the operator always sees the
    // action they can take next).
    var analyzerBtn = document.createElement('button');
    analyzerBtn.type = 'button';
    analyzerBtn.className = 'denvermc-btn denvermc-btn--primary';
    analyzerBtn.id = 'denvermcAnalyzerBtn';
    analyzerBtn.appendChild(svgIcon(
      'M1.5 1.5h5v5h-5v-5zm0 8h5v5h-5v-5zm8-8h5v5h-5v-5zm0 8h5v5h-5v-5z',
      '0 0 16 16'
    ));
    var analyzerLabel = document.createElement('span');
    analyzerLabel.className = 'denvermc-btn__label';
    analyzerLabel.textContent = 'Full analyzer';
    analyzerBtn.appendChild(analyzerLabel);
    analyzerBtn.addEventListener('click', function () {
      var current = resolveMode();
      if (current === 'analyzer') {
        setMode('minimal');
      } else {
        setMode('analyzer');
      }
    });
    analyzerToggleBtnEl = analyzerBtn;

    var siteBtn = document.createElement('a');
    siteBtn.className = 'denvermc-btn denvermc-btn--ghost';
    siteBtn.href = SITE_HOME_HREF;
    siteBtn.setAttribute('aria-label', 'Return to the Colorado Mesh site');
    siteBtn.title = 'Return to coloradomesh.org';
    siteBtn.appendChild(svgIcon(
      'M9.5 2.5l-5 5.5 5 5.5V11h4V6h-4V2.5z',
      '0 0 16 16'
    ));
    var siteLabel = document.createElement('span');
    siteLabel.className = 'denvermc-btn__label denvermc-btn__label--sm-hide';
    siteLabel.textContent = 'Site';
    siteBtn.appendChild(siteLabel);

    actions.appendChild(status);
    actions.appendChild(divider);
    actions.appendChild(focusBtn);
    actions.appendChild(analyzerBtn);
    actions.appendChild(siteBtn);

    bar.appendChild(brand);
    bar.appendChild(spacer);
    bar.appendChild(actions);

    document.body.appendChild(bar);
    topbarEl = bar;
    return bar;
  }

  function buildFab() {
    if (fabEl) return fabEl;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'denvermc-fab';
    btn.id = 'denvermcMinimalFab';
    btn.setAttribute('aria-label', 'Return to the minimal Colorado Mesh live map');
    btn.title = 'Minimal map view';
    btn.appendChild(svgIcon(
      'M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.25A1.75 1.75 0 1 1 8 4.25a1.75 1.75 0 0 1 0 3.5z',
      '0 0 16 16'
    ));
    var label = document.createElement('span');
    label.className = 'denvermc-fab__label';
    label.textContent = 'Minimal map';
    btn.appendChild(label);
    btn.addEventListener('click', function () {
      if (!isLiveRoute()) {
        window.location.hash = DEFAULT_HASH;
      }
      setMode('minimal');
    });
    document.body.appendChild(btn);
    fabEl = btn;
    return btn;
  }

  function buildFocusExit() {
    if (focusExitEl) return focusExitEl;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'denvermc-focus-exit';
    btn.id = 'denvermcFocusExit';
    btn.setAttribute('aria-label', 'Exit focus mode (ESC)');
    btn.title = 'Exit focus mode · ESC';
    btn.appendChild(svgIcon(
      // corners-in / minimize glyph
      'M5.5 1.5v2.5h-2.5v1.5h4v-4h-1.5zm5 0v4h4v-1.5h-2.5v-2.5h-1.5zm-7 9h-2.5v1.5h4v-4h-1.5v2.5zm9-2.5v4h1.5v-2.5h2.5v-1.5h-4z',
      '0 0 16 16'
    ));
    var label = document.createElement('span');
    label.className = 'denvermc-focus-exit__label';
    label.textContent = 'Exit focus';
    btn.appendChild(label);
    btn.addEventListener('click', function () { setFocus(false); });
    document.body.appendChild(btn);
    focusExitEl = btn;
    return btn;
  }

  // -- Mode application -------------------------------------------------
  function setMode(mode) {
    if (!isMapPath()) return;
    // Switching persistent mode also exits focus — the user clearly
    // wants to interact with chrome again.
    focusActive = false;
    if (mode === 'minimal') {
      writePreference(null);
    } else {
      writePreference('analyzer');
    }
    applyMode();
  }

  function setFocus(on) {
    if (!isMapPath()) return;
    if (on && !isLiveRoute()) {
      // Focus only makes sense on the live route — bounce there first.
      window.location.hash = DEFAULT_HASH;
    }
    focusActive = !!on;
    applyMode();
  }

  function syncAnalyzerToggle(mode) {
    if (!analyzerToggleBtnEl) return;
    var label = analyzerToggleBtnEl.querySelector('.denvermc-btn__label');
    if (mode === 'analyzer') {
      analyzerToggleBtnEl.classList.remove('denvermc-btn--primary');
      analyzerToggleBtnEl.classList.add('denvermc-btn--ghost');
      analyzerToggleBtnEl.setAttribute('aria-pressed', 'true');
      analyzerToggleBtnEl.setAttribute('aria-label', 'Switch back to the minimal Colorado Mesh map');
      analyzerToggleBtnEl.title = 'Return to minimal map';
      if (label) label.textContent = 'Minimal map';
    } else {
      analyzerToggleBtnEl.classList.add('denvermc-btn--primary');
      analyzerToggleBtnEl.classList.remove('denvermc-btn--ghost');
      analyzerToggleBtnEl.setAttribute('aria-pressed', 'false');
      analyzerToggleBtnEl.setAttribute('aria-label', 'Open the full analyzer (packets, nodes, channels, analytics, perf)');
      analyzerToggleBtnEl.title = 'Open the full analyzer';
      if (label) label.textContent = 'Full analyzer';
    }
  }

  function syncFocusButton(mode) {
    if (!focusBtnEl) return;
    // Focus button only makes sense on the live route; hide elsewhere.
    var canFocus = isLiveRoute() && mode !== 'focus';
    focusBtnEl.hidden = !canFocus;
  }

  function applyMode() {
    var body = document.body;
    var mode = resolveMode();

    body.classList.toggle('denvermc-shell', mode !== 'off');
    body.classList.toggle('denvermc-minimal', mode === 'minimal');
    body.classList.toggle('denvermc-analyzer', mode === 'analyzer');
    body.classList.toggle('denvermc-focus', mode === 'focus');

    if (mode === 'off') {
      if (topbarEl) topbarEl.setAttribute('hidden', '');
      if (fabEl) fabEl.setAttribute('hidden', '');
      if (focusExitEl) focusExitEl.setAttribute('hidden', '');
      stopMinimalSeedWatch();
      unseedMinimalPanels();
      return;
    }

    // Topbar visible in minimal & analyzer; hidden in focus
    if (topbarEl) {
      if (mode === 'focus') topbarEl.setAttribute('hidden', '');
      else topbarEl.removeAttribute('hidden');
    }
    // FAB only in analyzer mode — gives a discoverable "return to minimal"
    // affordance separate from the topbar toggle (topbar is hidden on
    // very small viewports where the bar collapses controls).
    if (fabEl) {
      if (mode === 'analyzer') fabEl.removeAttribute('hidden');
      else fabEl.setAttribute('hidden', '');
    }
    if (focusExitEl) {
      if (mode === 'focus') focusExitEl.removeAttribute('hidden');
      else focusExitEl.setAttribute('hidden', '');
    }

    syncAnalyzerToggle(mode);
    syncFocusButton(mode);

    if (mode === 'minimal' || mode === 'focus') {
      startMinimalSeedWatch();
    } else {
      stopMinimalSeedWatch();
      unseedMinimalPanels();
    }
  }

  // -- Minimal-mode seed-hide for CoreScope side panels -----------------
  // (Reused for focus mode — both want panels hidden by default while
  // preserving operator open/close affordances.)
  function seedLivePanel(opts) {
    var el = document.getElementById(opts.panelId);
    if (!el) return false;
    if (el.dataset.denvermcSeeded === '1') return false;
    el.dataset.denvermcSeeded = '1';
    seedHiddenIds.add(opts.panelId);
    if (!el.classList.contains('hidden')) {
      el.classList.add('hidden');
      el.dataset.denvermcSeedAdded = '1';
    }
    if (opts.afterSeed) opts.afterSeed();
    return true;
  }

  function seedMinimalPanels() {
    if (!isLiveRoute()) return;
    if (!document.body.classList.contains('denvermc-minimal')
        && !document.body.classList.contains('denvermc-focus')) return;

    seedLivePanel({
      panelId: 'liveFeed',
      afterSeed: function () {
        var feedShow = document.getElementById('feedShowBtn');
        if (feedShow) feedShow.classList.remove('hidden');
      },
    });
    seedLivePanel({
      panelId: 'liveLegend',
      afterSeed: function () {
        var legendToggle = document.getElementById('legendToggleBtn');
        if (legendToggle) {
          legendToggle.setAttribute('aria-label', 'Show legend');
          legendToggle.textContent = '🎨';
        }
      },
    });
  }

  var seedHiddenIds = new Set();

  function userPrefHidden(key) {
    try { return window.localStorage.getItem(key) === 'true'; }
    catch { return false; }
  }

  function unseedLivePanel(opts) {
    var el = document.getElementById(opts.panelId);
    if (!el) return;
    var weAddedHidden = el.dataset.denvermcSeedAdded === '1';
    delete el.dataset.denvermcSeeded;
    delete el.dataset.denvermcSeedAdded;
    if (weAddedHidden && !userPrefHidden(opts.prefKey) && el.classList.contains('hidden')) {
      el.classList.remove('hidden');
      if (opts.afterUnseed) opts.afterUnseed();
    }
  }

  function unseedMinimalPanels() {
    if (!seedHiddenIds.size) return;
    unseedLivePanel({
      panelId: 'liveFeed',
      prefKey: 'live-feed-hidden',
      afterUnseed: function () {
        var feedShow = document.getElementById('feedShowBtn');
        if (feedShow) feedShow.classList.add('hidden');
      },
    });
    unseedLivePanel({
      panelId: 'liveLegend',
      prefKey: 'live-legend-hidden',
      afterUnseed: function () {
        var legendToggle = document.getElementById('legendToggleBtn');
        if (legendToggle) {
          legendToggle.setAttribute('aria-label', 'Hide legend');
          legendToggle.textContent = '✕';
        }
      },
    });
    seedHiddenIds.clear();
  }

  var minimalSeedObserver = null;

  function startMinimalSeedWatch() {
    seedMinimalPanels();

    if (minimalSeedObserver) return;
    minimalSeedObserver = new MutationObserver(function () {
      var inSeededMode = document.body.classList.contains('denvermc-minimal')
                       || document.body.classList.contains('denvermc-focus');
      if (!inSeededMode || !isLiveRoute()) {
        stopMinimalSeedWatch();
        return;
      }
      seedMinimalPanels();
    });
    var appEl = document.getElementById('app');
    if (appEl) {
      minimalSeedObserver.observe(appEl, { childList: true });
    } else {
      minimalSeedObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  function stopMinimalSeedWatch() {
    if (minimalSeedObserver) {
      minimalSeedObserver.disconnect();
      minimalSeedObserver = null;
    }
  }

  // -- Status indicator -------------------------------------------------
  function syncStatus() {
    if (!statusEl) return;
    var label = statusEl.querySelector('.denvermc-status__label');
    var connected = true;
    var bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav && bottomNav.classList.contains('disconnected')) {
      connected = false;
    }
    var logoState = window.__corescopeLogo;
    if (logoState && typeof logoState.isConnected === 'function') {
      try { connected = !!logoState.isConnected(); } catch { /* ignore */ }
    }
    statusEl.setAttribute('data-state', connected ? 'connected' : 'disconnected');
    if (label) label.textContent = connected ? 'Live' : 'Reconnecting';
  }

  // -- Wire up ----------------------------------------------------------
  function init() {
    ensureDefaultRoute();
    if (!isMapPath()) return;

    buildTopbar();
    buildFab();
    buildFocusExit();
    applyMode();
    syncStatus();

    window.addEventListener('hashchange', function () {
      ensureDefaultRoute();
      // Leaving the live route always cancels focus — focus only exists
      // on the live map.
      if (!isLiveRoute()) focusActive = false;
      applyMode();
    });
    window.addEventListener('popstate', applyMode);

    setInterval(syncStatus, 1500);

    // Keyboard shortcuts:
    //   ESC in analyzer mode (on live)   -> minimal
    //   ESC in focus mode               -> exit focus (back to minimal)
    //   ESC while typing                -> no-op (let inputs handle it)
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (focusActive) {
        e.preventDefault();
        setFocus(false);
        return;
      }
      if (!isLiveRoute()) return;
      if (document.body.classList.contains('denvermc-analyzer')) {
        setMode('minimal');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
