/*
 * Sentinel Pro demo v2 — mock dataset. Loaded before ui.js/app.js/screens.
 * This is the shared contract: every screen module reads from window.DATA
 * and should not invent machine/document/session ids that aren't here.
 * All data is simulated for demonstration purposes, but scenario content is
 * grounded in the real product's domain (Cross Ply laminators, BL printers,
 * DSD-150 compressor, Tenter Frame dip tank, R&D press) so it reads as
 * credible industrial content rather than generic placeholder text.
 */
(function () {
  var DATA = {};

  DATA.meta = {
    product: 'Sentinel Pro',
    tagline: 'AI-grounded industrial diagnostics, memory-first.',
    vendor: 'EPIConsulting NC',
    version: 'v2.4.1',
    buildLabel: 'Fleet Board — Concept A',
    generatedAt: '2026-09-22',
    demoNote: 'INTERACTIVE DEMO — all data below is simulated for demonstration. No document, PLC export, live tag or AI response shown here is connected to a real machine.'
  };

  DATA.providers = [
    { key: 'anthropic', name: 'Anthropic', model: 'Claude Sonnet 5', status: 'connected', isDefault: true },
    { key: 'openai', name: 'OpenAI', model: 'GPT-5.1', status: 'connected', isDefault: false },
    { key: 'xai', name: 'xAI', model: 'Grok 4', status: 'connected', isDefault: false },
    { key: 'google', name: 'Google', model: 'Gemini 2.5 Pro', status: 'not configured', isDefault: false }
  ];

  DATA.users = [
    { id: 1, name: 'A. Reyes', email: 'admin@epi.com', role: 'admin' },
    { id: 2, name: 'D. Coleman', email: 'tech@epi.com', role: 'engineer' },
    { id: 3, name: 'M. Okafor', email: 'viewer@epi.com', role: 'viewer' }
  ];
  DATA.roles = {
    admin: { label: 'Administrator', desc: 'Full access, including user management and document administration.' },
    engineer: { label: 'Engineer', desc: 'Diagnostics, documents, reports, memory management. No user administration.' },
    viewer: { label: 'Viewer', desc: 'Read-only: browse documents, run diagnostics, view reports.' }
  };

  DATA.customers = [
    { id: 1, name: 'Barrday Advanced Materials Corp', site: 'Millbrook Plant, NC', machineIds: [1, 2, 3, 4, 5, 7, 8, 13, 17] },
    { id: 2, name: 'Titan Composite Solutions', site: 'Greer Annex, SC', machineIds: [6, 9] }
  ];

  DATA.categories = [
    'Text Documents', 'Manuals & Reports', 'Schematics & Diagrams', 'PLC Code', 'HMI Code',
    'Drive & Motion Code', 'Tag Data', 'Operator Information', 'Diagnostic Insights',
    'Platen Heat Control', 'Moved Files', 'Other Equipment Data'
  ];

  DATA.machines = [
    {
      id: 1, name: 'Cross Ply XP1', family: 'Cross Ply Laminator', customerId: 1,
      controller: '1768-L43 CompactLogix', motion: '1768-M04SE (SERCOS)',
      servo: 'Kinetix 6000 (2094-*), Ultra3000 (2098-DSD)', vfd: 'Yaskawa J7 (CIMR-J7AM)',
      status: 'ok', health: 96, docs: 41, chunks: 5920, lastActivity: '2026-09-21T14:02:00Z',
      summary: 'Lead cross-ply laminator, 90° clamp transfer system. Gold-template memory corpus.'
    },
    {
      id: 2, name: 'Cross Ply XP2', family: 'Cross Ply Laminator', customerId: 1,
      controller: '1768-L43 CompactLogix', motion: '1768-M04SE (SERCOS)',
      servo: 'Kinetix 6000 (2094-*)', vfd: 'undocumented — no drive_code on file',
      status: 'warn', health: 78, docs: 33, chunks: 4110, lastActivity: '2026-09-20T09:41:00Z',
      summary: 'Second laminator line. VFD vendor/model not yet documented in the corpus.'
    },
    {
      id: 3, name: 'Cross Ply XP3', family: 'Cross Ply Laminator', customerId: 1,
      controller: '1769-L30ERM CompactLogix', motion: 'CIP Motion',
      servo: 'Kinetix 5500 (2198-H025-ERS)', vfd: 'Yaskawa J1000',
      status: 'ok', health: 91, docs: 29, chunks: 3860, lastActivity: '2026-09-19T16:12:00Z',
      summary: 'CIP Motion generation laminator, analog-controlled Yaskawa J1000 VFDs.'
    },
    {
      id: 4, name: 'Cross Ply XP4', family: 'Cross Ply Laminator', customerId: 1,
      controller: '1769-L30ERM CompactLogix', motion: 'CIP Motion (AXIS_CIP_DRIVE × 9)',
      servo: '—', vfd: 'Yaskawa J1000 (PCIMR-JU4A011BAA)',
      status: 'ok', health: 89, docs: 46, chunks: 6810, lastActivity: '2026-09-18T11:05:00Z',
      summary: 'Heaviest schematic/drawing corpus in the fleet — AutoCAD Electrical wire-level detail.'
    },
    {
      id: 5, name: 'Cross Ply XP5', family: 'Cross Ply Laminator', customerId: 1,
      controller: '1769-L27ERM-QBFC1B CompactLogix', motion: 'CIP Motion',
      servo: 'Kinetix 5700 (2198-C4020-ERS), Kinetix 5500', vfd: 'PowerFlex 525',
      status: 'fault', health: 82, docs: 52, chunks: 7440, lastActivity: '2026-09-22T08:47:00Z',
      summary: 'Newest laminator; platen heating upgrade (D-5883) in progress. Has a digital twin.',
      hasTwin: true
    },
    {
      id: 6, name: 'Tenter Frame Dip Tank', family: 'Dipping Tank Transfer System', customerId: 2,
      controller: 'Do-more BX-DM1E-36ER3-D', motion: 'AutomationDirect BRX',
      servo: '—', vfd: 'Pneumatic (air-driven pump)',
      status: 'ok', health: 88, docs: 61, chunks: 8930, lastActivity: '2026-09-17T13:30:00Z',
      summary: 'Chain-driven dip tank transfer line. External knowledge source synced from the build partner’s repository.'
    },
    {
      id: 7, name: 'BL3 Printer', family: 'BL Printer', customerId: 1,
      controller: 'PanelView + PLC-5 (legacy)', motion: '—', servo: '—', vfd: '—',
      status: 'ok', health: 93, docs: 18, chunks: 2210, lastActivity: '2026-09-12T10:00:00Z',
      summary: 'Shares its Modbus register map with BL4 Printing.'
    },
    {
      id: 8, name: 'BL4 Printing', family: 'BL Printer', customerId: 1,
      controller: 'PanelView + PLC-5 (legacy)', motion: '—', servo: '—', vfd: '—',
      status: 'ok', health: 90, docs: 16, chunks: 1940, lastActivity: '2026-09-11T15:20:00Z',
      summary: 'Print head of the BL4 line (Unwind → Laminator → Rewind is a separate machine).'
    },
    {
      id: 9, name: 'DSD-150 Compressor', family: 'Compressor', customerId: 2,
      controller: 'Unitronics ULPR', motion: '—', servo: '—', vfd: 'Fixed-speed, DOL start',
      status: 'warn', health: 74, docs: 22, chunks: 2680, lastActivity: '2026-09-20T18:44:00Z',
      summary: 'Rotary-screw compressor package. Recurrent discharge-temperature and startup-overcurrent history.'
    },
    {
      id: 13, name: 'BL4 Rewind Control', family: 'BL Printer', customerId: 1,
      controller: 'AB SLC 500', motion: '—', servo: 'AC tension servo', vfd: 'AC vector drive',
      status: 'ok', health: 85, docs: 24, chunks: 3050, lastActivity: '2026-09-14T12:15:00Z',
      summary: 'Rewind tension control subsystem of the BL4 line (Unwind → Laminator → Rewind).'
    },
    {
      id: 17, name: 'R&D Helmet Press', family: 'Press', customerId: 1,
      controller: 'Unitronics ULPR', motion: '—', servo: '—', vfd: 'Hydraulic pump motor, VFD-fed',
      status: 'ok', health: 95, docs: 19, chunks: 2340, lastActivity: '2026-09-08T09:10:00Z',
      summary: '565-ton R&D helmet press. Fully remediated ingestion corpus, audit-clean.'
    }
  ];

  // ---------- documents ----------
  function doc(id, machineId, title, filename, category, opts) {
    opts = opts || {};
    return Object.assign({
      id: id, machineId: machineId, title: title, filename: filename, category: category,
      sizeBytes: opts.sizeBytes || 180000 + Math.round(Math.random() * 900000),
      uploadedAt: opts.uploadedAt || '2026-08-1' + (1 + (id % 8)) + 'T10:00:00Z',
      indexed: opts.indexed !== false, chunks: opts.chunks || 20 + (id % 60)
    }, opts);
  }
  DATA.documents = [
    doc(101, 1, 'XP1 Controller Organizer Listing', 'XP1_Controller_Export.L5X', 'PLC Code', { chunks: 640 }),
    doc(102, 1, '90° Clamp Transfer — Wiring Schematic', 'XP1_ClampTransfer_Sch.dwg', 'Schematics & Diagrams', { chunks: 58 }),
    doc(103, 1, 'Kinetix 6000 Servo Parameter Sheet', 'XP1_Kinetix6000_Params.csv', 'Tag Data', { chunks: 12 }),
    doc(104, 1, 'Yaskawa J7 VFD Manual (excerpt)', 'Yaskawa_J7_CIMR-J7AM_Manual.pdf', 'Manuals & Reports', { chunks: 210 }),
    doc(105, 1, 'F-101–F-104 Fault Code Reference', 'XP1_FaultCodes.pdf', 'Manuals & Reports', { chunks: 34 }),
    doc(201, 2, 'XP2 Controller Organizer Listing', 'XP2_Controller_Export.L5X', 'PLC Code', { chunks: 590 }),
    doc(202, 2, 'XP2 Drive Cabinet Layout', 'XP2_DriveCabinet.dwg', 'Schematics & Diagrams', { chunks: 40 }),
    doc(301, 3, 'XP3 CIP Motion Axis Configuration', 'XP3_CIPMotion_Axes.L5X', 'PLC Code', { chunks: 410 }),
    doc(302, 3, 'Yaskawa J1000 Quick Reference', 'Yaskawa_J1000_QuickRef.pdf', 'Drive & Motion Code', { chunks: 88 }),
    doc(401, 4, 'XP4 AutoCAD Electrical — Full Set', 'XP4_ElecSet_AC1032.dwg', 'Schematics & Diagrams', { chunks: 306 }),
    doc(402, 4, 'XP4 Project Tag Listing', 'XP4_TagListing.L5X', 'PLC Code', { chunks: 1080 }),
    doc(501, 5, 'XP5 Controller Export (as-running)', 'XP5_Controller_Export.L5X', 'PLC Code', { chunks: 904 }),
    doc(502, 5, 'Watlow PM8 Heater Shoe Configuration', 'XP5_Watlow_PM8_Config.pdf', 'Manuals & Reports', { chunks: 46 }),
    doc(503, 5, 'D-5883 Platen Heating Upgrade Drawing', 'D-5883_PlatenUpgrade.dwg', 'Platen Heat Control', { chunks: 62 }),
    doc(504, 5, 'PowerFlex 525 Parameter Sheet', 'XP5_PowerFlex525_Params.csv', 'Tag Data', { chunks: 18 }),
    doc(505, 5, 'Zone 3 Over-Temp Incident — Insight', 'XP5_Zone3_OverTemp_Insight.md', 'Diagnostic Insights', { chunks: 4 }),
    doc(601, 6, 'Do-more Full-Project Export (as-running)', '8_3_26_Project_Export.txt', 'PLC Code', { chunks: 1240 }),
    doc(602, 6, 'Chain Clip Sensor — Entry Side Schematic', 'TenterFrame_ClipSensors.dwg', 'Schematics & Diagrams', { chunks: 71 }),
    doc(603, 6, '[BRK] Dip Recipe Band-Maintenance Logic', 'BRK_FT-5.8_BandMaint.md', 'Diagnostic Insights', { chunks: 9, isExternal: true }),
    doc(701, 7, 'BL3/BL4 Shared Modbus Register Map', 'BL_Printers_ModbusMap.xlsx', 'Tag Data', { chunks: 6 }),
    doc(901, 9, 'DSD-150 P&ID', 'DSD150_PID.dwg', 'Schematics & Diagrams', { chunks: 22 }),
    doc(902, 9, 'DSD-150 Discharge Temp Trip History', 'DSD150_DischargeTemp_Log.csv', 'Tag Data', { chunks: 8 }),
    doc(903, 9, 'K2M Compressor Control Manual', 'DSD150_K2M_Manual.pdf', 'Manuals & Reports', { chunks: 118 }),
    doc(1301, 13, 'BL4 Rewind Tension Control Ladder', 'BL4_Rewind_Tension.L5X', 'PLC Code', { chunks: 260 }),
    doc(1701, 17, 'R&D Press ULPR Export', 'RD_HelmetPress.ulpr', 'PLC Code', { chunks: 340 })
  ];

  // ---------- OPC bridge ----------
  DATA.opcAgents = [
    { id: 'AG-01', name: 'Win11-Floor1', machineId: 5, protocol: 'OPC UA', status: 'online', lastSeen: '2026-09-22T14:59:40Z' },
    { id: 'AG-02', name: 'Win11-Floor1-XP1', machineId: 1, protocol: 'OPC UA', status: 'online', lastSeen: '2026-09-22T14:59:12Z' },
    { id: 'AG-03', name: 'Win10-Compressor-Rm', machineId: 9, protocol: 'OPC DA', status: 'offline', lastSeen: '2026-09-21T22:10:00Z' }
  ];
  DATA.opcTags = {
    5: [
      { tag: 'PLATEN_Z1_TEMP_PV', label: 'Platen Zone 1 Temp', unit: '°F', base: 388, noise: 3, band: [350, 430], alarmHigh: 425 },
      { tag: 'PLATEN_Z2_TEMP_PV', label: 'Platen Zone 2 Temp', unit: '°F', base: 391, noise: 3, band: [350, 430], alarmHigh: 425 },
      { tag: 'PLATEN_Z3_TEMP_PV', label: 'Platen Zone 3 Temp', unit: '°F', base: 412, noise: 6, band: [350, 430], alarmHigh: 425, trendingHigh: true },
      { tag: 'LINE_SPEED_FPM', label: 'Line Speed', unit: 'fpm', base: 42, noise: 1.2, band: [0, 60] },
      { tag: 'NIP_PRESSURE_PSI', label: 'Nip Roll Pressure', unit: 'psi', base: 118, noise: 2, band: [80, 160] }
    ],
    1: [
      { tag: 'CLAMP_CYCLE_TIME_MS', label: '90° Clamp Cycle Time', unit: 'ms', base: 640, noise: 15, band: [500, 900] },
      { tag: 'CLAMP_TORQUE_PCT', label: 'Clamp Servo Torque', unit: '%', base: 34, noise: 4, band: [0, 100] },
      { tag: 'LINE_SPEED_FPM', label: 'Line Speed', unit: 'fpm', base: 38, noise: 1, band: [0, 55] }
    ],
    9: [
      { tag: 'DISCHARGE_TEMP_F', label: 'Discharge Temperature', unit: '°F', base: 198, noise: 4, band: [160, 230], alarmHigh: 225 },
      { tag: 'MOTOR_CURRENT_A', label: 'Motor Current', unit: 'A', base: 62, noise: 3, band: [0, 90] },
      { tag: 'OIL_PRESSURE_PSI', label: 'Oil Pressure', unit: 'psi', base: 54, noise: 2, band: [30, 75] }
    ]
  };

  // ---------- diagnostic sessions (scripted, realistic) ----------
  DATA.diagnosticSessions = [
    {
      id: 'S-5041', machineId: 5, title: 'Zone 3 platen trending high', provider: 'anthropic',
      startedAt: '2026-09-22T08:47:00Z', tagged: ['platen', 'over-temp', 'live-data'],
      messages: [
        { role: 'user', text: 'Zone 3 on XP5 keeps creeping past 410°F during long runs while zones 1 and 2 stay flat around 390. What should I check?' },
        {
          role: 'ai',
          text: 'Live OPC context: PLATEN_Z3_TEMP_PV is currently 412°F and has trended up ~8°F over the last 20 minutes while Z1/Z2 are stable — that isolates this to Zone 3’s own heater loop rather than a line-wide setpoint issue.\n\nMost likely causes, in order:\n1. Watlow PM8 Zone 3 PID tuning drift — the D-5883 upgrade drawing shows Zone 3 on its own SSR bank; check autotune history.\n2. A partially failed Zone 3 thermocouple reading low, causing the loop to over-drive the SSR to compensate.\n3. Reduced airflow/contact on the Zone 3 platen segment (mechanical, not electrical).\n\nStart with the Watlow PM8 configuration to confirm Zone 3’s PID gains match Zones 1/2.',
          citations: [{ title: 'XP5_Watlow_PM8_Config.pdf', date: '2026-08-15' }, { title: 'D-5883_PlatenUpgrade.dwg', date: '2026-08-17' }]
        },
        { role: 'user', text: 'PID gains are identical across all three zones. What about the thermocouple theory?' },
        {
          role: 'ai',
          text: 'With gains ruled out, a low-reading Zone 3 thermocouple is the next-most-likely cause — the loop would keep driving output to chase a setpoint it never sees. There’s a prior incident on this exact symptom.',
          citations: [{ title: 'XP5_Zone3_OverTemp_Insight.md', date: '2026-09-15' }],
          insight: 'Approved insight (2026-09-15): Zone 3’s thermocouple connector on the D-5883 upgrade harness sits closer to the platen edge than Zones 1/2 and is more exposed to nip-roll vibration — three prior over-temp events traced to a loosened connector at that exact point. Recommend a torque check before assuming a sensor failure.'
        }
      ]
    },
    {
      id: 'S-1022', machineId: 1, title: '90° clamp intermittent stall', provider: 'anthropic',
      startedAt: '2026-09-19T13:10:00Z', tagged: ['clamp', 'servo'],
      messages: [
        { role: 'user', text: 'The 90° clamp transfer is stalling mid-cycle about once per shift, always on the same station. Fault code?' },
        {
          role: 'ai',
          text: 'That symptom pattern (mid-cycle stall, single station, intermittent) matches fault F-102 — Kinetix 6000 following-error trip on the clamp axis, usually from a mechanical bind rather than a drive fault. The ladder rung that raises F-102 checks axis following error against a 2.5° window over 3 scans before latching the fault — a transient bind that clears within that window won’t even set it, so if you ARE seeing F-102, the bind is holding for multiple scans.',
          citations: [{ title: 'XP1_Controller_Export.L5X', date: '2026-08-11' }, { title: 'XP1_FaultCodes.pdf', date: '2026-08-13' }]
        },
        { role: 'user', text: 'Confirmed F-102 on the HMI. What do you recommend checking on that station mechanically?' },
        {
          role: 'ai',
          text: 'With F-102 confirmed and it being station-specific, check that station’s clamp jaw pivot bushing and the transfer rail alignment first — a binding pivot is the dominant field cause for a single-station following-error trip on this design. If the bind clears with the pivot lubricated/re-aligned, no drive parameter change is needed. I don’t have a wear-interval spec for that bushing in the indexed documentation, so I can’t tell you how overdue it is — that would need to come from your PM log.',
          citations: [{ title: 'XP1_ClampTransfer_Sch.dwg', date: '2026-08-11' }],
          insufficientNote: 'No PM/wear-interval data indexed for XP1 — answer above is scoped to what the schematic and controller export can show.'
        }
      ]
    },
    {
      id: 'S-9084', machineId: 9, title: 'Discharge temp + startup overcurrent', provider: 'openai',
      startedAt: '2026-09-20T18:44:00Z', tagged: ['compressor', 'overcurrent'],
      messages: [
        { role: 'user', text: 'DSD-150 tripped on overcurrent again during a cold start this morning, third time this month. High discharge temp alarms have also been more frequent. Related?' },
        {
          role: 'ai',
          text: 'Yes — on the K2M control scheme these are very likely the same root cause. A cold start pulls higher inrush while oil viscosity is still high; if the oil separator or cooler is partially fouled (raising discharge temp under load), the motor works harder through the same cold-start window and is more likely to hit the overcurrent trip. The discharge-temp log shows a slow upward drift over the last 6 weeks (198°F baseline → recent peaks near 221°F), consistent with gradual cooler fouling rather than a sudden fault.',
          citations: [{ title: 'DSD150_K2M_Manual.pdf', date: '2026-08-05' }, { title: 'DSD150_DischargeTemp_Log.csv', date: '2026-09-20' }]
        },
        { role: 'user', text: 'That tracks — cooler hasn’t been serviced in a while. Anything in the manual on cooler service intervals?' },
        {
          role: 'ai',
          text: 'The K2M manual excerpt indexed for this machine covers startup sequencing and trip-code definitions but does not include a cooler service interval table — I don’t want to guess a number that isn’t in the source. What I can confirm from the data: the drift pattern strongly supports scheduling cooler service rather than adjusting the overcurrent trip setpoint, which would just mask the underlying restriction.',
          insufficientNote: 'Cooler service-interval table not present in the indexed K2M manual excerpt — flagged rather than estimated.'
        }
      ]
    },
    {
      id: 'S-6055', machineId: 6, title: 'Entry-side clip miss faults', provider: 'anthropic',
      startedAt: '2026-09-17T13:30:00Z', tagged: ['tenter', 'clip-miss'],
      messages: [
        { role: 'user', text: 'Recurring chain clip miss faults on the entry side, stopping production several times a shift. Where do I start?' },
        {
          role: 'ai',
          text: 'On the as-running Do-more export, entry-side clip detection is a proximity-sensor-confirmed handoff — a miss fault means the sensor didn’t see a clip close within the expected window after the pusher cycle, which is usually chain tension or sensor gap, not the clip mechanism itself. Check chain tension against the entry-side spec first; it drifts faster on the entry span because it carries the fabric load transfer.',
          citations: [{ title: '8_3_26_Project_Export.txt', date: '2026-08-03' }, { title: 'TenterFrame_ClipSensors.dwg', date: '2026-08-04' }]
        },
        { role: 'user', text: 'Tension is in spec. Could this be related to the band-maintenance recipe changes from the build partner?' },
        {
          role: 'ai',
          text: 'Possibly — there is an unresolved conflict on file between the v9 batch-cycle campaign and an external band-maintenance recipe change, and I want to flag that rather than pick a side. Before changing anything recipe-related, confirm which campaign is actually running on the floor right now — the documentation itself is not settled on this point.',
          citations: [{ title: 'BRK_FT-5.8_BandMaint.md', date: '2026-07-31' }],
          insufficientNote: 'Known open conflict in the indexed corpus (v9 batch-cycle vs. external FT-5.8 band-maintenance) — surfaced, not resolved, by design.'
        }
      ]
    }
  ];

  // ---------- learning insights (approve/reject queue) ----------
  DATA.learningInsights = [
    {
      id: 901, machineId: 5, status: 'pending',
      title: 'Zone 3 thermocouple connector vibration exposure',
      body: 'Three over-temp events traced to the same loosened D-5883 harness connector on Zone 3. Recommend adding a torque check to the PM checklist.',
      sourceSession: 'S-5041', proposedAt: '2026-09-22T09:10:00Z'
    },
    {
      id: 902, machineId: 1, status: 'approved',
      title: 'F-102 is mechanical, not a drive parameter fault',
      body: 'Following-error trip on the clamp axis latches only after a mechanical bind holds for 3+ scans — do not adjust Kinetix following-error limits to work around a station-specific bind.',
      sourceSession: 'S-1022', proposedAt: '2026-09-19T14:02:00Z', approvedAt: '2026-09-19T16:30:00Z'
    },
    {
      id: 903, machineId: 9, status: 'pending',
      title: 'Discharge-temp drift precedes overcurrent trips',
      body: 'A slow discharge-temperature upward drift (6+ weeks) reliably precedes a cluster of cold-start overcurrent trips — useful as an early-warning signal for cooler service.',
      sourceSession: 'S-9084', proposedAt: '2026-09-20T19:05:00Z'
    }
  ];

  // ---------- memory / knowledge dashboard ----------
  DATA.memory = {
    hybridEnabled: true,
    fleetHealth: 91,
    perMachine: DATA.machines.map(function (m) {
      var dense = 82 + Math.round(Math.random() * 15);
      return {
        machineId: m.id, denseCoverage: Math.min(99, dense), bm25Coverage: Math.min(99, dense - 3),
        chunks: m.chunks, lastReindex: m.lastActivity, bm25Fresh: m.id !== 2
      };
    }),
    healthChecks: [
      { key: 'binary_guard', label: 'Binary guard', status: 'ok', detail: 'No binary-indexed documents fleet-wide.' },
      { key: 'orphan_chunks', label: 'Orphan chunk purge', status: 'ok', detail: 'ChromaDB ↔ SQLite in sync (0 orphan / 0 missing).' },
      { key: 'hollow_docs', label: 'Hollow document scan', status: 'warn', detail: '2 documents on XP2 flagged for re-ingestion review.' },
      { key: 'bm25_freshness', label: 'BM25 lexical index freshness', status: 'warn', detail: 'XP2 pickle is stale — rebuilds lazily on next diagnostic turn.' }
    ],
    externalSources: [
      {
        key: 'brk_plc_dev', name: 'BRK_PLC_DEV', machineId: 6, adapter: 'filesystem-md',
        status: 'synced', lastSync: '2026-09-17T06:00:00Z', itemsSynced: 184, chunksIndexed: 3899
      }
    ]
  };

  // ---------- reports ----------
  DATA.reportTypes = [
    'Diagnostic Summary', 'Maintenance Recommendation', 'Trend Analysis', 'Alarm Analysis',
    'Drive Parameter Audit', 'PLC Code Review', 'System Health', 'Machine Profile',
    'Safety Audit', 'Fault History', 'Style Guide Compliance', 'Fleet Comparison', 'Commissioning Record'
  ];
  DATA.reportFormats = ['PDF', 'DOCX', 'XLSX', 'HTML', 'Markdown'];
  DATA.reports = [
    { id: 5001, machineId: 5, type: 'Diagnostic Summary', format: 'PDF', status: 'complete', createdAt: '2026-09-22T09:20:00Z', title: 'XP5 — Zone 3 Over-Temp Diagnostic Summary' },
    { id: 5002, machineId: 1, type: 'Maintenance Recommendation', format: 'DOCX', status: 'complete', createdAt: '2026-09-19T16:40:00Z', title: 'XP1 — 90° Clamp Pivot Bushing PM Recommendation' },
    { id: 5003, machineId: 9, type: 'Trend Analysis', format: 'XLSX', status: 'complete', createdAt: '2026-09-20T19:15:00Z', title: 'DSD-150 — 6-Week Discharge Temperature Trend' },
    { id: 5004, machineId: 4, type: 'System Health', format: 'PDF', status: 'generating', createdAt: '2026-09-22T14:50:00Z', title: 'XP4 — Quarterly System Health Report', progress: 62 },
    { id: 5005, machineId: 6, type: 'Fault History', format: 'HTML', status: 'complete', createdAt: '2026-09-17T14:00:00Z', title: 'Tenter Frame — Entry-Side Clip Miss Fault History' }
  ];

  // ---------- XP5 digital twin ----------
  DATA.twin = {
    machineId: 5,
    bindings: [
      { tag: 'PLATEN_Z3_TEMP_PV', boundTo: 'twin.platen.zone3.temp_f' },
      { tag: 'LINE_SPEED_FPM', boundTo: 'twin.line.speed_fpm' },
      { tag: 'NIP_PRESSURE_PSI', boundTo: 'twin.nip.pressure_psi' }
    ],
    scenarios: [
      { id: 'SC-01', name: 'Baseline production run', desc: 'Nominal 3-zone platen, 42 fpm line speed.' },
      { id: 'SC-02', name: 'Zone 3 sensor drift', desc: 'Replays the Zone 3 over-temp incident for training/what-if review.' },
      { id: 'SC-03', name: 'Cold-start ramp', desc: 'Startup ramp from ambient to running setpoint across all 3 zones.' }
    ],
    simRuns: [
      { id: 'RUN-241', scenarioId: 'SC-02', status: 'complete', startedAt: '2026-09-21T10:00:00Z', diffEvents: 3 },
      { id: 'RUN-242', scenarioId: 'SC-01', status: 'complete', startedAt: '2026-09-22T07:00:00Z', diffEvents: 0 }
    ],
    diffEvents: [
      { runId: 'RUN-241', t: '00:14:20', tag: 'PLATEN_Z3_TEMP_PV', expected: 392, actual: 411, note: 'Divergence begins — matches real incident onset.' },
      { runId: 'RUN-241', t: '00:22:05', tag: 'PLATEN_Z3_TEMP_PV', expected: 393, actual: 418, note: 'Divergence widening.' },
      { runId: 'RUN-241', t: '00:31:40', tag: 'PLATEN_Z3_TEMP_PV', expected: 390, actual: 412, note: 'Alarm threshold approached in simulation.' }
    ]
  };

  // ---------- SVG studio ----------
  DATA.svgStudio = {
    tagCategories: ['Temperature', 'Pressure', 'Speed', 'Position', 'Digital I/O'],
    repository: [
      { id: 'SVG-11', machineId: 5, title: 'XP5 Platen Zone Overview', tagCount: 6, updatedAt: '2026-09-18T10:00:00Z' },
      { id: 'SVG-12', machineId: 1, title: 'XP1 90° Clamp Station Map', tagCount: 4, updatedAt: '2026-09-12T10:00:00Z' },
      { id: 'SVG-13', machineId: 9, title: 'DSD-150 Process Overview', tagCount: 5, updatedAt: '2026-08-30T10:00:00Z' }
    ]
  };

  // ---------- fleet activity feed ----------
  DATA.activity = [
    { t: '2026-09-22T14:50:00Z', text: 'System Health report started for XP4', machineId: 4, kind: 'report' },
    { t: '2026-09-22T09:20:00Z', text: 'Diagnostic Summary generated for XP5 (Zone 3 over-temp)', machineId: 5, kind: 'report' },
    { t: '2026-09-22T09:10:00Z', text: 'New learning insight proposed on XP5', machineId: 5, kind: 'insight' },
    { t: '2026-09-21T14:02:00Z', text: 'XP1 reindexed — 5,920 chunks', machineId: 1, kind: 'index' },
    { t: '2026-09-20T19:05:00Z', text: 'New learning insight proposed on DSD-150', machineId: 9, kind: 'insight' },
    { t: '2026-09-19T16:30:00Z', text: 'Insight approved on XP1 (F-102 mechanical root cause)', machineId: 1, kind: 'insight' },
    { t: '2026-09-17T06:00:00Z', text: 'External KB source BRK_PLC_DEV synced — 184 items', machineId: 6, kind: 'sync' }
  ];

  window.DATA = DATA;
})();
