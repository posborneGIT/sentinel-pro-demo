/*
 * Sentinel Pro demo v2 — shell + router. Owns: login, alarm strip, header
 * crumb, nav rail, hash router, top-level SCREENS dispatch, and the
 * Machine Workspace tab dispatcher (WorkspaceTabs.*).
 *
 * Screen contract:
 *   window.SCREENS[key] = function(mount, route, ctx) { ...; return cleanupFn?; }
 *   window.WorkspaceTabs[tabKey] = function(mount, machine, ctx) { ...; return cleanupFn?; }
 * `mount` is a plain DOM element already attached to the document — set its
 * innerHTML and/or build DOM inside it. If a screen starts a timer/interval,
 * return a cleanup function; the shell calls it before the next navigation.
 * `ctx` = { data: window.DATA, ui: window.UI, navigate, state }
 */
(function () {
  var RAIL_ITEMS = [
    { key: 'fleet', label: 'Fleet', hash: '#/fleet', icon: '<rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/>' },
    { key: 'diagnostics', label: 'Diagnose', hash: '#/diagnostics', icon: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>' },
    { key: 'documents', label: 'Documents', hash: '#/documents', icon: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>' },
    { key: 'reports', label: 'Reports', hash: '#/reports', icon: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>' },
    { key: 'twin', label: 'Twin', hash: '#/twin', icon: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M10 10l4 4M14 10l-4 4"/>' },
    { key: 'svg-studio', label: 'SVG Studio', hash: '#/svg-studio', icon: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 15l5-5 4 4 3-3 6 6"/>' },
    { key: 'knowledge', label: 'Knowledge', hash: '#/knowledge', icon: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', group: 'bottom' },
    { key: 'customers', label: 'Customers', hash: '#/customers', icon: '<path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18M9 21v-5h6v5"/>', group: 'bottom' },
    { key: 'users', label: 'Users', hash: '#/users', icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/>', group: 'bottom' },
    { key: 'settings', label: 'Settings', hash: '#/settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>', group: 'bottom' }
  ];

  window.SCREENS = window.SCREENS || {};
  window.WorkspaceTabs = window.WorkspaceTabs || {};
  var WORKSPACE_TAB_ORDER = ['overview', 'diagnose', 'documents', 'live', 'history', 'twin'];

  var STATE = {
    user: null,
    role: 'admin',
    theme: 'dark',
    cleanup: null
  };
  window.APP_STATE = STATE;

  function ctx() {
    return { data: window.DATA, ui: window.UI, navigate: navigate, state: STATE };
  }

  function navigate(hash) { window.location.hash = hash; }
  window.APP_NAVIGATE = navigate;

  function parseHash() {
    var h = (window.location.hash || '#/fleet').replace(/^#/, '');
    var parts = h.split('/').filter(Boolean);
    if (parts[0] === 'fleet' && parts[1] && /^\d+$/.test(parts[1])) {
      return { screen: 'workspace', machineId: Number(parts[1]), tab: parts[2] || 'overview' };
    }
    return { screen: parts[0] || 'fleet', machineId: null, tab: null };
  }

  function machineIcon(name) {
    var parts = String(name || '').trim().split(/\s+/);
    var last = parts[parts.length - 1] || '?';
    return last.slice(0, 3).toUpperCase();
  }

  function renderRail(active) {
    var top = RAIL_ITEMS.filter(function (i) { return i.group !== 'bottom'; });
    var bottom = RAIL_ITEMS.filter(function (i) { return i.group === 'bottom'; });
    function item(i) {
      return '<a class="rail-item' + (active === i.key ? ' on' : '') + '" href="' + i.hash + '" title="' + i.label + '">' +
        '<svg viewBox="0 0 24 24">' + i.icon + '</svg><span>' + i.label + '</span></a>';
    }
    return top.map(item).join('') + '<div class="rail-spacer"></div>' + bottom.map(item).join('');
  }

  function activeRailKey(route) {
    if (route.screen === 'workspace') return route.tab === 'diagnose' ? 'diagnostics' : (route.tab === 'documents' ? 'documents' : (route.tab === 'twin' ? 'twin' : 'fleet'));
    if (route.screen === 'fleet') return 'fleet';
    return route.screen;
  }

  function crumbFor(route) {
    var D = window.DATA;
    if (route.screen === 'workspace') {
      var m = D.machines.filter(function (x) { return x.id === route.machineId; })[0];
      var tabLabel = { overview: 'Overview', diagnose: 'Diagnose', documents: 'Documents', live: 'Live Data', history: 'History', twin: 'Twin' }[route.tab] || 'Overview';
      return 'EPI <span class="sep">›</span> Fleet <span class="sep">›</span> ' + UI.escape(m ? m.name : 'Machine') + ' <span class="sep">›</span> ' + tabLabel;
    }
    var labels = { fleet: 'Fleet', documents: 'Documents', reports: 'Reports', knowledge: 'Knowledge', customers: 'Customers', machines: 'Machines', twin: 'XP5 Digital Twin', 'svg-studio': 'SVG Studio', settings: 'Settings', users: 'Users', diagnostics: 'Diagnose' };
    return 'EPI <span class="sep">›</span> ' + (labels[route.screen] || 'Fleet');
  }

  function renderAlarmStrip() {
    var D = window.DATA;
    var faults = D.machines.filter(function (m) { return m.status === 'fault'; }).length;
    var warns = D.machines.filter(function (m) { return m.status === 'warn'; }).length;
    return '<span class="astat">' + UI.dot(faults ? 'fault' : 'ok') + faults + ' FAULT</span>' +
      '<span class="astat">' + UI.dot(warns ? 'warn' : 'ok') + warns + ' WARN</span>' +
      '<span class="astat mute">' + D.machines.length + ' machines · ' + D.customers.length + ' customers</span>' +
      '<span class="astat grow"></span>' +
      '<span class="astat mute">' + D.meta.product + ' ' + D.meta.version + '</span>';
  }

  function roleSwitcherHtml() {
    var D = window.DATA;
    return Object.keys(D.roles).map(function (r) {
      return '<button class="btn sm' + (STATE.role === r ? ' primary' : ' ghost') + '" data-role="' + r + '">' + D.roles[r].label + '</button>';
    }).join('');
  }

  function renderShell() {
    var root = document.getElementById('app-root');
    root.innerHTML =
      '<div class="app-shell">' +
      '<div class="alarm-strip" id="alarm-strip">' + renderAlarmStrip() + '</div>' +
      '<div class="shell-hdr">' +
      '<div class="crumb" id="crumb"></div>' +
      '<div class="grow"></div>' +
      '<div class="row" style="gap:6px" id="role-switcher">' + roleSwitcherHtml() + '</div>' +
      '<button class="btn sm ghost" id="theme-toggle" title="Toggle theme">◐</button>' +
      '</div>' +
      '<div class="shell-body">' +
      '<nav class="rail" id="rail"></nav>' +
      '<main class="main"><div class="page" id="page"></div></main>' +
      '</div>' +
      '</div>' +
      '<div class="demo-banner"><b>INTERACTIVE DEMO</b> — simulated data for demonstration purposes. No document, AI response or live tag shown is connected to a real machine.</div>' +
      '<div class="toasts" id="toasts"></div>' +
      '<div id="modal-host"></div>';

    document.getElementById('theme-toggle').addEventListener('click', function () {
      STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', STATE.theme);
    });
    document.getElementById('role-switcher').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-role]');
      if (!btn) return;
      STATE.role = btn.getAttribute('data-role');
      UI.toast('Viewing as ' + window.DATA.roles[STATE.role].label, 'info', 2600);
      renderShell();
      renderRoute();
    });
  }

  function renderRoute() {
    if (typeof STATE.cleanup === 'function') { try { STATE.cleanup(); } catch (e) { /* noop */ } }
    STATE.cleanup = null;

    var route = parseHash();
    document.getElementById('rail').innerHTML = renderRail(activeRailKey(route));
    document.getElementById('crumb').innerHTML = crumbFor(route);
    var page = document.getElementById('page');
    page.scrollTop = 0;
    var mainEl = document.querySelector('.main');
    if (mainEl) mainEl.scrollTop = 0;

    try {
      if (route.screen === 'workspace') {
        renderWorkspace(page, route, ctx());
      } else if (route.screen === 'diagnostics') {
        // Top-level "Diagnose" rail item: jump into the most recently active machine's Diagnose tab.
        var recent = window.DATA.machines.slice().sort(function (a, b) { return a.lastActivity < b.lastActivity ? 1 : -1; })[0];
        navigate('#/fleet/' + recent.id + '/diagnose');
        return;
      } else if (route.screen === 'twin') {
        // Top-level "Twin" rail item: only XP5 has a digital twin today — jump straight into it.
        var twinMachine = window.DATA.machines.filter(function (m) { return m.hasTwin; })[0];
        if (twinMachine) { navigate('#/fleet/' + twinMachine.id + '/twin'); return; }
        page.innerHTML = '<div class="empty"><div class="k">No digital twin configured</div>No machine in this fleet currently has a digital twin binding.</div>';
      } else if (window.SCREENS[route.screen]) {
        var cleanup = window.SCREENS[route.screen](page, route, ctx());
        if (typeof cleanup === 'function') STATE.cleanup = cleanup;
      } else {
        page.innerHTML = '<div class="empty"><div class="k">Not built yet</div>This screen is still under construction in this preview.</div>';
      }
    } catch (err) {
      console.error('[Sentinel Pro demo] render error for route', route, err);
      page.innerHTML = '<div class="note fault">This screen hit an error while rendering: ' + UI.escape(err && err.message ? err.message : String(err)) + '</div>';
    }
  }

  function renderWorkspace(page, route, c) {
    var m = window.DATA.machines.filter(function (x) { return x.id === route.machineId; })[0];
    if (!m) { page.innerHTML = '<div class="empty"><div class="k">Machine not found</div><a class="link" href="#/fleet">Back to Fleet</a></div>'; return; }
    var tabs = WORKSPACE_TAB_ORDER.filter(function (t) { return t !== 'twin' || m.hasTwin; });
    var tab = tabs.indexOf(route.tab) >= 0 ? route.tab : 'overview';

    page.innerHTML =
      '<div class="panel" style="margin-bottom:14px">' +
      '<div class="wprofile"><div class="wp-icon">' + machineIcon(m.name) + '</div>' +
      '<div class="grow"><div class="wp-name">' + UI.escape(m.name) + '</div>' +
      '<div class="wp-meta">' + UI.escape(m.family) + ' · ' + UI.escape(m.controller) + ' · ' + m.docs + ' documents · ' + m.chunks.toLocaleString() + ' chunks indexed</div></div>' +
      UI.state(m.status === 'fault' ? 'Fault' : (m.status === 'warn' ? 'Attention' : 'Normal'), m.status === 'ok' ? '' : m.status) +
      '</div>' +
      '<div class="tabs" id="ws-tabs">' + tabs.map(function (t) {
        var labels = { overview: 'Overview', diagnose: 'Diagnose', documents: 'Documents', live: 'Live Data', history: 'History', twin: 'Twin' };
        return '<a class="tab' + (t === tab ? ' on' : '') + '" href="#/fleet/' + m.id + '/' + t + '">' + labels[t] + '</a>';
      }).join('') + '</div>' +
      '</div>' +
      '<div id="ws-tab-content"></div>';

    var tabMount = document.getElementById('ws-tab-content');
    var fn = window.WorkspaceTabs[tab];
    if (typeof fn === 'function') {
      var cleanup = fn(tabMount, m, c);
      if (typeof cleanup === 'function') STATE.cleanup = cleanup;
    } else {
      tabMount.innerHTML = '<div class="empty"><div class="k">' + tab + ' tab not built yet</div>This tab is still under construction in this preview.</div>';
    }
  }

  function doLogin(role) {
    var D = window.DATA;
    var u = D.users.filter(function (x) { return x.role === role; })[0] || D.users[0];
    STATE.user = u; STATE.role = u.role;
    document.getElementById('login-root').innerHTML = '';
    renderShell();
    if (!window.location.hash) window.location.hash = '#/fleet';
    renderRoute();
  }
  window.APP_LOGIN = doLogin;

  function renderLogin() {
    var el = document.getElementById('login-root');
    el.innerHTML =
      '<div class="login-wrap"><div class="login-card">' +
      '<div class="login-logo"><div class="mark">SP</div><div><div class="login-title">Sentinel Pro</div><div class="mute" style="font-size:11px">by EPIConsulting NC</div></div></div>' +
      '<div class="login-sub">Industrial AI diagnostics platform — interactive demo v2</div>' +
      '<div class="field"><label>Email</label><input class="input" value="admin@epi.com" readonly></div>' +
      '<div class="field" style="margin-top:10px"><label>Sign in as</label>' +
      '<div class="login-role-pick">' +
      '<button class="btn sm" data-login-role="admin">Admin</button>' +
      '<button class="btn sm" data-login-role="engineer">Engineer</button>' +
      '<button class="btn sm" data-login-role="viewer">Viewer</button>' +
      '</div></div>' +
      '<button class="btn primary" id="login-btn">Sign In</button>' +
      '<div class="login-foot">' + window.DATA.meta.demoNote + '</div>' +
      '</div></div>';

    var picked = 'admin';
    el.querySelectorAll('[data-login-role]').forEach(function (b) {
      b.addEventListener('click', function () {
        picked = b.getAttribute('data-login-role');
        el.querySelectorAll('[data-login-role]').forEach(function (x) { x.classList.remove('primary'); });
        b.classList.add('primary');
      });
    });
    document.getElementById('login-btn').addEventListener('click', function () { doLogin(picked); });
  }

  window.addEventListener('hashchange', renderRoute);
  document.addEventListener('DOMContentLoaded', function () {
    renderLogin();
  });
})();
