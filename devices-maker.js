// The DEVICES.CSV maker on the patcher page: the synths you pick (or a JSON / CSV file) become DEVICES.CSV
(function () {
  var $ = function (i) { return document.getElementById(i); }, csv = "";
  var picker = createPicker($("ccpicker"), window.CC_CATALOG, update, 5);
  var intro = $("ccpicker").querySelector(".ccpick p");
  if (intro) intro.textContent = "Add the synths you use. Each one comes with its CC names, so a CTRL dial picks \"CUTOFF\" instead of a number. Add your own with a JSON or CSV file.";
  function update() {
    var notes = $("dnotes"), out = $("dout"), st = $("dstatus");
    notes.hidden = out.hidden = true; notes.textContent = ""; st.className = ""; st.textContent = ""; $("save").disabled = true; csv = "";
    if (picker && picker.problem()) { st.textContent = "Fix the list first: " + picker.problem(); st.className = "err"; return; }
    var list;
    try { list = picker ? picker.devices() : []; } catch (e) { st.textContent = e.message; st.className = "err"; return; }
    if (!list.length) { st.textContent = "Add a synth to make the file."; return; }
    var json = { devices: list.map(function (d, i) { return { device: i + 1, name: d[0], ccs: d[1], channel: d[2] || 0 }; }) };
    try {
      var r = DevicesConvert.convert(JSON.stringify(json));
      csv = r.csv; out.textContent = csv; out.hidden = false; $("save").disabled = false;
      st.textContent = r.devices + " device" + (r.devices === 1 ? "" : "s") + ", " + r.ccs + " CC name" + (r.ccs === 1 ? "" : "s");
      r.warnings.forEach(function (w) { var li = document.createElement("li"); li.textContent = w; notes.appendChild(li); });
      notes.hidden = !r.warnings.length;
    } catch (e) { st.textContent = e.message; st.className = "err"; }
  }
  update();
  // A file the testers already have: the patcher's own CC list format (JSON or CSV) joins the picker's list; a
  // device-numbered JSON (the device converter's) becomes DEVICES.CSV as it is
  function jsay(text, cls) { var m = $("jmsg"); m.textContent = text; m.className = "jmsg " + (cls || ""); m.hidden = !text; }
  function take(f) {
    if (!f) return;
    if (f.size > 200000) { jsay(f.name + " is too big for a CC list (200 KB at most).", "bad"); return; }
    f.text().then(function (text) {
      var first = "";
      try {
        ccParseFile(f.name, text);                         // (throws if it is not the patcher's format)
        var input = $("ccpicker").querySelector('input[type=file]'), dt = new DataTransfer();
        dt.items.add(f); input.files = dt.files; input.dispatchEvent(new Event("change"));
        jsay("Added the synths from " + f.name + " to the list below. Check it, then download DEVICES.CSV.", "ok");
        return;
      } catch (e) { first = e.message; }
      try {
        var r = DevicesConvert.convert(text);
        if (!r.devices) throw new Error("no devices in it");
        csv = r.csv; $("dout").textContent = csv; $("dout").hidden = false; $("save").disabled = false;
        $("dstatus").className = ""; $("dstatus").textContent = r.devices + " device" + (r.devices === 1 ? "" : "s") + ", " + r.ccs + " CC names, from " + f.name;
        var notes = $("dnotes"); notes.textContent = "";
        r.warnings.forEach(function (w) { var li = document.createElement("li"); li.textContent = w; notes.appendChild(li); });
        notes.hidden = !r.warnings.length;
        jsay(f.name + " is ready as DEVICES.CSV below.", "ok");
      } catch (e2) {
        jsay(f.name + ": " + first + " (and as a device file: " + e2.message + ")", "bad");
      }
    });
  }
  $("jfile").addEventListener("change", function () { take(this.files[0]); this.value = ""; });
  var dz = $("jdrop");
  ["dragenter", "dragover"].forEach(function (t) { dz.addEventListener(t, function (e) { e.preventDefault(); dz.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { dz.addEventListener(t, function (e) { e.preventDefault(); dz.classList.remove("over"); }); });
  dz.addEventListener("drop", function (e) { take(e.dataTransfer.files[0]); });
  $("save").addEventListener("click", function () {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "DEVICES.CSV"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();
