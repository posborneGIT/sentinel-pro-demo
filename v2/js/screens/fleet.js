/*
 * SCREENS.fleet — the Fleet Board, this demo's landing screen. KPI row,
 * customer filter chips, machine card grid, recent activity, and a
 * simulated System Status panel.
 */
(function () {
  SCREENS.fleet = function (mount, route, ctx) {
    var UI = ctx.ui, DATA = ctx.data, navigate = ctx.navigate;
    var activeCustomer = null; // null = all customers

    function machineName(id) {
      var m = DATA.machines.filter(function (x) { return x.id === id; })[0];
      return m ? m.name : ('#' + id);
    }
    function kpiRow() {
      var total = DATA.machines.length;
      var sessions = DATA.diagnosticSessions.length;
      var faults = DATA.machines.filter(function (m) { return m.status === 'fault'; }).length;
      var warns = DATA.machines.filter(function (m) { return m.status === 'warn'; }).length;
      return '<div class="kpi-row">' +
        '<div class="kpi"><div class="k-label">Fleet</div><div class="k-val">' + total + '</div><div class="k-sub">machines under management</div></div>' +
        '<div class="kpi"><div class="k-label">Active Sessions</div><div class="k-val">' + sessions + '</div><div class="k-sub">diagnostic sessions on file</div></div>' +
        '<div class="kpi"><div class="k-label">Memory Health</div><div class="k-val">' + UI.pct(DATA.memory.fleetHealth) + '</div><div class="k-sub">fleet-wide index health</div></div>' +
        '<div class="kpi"><div class="k-label">Needs Attention</div><div class="k-val" style="' + (faults ? 'color:var(--fault)' : (warns ? 'color:var(--warn)' : '')) + '">' + (faults + warns) + '</div><div class="k-sub">' + faults + ' fault · ' + warns + ' warn</div></div>' +
        '</div>';
    }

    function customerChips() {
      var chips = '<button class="chip' + (activeCustomer == null ? ' ok' : '') + '" data-cust="all">' + (activeCustomer == null ? UI.dot('ok') : '') + 'All Customers</button>';
      chips += DATA.customers.map(function (c) {
        var on = activeCustomer === c.id;
        return '<button class="chip' + (on ? ' ok' : '') + '" data-cust="' + c.id + '">' + (on ? UI.dot('ok') : '') + UI.escape(c.name) + ' (' + c.machineIds.length + ')</button>';
      }).join('');
      return '<div class="row" id="cust-chips" style="flex-wrap:wrap;gap:8px;margin-bottom:14px">' + chips + '</div>';
    }

    function machineCard(m) {
      var tone = m.status === 'ok' ? '' : m.status;
      var stateLabel = m.status === 'fault' ? 'Fault' : (m.status === 'warn' ? 'Attention' : 'Normal');
      var pm = DATA.memory.perMachine.filter(function (p) { return p.machineId === m.id; })[0];
      return '<button class="mcard" data-machine="' + m.id + '">' +
        '<div class="mc-hd"><span class="mc-name">' + UI.escape(m.name) + '</span>' + UI.state(stateLabel, tone) + '</div>' +
        '<div class="mc-body">' +
        '<div class="mc-row"><span class="mute">' + UI.escape(m.family) + '</span><span>' + UI.escape(m.controller) + '</span></div>' +
        '<div class="mc-row"><span class="mute">Health</span><span class="val">' + UI.pct(m.health) + '</span></div>' +
        '<div class="bar">' + '<i class="' + (m.status === 'fault' ? 'fault' : (m.status === 'warn' ? 'warn' : 'ok')) + '" style="width:' + m.health + '%"></i></div>' +
        '<div class="mc-row"><span class="mute">Documents</span><span>' + m.docs + ' · ' + m.chunks.toLocaleString() + ' chunks</span></div>' +
        (pm ? '<div class="mc-row"><span class="mute">Dense / BM25</span><span>' + UI.pct(pm.denseCoverage) + ' / ' + UI.pct(pm.bm25Coverage) + '</span></div>' : '') +
        '</div></button>';
    }

    function visibleMachines() {
      if (activeCustomer == null) return DATA.machines;
      var c = DATA.customers.filter(function (x) { return x.id === activeCustomer; })[0];
      if (!c) return DATA.machines;
      return DATA.machines.filter(function (m) { return c.machineIds.indexOf(m.id) >= 0; });
    }

    function activityRow(a) {
      var toneByKind = { report: 'info', insight: 'ok', index: '', sync: 'info' };
      return '<button class="link" data-activity-machine="' + a.machineId + '" style="display:block;width:100%;text-align:left;padding:8px 0;border-bottom:1px solid var(--line);color:inherit">' +
        '<div class="row"><span class="dot' + (toneByKind[a.kind] ? ' ' + toneByKind[a.kind] : '') + '"></span>' +
        '<span class="grow" style="font-size:12.5px">' + UI.escape(a.text) + '</span></div>' +
        '<div class="mute" style="font-size:10.5px;margin-left:15px">' + UI.timeAgo(a.t) + ' · ' + UI.escape(machineName(a.machineId)) + '</div>' +
        '</button>';
    }

    function systemStatusPanel() {
      var items = ['Backend API', 'LLM Service', 'Vector Store', 'OPC Bridge', 'Health Daemon'];
      return '<div class="panel"><div class="ph">System Status</div><div class="pb stack">' +
        items.map(function (label) {
          return '<div class="row"><span style="font-size:12.5px">' + UI.escape(label) + '</span><span class="grow"></span>' + UI.state('OK', 'ok') + '</div>';
        }).join('') +
        '<div class="note info" style="margin-top:4px">Simulated for this demo — no live services are actually reachable.</div>' +
        '</div></div>';
    }

    function render() {
      mount.innerHTML =
        kpiRow() +
        customerChips() +
        '<div class="cols cols-2">' +
        '<div class="mgrid" id="mgrid">' + visibleMachines().map(machineCard).join('') + '</div>' +
        '<div class="stack">' +
        '<div class="panel"><div class="ph">Recent Activity</div><div class="pb" style="padding-top:0" id="activity-list">' +
        DATA.activity.slice(0, 8).map(activityRow).join('') +
        '</div></div>' +
        systemStatusPanel() +
        '</div>' +
        '</div>';

      document.getElementById('cust-chips').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cust]');
        if (!btn) return;
        var v = btn.getAttribute('data-cust');
        activeCustomer = v === 'all' ? null : Number(v);
        render();
      });
      document.getElementById('mgrid').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-machine]');
        if (!btn) return;
        navigate('#/fleet/' + btn.getAttribute('data-machine') + '/overview');
      });
      document.getElementById('activity-list').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-activity-machine]');
        if (!btn) return;
        navigate('#/fleet/' + btn.getAttribute('data-activity-machine') + '/overview');
      });
    }

    render();
    return function cleanup() {};
  };
})();
