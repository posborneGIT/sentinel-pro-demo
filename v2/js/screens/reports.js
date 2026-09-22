/*
 * SCREENS.reports — top-level Reports screen. 13 report types x 5 formats,
 * a mock generate flow (progress fill, never a real file), and the existing
 * generated-reports table from DATA.reports.
 */
(function () {
  var localReports = null;
  var activeIntervals = [];

  function machineName(DATA, id) {
    var m = DATA.machines.filter(function (x) { return x.id === id; })[0];
    return m ? m.name : ('Machine ' + id);
  }

  function render(mount, route, c) {
    var UI = c.ui, DATA = c.data;
    if (!localReports) localReports = DATA.reports.slice();
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    function statusCell(r) {
      if (r.status === 'generating') {
        return '<div class="stack" style="gap:4px"><span class="state info">' + UI.dot('info') + 'Generating</span>' +
          '<span class="bar" style="width:120px"><i style="width:' + (r.progress || 0) + '%"></i></span></div>';
      }
      return UI.state('Complete', 'ok');
    }

    function tableHtml() {
      var rows = localReports.map(function (r) {
        return '<tr class="row"><td>' + UI.escape(r.title) + '</td>' +
          '<td>' + UI.escape(machineName(DATA, r.machineId)) + '</td>' +
          '<td>' + UI.escape(r.type) + '</td>' +
          '<td>' + UI.plate(r.format) + '</td>' +
          '<td>' + statusCell(r) + '</td>' +
          '<td class="mono mute">' + UI.fmtDate(r.createdAt) + '</td>' +
          '<td><button class="btn sm ghost" data-download="' + r.id + '"' + (r.status !== 'complete' ? ' disabled' : '') + '>Download</button></td>' +
          '</tr>';
      }).join('');
      return '<div class="tw"><table class="t"><thead><tr><th>Title</th><th>Machine</th><th>Type</th><th>Format</th><th>Status</th><th>Created</th><th></th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="7"><div class="empty">No reports generated yet.</div></td></tr>') + '</tbody></table></div>';
    }

    function typeOptions() { return DATA.reportTypes.map(function (t) { return '<option>' + UI.escape(t) + '</option>'; }).join(''); }
    function formatOptions() { return DATA.reportFormats.map(function (f) { return '<option>' + UI.escape(f) + '</option>'; }).join(''); }
    function machineOptions() { return DATA.machines.map(function (m) { return '<option value="' + m.id + '">' + UI.escape(m.name) + '</option>'; }).join(''); }

    function openGenerateModal() {
      UI.openModal(
        '<div class="mh">Generate Report</div>' +
        '<div class="mb stack">' +
        '<div class="field"><label>Machine</label><select class="select" id="rg-machine">' + machineOptions() + '</select></div>' +
        '<div class="field"><label>Report Type</label><select class="select" id="rg-type">' + typeOptions() + '</select></div>' +
        '<div class="field"><label>Export Format</label><select class="select" id="rg-format">' + formatOptions() + '</select></div>' +
        '<div class="note info">This preview simulates generation with a progress fill. No file is produced or downloadable.</div>' +
        '</div>' +
        '<div class="mf"><button class="btn ghost" id="rg-cancel">Cancel</button><button class="btn primary" id="rg-submit">Generate</button></div>'
      );
      document.getElementById('rg-cancel').addEventListener('click', UI.closeModal);
      document.getElementById('rg-submit').addEventListener('click', function () {
        var machineId = Number(document.getElementById('rg-machine').value);
        var type = document.getElementById('rg-type').value;
        var format = document.getElementById('rg-format').value;
        UI.closeModal();
        startGeneration(machineId, type, format);
      });
    }

    function startGeneration(machineId, type, format) {
      var newReport = {
        id: Date.now(), machineId: machineId, type: type, format: format, status: 'generating',
        progress: 0, createdAt: new Date().toISOString(),
        title: machineName(DATA, machineId) + ' — ' + type
      };
      localReports = [newReport].concat(localReports);
      renderAll();
      var iv = setInterval(function () {
        newReport.progress = Math.min(100, (newReport.progress || 0) + 22 + Math.round(Math.random() * 10));
        if (newReport.progress >= 100) {
          newReport.status = 'complete';
          clearInterval(iv);
          activeIntervals = activeIntervals.filter(function (x) { return x !== iv; });
          UI.toast('Report generated: ' + newReport.title, 'ok', 3200);
        }
        renderAll();
      }, 420);
      activeIntervals.push(iv);
    }

    function renderAll() {
      mount.innerHTML =
        '<div class="panel" style="margin-bottom:14px"><div class="ph">Reports<span class="grow"></span>' +
        '<button class="btn primary" id="rg-open">Generate Report</button></div>' +
        '<div class="pb mute" style="font-size:12px">' + DATA.reportTypes.length + ' report types × ' + DATA.reportFormats.length + ' export formats.</div></div>' +
        '<div class="panel"><div class="ph">Generated Reports<span class="grow"></span><span class="num">' + localReports.length + '</span></div>' + tableHtml() + '</div>';
      document.getElementById('rg-open').addEventListener('click', openGenerateModal);
      mount.querySelectorAll('[data-download]').forEach(function (b) {
        b.addEventListener('click', function () { UI.toast('Demo mode — export is disabled in this preview.', 'info'); });
      });
    }

    renderAll();

    return function cleanup() {
      activeIntervals.forEach(clearInterval);
      activeIntervals = [];
    };
  }

  window.SCREENS.reports = render;
})();
