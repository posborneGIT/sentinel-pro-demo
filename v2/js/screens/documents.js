/*
 * SCREENS.documents — fleet-wide Documents screen: every document across
 * every machine, filterable by machine + category, with search.
 */
(function () {
  SCREENS.documents = function (mount, route, ctx) {
    var UI = ctx.ui, DATA = ctx.data, navigate = ctx.navigate;
    var activeMachine = 'all';
    var activeCategory = 'all';
    var query = '';

    function machineName(id) {
      var m = DATA.machines.filter(function (x) { return x.id === id; })[0];
      return m ? m.name : ('#' + id);
    }

    function filtered() {
      var q = query.trim().toLowerCase();
      return DATA.documents.filter(function (d) {
        if (activeMachine !== 'all' && String(d.machineId) !== activeMachine) return false;
        if (activeCategory !== 'all' && d.category !== activeCategory) return false;
        if (q && (d.title + ' ' + d.filename).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    }

    function docRow(d) {
      return '<tr class="row">' +
        '<td>' + UI.fileplate(d.filename) + '</td>' +
        '<td><div>' + UI.escape(d.title) + '</div><div class="mute" style="font-size:11px">' + UI.escape(d.filename) + '</div></td>' +
        '<td><button class="link" data-goto-machine="' + d.machineId + '">' + UI.escape(machineName(d.machineId)) + '</button></td>' +
        '<td>' + UI.escape(d.category) + '</td>' +
        '<td class="n">' + UI.bytes(d.sizeBytes) + '</td>' +
        '<td class="n">' + d.chunks + '</td>' +
        '<td>' + UI.state(d.indexed ? 'Indexed' : 'Pending', d.indexed ? 'ok' : 'warn') + '</td>' +
        '<td class="mute" style="font-size:11.5px">' + UI.fmtDate(d.uploadedAt) + '</td>' +
        '</tr>';
    }

    function renderTable() {
      var docs = filtered();
      var count = document.getElementById('doc-count');
      var body = document.getElementById('doc-tbody');
      if (count) count.textContent = docs.length + ' of ' + DATA.documents.length;
      if (!body) return;
      body.innerHTML = docs.length ? docs.map(docRow).join('') :
        '<tr><td colspan="8"><div class="empty"><div class="k">No matching documents</div>Try clearing a filter or search term.</div></td></tr>';
    }

    mount.innerHTML =
      '<div class="panel">' +
      '<div class="ph" style="flex-wrap:wrap;height:auto;padding:8px 14px;gap:8px">' +
      '<input class="input" id="doc-search" placeholder="Search documents…" style="height:28px;max-width:240px">' +
      '<select class="select" id="doc-machine-filter" style="height:28px;max-width:200px">' +
      '<option value="all">All Machines</option>' +
      DATA.machines.map(function (m) { return '<option value="' + m.id + '">' + UI.escape(m.name) + '</option>'; }).join('') +
      '</select>' +
      '<select class="select" id="doc-cat-filter" style="height:28px;max-width:220px">' +
      '<option value="all">All Categories</option>' +
      DATA.categories.map(function (c) { return '<option value="' + UI.escape(c) + '">' + UI.escape(c) + '</option>'; }).join('') +
      '</select>' +
      '<span class="grow"></span><span class="num" id="doc-count">' + DATA.documents.length + ' of ' + DATA.documents.length + '</span>' +
      '</div>' +
      '<div class="tw"><table class="t"><thead><tr><th></th><th>Title</th><th>Machine</th><th>Category</th><th class="n">Size</th><th class="n">Chunks</th><th>Status</th><th>Uploaded</th></tr></thead>' +
      '<tbody id="doc-tbody"></tbody></table></div>' +
      '</div>';

    document.getElementById('doc-search').addEventListener('input', function (e) { query = e.target.value; renderTable(); });
    document.getElementById('doc-machine-filter').addEventListener('change', function (e) { activeMachine = e.target.value; renderTable(); });
    document.getElementById('doc-cat-filter').addEventListener('change', function (e) { activeCategory = e.target.value; renderTable(); });
    mount.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-goto-machine]');
      if (btn) navigate('#/fleet/' + btn.getAttribute('data-goto-machine') + '/documents');
    });

    renderTable();
    return function cleanup() {};
  };
})();
