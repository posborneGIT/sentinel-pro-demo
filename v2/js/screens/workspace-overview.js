/*
 * WorkspaceTabs.overview — machine profile: spec table, memory coverage
 * rings, quick-action navigation into sibling tabs, scoped activity feed,
 * and a pending-learning-insights count.
 */
(function () {
  WorkspaceTabs.overview = function (mount, machine, ctx) {
    var UI = ctx.ui, DATA = ctx.data, navigate = ctx.navigate;

    var pm = DATA.memory.perMachine.filter(function (p) { return p.machineId === machine.id; })[0];
    var customer = DATA.customers.filter(function (c) { return c.id === machine.customerId; })[0];
    var activity = DATA.activity.filter(function (a) { return a.machineId === machine.id; });
    var pendingInsights = DATA.learningInsights.filter(function (i) { return i.machineId === machine.id && i.status === 'pending'; });

    function specRow(label, val) {
      return '<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)">' +
        '<span class="lbl" style="width:110px;flex:none">' + UI.escape(label) + '</span>' +
        '<span class="grow"></span><span class="val" style="text-align:right">' + UI.escape(val || '—') + '</span></div>';
    }

    function activityRow(a) {
      var toneByKind = { report: 'info', insight: 'ok', index: '', sync: 'info' };
      return '<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)">' +
        '<span class="dot' + (toneByKind[a.kind] ? ' ' + toneByKind[a.kind] : '') + '"></span>' +
        '<span class="grow" style="font-size:12.5px">' + UI.escape(a.text) + '</span>' +
        '<span class="mute" style="font-size:10.5px">' + UI.timeAgo(a.t) + '</span></div>';
    }

    mount.innerHTML =
      '<div class="cols cols-2">' +
      '<div class="stack">' +
      '<div class="panel"><div class="ph">Machine Specification</div><div class="pb">' +
      specRow('Family', machine.family) +
      specRow('Customer', customer ? customer.name : '—') +
      specRow('Controller', machine.controller) +
      specRow('Motion', machine.motion) +
      specRow('Servo', machine.servo) +
      specRow('VFD', machine.vfd) +
      '</div>' +
      '<div class="pb" style="padding-top:0"><div class="note' + (machine.status === 'ok' ? ' ok' : ' ' + machine.status) + '">' + UI.escape(machine.summary) + '</div></div>' +
      '</div>' +
      '<div class="panel"><div class="ph">Quick Actions</div><div class="pb row" style="flex-wrap:wrap;gap:8px">' +
      '<button class="btn primary" data-qa="diagnose">Open Diagnose</button>' +
      '<button class="btn" data-qa="documents">Browse Documents</button>' +
      '<button class="btn" data-qa="live">View Live Data</button>' +
      '</div></div>' +
      '<div class="panel"><div class="ph">Activity — ' + UI.escape(machine.name) + '<span class="grow"></span><span class="num">' + activity.length + '</span></div>' +
      '<div class="pb">' + (activity.length ? activity.map(activityRow).join('') : '<div class="empty">No recorded activity for this machine.</div>') + '</div></div>' +
      '</div>' +
      '<div class="stack">' +
      '<div class="panel"><div class="ph">Memory Coverage</div><div class="pb">' +
      (pm ? '<div class="ring-grid">' + UI.ring(pm.denseCoverage, 'Dense') + UI.ring(pm.bm25Coverage, 'BM25') + '</div>' +
        '<div class="row" style="margin-top:10px;justify-content:space-between">' +
        '<span class="mute" style="font-size:11px">' + pm.chunks.toLocaleString() + ' chunks</span>' +
        '<span class="mute" style="font-size:11px">reindexed ' + UI.timeAgo(pm.lastReindex) + '</span></div>' +
        (pm.bm25Fresh === false ? '<div class="note warn" style="margin-top:10px">BM25 lexical index is stale for this machine — it rebuilds lazily on the next diagnostic query.</div>' : '')
        : '<div class="empty">No memory coverage data on file.</div>') +
      '</div></div>' +
      '<div class="panel"><div class="ph">Learning Insights<span class="grow"></span>' +
      UI.plate(pendingInsights.length + ' pending', pendingInsights.length ? 'warn' : '') + '</div>' +
      '<div class="pb">' + (pendingInsights.length
        ? pendingInsights.map(function (i) { return '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="grow" style="font-size:12.5px">' + UI.escape(i.title) + '</span></div>'; }).join('')
        : '<div class="empty">No pending insights awaiting review.</div>') +
      '<button class="btn sm ghost" id="ov-to-knowledge" style="margin-top:8px;width:100%">Review in Knowledge</button>' +
      '</div></div>' +
      '</div>' +
      '</div>';

    mount.addEventListener('click', function (e) {
      var qa = e.target.closest('[data-qa]');
      if (qa) { navigate('#/fleet/' + machine.id + '/' + qa.getAttribute('data-qa')); return; }
      if (e.target.closest('#ov-to-knowledge')) { navigate('#/knowledge'); }
    });

    return function cleanup() {};
  };
})();
