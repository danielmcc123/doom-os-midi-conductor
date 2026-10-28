// The CC list picker: tick the synths whose CC names the SP should know, add your own list from a file,
// and write the choice into the patched firmware image (data only, no code changes).
// A JavaScript port of midi_out/cc_names.py: the rules and the bytes are the same, and test_ccpicker.py
// checks that they stay so.
//
// The page gives it window.CC_CATALOG (see cc_catalog.py): [{maker, synths: [{device, title, note,
// default, ccs: [[cc, name], ...]}]}].

const CC_MAX_DEVICES = 11;
const CC_MAX_RECORDS = 250;
const CC_NAME_CHARS = /^[A-Z0-9 +./#-]{1,7}$/;
const CC_FIRST_NAME = 'DEVICE';
const CC_SPARE_NAMES = ['DRUMS', 'BASS', 'KEYS', 'SYNTH', 'LEAD', 'PAD', 'FX', 'SEQ', 'MIDI']
  .concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => 'USER' + i));
const CC_REC_SIZE = 10;
const CC_HDR_SIZE = 4 * (CC_MAX_DEVICES + 1);
const CC_MAGIC = [0x43, 0x43, 0x44, 0x54];          // "CCDT"
const CC_DESC_SIZE = 0x20;
const CC_DESC_VERSION = 2;
const CC_DEVICE_SLOTS = 7;                          // the SP's devices 1..7
// Builds with a built-in device keep the last name slot for it (and its CCs, and device 7 when yours does
// not fill it): the picker then offers one device less.
const CC_RES_NAME = String.fromCharCode(71, 72, 79, 83, 84), CC_RES_SLOT = 7;
let ccLimit = CC_MAX_DEVICES;                       // how many devices of your own fit

// ---- the rules (cc_names.normalise) ----

function ccName(text, what) {
  const t = String(text).trim().toUpperCase();
  if (!CC_NAME_CHARS.test(t)) {
    throw new Error(what + ' "' + String(text) + '": use 1-7 characters from A-Z 0-9 space - + . / #');
  }
  return t;
}

function ccChannel(value, name) {
  if (value === undefined || value === null || value === '' || value === 0) return 0;
  const text = String(value).trim();
  if (!/^-?\d+$/.test(text)) throw new Error(name + ': channel "' + value + '" is not a number');
  const ch = parseInt(text, 10);
  if (ch < 1 || ch > 16) throw new Error(name + ': channel ' + ch + ' is outside 1-16');
  return ch;
}

// devices: [[name, [[cc, name], ...] | {cc: name}, channel?], ...] -> [[name, ccs, channel 0-16], ...],
// validated, upper case, CCs sorted.
function ccNormalise(devices) {
  if (devices.length > ccLimit) {
    throw new Error('at most ' + ccLimit + ' devices' + ', got ' + devices.length);
  }
  const out = [], seen = new Set();
  let total = 0;
  for (const dev of devices) {
    const name = ccName(dev[0], 'device name');
    if (seen.has(name) || name === CC_FIRST_NAME) {
      throw new Error('device name "' + name + '" used twice (or reserved)');
    }
    seen.add(name);
    const chan = ccChannel(dev[2], name);
    const items = Array.isArray(dev[1]) ? dev[1] : Object.entries(dev[1] || {});
    const got = [], nums = new Set();
    for (const [rawCc, cname] of items) {
      const text = String(rawCc).trim();
      if (!/^-?\d+$/.test(text)) throw new Error(name + ': "' + rawCc + '" is not a CC number');
      const cc = parseInt(text, 10);
      if (cc < 0 || cc > 127) throw new Error(name + ': CC ' + cc + ' is outside 0-127');
      if (nums.has(cc)) throw new Error(name + ': CC ' + cc + ' listed twice');
      nums.add(cc);
      got.push([cc, ccName(cname, name + ' CC ' + cc + ' name')]);
    }
    total += got.length;
    got.sort((a, b) => a[0] - b[0]);
    out.push([name, got, chan]);
  }
  if (total > CC_MAX_RECORDS) {
    throw new Error(total + ' CC names in all; the limit is ' + CC_MAX_RECORDS);
  }
  return out;
}

function ccCount(devices) {
  return devices.reduce((n, d) => n + (Array.isArray(d[1]) ? d[1].length : Object.keys(d[1]).length), 0);
}

// ---- files you upload ----

function ccParseJson(text) {
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('not valid JSON: ' + e.message); }
  if (!data || typeof data !== 'object' || !Array.isArray(data.devices)) {
    throw new Error('expected {"devices": [ {"name": ..., "ccs": {...}}, ... ]}');
  }
  const devs = data.devices.map((d, i) => {
    if (!d || typeof d !== 'object' || typeof d.name !== 'string') {
      throw new Error('device ' + (i + 1) + ' has no "name"');
    }
    const ccs = d.ccs === undefined ? {} : d.ccs;
    if (ccs === null || typeof ccs !== 'object' || Array.isArray(ccs)) {
      throw new Error(d.name + ': "ccs" must be an object like {"43": "CUTOFF"}');
    }
    return [d.name, ccs, d.channel];
  });
  return ccNormalise(devs);
}

// RFC 4180-ish: commas, double quotes, CR/LF.
function ccCsvRows(text) {
  const rows = [];
  let row = [], cell = '', quoted = false, any = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') { quoted = true; any = true; }
    else if (ch === ',') { row.push(cell); cell = ''; any = true; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      if (any || cell !== '') { row.push(cell); rows.push(row); }
      row = []; cell = ''; any = false;
    } else { cell += ch; any = true; }
  }
  if (any || cell !== '') { row.push(cell); rows.push(row); }
  return rows;
}

function ccParseCsv(text) {
  const devs = new Map(), chans = new Map();
  const rows = ccCsvRows(text.replace(/^﻿/, '')).filter(r => r.length && !r[0].trim().startsWith('#'));
  let line = 0;
  for (const r of rows) {
    line++;
    if (r.length < 2 || r[0].trim().toLowerCase() === 'device') continue;
    const dev = r[0].trim().toUpperCase();
    if (!devs.has(dev)) devs.set(dev, []);
    if (r.length > 3 && r[3].trim()) {
      if (chans.has(dev) && chans.get(dev) !== r[3].trim()) throw new Error(dev + ': two different channels');
      chans.set(dev, r[3].trim());
    }
    if (r.length < 3 || !r[1].trim()) continue;                // "device,," : a device without a list
    if (!/^\d+$/.test(r[1].trim())) throw new Error('line ' + line + ': "' + r[1] + '" is not a CC number');
    devs.get(dev).push([r[1], r[2]]);
  }
  return ccNormalise(Array.from(devs.entries()).map(([d, c]) => [d, c, chans.get(d)]));
}

function ccParseFile(name, text) {
  const csv = /\.csv$/i.test(name) || (!/\.json$/i.test(name) && !/^\s*[{[]/.test(text));
  const devices = csv ? ccParseCsv(text) : ccParseJson(text);
  if (!devices.length) throw new Error('the file has no devices in it');
  return devices;
}

// ---- templates and export ----

function ccDumpJson(devices, help) {
  const obj = {};
  if (help) obj._help = help;
  obj.devices = devices.map(([n, ccs, ch]) => {
    const o = {};
    for (const [cc, c] of ccs) o[String(cc)] = c;
    return ch ? { name: n, channel: ch, ccs: o } : { name: n, ccs: o };
  });
  return JSON.stringify(obj, null, 2) + '\n';
}

function ccCsvCell(s) {
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function ccDumpCsv(devices, comments) {
  const lines = (comments || []).map(c => '# ' + c);
  lines.push('device,cc,name,channel');
  for (const [n, ccs, ch] of devices) {
    if (!ccs.length) lines.push([ccCsvCell(n), '', '', ch || ''].join(','));
    ccs.forEach(([cc, c], i) => lines.push([ccCsvCell(n), cc, ccCsvCell(c), i === 0 && ch ? ch : ''].join(',')));
  }
  return lines.join('\n') + '\n';
}

const CC_TEMPLATE_HELP = 'Each device is a name (1-7 characters), an optional "channel" (1-16: the SP puts the device on that '
  + 'channel the first time it starts) and its CCs as "number": "NAME". The first 7 devices also fill the SP\'s device slots. Names use A-Z 0-9 space - + . / # '
  + '(lower case becomes upper case). Up to ' + CC_MAX_DEVICES + ' devices and ' + CC_MAX_RECORDS
  + ' CCs in all; CC numbers are 0-127 and each only once per device. Delete this _help line if you like.';
const CC_TEMPLATE_DEVICES = [
  ['MYSYNTH', [[74, 'CUTOFF'], [71, 'RESO'], [73, 'ATTACK'], [72, 'RELEASE']], 1],
];
const CC_TEMPLATE_COMMENTS = [
  'One CC per line: device,cc,name. Lines starting with # are ignored, the header line is optional.',
  'Device and CC names are 1-7 characters from A-Z 0-9 space - + . / # (lower case becomes upper case).',
  'Up to ' + CC_MAX_DEVICES + ' devices and ' + CC_MAX_RECORDS + ' CCs in all; CC numbers 0-127, each once per device.',
  'A line like  MYSYNTH,,  adds a device name with no CC list.',
  'The channel column (1-16) is optional, once per device is enough: the SP puts the device on that channel.',
  'The first 7 devices are put into the SP\'s device slots 1-7 the first time it starts with this firmware.',
];

// ---- the bytes (cc_names.slots / ccdata_bytes / names_bytes / apply_to_image) ----

function ccSlots(devices, reserved) {
  const names = [CC_FIRST_NAME].concat(devices.map(d => d[0]));
  const spare = CC_SPARE_NAMES.filter(s => !names.includes(s));
  const all = names.concat(spare).slice(0, reserved ? CC_MAX_DEVICES : CC_MAX_DEVICES + 1);
  return reserved ? all.concat([CC_RES_NAME]) : all;
}

function ccAscii(text, width) {
  const out = new Uint8Array(width);
  for (let i = 0; i < text.length && i < width; i++) out[i] = text.charCodeAt(i);
  return out;
}

function ccDataBytes(devices, resCcs) {
  const hdr = new Uint8Array(CC_HDR_SIZE), recs = [];
  let n = 0;
  const lists = devices.map(d => d[1]);
  if (resCcs) {
    while (lists.length < CC_MAX_DEVICES - 1) lists.push([]);
    lists.push(resCcs);                             // the built-in device: the last name slot
  }
  lists.forEach((ccs, i) => {
    const slot = i + 1;
    if (!ccs.length) return;
    hdr[4 * slot] = n;
    hdr[4 * slot + 1] = ccs.length;
    for (const [cc, name] of ccs) {
      recs.push(slot, cc);
      recs.push(...ccAscii(name, 8));
    }
    n += ccs.length;
  });
  const out = new Uint8Array(CC_HDR_SIZE + recs.length);
  out.set(hdr);
  out.set(recs, CC_HDR_SIZE);
  return out;
}

// The 16 config bytes of devices 1..7 as the SP keeps them: [0, ch1..ch7, 0, name slot 1..7].
function ccDeviceDefaults(devices, reserved) {
  const out = new Uint8Array(16);
  devices.slice(0, CC_DEVICE_SLOTS).forEach((d, i) => { out[i + 1] = d[2] || 0; out[9 + i] = i + 1; });
  return out;
}

function ccNamesBytes(devices, reserved) {
  const out = new Uint8Array(8 * (CC_MAX_DEVICES + 1));
  ccSlots(devices, reserved).forEach((s, i) => out.set(ccAscii(s, 8), 8 * i));
  return out;
}

function ccLocate(image) {
  let idx = -1;
  for (let i = 0; i + CC_DESC_SIZE <= image.length; i++) {
    if (image[i] === CC_MAGIC[0] && image[i + 1] === CC_MAGIC[1] && image[i + 2] === CC_MAGIC[2]
        && image[i + 3] === CC_MAGIC[3]) {
      if (idx >= 0) throw new Error('this firmware has more than one CC list area');
      idx = i;
    }
  }
  if (idx < 0) throw new Error('this firmware has no CC list area');
  const view = new DataView(image.buffer, image.byteOffset, image.byteLength);
  const ver = image[idx + 4], maxdev = image[idx + 5], rec = image[idx + 6], hdr = image[idx + 7];
  if (ver !== CC_DESC_VERSION || maxdev !== CC_MAX_DEVICES || rec !== CC_REC_SIZE || hdr !== CC_HDR_SIZE) {
    throw new Error('unknown CC list layout');
  }
  return {
    names: idx + view.getInt32(idx + 8, true),
    cc: idx + view.getInt32(idx + 12, true),
    size: view.getUint16(idx + 16, true),
    defaults: view.getInt32(idx + 18, true) ? idx + view.getInt32(idx + 18, true) : 0,
  };
}

// A copy of the patched image with `devices` (already normalised) in its CC list area.
function ccApplyToImage(image, devices) {
  const at = ccLocate(image);
  // a build with a built-in device has it in the last name slot: keep it, with its CCs
  let resCcs = null;
  const nm = from => { let t = ''; for (let i = 0; i < 8 && image[from + i]; i++) t += String.fromCharCode(image[from + i]); return t; };
  if (nm(at.names + 8 * CC_MAX_DEVICES) === CC_RES_NAME) {
    if (devices.length > CC_MAX_DEVICES - 1) throw new Error('use at most ' + (CC_MAX_DEVICES - 1) + ' devices');
    const first = image[at.cc + 4 * CC_MAX_DEVICES], count = image[at.cc + 4 * CC_MAX_DEVICES + 1];
    resCcs = [];
    for (let k = first; k < first + count; k++) {
      const r = at.cc + CC_HDR_SIZE + CC_REC_SIZE * k;
      resCcs.push([image[r + 1], nm(r + 2)]);
    }
  }
  const data = ccDataBytes(devices, resCcs);
  if (data.length > at.size) throw new Error('the CC lists do not fit');
  const out = new Uint8Array(image);
  out.set(ccNamesBytes(devices, !!resCcs), at.names);
  out.fill(0, at.cc, at.cc + at.size);
  out.set(data, at.cc);
  if (at.defaults) out.set(ccDeviceDefaults(devices, !!resCcs), at.defaults);
  return out;
}

function ccReadFromImage(image) {
  const at = ccLocate(image);
  const text = (from, n) => {
    let s = '';
    for (let i = 0; i < n && image[from + i]; i++) s += String.fromCharCode(image[from + i]);
    return s;
  };
  const devs = [];
  const reserved = text(at.names + 8 * CC_MAX_DEVICES, 8) === CC_RES_NAME;
  for (let slot = 1; slot <= (reserved ? CC_MAX_DEVICES - 1 : CC_MAX_DEVICES); slot++) {
    const first = image[at.cc + 4 * slot], count = image[at.cc + 4 * slot + 1];
    const ccs = [];
    for (let k = first; k < first + count; k++) {
      const r = at.cc + CC_HDR_SIZE + CC_REC_SIZE * k;
      ccs.push([image[r + 1], text(r + 2, 8)]);
    }
    ccs.sort((a, b) => a[0] - b[0]);
    devs.push([text(at.names + 8 * slot, 8), ccs, slot <= CC_DEVICE_SLOTS && at.defaults ? image[at.defaults + slot] : 0]);
  }
  while (devs.length && !devs[devs.length - 1][1].length && CC_SPARE_NAMES.includes(devs[devs.length - 1][0])) devs.pop();
  return devs;
}

function ccSame(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---- the panel ----

const CC_STYLE = `
.ccpick{margin:0;padding:18px 20px;border-top:1px solid var(--line,#2a2f37)}
.ccpick h3{margin:0 0 4px;font-size:1.05em}
.ccpick p{margin:4px 0 12px;color:var(--dim,#9aa3ad);font-size:.92em}
.ccpick .dev{display:flex;align-items:center;gap:10px;padding:8px 12px;margin:6px 0;border:1px solid var(--line,#2a2f37);
  border-radius:8px}
.ccpick .dev .slot{font-family:ui-monospace,Menlo,monospace;font-size:.8em;color:var(--dim,#9aa3ad);width:2.2em;flex:none}
.ccpick .dev .what{flex:1;min-width:0}
.ccpick .dev b{font-weight:600}
.ccpick .dev .nm{font-family:ui-monospace,Menlo,monospace;font-size:.85em;color:var(--dim,#9aa3ad)}
.ccpick .dev small{display:block;color:var(--dim,#9aa3ad)}
.ccpick .dev .x{flex:none;width:30px;height:30px;border:0;border-radius:6px;background:none;color:var(--dim,#9aa3ad);
  font-size:1.1em;cursor:pointer}
.ccpick .dev .x:hover{color:var(--fg,#e8eaed);background:var(--line,#2a2f37)}
.ccpick .empty{color:var(--dim,#9aa3ad);font-size:.92em;padding:8px 0}
.ccpick .add{margin-top:8px}
.ccpick .menu{margin-top:8px;max-height:380px;overflow:auto;padding:4px 6px 8px;border:1px solid var(--line,#2a2f37);
  border-radius:10px;background:var(--bg,transparent)}
.ccpick .maker{margin:10px 6px 2px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:.78em;
  letter-spacing:.08em;text-transform:uppercase;color:var(--acc2,#ffb066)}
.ccpick .maker::after{content:"";flex:1;border-top:1px solid var(--line,#2a2f37)}
.ccpick .opt{display:block;width:100%;text-align:left;padding:7px 10px;border:0;border-radius:6px;background:none;
  color:var(--fg,#e8eaed);font:inherit;cursor:pointer}
.ccpick .opt:hover:not(:disabled){background:var(--line,#2a2f37)}
.ccpick .opt:disabled{color:var(--dim,#9aa3ad);cursor:default;opacity:.6}
.ccpick .opt small{display:block;color:var(--dim,#9aa3ad)}
.ccpick .opt .nm{font-family:ui-monospace,Menlo,monospace;font-size:.85em;color:var(--dim,#9aa3ad)}
.ccpick .count{margin-top:12px;font-size:.92em;font-variant-numeric:tabular-nums}
.ccpick .err{margin:8px 0 0;font-size:.92em;white-space:pre-wrap;color:var(--warn,#f2c14e)}
.ccpick .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}
.ccpick button.mini{height:34px;padding:0 14px;border:1px solid var(--line,#2a2f37);border-radius:8px;background:none;
  color:var(--fg,#e8eaed);font:inherit;font-size:.9em;cursor:pointer}
.ccpick button.mini:hover{border-color:var(--acc,#ff7a1a)}
.ccpick .order{margin:8px 0 0;font-size:.85em;color:var(--dim,#9aa3ad);font-family:ui-monospace,Menlo,monospace}
.ccpick .links{margin-top:10px;font-size:.88em;color:var(--dim,#9aa3ad)}
.ccpick .links button{border:0;background:none;padding:0;margin:0 2px;color:var(--acc2,#ffb066);font:inherit;
  text-decoration:underline;cursor:pointer}
`;

function createPicker(host, catalog, onChange, reserve) {
  ccLimit = CC_MAX_DEVICES - (reserve || 0);
  const doc = host.ownerDocument;
  const style = doc.createElement('style');
  style.textContent = CC_STYLE;
  host.append(style);
  const root = doc.createElement('div');
  root.className = 'ccpick';
  host.append(root);
  const el = (tag, cls, text) => {
    const e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const button = (cls, text) => {
    const b = el('button', cls, text);
    b.type = 'button';
    return b;
  };

  root.append(el('h3', '', 'CC lists'),
    el('p', '', 'The synths whose CC names the SP knows, so a CTRL dial can pick "CUTOFF" instead of a number. '
      + 'They take the device name slots on the SP in the order shown, and the first seven are set up as devices 1 to 7 (with their channel, if they have one) the first time the SP starts.'));
  const listEl = el('div');
  const add = el('div', 'add');
  const addBtn = button('mini', '+ Add a synth');
  const menu = el('div', 'menu');
  menu.hidden = true;
  add.append(addBtn, menu);
  const file = el('input');
  file.type = 'file';
  file.accept = '.json,.csv,application/json,text/csv,text/plain';
  file.hidden = true;
  const count = el('div', 'count');
  const order = el('div', 'order');
  const err = el('div', 'err');
  err.hidden = true;
  const links = el('div', 'links');
  const tJson = button('', 'JSON template'), tCsv = button('', 'CSV template'), mine = button('', 'download this list');
  links.append('Make your own: ', tJson, ' · ', tCsv, ' · or ', mine, ' as a starting point.');
  root.append(listEl, add, file, count, order, err, links);

  // The synths in the list, in slot order: {device, ccs, title, source}.
  let entries = [];
  for (const g of catalog) {
    for (const s of g.synths) if (s.default) entries.push({ device: s.device, ccs: s.ccs, channel: s.channel || 0, title: s.title, source: g.maker });
  }
  let problem = '', customName = '';

  const pairs = list => list.map(e => [e.device, e.ccs, e.channel || 0]);
  const valid = list => ccNormalise(pairs(list));          // throws when the list would not be accepted

  // A message under the list. `blocks` marks a list that cannot be written; a refused addition leaves
  // the list as it was, so it only informs.
  function say(text, blocks) {
    problem = blocks ? text : '';
    err.textContent = text;
    err.hidden = !text;
  }

  function render() {
    listEl.textContent = '';
    if (!entries.length) listEl.append(el('div', 'empty', 'No CC lists. The SP will show plain device names.'));
    entries.forEach((e, i) => {
      const row = el('div', 'dev');
      row.append(el('span', 'slot', String(i + 1)));
      const what = el('span', 'what');
      const b = el('b', '', e.title);
      what.append(b, el('span', 'nm', ' ' + e.device + ' · ' + e.ccs.length + ' CCs' + (e.channel ? ' · ch ' + e.channel : '')), el('small', '', e.source));
      const x = button('x', '✕');
      x.title = 'Remove ' + e.title;
      x.setAttribute('aria-label', 'Remove ' + e.title);
      x.addEventListener('click', () => { entries.splice(i, 1); say(''); render(); });
      row.append(what, x);
      listEl.append(row);
    });
    const n = entries.reduce((t, e) => t + e.ccs.length, 0);
    count.textContent = entries.length + ' of ' + ccLimit + ' device names · ' + n + ' of ' + CC_MAX_RECORDS + ' CCs';
    let slots = '';
    try { slots = ccSlots(valid(entries), ccLimit < CC_MAX_DEVICES).slice(0, ccLimit + 1).join(' · '); } catch (e) { say(e.message, true); }
    order.textContent = slots ? 'On the SP: ' + slots : '';
    if (onChange) onChange(!problem);
  }

  function tryAdd(more, what) {
    try {
      valid(entries.concat(more));
    } catch (e) {
      say(what + ': ' + e.message);
      if (onChange) onChange(!problem);
      return false;
    }
    entries = entries.concat(more);
    say('');
    render();
    return true;
  }

  function fillMenu() {
    menu.textContent = '';
    const have = new Set(entries.map(e => e.device));
    for (const g of catalog) {
      menu.append(el('div', 'maker', g.maker));
      for (const s of g.synths) {
        const o = button('opt');
        o.disabled = have.has(s.device);
        o.append(el('b', '', s.title), el('span', 'nm', ' ' + s.device + ' · ' + s.ccs.length + ' CCs'),
                 el('small', '', o.disabled ? 'Already in the list' : s.note));
        o.addEventListener('click', () => {
          closeMenu();
          tryAdd([{ device: s.device, ccs: s.ccs, channel: s.channel || 0, title: s.title, source: g.maker }], s.title);
        });
        menu.append(o);
      }
    }
    menu.append(el('div', 'maker', 'Your own'));
    const own = button('opt');
    own.append(el('b', '', 'From a file …'), el('small', '', 'A JSON or CSV list. It is checked before it is added.'));
    own.addEventListener('click', () => { closeMenu(); file.click(); });
    menu.append(own);
  }
  function closeMenu() { menu.hidden = true; }
  addBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (menu.hidden) { fillMenu(); menu.hidden = false; } else closeMenu();
  });
  doc.addEventListener('click', e => { if (!add.contains(e.target)) closeMenu(); });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  function offer(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = el('a');
    a.href = url;
    a.download = filename;
    root.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  tJson.addEventListener('click', () => offer('my_ccs_template.json',
    ccDumpJson(CC_TEMPLATE_DEVICES, CC_TEMPLATE_HELP), 'application/json'));
  tCsv.addEventListener('click', () => offer('my_ccs_template.csv',
    ccDumpCsv(CC_TEMPLATE_DEVICES, CC_TEMPLATE_COMMENTS), 'text/csv'));
  mine.addEventListener('click', () => {
    try { offer('my_ccs.json', ccDumpJson(valid(entries)), 'application/json'); } catch (e) { say(e.message, true); }
  });

  file.addEventListener('change', async () => {
    const f = file.files && file.files[0];
    file.value = '';
    if (!f) return;
    try {
      if (f.size > 200000) throw new Error('that file is too big for a CC list (200 KB at most)');
      const devices = ccParseFile(f.name, await f.text());
      customName = f.name;
      tryAdd(devices.map(([device, ccs, channel]) => ({ device, ccs, channel, title: device, source: 'From ' + f.name })), f.name);
    } catch (e) {
      say(f.name + ': ' + e.message);
    }
  });

  render();

  return {
    problem: () => problem,
    devices() {
      return valid(entries);
    },
    // true while the choice is the one the release image was built with
    isDefault() {
      const base = ccNormalise(catalog.flatMap(g => g.synths).filter(s => s.default).map(s => [s.device, s.ccs, s.channel || 0]));
      try { return ccSame(valid(entries), base); } catch (e) { return false; }
    },
    customName: () => customName,
  };
}

if (typeof module === 'object' && module.exports) {
  Object.assign(module.exports, {
    ccNormalise, ccParseJson, ccParseCsv, ccParseFile, ccDumpJson, ccDumpCsv, ccSlots, ccDataBytes,
    ccNamesBytes, ccDeviceDefaults, ccApplyToImage, ccReadFromImage, ccLocate, createPicker,
    CC_TEMPLATE_HELP, CC_TEMPLATE_DEVICES, CC_TEMPLATE_COMMENTS,
  });
}
