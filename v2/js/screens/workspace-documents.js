/*
 * WorkspaceTabs.documents — per-machine document library: category rail
 * with live per-machine counts, a searchable/filterable document table, and
 * a mock "Upload Document" flow. Tab content only — no page-level chrome.
 */
(function () {
  WorkspaceTabs.documents = function (mount, machine, ctx) {
    var UI = ctx.ui, DATA = ctx.data;
    var activeCategory = null; // null = all
    var query = '';

    var machineDocs = DATA.documents.filter(function (d) { return d.machineId === machine.id; });

    function categoryCounts() {
      var counts = {};
      machineDocs.forEach(function (d) { counts[d.category] = (counts[d.category] || 0) + 1; });
      return counts;
    }

    function filteredDocs() {
      var q = query.trim().toLowerCase();
      return machineDocs.filter(function (d) {
        if (activeCategory && d.category !== activeCategory) return false;
        if (q && (d.title + ' ' + d.filename).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
    }

    function railHtml() {
      var counts = categoryCounts();
      var all = '<button class="rail-item"' +
        ' style="width:auto;height:auto;flex-direction:row;justify-content:space-between;padding:7px 10px;border-radius:3px"' +
        ' data-cat="all"><span style="' + (activeCategory == null ? 'color:var(--ink)' : '') + '">All Documents</span>' +
        '<span class="num">' + machineDocs.length + '</span></button>';
      var rows = DATA.categories.map(function (c) {
        var n = counts[c] || 0;
        var on = activeCategory === c;
        return '<button class="rail-item" style="width:auto;height:auto;flex-direction:row;justify-content:space-between;padding:7px 10px;border-radius:3px' + (on ? ';background:var(--g2)' : '') + '" data-cat="' + UI.escape(c) + '">' +
          '<span style="' + (on ? 'color:var(--ink)' : n === 0 ? 'color:var(--mute)' : '') + '">' + UI.escape(c) + '</span>' +
          '<span class="num">' + n + '</span></button>';
      }).join('');
      return all + rows;
    }

    function docRow(d) {
      return '<tr class="row">' +
        '<td>' + UI.fileplate(d.filename) + '</td>' +
        '<td><div>' + UI.escape(d.title) + '</div><div class="mute" style="font-size:11px">' + UI.escape(d.filename) + '</div></td>' +
        '<td>' + UI.escape(d.category) + '</td>' +
        '<td class="n">' + UI.bytes(d.sizeBytes) + '</td>' +
        '<td class="n">' + d.chunks + '</td>' +
        '<td>' + UI.state(d.indexed ? 'Indexed' : 'Pending', d.indexed ? 'ok' : 'warn') + '</td>' +
        '<td class="mute" style="font-size:11.5px">' + UI.fmtDate(d.uploadedAt) + '</td>' +
        '</tr>';
    }

    function renderTable() {
      var docs = filteredDocs();
      var body = document.getElementById('wd-tbody');
      var count = document.getElementById('wd-count');
      if (count) count.textContent = docs.length;
      if (!body) return;
      body.innerHTML = docs.length ? docs.map(docRow).join('') :
        '<tr><td colspan="7"><div class="empty"><div class="k">No matching documents</div>Try a different search term or category.</div></td></tr>';
    }

    function renderRail() {
      var rail = document.getElementById('wd-rail');
      if (rail) rail.innerHTML = railHtml();
    }

    function openUploadModal() {
      var id = UI.uid('upload');
      UI.openModal(
        '<div class="mh">Upload Document<span class="grow"></span></div>' +
        '<div class="mb stack">' +
        '<div class="field"><label>Machine</label><div class="val">' + UI.escape(machine.name) + '</div></div>' +
        '<div class="field"><label>Category</label><select class="select" id="' + id + '-cat">' +
        DATA.categories.map(function (c) { return '<option value="' + UI.escape(c) + '">' + UI.escape(c) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label>File</label><div class="input" style="color:var(--mute)">Choose a file… (demo — no file is actually read)</div>' +
        '<div class="note" style="margin-top:6px">Accepted: .l5x .l5k .acd .rss .ulpr .ullme .mer .apa .cli .ypj .csv .xlsx .xls .pdf .doc .docx .dwg .dxf .svg .png .jpg .txt .md</div></div>' +
        '<div id="' + id + '-progress-wrap" style="display:none">' +
        '<div class="field"><label>Indexing…</label><div class="bar"><i id="' + id + '-bar" style="width:0%"></i></div></div>' +
        '</div>' +
        '</div>' +
        '<div class="mf">' +
        '<button class="btn ghost" id="' + id + '-cancel">Cancel</button>' +
        '<button class="btn primary" id="' + id + '-submit">Upload</button>' +
        '</div>',
        { dismissable: true }
      );
      document.getElementById(id + '-cancel').addEventListener('click', UI.closeModal);
      document.getElementById(id + '-submit').addEventListener('click', function () {
        var submitBtn = document.getElementById(id + '-submit');
        var catSel = document.getElementById(id + '-cat');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading…';
        document.getElementById(id + '-progress-wrap').style.display = '';
        var bar = document.getElementById(id + '-bar');
        var pct = 0;
        var iv = setInterval(function () {
          pct = Math.min(100, pct + 8 + Math.random() * 10);
          if (bar) bar.style.width = pct + '%';
          if (pct >= 100) {
            clearInterval(iv);
            setTimeout(function () {
              var chunks = 15 + Math.round(Math.random() * 80);
              var newDoc = {
                id: 'demo-' + UI.uid(''), machineId: machine.id,
                title: 'New Upload — ' + catSel.value, filename: 'uploaded_file.dat',
                category: catSel.value, sizeBytes: 200000 + Math.round(Math.random() * 500000),
                uploadedAt: new Date().toISOString(), indexed: true, chunks: chunks
              };
              machineDocs.unshift(newDoc);
              DATA.documents.unshift(newDoc);
              UI.closeModal();
              UI.toast('Indexed — ' + chunks + ' chunks', 'ok');
              renderRail();
              renderTable();
            }, 250);
          }
        }, 150);
      });
    }

    mount.innerHTML =
      '<div class="cols cols-3">' +
      '<div class="panel"><div class="ph">Categories</div><div class="pb" id="wd-rail" style="display:flex;flex-direction:column;gap:2px;padding-top:8px">' + railHtml() + '</div></div>' +
      '<div class="panel">' +
      '<div class="ph"><input class="input" id="wd-search" placeholder="Search documents…" style="height:26px;max-width:260px">' +
      '<span class="grow"></span><span class="num" id="wd-count">' + machineDocs.length + '</span></div>' +
      '<div class="tw"><table class="t"><thead><tr><th></th><th>Title</th><th>Category</th><th class="n">Size</th><th class="n">Chunks</th><th>Status</th><th>Uploaded</th></tr></thead>' +
      '<tbody id="wd-tbody"></tbody></table></div>' +
      '</div>' +
      '<div class="stack">' +
      '<button class="btn primary" id="wd-upload" style="width:100%">Upload Document</button>' +
      '<div class="note info">Uploads in this demo are simulated — the fake progress bar and chunk count are not connected to a real ingestion pipeline.</div>' +
      '</div>' +
      '</div>';

    document.getElementById('wd-rail').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cat]');
      if (!btn) return;
      var v = btn.getAttribute('data-cat');
      activeCategory = v === 'all' ? null : v;
      renderRail();
      renderTable();
    });
    document.getElementById('wd-search').addEventListener('input', function (e) {
      query = e.target.value;
      renderTable();
    });
    document.getElementById('wd-upload').addEventListener('click', openUploadModal);

    renderTable();

    return function cleanup() {};
  };
})();
