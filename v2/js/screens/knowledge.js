/*
 * SCREENS.knowledge — fleet-wide Knowledge / Memory dashboard: per-machine
 * dense+BM25 coverage, health checks, External KB sources, and the
 * learning-insight approval queue.
 */
(function () {
  SCREENS.knowledge = function (mount, route, ctx) {
    var UI = ctx.ui, DATA = ctx.data;
    var mem = DATA.memory;

    function machineName(id) {
      var m = DATA.machines.filter(function (x) { return x.id === id; })[0];
      return m ? m.name : ('#' + id);
    }

    function ringCard(pm) {
      return '<div class="panel">' +
        '<div class="ph">' + UI.escape(machineName(pm.machineId)) + (pm.bm25Fresh === false ? '<span class="grow"></span>' + UI.plate('BM25 stale', 'warn') : '') + '</div>' +
        '<div class="pb"><div class="ring-grid">' +
        UI.ring(pm.denseCoverage, 'Dense') +
        UI.ring(pm.bm25Coverage, 'BM25') +
        '</div>' +
        '<div class="row" style="margin-top:10px;justify-content:space-between">' +
        '<span class="mute" style="font-size:11px">' + pm.chunks.toLocaleString() + ' chunks</span>' +
        '<span class="mute" style="font-size:11px">reindexed ' + UI.timeAgo(pm.lastReindex) + '</span>' +
        '</div></div></div>';
    }

    function healthRow(h) {
      return '<div class="row" style="padding:9px 0;border-bottom:1px solid var(--line)">' +
        UI.state(h.status === 'ok' ? 'OK' : 'Attention', h.status === 'ok' ? 'ok' : 'warn') +
        '<span class="grow"></span><span style="flex:2;color:var(--ink2)">' + UI.escape(h.label) + ' — <span class="mute">' + UI.escape(h.detail) + '</span></span>' +
        '</div>';
    }

    function sourceCard(src) {
      return '<div class="panel" data-src="' + src.key + '"><div class="ph">' + UI.escape(src.name) + '<span class="grow"></span>' + UI.state(src.status === 'synced' ? 'Synced' : src.status, src.status === 'synced' ? 'ok' : 'warn') + '</div>' +
        '<div class="pb stack">' +
        '<div class="row"><span class="lbl">Bound machine</span><span class="grow"></span><span class="val" style="font-size:12px">' + UI.escape(machineName(src.machineId)) + '</span></div>' +
        '<div class="row"><span class="lbl">Last sync</span><span class="grow"></span><span class="mute src-lastsync" style="font-size:11.5px">' + UI.timeAgo(src.lastSync) + '</span></div>' +
        '<div class="row"><span class="lbl">Items / Chunks</span><span class="grow"></span><span class="val" style="font-size:12px">' + src.itemsSynced + ' / ' + src.chunksIndexed.toLocaleString() + '</span></div>' +
        '<div id="sync-note-' + src.key + '"></div>' +
        '<button class="btn sm ghost" data-sync="' + src.key + '">Sync Now</button>' +
        '</div></div>';
    }

    function insightRow(ins) {
      var tone = ins.status === 'approved' ? 'ok' : (ins.status === 'rejected' ? 'fault' : 'warn');
      var label = ins.status === 'approved' ? 'Approved' : (ins.status === 'rejected' ? 'Rejected' : 'Pending');
      return '<div class="panel" data-insight="' + ins.id + '" style="margin-bottom:10px">' +
        '<div class="ph">' + UI.escape(machineName(ins.machineId)) + ' — ' + UI.escape(ins.title) + '<span class="grow"></span>' + UI.state(label, tone) + '</div>' +
        '<div class="pb"><div class="mute" style="font-size:12.5px;margin-bottom:8px">' + UI.escape(ins.body) + '</div>' +
        (ins.status === 'pending' ? '<div class="row"><button class="btn sm primary" data-approve="' + ins.id + '">Approve</button><button class="btn sm danger" data-reject="' + ins.id + '">Reject</button></div>' : '') +
        '</div></div>';
    }

    mount.innerHTML =
      '<div class="stack">' +
      '<div class="note info">Hybrid retrieval is enabled fleet-wide: every diagnostic query fuses dense (ChromaDB embedding) search with per-machine BM25 lexical search via reciprocal-rank fusion, so exact tag names and fault codes are keyword-matchable alongside semantic similarity.</div>' +
      '<div class="sec-label">Per-Machine Coverage</div>' +
      '<div class="card-grid">' + mem.perMachine.map(ringCard).join('') + '</div>' +
      '<div class="sec-label">Health Checks</div>' +
      '<div class="panel"><div class="pb">' + mem.healthChecks.map(healthRow).join('') + '</div></div>' +
      '<div class="sec-label">External Knowledge Sources</div>' +
      '<div class="card-grid">' + mem.externalSources.map(sourceCard).join('') + '</div>' +
      '<div class="sec-label">Learning Insights Queue</div>' +
      '<div id="insights-list">' + DATA.learningInsights.map(insightRow).join('') + '</div>' +
      '</div>';

    mount.addEventListener('click', function (e) {
      var syncBtn = e.target.closest('[data-sync]');
      if (syncBtn) {
        var key = syncBtn.getAttribute('data-sync');
        var src = mem.externalSources.filter(function (s) { return s.key === key; })[0];
        var note = document.getElementById('sync-note-' + key);
        syncBtn.disabled = true;
        note.innerHTML = '<div class="note info" style="margin:8px 0">Syncing…</div>';
        setTimeout(function () {
          src.lastSync = new Date().toISOString();
          note.innerHTML = '<div class="note ok" style="margin:8px 0">Synced just now.</div>';
          var card = mount.querySelector('[data-src="' + key + '"] .src-lastsync');
          if (card) card.textContent = UI.timeAgo(src.lastSync);
          syncBtn.disabled = false;
          UI.toast(src.name + ' sync complete.', 'ok');
        }, 1500);
        return;
      }
      var approveBtn = e.target.closest('[data-approve]');
      var rejectBtn = e.target.closest('[data-reject]');
      if (approveBtn || rejectBtn) {
        var id = Number((approveBtn || rejectBtn).getAttribute('data-approve') || (approveBtn || rejectBtn).getAttribute('data-reject'));
        var ins = DATA.learningInsights.filter(function (x) { return x.id === id; })[0];
        if (!ins) return;
        ins.status = approveBtn ? 'approved' : 'rejected';
        var wrap = mount.querySelector('[data-insight="' + id + '"]');
        if (wrap) wrap.outerHTML = insightRow(ins);
        UI.toast('Insight ' + ins.status + '.', approveBtn ? 'ok' : 'info');
      }
    });

    return function cleanup() {};
  };
})();
