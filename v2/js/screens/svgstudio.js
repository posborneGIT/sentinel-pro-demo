/*
 * SCREENS['svg-studio'] — top-level SVG Studio: tag-category chips, a
 * repository gallery with a small inline SVG preview per card, and a mock
 * "Generate New SVG" flow.
 */
(function () {
  var localRepo = null;
  var pendingTimeouts = [];

  function machineName(DATA, id) {
    var m = DATA.machines.filter(function (x) { return x.id === id; })[0];
    return m ? m.name : ('Machine ' + id);
  }

  function previewSvg(seed) {
    var n = (seed || 1);
    var boxes = [];
    for (var i = 0; i < 4; i++) {
      var x = 6 + (i % 2) * 46;
      var y = 6 + Math.floor(i / 2) * 30;
      var tone = (i + n) % 3 === 0 ? 'var(--info)' : 'var(--line2)';
      boxes.push('<rect x="' + x + '" y="' + y + '" width="38" height="22" rx="2" fill="none" stroke="' + tone + '" stroke-width="1.5"/>');
    }
    return '<svg viewBox="0 0 92 62" width="100%" height="96" style="background:var(--g0);border-radius:3px">' + boxes.join('') + '</svg>';
  }

  function render(mount, route, c) {
    var UI = c.ui, DATA = c.data;
    if (!localRepo) localRepo = DATA.svgStudio.repository.slice();
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts = [];

    function chips() {
      return DATA.svgStudio.tagCategories.map(function (t) { return UI.chip(t, false, 'info'); }).join(' ');
    }

    function gallery() {
      var cards = localRepo.map(function (item) {
        return '<div class="panel">' +
          '<div class="ph">' + UI.escape(item.title) + '</div>' +
          '<div class="pb stack">' + previewSvg(item.id.length) +
          '<div class="row" style="justify-content:space-between;font-size:11.5px"><span class="mute">' + UI.escape(machineName(DATA, item.machineId)) + '</span><span class="num">' + item.tagCount + ' tags</span></div>' +
          '<div class="mute" style="font-size:10.5px">Updated ' + UI.timeAgo(item.updatedAt) + '</div>' +
          '</div></div>';
      }).join('');
      return '<div class="card-grid">' + (cards || '<div class="empty">No generated SVGs yet.</div>') + '</div>';
    }

    function machineOptions() { return DATA.machines.map(function (m) { return '<option value="' + m.id + '">' + UI.escape(m.name) + '</option>'; }).join(''); }
    function categoryOptions() { return DATA.svgStudio.tagCategories.map(function (t) { return '<option>' + UI.escape(t) + '</option>'; }).join(''); }

    function openGenerateModal() {
      UI.openModal(
        '<div class="mh">Generate New SVG</div>' +
        '<div class="mb stack">' +
        '<div class="field"><label>Machine</label><select class="select" id="svg-machine">' + machineOptions() + '</select></div>' +
        '<div class="field"><label>Tag Category</label><select class="select" id="svg-cat">' + categoryOptions() + '</select></div>' +
        '<div class="note info">Preview only — no AI generation call is made in this demo.</div>' +
        '</div>' +
        '<div class="mf"><button class="btn ghost" id="svg-cancel">Cancel</button><button class="btn primary" id="svg-submit">Generate</button></div>'
      );
      document.getElementById('svg-cancel').addEventListener('click', UI.closeModal);
      document.getElementById('svg-submit').addEventListener('click', function () {
        var machineId = Number(document.getElementById('svg-machine').value);
        var category = document.getElementById('svg-cat').value;
        UI.closeModal();
        UI.toast('Generating SVG — ' + category + '…', 'info', 1400);
        var t = setTimeout(function () {
          var item = { id: 'SVG-' + Math.floor(20 + Math.random() * 79), machineId: machineId, title: machineName(DATA, machineId) + ' — ' + category, tagCount: 3 + Math.floor(Math.random() * 6), updatedAt: new Date().toISOString() };
          localRepo = [item].concat(localRepo);
          UI.toast('SVG generated: ' + item.title, 'ok', 3000);
          renderAll();
        }, 1300);
        pendingTimeouts.push(t);
      });
    }

    function renderAll() {
      mount.innerHTML =
        '<div class="panel" style="margin-bottom:14px"><div class="ph">SVG Studio<span class="grow"></span>' +
        '<button class="btn primary" id="svg-open">Generate New SVG</button></div>' +
        '<div class="pb stack"><div>' + chips() + '</div></div></div>' +
        gallery();
      document.getElementById('svg-open').addEventListener('click', openGenerateModal);
    }

    renderAll();
    return function cleanup() { pendingTimeouts.forEach(clearTimeout); pendingTimeouts = []; };
  }

  window.SCREENS['svg-studio'] = render;
})();
