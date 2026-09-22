/*
 * WorkspaceTabs.twin — XP5 Digital Twin tab (only reached when
 * machine.hasTwin is true, but written generically off machine.id).
 * Bindings + scenario picker + sim runs + diff-event drill-down + a small
 * illustrative zone diagram.
 */
(function () {
  // Persists across tab re-entries within the same page session (module scope).
  var localRuns = null; // lazily cloned from DATA.twin.simRuns per machine
  var selectedRunId = null;
  var pendingTimeouts = [];

  function fmtDT(iso) { return window.UI.fmtDateTime(iso); }

  function scenarioName(id) {
    var s = window.DATA.twin.scenarios.filter(function (x) { return x.id === id; })[0];
    return s ? s.name : id;
  }

  function drawZoneDiagram(canvas, hotZone) {
    var ctxx = canvas.getContext('2d');
    var w = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
    var h = canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
    ctxx.clearRect(0, 0, w, h);
    var cs = getComputedStyle(document.documentElement);
    var norm = cs.getPropertyValue('--norm').trim() || '#6b7580';
    var warn = cs.getPropertyValue('--warn').trim() || '#f0b429';
    var fault = cs.getPropertyValue('--fault').trim() || '#e5484d';
    var line2 = cs.getPropertyValue('--line2').trim() || '#3b434e';
    var ink = cs.getPropertyValue('--ink').trim() || '#d7dde5';
    var zones = ['Zone 1', 'Zone 2', 'Zone 3'];
    var pad = 20 * (window.devicePixelRatio || 1);
    var gap = 16 * (window.devicePixelRatio || 1);
    var bw = (w - pad * 2 - gap * 2) / 3;
    var bh = h - pad * 2;
    zones.forEach(function (label, i) {
      var x = pad + i * (bw + gap);
      var color = norm;
      if (hotZone === i + 1) color = fault;
      else if (hotZone === -(i + 1)) color = warn;
      ctxx.fillStyle = color;
      ctxx.globalAlpha = 0.22;
      ctxx.fillRect(x, pad, bw, bh);
      ctxx.globalAlpha = 1;
      ctxx.strokeStyle = color === norm ? line2 : color;
      ctxx.lineWidth = 2 * (window.devicePixelRatio || 1);
      ctxx.strokeRect(x, pad, bw, bh);
      ctxx.fillStyle = ink;
      ctxx.font = (13 * (window.devicePixelRatio || 1)) + 'px sans-serif';
      ctxx.textAlign = 'center';
      ctxx.fillText(label, x + bw / 2, pad + bh / 2);
    });
  }

  function render(mount, machine, c) {
    var UI = c.ui, DATA = c.data;
    if (!localRuns) localRuns = DATA.twin.simRuns.slice();
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts = [];

    function html() {
      var bindingsRows = DATA.twin.bindings.map(function (b) {
        return '<tr class="row"><td class="mono">' + UI.escape(b.tag) + '</td><td class="mono mute">→</td><td class="mono">' + UI.escape(b.boundTo) + '</td></tr>';
      }).join('');

      var scenarioCards = DATA.twin.scenarios.map(function (s) {
        return '<div class="panel" style="min-width:220px">' +
          '<div class="ph">' + UI.escape(s.name) + '</div>' +
          '<div class="pb stack"><div class="mute" style="font-size:12px">' + UI.escape(s.desc) + '</div>' +
          '<button class="btn sm" data-run="' + s.id + '">Run Simulation</button></div></div>';
      }).join('');

      var runRows = localRuns.map(function (r) {
        var tone = r.status === 'running' ? 'info' : (r.diffEvents > 0 ? 'warn' : 'ok');
        var label = r.status === 'running' ? 'Running' : (r.diffEvents > 0 ? r.diffEvents + ' divergence' + (r.diffEvents > 1 ? 's' : '') : 'Matched');
        return '<tr class="row' + (r.id === selectedRunId ? ' sel' : '') + '" data-select-run="' + r.id + '" style="cursor:pointer">' +
          '<td class="mono">' + r.id + '</td>' +
          '<td>' + UI.escape(scenarioName(r.scenarioId)) + '</td>' +
          '<td>' + UI.state(r.status === 'running' ? 'Running' : 'Complete', r.status === 'running' ? 'info' : '') + '</td>' +
          '<td class="mono mute">' + fmtDT(r.startedAt) + '</td>' +
          '<td>' + UI.chip(label, tone) + '</td>' +
          '</tr>';
      }).join('');

      var selRun = localRuns.filter(function (r) { return r.id === selectedRunId; })[0];
      var diffSection = '';
      if (selRun && selRun.diffEvents > 0) {
        var events = DATA.twin.diffEvents.filter(function (e) { return e.runId === selRun.id; });
        var isIncident = selRun.scenarioId === 'SC-02';
        diffSection = '<div class="panel" style="margin-top:14px">' +
          '<div class="ph">Diff Events — ' + selRun.id + '<span class="grow"></span><span class="num">' + events.length + '</span></div>' +
          '<div class="pb">' +
          (isIncident ? '<div class="note warn" style="margin-bottom:10px">This run replays the real XP5 Zone 3 platen over-temp incident (see the Diagnose tab, session S-5041) so engineers can rehearse the fault pattern against the twin before it happens live.</div>' : '') +
          '<div class="tw"><table class="t"><thead><tr><th>Time</th><th>Tag</th><th class="n">Expected</th><th class="n">Actual</th><th>Note</th></tr></thead><tbody>' +
          events.map(function (e) {
            return '<tr class="row"><td class="mono">' + e.t + '</td><td class="mono">' + UI.escape(e.tag) + '</td>' +
              '<td class="n val">' + e.expected + '</td><td class="n val" style="color:var(--fault)">' + e.actual + '</td>' +
              '<td class="mute">' + UI.escape(e.note) + '</td></tr>';
          }).join('') + '</tbody></table></div></div>';
      }

      return '<div class="cols" style="grid-template-columns: 1fr">' +
        '<div class="panel"><div class="ph">Zone Overview<span class="grow"></span><span class="sub">illustrative</span></div>' +
        '<div class="pb"><div class="twin-canvas-wrap"><canvas id="twin-zone-canvas" style="width:100%;height:100%"></canvas></div></div></div>' +

        '<div class="panel"><div class="ph">Tag Bindings</div><div class="tw"><table class="t"><tbody>' + bindingsRows + '</tbody></table></div></div>' +

        '<div class="panel"><div class="ph">Scenarios</div><div class="pb hscroll">' + scenarioCards + '</div></div>' +

        '<div class="panel"><div class="ph">Sim Runs<span class="grow"></span><span class="num">' + localRuns.length + '</span></div>' +
        '<div class="tw"><table class="t"><thead><tr><th>Run</th><th>Scenario</th><th>Status</th><th>Started</th><th>Result</th></tr></thead><tbody>' + runRows + '</tbody></table></div></div>' +

        diffSection +
        '</div>';
    }

    mount.innerHTML = html();
    var hotZone = -3; // Zone 3 shown as elevated (warn) by default, matching live OPC context
    drawZoneDiagram(document.getElementById('twin-zone-canvas'), hotZone);

    mount.addEventListener('click', function (e) {
      var runBtn = e.target.closest('[data-run]');
      if (runBtn) {
        var scenarioId = runBtn.getAttribute('data-run');
        var newRun = { id: 'RUN-' + Math.floor(200 + Math.random() * 700), scenarioId: scenarioId, status: 'running', startedAt: new Date().toISOString(), diffEvents: 0 };
        localRuns = [newRun].concat(localRuns);
        UI.toast('Simulation started: ' + scenarioName(scenarioId), 'info', 2200);
        mount.innerHTML = html();
        drawZoneDiagram(document.getElementById('twin-zone-canvas'), hotZone);
        var t = setTimeout(function () {
          newRun.status = 'complete';
          UI.toast('Simulation complete: ' + scenarioName(scenarioId), 'ok', 3000);
          mount.innerHTML = html();
          drawZoneDiagram(document.getElementById('twin-zone-canvas'), hotZone);
        }, 1500);
        pendingTimeouts.push(t);
        return;
      }
      var selRow = e.target.closest('[data-select-run]');
      if (selRow) {
        selectedRunId = selRow.getAttribute('data-select-run');
        mount.innerHTML = html();
        drawZoneDiagram(document.getElementById('twin-zone-canvas'), hotZone);
      }
    });

    return function cleanup() {
      pendingTimeouts.forEach(clearTimeout);
      pendingTimeouts = [];
    };
  }

  window.WorkspaceTabs.twin = render;
})();
