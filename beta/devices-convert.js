/* Turns a JSON device mapping into DEVICES.CSV, the file the SP reads (DEVICE FILES: MARK on the DEVICES screen, IMPORT).
   Runs in the browser, nothing is uploaded. Also loads in Node (tests): require("./devices-convert.js").convert(text).

   JSON: {"devices": [{"device": 1, "name": "MS-20", "input_only": false, "raw_ccs": "hide",
                       "ccs": [{"cc": 74, "name": "CUTOFF"}, [71, "RESO"], {"7": "VOLUME"}]}]}
   "devices" may also be an object keyed by device number, or the whole file a list of devices. Only "device" is needed. */
(function (root) {
  "use strict";
  var MAX_DEVICE = 7, NAME_LEN = 7, CC_CAP = 251;

  // What the SP keeps in a name: A-Z, 0-9, space, - and . (anything else becomes a space), 7 characters, no blanks at either end.
  function clean(text, len) {
    var out = "", s = String(text == null ? "" : text).toUpperCase();
    for (var i = 0; i < s.length && out.length < len; i++) {
      var c = s[i];
      if (!/[A-Z0-9 .\-]/.test(c)) c = " ";
      if (c === " " && out.length === 0) continue;
      out += c;
    }
    return out.replace(/ +$/, "");
  }

  function asDevices(data) {
    var list = data && !Array.isArray(data) && typeof data === "object" && "devices" in data ? data.devices : data;
    if (Array.isArray(list)) return list.map(function (d) { return [d && d.device != null ? d.device : d && d.number, d]; });
    if (list && typeof list === "object") return Object.keys(list).map(function (k) { return [k, list[k]]; });
    throw new Error("expected a list of devices");
  }

  function asCcs(ccs) {
    if (ccs == null) return [];
    if (Array.isArray(ccs)) return ccs.map(function (c) {
      if (Array.isArray(c)) return [c[0], c[1]];
      if (c && typeof c === "object") {
        var keys = Object.keys(c);
        if (c.cc == null && c.number == null && keys.length === 1) return [keys[0], c[keys[0]]];     // {"74": "CUTOFF"}
        return [c.cc != null ? c.cc : c.number, c.name];
      }
      return [undefined, undefined];
    });
    if (typeof ccs === "object") return Object.keys(ccs).map(function (k) { return [k, ccs[k]]; });
    return [];
  }

  function convert(text) {
    var warnings = [], data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("That isn't valid JSON: " + e.message); }
    var devices = {};
    asDevices(data).forEach(function (pair) {
      var n = Number(pair[0]), d = pair[1];
      if (!Number.isInteger(n) || n < 1 || n > MAX_DEVICE) { warnings.push("Skipped a device numbered " + pair[0] + ": the SP has devices 1 to " + MAX_DEVICE + "."); return; }
      if (!d || typeof d !== "object") { warnings.push("Skipped device " + n + ": it is not an object."); return; }
      if (devices[n]) warnings.push("Device " + n + " is in the file twice: the later one is used.");
      var name = clean(d.name, NAME_LEN);
      if (d.name != null && String(d.name).trim() !== "" && (String(d.name).toUpperCase() !== name)) {
        warnings.push("Device " + n + " name \"" + d.name + "\" becomes \"" + name + "\" (A-Z, 0-9, space, - and . only, " + NAME_LEN + " characters).");
      }
      var input = d.input_only != null ? d.input_only : d.inputOnly;
      var raw = d.raw_ccs != null ? d.raw_ccs : d.rawCcs;
      var rawShow = raw == null ? true : (typeof raw === "string" ? /^s/i.test(raw) : !!raw);
      var seen = {}, ccs = [];
      asCcs(d.ccs).forEach(function (c) {
        var cc = Number(c[0]);
        if (!Number.isInteger(cc) || cc < 0 || cc > 127) { warnings.push("Device " + n + ": skipped CC " + c[0] + " (CCs are 0 to 127)."); return; }
        var nm = clean(c[1], NAME_LEN);
        if (!nm) nm = "CC" + cc;
        else if (String(c[1]).toUpperCase() !== nm) warnings.push("Device " + n + " CC " + cc + " name \"" + c[1] + "\" becomes \"" + nm + "\".");
        if (seen[cc] != null) { warnings.push("Device " + n + ": CC " + cc + " is listed twice, the later name is used."); ccs[seen[cc]] = [cc, nm]; return; }
        seen[cc] = ccs.length; ccs.push([cc, nm]);
      });
      if (ccs.length && !name) warnings.push("Device " + n + " has CC names but no name: the SP only keeps CC names for a named device.");
      devices[n] = { name: name, input: input === true || /^y/i.test(String(input || "")), rawShow: rawShow, ccs: ccs };
    });
    var lines = ["DEVICE,NAME,INPUT ONLY,RAW CCS,CC,CC NAME"], total = 0;
    Object.keys(devices).map(Number).sort(function (a, b) { return a - b; }).forEach(function (n) {
      var d = devices[n];
      lines.push([n, d.name, d.input ? "YES" : "NO", d.rawShow ? "SHOW" : "HIDE", "", ""].join(","));
      d.ccs.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (c) { lines.push([n, "", "", "", c[0], c[1]].join(",")); total++; });
    });
    if (total > CC_CAP) warnings.push("That is " + total + " CC names: the SP keeps " + CC_CAP + " in all, the rest are left out when it imports.");
    if (!Object.keys(devices).length) warnings.push("No devices found.");
    if (devices[7]) warnings.push("Device 7 is GHOST in the release builds: the SP skips it.");
    return { csv: lines.join("\r\n") + "\r\n", warnings: warnings, devices: Object.keys(devices).length, ccs: total };
  }

  var api = { convert: convert, clean: clean };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.DevicesConvert = api;
})(typeof window !== "undefined" ? window : this);
