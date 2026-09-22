/*
 * WorkspaceTabs.live — OPC Bridge live monitor: agent status, live tag
 * table with a random-walk simulation, a canvas trend line for the tag
 * flagged trendingHigh, an explicit LIVE/PAUSED feed-status chip (never a
 * silently-frozen display), and one AI tag-suggestion card.
 */
(function () {
  WorkspaceTabs.live = function (mount, machine, ctx) {
    var UI = ctx.ui, DATA = ctx.data;
    var agent = DATA.opcAgents.filter(function (a) { return a.machineId === machine.id; })[0];
    var tags = DATA.opcTags[machine.id];

    if (!agent || !tags || !tags.length) {
      mount.innerHTML = '<div class="empty"><div class="k">No OPC bridge agent configured for this machine.</div>Live tag streaming is set up per machine by a floor agent — none is bound to ' + UI.escape(machine.name) + ' in this demo.</div>';
      return function cleanup() {};
    }

    // working copies so the interval can mutate values without touching DATA
    var live = tags.map(function (t) { return Object.assign({}, t, { value: t.base }); });
    var trendTag = live.filter(function (t) { return t.trendingHigh; })[0] || live[0];
    var history = []; // rolling window of {t, v} for trendTag
    var tickCount = 0;
    var running = true;
    var intervalId = null;

    var suggestion = { tag: machine.id === 5 ? 'PLATEN_Z3_SETPOINT_SP' : 'AUX_PROCESS_SETPOINT', label: 'AI-suggested tag — related setpoint for ' + (trendTag ? trendTag.label : 'process') };

    mount.innerHTML =
      '<div class="cols cols-2">' +
      '<div class="stack">' +
      '<div class="panel"><div class="ph">Live Tags<span class="grow"></span>' +
      '<span class="chip" id="feed-chip"></span>' +
      '<button class="btn sm ghost" id="run-toggle" style="margin-left:8px"></button></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Tag</th><th>Label</th><th class="n">Value</th><th>Range</th><th>State</th></tr></thead>' +
      '<tbody id="tag-body"></tbody></table></div></div>' +
      '<div class="panel"><div class="ph">Trend — ' + UI.escape(trendTag ? trendTag.label : '') + '</div>' +
      '<div class="pb opc-trend-wrap"><canvas id="trend-canvas"></canvas></div></div>' +
      '</div>' +
      '<div class="stack">' +
      '<div class="panel"><div class="ph">Agent</div><div class="pb stack">' +
      '<div class="row"><span class="lbl">Name</span><span class="grow"></span><span class="val">' + UI.escape(agent.name) + '</span></div>' +
      '<div class="row"><span class="lbl">Protocol</span><span class="grow"></span><span class="val">' + UI.escape(agent.protocol) + '</span></div>' +
      '<div class="row"><span class="lbl">Status</span><span class="grow"></span>' + UI.state(agent.status === 'online' ? 'Online' : 'Offline', agent.status === 'online' ? 'ok' : 'fault') + '</div>' +
      '<div class="row"><span class="lbl">Last Seen</span><span class="grow"></span><span class="mute" style="font-size:11.5px">' + UI.timeAgo(agent.lastSeen) + '</span></div>' +
      '</div></div>' +
      '<div class="panel"><div class="ph">AI Tag Suggestion</div><div class="pb stack">' +
      '<div class="note info">' + UI.escape(suggestion.label) + '<br><span class="mono" style="font-size:11px">' + UI.escape(suggestion.tag) + '</span></div>' +
      '<div class="row" id="sugg-actions"><button class="btn sm primary" id="sugg-approve">Approve</button><button class="btn sm ghost" id="sugg-reject">Reject</button></div>' +
      '</div></div>' +
      '</div></div>';

    var tbody = document.getElementById('tag-body');
    var canvas = document.getElementById('trend-canvas');

    function renderFeedChip() {
      var chip = document.getElementById('feed-chip');
      var btn = document.getElementById('run-toggle');
      if (running) { chip.className = 'chip ok'; chip.innerHTML = UI.dot('ok') + 'LIVE'; btn.textContent = 'Pause'; }
      else { chip.className = 'chip warn'; chip.innerHTML = UI.dot('warn') + 'PAUSED'; btn.textContent = 'Resume'; }
    }

    function renderTags() {
      tbody.innerHTML = live.map(function (t) {
        var alarmed = t.alarmHigh != null && t.value >= t.alarmHigh;
        var pos = ((t.value - t.band[0]) / (t.band[1] - t.band[0])) * 100;
        return '<tr class="row' + (alarmed ? ' sev-fault' : '') + '">' +
          '<td class="mono" style="font-size:11px">' + UI.escape(t.tag) + '</td>' +
          '<td>' + UI.escape(t.label) + '</td>' +
          '<td class="n tagrow-val">' + t.value.toFixed(1) + '<span class="unit">' + UI.escape(t.unit) + '</span></td>' +
          '<td style="width:120px">' + UI.bar(pos, alarmed ? 'fault' : '') + '</td>' +
          '<td>' + UI.state(alarmed ? 'Alarm' : 'Normal', alarmed ? 'fault' : '') + '</td>' +
          '</tr>';
      }).join('');
    }

    function drawTrend() {
      if (!canvas || !trendTag) return;
      var w = canvas.clientWidth || 400, h = canvas.clientHeight || 150;
      canvas.width = w; canvas.height = h;
      var g = canvas.getContext('2d');
      g.clearRect(0, 0, w, h);
      if (history.length < 2) return;
      var lo = trendTag.band[0], hi = trendTag.band[1];
      function y(v) { return h - ((v - lo) / (hi - lo)) * h; }
      g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line2').trim() || '#3b434e';
      g.lineWidth = 1;
      if (trendTag.alarmHigh != null) {
        g.beginPath(); g.setLineDash([4, 3]);
        g.moveTo(0, y(trendTag.alarmHigh)); g.lineTo(w, y(trendTag.alarmHigh)); g.stroke();
        g.setLineDash([]);
      }
      g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--info').trim() || '#4c9be8';
      g.lineWidth = 1.6;
      g.beginPath();
      history.forEach(function (p, i) {
        var x = (i / (history.length - 1)) * w;
        if (i === 0) g.moveTo(x, y(p.v)); else g.lineTo(x, y(p.v));
      });
      g.stroke();
    }

    function tick() {
      tickCount += 1;
      live.forEach(function (t) {
        var drift = (Math.random() - 0.5) * 2 * t.noise;
        if (t.trendingHigh) drift += t.noise * 0.35; // biased upward walk toward alarmHigh
        var next = t.value + drift;
        next = Math.max(t.band[0], Math.min(t.band[1] * 1.02, next));
        t.value = next;
      });
      var tt = live.filter(function (t) { return t.tag === trendTag.tag; })[0];
      history.push({ t: tickCount, v: tt.value });
      if (history.length > 60) history.shift();
      renderTags();
      drawTrend();
    }

    function start() { if (intervalId) return; running = true; renderFeedChip(); intervalId = setInterval(tick, 1200); }
    function pause() { running = false; renderFeedChip(); if (intervalId) { clearInterval(intervalId); intervalId = null; } }

    document.getElementById('run-toggle').addEventListener('click', function () { running ? pause() : start(); });
    var approveBtn = document.getElementById('sugg-approve');
    var rejectBtn = document.getElementById('sugg-reject');
    approveBtn.addEventListener('click', function () {
      UI.toast('Tag approved — added to ' + machine.name + '’s monitored set.', 'ok');
      approveBtn.disabled = true; rejectBtn.disabled = true;
    });
    rejectBtn.addEventListener('click', function () {
      UI.toast('Suggestion rejected.', 'info');
      approveBtn.disabled = true; rejectBtn.disabled = true;
    });

    renderTags();
    renderFeedChip();
    tick();
    start();

    return function cleanup() { if (intervalId) clearInterval(intervalId); };
  };
})();
