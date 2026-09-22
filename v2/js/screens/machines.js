/*
 * SCREENS.machines — flat table of the whole fleet: search, status filter
 * chips, and a mock "Add Machine" flow that is honest about being disabled
 * in this preview (never claims a fake machine was actually added).
 */
(function () {
  SCREENS.machines = function (mount, route, ctx) {
    var UI = ctx.ui, DATA = ctx.data, navigate = ctx.navigate;
    var query = '';
    var activeStatus = null; // null = all

    function customerName(id) {
      var c = DATA.customers.filter(function (x) { return x.id === id; })[0];
      return c ? c.name : '—';
    }

    function statusChips() {
      var statuses = [
        { key: null, label: 'All', tone: '' },
        { key: 'ok', label: 'Normal', tone: 'ok' },
        { key: 'warn', label: 'Attention', tone: 'warn' },
        { key: 'fault', label: 'Fault', tone: 'fault' }
      ];
      return statuses.map(function (s) {
        var n = s.key == null ? DATA.machines.length : DATA.machines.filter(function (m) { return m.status === s.key; }).length;
        var on = activeStatus === s.key;
        return '<button class="chip' + (on && s.tone ? ' ' + s.tone : '') + '" data-status="' + (s.key == null ? 'all' : s.key) + '">' +
          (s.tone ? UI.dot(s.tone) : '') + UI.escape(s.label) + ' (' + n + ')</button>';
      }).join('');
    }

    function filtered() {
      var q = query.trim().toLowerCase();
      return DATA.machines.filter(function (m) {
        if (activeStatus && m.status !== activeStatus) return false;
        if (q && (m.name + ' ' + m.family + ' ' + m.controller).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    }

    function machineRow(m) {
      var tone = m.status === 'ok' ? '' : m.status;
      var stateLabel = m.status === 'fault' ? 'Fault' : (m.status === 'warn' ? 'Attention' : 'Normal');
      return '<tr class="row" data-machine-row="' + m.id + '" style="cursor:pointer">' +
        '<td class="mono mute" style="font-size:11px">' + m.id + '</td>' +
        '<td>' + UI.escape(m.name) + '</td>' +
        '<td>' + UI.escape(m.family) + '</td>' +
        '<td>' + UI.escape(customerName(m.customerId)) + '</td>' +
        '<td style="font-size:11.5px">' + UI.escape(m.controller) + '</td>' +
        '<td>' + UI.state(stateLabel, tone) + '</td>' +
        '<td class="n">' + UI.pct(m.health) + '</td>' +
        '</tr>';
    }

    function renderTable() {
      var docs = filtered();
      var count = document.getElementById('mach-count');
      var body = document.getElementById('mach-tbody');
      if (count) count.textContent = docs.length + ' of ' + DATA.machines.length;
      if (!body) return;
      body.innerHTML = docs.length ? docs.map(machineRow).join('') :
        '<tr><td colspan="7"><div class="empty"><div class="k">No matching machines</div>Try a different search term or status filter.</div></td></tr>';
    }

    function openAddMachineModal() {
      var id = UI.uid('addmachine');
      UI.openModal(
        '<div class="mh">Add Machine</div>' +
        '<div class="mb stack">' +
        '<div class="field"><label>Name</label><input class="input" id="' + id + '-name" placeholder="e.g. Cross Ply XP6"></div>' +
        '<div class="field"><label>Family</label><input class="input" id="' + id + '-family" placeholder="e.g. Cross Ply Laminator"></div>' +
        '<div class="field"><label>Customer</label><select class="select">' +
        DATA.customers.map(function (c) { return '<option>' + UI.escape(c.name) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="note warn">This preview does not write to a real machine registry — submitting will not create a machine.</div>' +
        '</div>' +
        '<div class="mf">' +
        '<button class="btn ghost" id="' + id + '-cancel">Cancel</button>' +
        '<button class="btn primary" id="' + id + '-submit">Add Machine</button>' +
        '</div>'
      );
      document.getElementById(id + '-cancel').addEventListener('click', UI.closeModal);
      document.getElementById(id + '-submit').addEventListener('click', function () {
        UI.closeModal();
        UI.toast('Demo mode — machine registry changes are disabled in this preview.', 'warn');
      });
    }

    mount.innerHTML =
      '<div class="panel">' +
      '<div class="ph" style="flex-wrap:wrap;height:auto;padding:8px 14px;gap:8px">' +
      '<input class="input" id="mach-search" placeholder="Search machines…" style="height:28px;max-width:240px">' +
      '<div class="row" id="mach-status-chips" style="gap:6px;flex-wrap:wrap">' + statusChips() + '</div>' +
      '<span class="grow"></span>' +
      '<span class="num" id="mach-count">' + DATA.machines.length + ' of ' + DATA.machines.length + '</span>' +
      '<button class="btn primary sm" id="mach-add">Add Machine</button>' +
      '</div>' +
      '<div class="tw"><table class="t"><thead><tr><th>ID</th><th>Name</th><th>Family</th><th>Customer</th><th>Controller</th><th>Status</th><th class="n">Health</th></tr></thead>' +
      '<tbody id="mach-tbody"></tbody></table></div>' +
      '</div>';

    document.getElementById('mach-search').addEventListener('input', function (e) { query = e.target.value; renderTable(); });
    document.getElementById('mach-status-chips').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-status]');
      if (!btn) return;
      var v = btn.getAttribute('data-status');
      activeStatus = v === 'all' ? null : v;
      document.getElementById('mach-status-chips').innerHTML = statusChips();
      renderTable();
    });
    document.getElementById('mach-add').addEventListener('click', openAddMachineModal);
    document.getElementById('mach-tbody').addEventListener('click', function (e) {
      var row = e.target.closest('[data-machine-row]');
      if (row) navigate('#/fleet/' + row.getAttribute('data-machine-row') + '/overview');
    });

    renderTable();
    return function cleanup() {};
  };
})();
