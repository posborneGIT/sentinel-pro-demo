/*
 * SCREENS.customers — customer cards with their machines as chips. Each
 * chip has an "x" unassign affordance that REQUIRES confirmation (UI.confirm,
 * danger:true) before doing anything — modeling how the real product's
 * Customers page should behave (a documented incident there currently skips
 * this confirmation). Unassign here is DOM-local only, not persisted.
 */
(function () {
  SCREENS.customers = function (mount, route, ctx) {
    var UI = ctx.ui, DATA = ctx.data, navigate = ctx.navigate;

    function machine(id) { return DATA.machines.filter(function (m) { return m.id === id; })[0]; }

    function machineChip(m) {
      var tone = m.status === 'ok' ? 'ok' : m.status;
      return '<span class="chip' + (m.status !== 'ok' ? ' ' + tone : ' ok') + '" data-chip-machine="' + m.id + '">' +
        UI.dot(tone) +
        '<button class="link" data-goto-machine="' + m.id + '" style="color:inherit">' + UI.escape(m.name) + '</button>' +
        '<button class="link" data-unassign="' + m.id + '" title="Unassign ' + UI.escape(m.name) + '" style="color:var(--mute);font-weight:700;margin-left:2px">×</button>' +
        '</span>';
    }

    function customerCard(c) {
      var machines = c.machineIds.map(machine).filter(Boolean);
      return '<div class="panel" data-customer="' + c.id + '">' +
        '<div class="ph">' + UI.escape(c.name) + '<span class="grow"></span><span class="num">' + machines.length + ' machines</span></div>' +
        '<div class="pb stack">' +
        '<div class="mute" style="font-size:11.5px">' + UI.escape(c.site) + '</div>' +
        '<div class="row" style="flex-wrap:wrap;gap:6px" data-chip-row>' +
        (machines.length ? machines.map(machineChip).join('') : '<span class="mute" style="font-size:12px">No machines assigned.</span>') +
        '</div>' +
        '</div></div>';
    }

    mount.innerHTML =
      '<div class="note info" style="margin-bottom:14px">Unassigning a machine here only removes it from this customer\'s panel — it stays fully visible on the Fleet Board, which filters on active status and access, never on customer assignment.</div>' +
      '<div class="card-grid" id="cust-grid">' + DATA.customers.map(customerCard).join('') + '</div>';

    mount.addEventListener('click', function (e) {
      var gotoBtn = e.target.closest('[data-goto-machine]');
      if (gotoBtn) { navigate('#/fleet/' + gotoBtn.getAttribute('data-goto-machine') + '/overview'); return; }

      var unassignBtn = e.target.closest('[data-unassign]');
      if (unassignBtn) {
        var machineId = Number(unassignBtn.getAttribute('data-unassign'));
        var m = machine(machineId);
        var chipEl = unassignBtn.closest('[data-chip-machine]');
        UI.confirm({
          title: 'Unassign Machine',
          body: 'Unassign <b>' + UI.escape(m ? m.name : 'this machine') + '</b> from this customer? The machine record itself is not deleted, and it remains fully visible on the Fleet Board.',
          okLabel: 'Unassign',
          danger: true,
          onConfirm: function () {
            if (chipEl) {
              var row = chipEl.parentElement;
              chipEl.remove();
              if (row && !row.querySelector('[data-chip-machine]')) {
                row.innerHTML = '<span class="mute" style="font-size:12px">No machines assigned.</span>';
              }
            }
            UI.toast((m ? m.name : 'Machine') + ' unassigned.', 'info');
          }
        });
      }
    });

    return function cleanup() {};
  };
})();
