const LOGO = "logo.png";
function applyLogos() {
  [
    "nav-logo",
    "but-logo",
    "compo-logo",
    "convo-logo",
    "prev-logo",
    "doc-logo",
    "stats-logo",
    "motm-logo",
    "class-logo",
    "slive-logo",
    "res-logo",
    "carton-logo",
    "h2h-logo",
    "abs-logo",
    "hat-logo",
    "rec-logo",
    "tr-logo",
    "sond-logo",
    "prono-logo",
    "nm-logo",
    "gen-logo",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.src = LOGO;
  });
}

// ══════════════════════════════════════
// STORAGE
// ══════════════════════════════════════
const PREFIX = "rmf247_";
function save(key, val) {
  try {
    localStorage.setItem(PREFIX + key, val);
  } catch (e) {}
}
function load(key, def = "") {
  try {
    return localStorage.getItem(PREFIX + key) ?? def;
  } catch (e) {
    return def;
  }
}
function saveImg(key, dataUrl) {
  if (!dataUrl || dataUrl.length < 200000) {
    // Too small to worry
    try {
      localStorage.setItem(PREFIX + "img_" + key, dataUrl);
    } catch (e) {}
    return;
  }
  // Compress large images (> 200KB)
  const img = new Image();
  img.onload = () => {
    const maxW = 1600;
    const maxH = 1600;
    let w = img.width;
    let h = img.height;
    if (w > maxW || h > maxH) {
      const r = Math.min(maxW / w, maxH / h);
      w *= r;
      h *= r;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const lowRes = canvas.toDataURL("image/jpeg", 0.75);
    try {
      localStorage.setItem(PREFIX + "img_" + key, lowRes);
    } catch (e) {}
  };
  img.src = dataUrl;
}
function loadImg(key) {
  try {
    return localStorage.getItem(PREFIX + "img_" + key);
  } catch (e) {
    return null;
  }
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function saveLive(fid, tid) {
  const val = document.getElementById(fid).value;
  save(fid, val);
  setText(tid, val);
}
function parseP(str) {
  // Split by comma or newline, handle multiple separator chars
  return str
    .split(/[,\n]+/)
    .map((s) => {
      s = s.trim();
      if (!s) return null;
      // Support · (U+00B7), | and : as separators
      const sep = s.includes("\u00b7")
        ? "\u00b7"
        : s.includes("|")
          ? "|"
          : s.includes(":")
            ? ":"
            : null;
      if (sep) {
        const p = s.split(sep);
        return { num: (p[0] || "").trim(), name: (p[1] || "").trim() };
      }
      // No separator: treat as name only
      return { num: "", name: s };
    })
    .filter((p) => p && (p.name || p.num));
}

// ══════════════════════════════════════
// TABS
// ══════════════════════════════════════
function switchTab(name, btn) {
  document
    .querySelectorAll(".workspace")
    .forEach((w) => w.classList.remove("active"));

  // Clear active from all navigation buttons
  document
    .querySelectorAll(".tab-btn, .dropdown-item")
    .forEach((b) => b.classList.remove("active"));

  const ws = document.getElementById("ws-" + name);
  if (ws) ws.classList.add("active");

  if (btn) {
    btn.classList.add("active");
  } else {
    // Fallback if triggered from code/reload
    const targetBtn = document.querySelector(
      `.tab-btn[onclick*="'${name}'"], .dropdown-item[onclick*="'${name}'"]`,
    );
    if (targetBtn) targetBtn.classList.add("active");
  }
  localStorage.setItem("rmf_active_tab", name);

  // Close any open mobile dropdown after selecting
  document
    .querySelectorAll(".nav-dropdown.open")
    .forEach((d) => d.classList.remove("open"));
}

// ══════════════════════════════════════
// MOBILE DROPDOWN TOGGLE
// ══════════════════════════════════════
(function () {
  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  document.addEventListener("click", function (e) {
    const catBtn = e.target.closest(".nav-category-btn");
    if (catBtn) {
      e.preventDefault();
      e.stopPropagation();
      const parent = catBtn.closest(".nav-dropdown");
      const wasOpen = parent.classList.contains("open");

      // Close all other dropdowns
      document
        .querySelectorAll(".nav-dropdown.open")
        .forEach((d) => d.classList.remove("open"));

      // Toggle the clicked one
      if (!wasOpen) {
        parent.classList.add("open");
      }
      return;
    }

    // If click is outside any dropdown, close them all
    if (!e.target.closest(".nav-dropdown")) {
      document
        .querySelectorAll(".nav-dropdown.open")
        .forEach((d) => d.classList.remove("open"));
    }
  });
})();

// ══════════════════════════════════════
// IMAGE UPLOAD
// ══════════════════════════════════════
function loadTeamLogo(input, crestId, zoneId, emojiId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    // Update crest - find the img inside the crest wrap
    const wrapId = crestId + "-wrap";
    const imgId = crestId.replace("em", "logo") + "-img";
    const thumbId = zoneId.replace("-zone", "-thumb");
    const img = document.getElementById(imgId);
    const emoji = document.getElementById(emojiId);
    const thumb = document.getElementById(thumbId);
    const zone = document.getElementById(zoneId);
    if (img) {
      img.src = dataUrl;
      img.classList.add("visible");
    }
    if (emoji) emoji.style.display = "none";
    if (thumb) {
      thumb.src = dataUrl;
      thumb.classList.add("visible");
    }
    if (zone) {
      const ic = zone.querySelector(".img-upload-icon");
      const tx = zone.querySelector(".img-upload-text");
      if (ic) ic.style.display = "none";
      if (tx) tx.style.display = "none";
    }
    saveImg(imgId, dataUrl);
  };
  reader.readAsDataURL(file);
}

function loadPlayerImg(input, imgId, iconId, thumbId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = document.getElementById(imgId);
    const icon = document.getElementById(iconId);
    const thumb = document.getElementById(thumbId);
    if (img) {
      img.src = dataUrl;
      img.style.display = "block";
    }
    if (icon) icon.style.display = "none";
    if (thumb) {
      thumb.src = dataUrl;
      thumb.classList.add("visible");
    }
    // update upload zone to show thumb
    const zone = input.closest(".img-upload");
    if (zone) {
      zone.querySelector(".img-upload-icon").style.display = "none";
      zone.querySelector(".img-upload-text").style.display = "none";
    }
    saveImg(imgId, dataUrl);
  };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════
// COMPOSITION — FORMATION LOGIC
// ══════════════════════════════════════
const FORMATIONS = {
  "4-3-3": { def: 4, mid: 3, att: 3 },
  "4-4-2": { def: 4, mid: 4, att: 2 },
  "3-5-2": { def: 3, mid: 5, att: 2 },
  "4-2-3-1": { lines: [4, 2, 3, 1] },
  "5-3-2": { def: 5, mid: 3, att: 2 },
  "3-4-3": { def: 3, mid: 4, att: 3 },
  "4-1-4-1": { lines: [4, 1, 4, 1] },
  "4-5-1": { def: 4, mid: 5, att: 1 },
};

function getFormLines(fName, def, mid, att) {
  const f = FORMATIONS[fName];
  if (!f) return [];
  if (f.lines) {
    // Multi-line formations like 4-2-3-1
    const allPlayers = [...att, ...mid, ...def];
    const lines = [];
    let i = 0;
    const reversed = [...f.lines].reverse(); // att first in display
    // We'll do att at top, def at bottom for visual
    const fwdLines = f.lines.slice().reverse();
    let pool = [...att, ...mid, ...def];
    // rebuild: take from att/mid/def according to formation numbers
    const counts = f.lines; // [4,2,3,1] = GK + 4def + 2mid + 3mid + 1att
    // For 4-2-3-1: att=1, mid=[3,2], def=4
    // rows from display top (ATT) to bottom (DEF):
    // row1: att (count=last), row2: next mid, ...
    const dispCounts = [...counts].reverse(); // display: att->def
    let poolR = [...att];
    const midP = [...mid];
    const defP = [...def];
    // distribute mid among middle rows
    const middleRows = dispCounts.slice(1, dispCounts.length - 1);
    let midIdx = 0;
    const result = [];
    // ATT row
    result.push(att.slice(0, dispCounts[0]));
    // middle rows from mid pool
    middleRows.forEach((cnt) => {
      result.push(midP.slice(midIdx, midIdx + cnt));
      midIdx += cnt;
    });
    // DEF row
    result.push(defP.slice(0, dispCounts[dispCounts.length - 1]));
    return result;
  }
  // Simple 3-line formation
  return [att.slice(0, f.att), mid.slice(0, f.mid), def.slice(0, f.def)];
}

function renderFormation() {
  const fName = document.getElementById("f-compo-form").value;
  setText("compo-badge", fName);
  save("f-compo-form", fName);

  const gk = parseP(document.getElementById("f-compo-gk").value);
  const def = parseP(document.getElementById("f-compo-def").value);
  const mid = parseP(document.getElementById("f-compo-mid").value);
  const att = parseP(document.getElementById("f-compo-att").value);

  const lines = getFormLines(fName, def, mid, att);

  const pitch = document.getElementById("compo-pitch");
  let html = "";

  // ATT rows first (top of pitch visual)
  lines.forEach((row, ri) => {
    if (!row.length) return;
    const isAtt = ri === 0;
    html += `<div class="compo-row">`;
    row.forEach((p) => {
      const imgData = loadImg("compo_p_" + p.num);
      html += `<div class="compo-player-node${isAtt ? " att" : ""}">
        <div class="compo-pnum-circle">
          ${imgData ? `<img src="${imgData}" alt="${p.name}">` : p.num}
        </div>
        <div class="compo-pname-txt">${p.name}</div>
      </div>`;
    });
    html += `</div>`;
  });

  // GK last (bottom)
  html += `<div class="compo-row">`;
  gk.forEach((p) => {
    html += `<div class="compo-player-node gk">
      <div class="compo-pnum-circle">${p.num}</div>
      <div class="compo-pname-txt">${p.name}</div>
    </div>`;
  });
  html += `</div>`;

  pitch.innerHTML = html;
  renderSubs();
}

function renderSubs() {
  const subs = parseP(document.getElementById("f-compo-subs").value);
  const el = document.getElementById("compo-subs");
  el.innerHTML = subs
    .map(
      (p) => `
    <div class="compo-sub-chip">
      <span class="compo-sub-n">${p.num}</span>
      <span class="compo-sub-name">${p.name}</span>
    </div>`,
    )
    .join("");
}

// ══════════════════════════════════════
// CONVOQUÉS
// ══════════════════════════════════════
function renderConvo() {
  const sections = [
    { label: "Gardiens de but", id: "f-convo-gk", icon: "🧤" },
    { label: "Défenseurs", id: "f-convo-def", icon: "🛡️" },
    { label: "Milieux de terrain", id: "f-convo-mid", icon: "⚙️" },
    { label: "Attaquants", id: "f-convo-att", icon: "⚡" },
  ];
  const body = document.getElementById("convo-body");
  let total = 0,
    html = "";
  sections.forEach((sec) => {
    const players = parseP(document.getElementById(sec.id).value).sort(
      (a, b) => parseInt(a.num || 999) - parseInt(b.num || 999),
    );
    if (!players.length) return;
    total += players.length;
    html += `<div class="pos-section">
      <div class="pos-header">
        <div class="pos-badge">${sec.icon} ${sec.label}</div>
        <div class="pos-count">${players.length}</div>
        <div class="pos-line"></div>
      </div>
      <div class="pos-players">
        ${players.map((p) => `<div class="pos-chip"><span class="pos-chip-num">${p.num}</span><span class="pos-chip-name">${p.name}</span></div>`).join("")}
      </div>
    </div>`;
  });
  body.innerHTML = html;
  setText("convo-count", total);
}

// ══════════════════════════════════════
// PREVIEW PLAYERS
// ══════════════════════════════════════
function renderPrevPlayers() {
  const ids = ["f-prev-p1", "f-prev-p2", "f-prev-p3", "f-prev-p4"];
  const icons = ["⚽", "🎯", "🛡️", "🔥"];
  const el = document.getElementById("prev-players");
  let html = "";
  ids.forEach((id, i) => {
    const val = document.getElementById(id).value.trim();
    if (!val) return;
    const parts = val.split("·");
    const num = parts[0]?.trim() || "";
    const name = parts[1]?.trim() || val;
    const role = parts[2]?.trim() || "";
    const team = parts[3]?.trim() || "";
    html += `<div class="prev-player-row">
      <div class="prev-player-num">${num}</div>
      <div class="prev-player-info">
        <div class="prev-player-name">${name}</div>
        <div class="prev-player-role">${role}</div>
      </div>
      <div class="prev-player-team">${team}</div>
    </div>`;
  });
  el.innerHTML = html;
}

// ══════════════════════════════════════
// DOWNLOAD (html2canvas)
// ══════════════════════════════════════
async function downloadCard(tplId, filename) {
  const loader = document.getElementById("loader");
  loader.classList.add("show");
  try {
    const el = document.getElementById(tplId);
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = filename + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (e) {
    alert("Erreur lors de la génération: " + e.message);
  } finally {
    loader.classList.remove("show");
  }
}

function copyCaption(id, event) {
  const copyText = document.getElementById(id);
  copyText.select();
  copyText.setSelectionRange(0, 99999); // Pour mobile
  navigator.clipboard.writeText(copyText.value).then(() => {
    const btn = event ? event.currentTarget : null;
    if (!btn) return;
    const originalText = btn.innerText;
    btn.innerText = "COPIÉ ! ✅";
    const originalBg = btn.style.background;
    const originalColor = btn.style.color;
    btn.style.background = "#4CAF50";
    btn.style.color = "#fff";
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = originalBg;
      btn.style.color = originalColor;
    }, 2000);
  });
}

// ══════════════════════════════════════
// INIT — restore from localStorage
// ══════════════════════════════════════
function restoreField(id, def = "") {
  const el = document.getElementById(id);
  if (!el) return def;
  const val = load(id, def);
  el.value = val;
  return val;
}

// ── SHORTHAND ──
function setT(id, val) {
  const e = document.getElementById(id);
  if (e) e.textContent = val;
}

// ── GENERIC TEAM LOGO LOADER ──
function loadTeamLogoGen(input, imgId, emojiId, zoneId, thumbId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const d = e.target.result;
    const img = document.getElementById(imgId);
    const emoji = document.getElementById(emojiId);
    const thumb = document.getElementById(thumbId);
    const zone = document.getElementById(zoneId);
    if (img) {
      img.src = d;
      img.classList.add("visible");
    }
    if (emoji) emoji.style.display = "none";
    if (thumb) {
      thumb.src = d;
      thumb.classList.add("visible");
    }
    if (zone) {
      const ic = zone.querySelector(".img-upload-icon");
      if (ic) ic.style.display = "none";
      const tx = zone.querySelector(".img-upload-text");
      if (tx) tx.style.display = "none";
    }
    saveImg(imgId, d);
  };
  reader.readAsDataURL(file);
}

// ── STAT BAR ──
function updateBar(name, val) {
  const n = Math.min(99, Math.max(0, parseInt(val) || 0));
  const fill = document.getElementById("sb-" + name);
  const sv = document.getElementById("sv-" + name);
  if (fill) fill.style.width = n + "%";
  if (sv) sv.textContent = n;
  save("f-stats-v-" + name, val);
}

// ── CLASSEMENT ──
function renderClassement() {
  const raw = document.getElementById("f-class-data")?.value || "";
  const highlight = (
    document.getElementById("f-class-highlight")?.value || ""
  ).toLowerCase();
  const medals = ["🥇", "🥈", "🥉"];
  const container = document.getElementById("class-table");
  if (!container) return;
  const rows = raw.split("\n").filter((l) => l.trim());
  let html = "";
  rows.forEach((line, i) => {
    const p = line.split(/·|\t/);
    const pos = p[0]?.trim() || "";
    const team = p[1]?.trim() || "";
    const pts = p[6]?.trim() || "0";
    const formeStr = p[7]?.trim() || "";
    const isHL = team.toLowerCase().includes(highlight) && highlight.length > 0;
    const medal = medals[i] || "";
    const formeDots = formeStr
      .split(",")
      .slice(0, 5)
      .map((f) => {
        const fc = f.trim().toUpperCase();
        const cls = fc === "V" ? "w" : fc === "N" ? "d" : "l";
        return `<div class="form-dot ${cls}"></div>`;
      })
      .join("");
    html += `<div class="class-row${isHL ? " highlight" : ""}">
      <div class="class-pos">${medal || pos}</div>
      <div class="class-team">
        <div class="class-team-logo">${team.substring(0, 3).toUpperCase()}</div>
        <div class="class-team-name">${team}</div>
      </div>
      <div class="class-stats">
        <div class="class-stat"><div class="class-stat-val">${p[2]?.trim() || ""}</div><div class="class-stat-lbl">MJ</div></div>
        <div class="class-stat"><div class="class-stat-val">${p[3]?.trim() || ""}</div><div class="class-stat-lbl">V</div></div>
        <div class="class-stat"><div class="class-stat-val">${p[4]?.trim() || ""}</div><div class="class-stat-lbl">N</div></div>
        <div class="class-stat"><div class="class-stat-val">${p[5]?.trim() || ""}</div><div class="class-stat-lbl">D</div></div>
        <div class="class-stat pts"><div class="class-stat-val">${pts}</div><div class="class-stat-lbl">Pts</div></div>
        <div class="class-form">${formeDots}</div>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

// ── LIVE EVENTS ──
function renderLiveEvents() {
  const raw = document.getElementById("f-slive-events")?.value || "";
  const container = document.getElementById("slive-events");
  if (!container) return;
  const lines = raw.split("\n").filter((l) => l.trim());
  container.innerHTML = lines
    .map((line) => {
      const p = line.split(/·|\t/);
      return `<div class="live-event-row">
      <div class="live-event-min">${p[0]?.trim() || ""}</div>
      <div class="live-event-ico">${p[1]?.trim() || "⚽"}</div>
      <div class="live-event-txt">${p[2]?.trim() || ""}</div>
      <div class="live-event-team">${p[3]?.trim() || ""}</div>
    </div>`;
    })
    .join("");
}

// ── RÉSUMÉ EVENTS ──
function renderResEvents() {
  const raw = document.getElementById("f-res-events")?.value || "";
  const container = document.getElementById("res-events-list");
  if (!container) return;
  const lines = raw.split("\n").filter((l) => l.trim());
  container.innerHTML = lines
    .map((line) => {
      const p = line.split(/·|\t/);
      return `<div class="res-event">
      <div class="res-ev-min">${p[0]?.trim() || ""}</div>
      <div class="res-ev-ico">${p[1]?.trim() || "⚽"}</div>
      <div class="res-ev-txt">${p[2]?.trim() || ""}</div>
      <div class="res-ev-team">${p[3]?.trim() || ""}</div>
    </div>`;
    })
    .join("");
}

// ── CARTON ──
function updateCarton() {
  const type = document.getElementById("f-carton-type")?.value || "";
  const name = document.getElementById("f-carton-name")?.value || "";
  const num = document.getElementById("f-carton-num")?.value || "";
  const isRouge = type.includes("Rouge");
  const vis = document.getElementById("carton-visual");
  const lbl = document.getElementById("carton-label");
  const sub = document.getElementById("carton-sublabel");
  const gr = document.getElementById("carton-glow-red");
  const gy = document.getElementById("carton-glow-yellow");
  if (vis) {
    vis.className = "carton-card-visual " + (isRouge ? "rouge" : "jaune");
    vis.textContent = isRouge ? "🟥" : "🟨";
  }
  if (lbl) lbl.textContent = isRouge ? "CARTON ROUGE" : "CARTON JAUNE";
  if (sub) sub.textContent = isRouge ? "EXPULSION" : "AVERTISSEMENT";
  if (gr) gr.style.display = isRouge ? "block" : "none";
  if (gy) gy.style.display = isRouge ? "none" : "block";
  setT("carton-pname", name);
  setT("carton-pnum", "№ " + num);
  save("f-carton-name", name);
  save("f-carton-num", num);
}

window.updateCartonLayout = function () {
  const vPos = document.getElementById("f-carton-vpos")?.value || "center";
  const hPos = document.getElementById("f-carton-hpos")?.value || "center";
  const op = document.getElementById("f-carton-op")?.value || 0;

  const main = document.querySelector("#tpl-carton .carton-main");
  if (main) {
    main.style.justifyContent = vPos;
    main.style.alignItems = hPos;
    main.style.flex = "1";
    main.style.width = "100%";
    if (hPos === "flex-start") {
      main.style.textAlign = "left";
      const info = document.querySelector("#tpl-carton .carton-player-info");
      if (info) info.style.alignItems = "flex-start";
    } else if (hPos === "flex-end") {
      main.style.textAlign = "right";
      const info = document.querySelector("#tpl-carton .carton-player-info");
      if (info) info.style.alignItems = "flex-end";
    } else {
      main.style.textAlign = "center";
      const info = document.querySelector("#tpl-carton .carton-player-info");
      if (info) info.style.alignItems = "center";
    }
  }

  const overlay = document.getElementById("carton-overlay");
  if (overlay) {
    overlay.style.background = `rgba(0,0,0,${op / 100})`;
  }

  save("f-carton-vpos", vPos);
  save("f-carton-hpos", hPos);
  save("f-carton-op", op);
};

window.removeImg = function (imgId, iconId, thumbId, zoneId, extraContainerId) {
  const img = document.getElementById(imgId);
  const icon = document.getElementById(iconId);
  const thumb = document.getElementById(thumbId);
  const zone = document.getElementById(zoneId);
  const extra = document.getElementById(extraContainerId);

  if (img) {
    img.src = "";
    img.style.display = "none";
  }
  if (icon) icon.style.display = "block";
  if (thumb) {
    thumb.src = "";
    thumb.classList.remove("visible");
    thumb.style.display = "none";
  }
  if (zone) {
    const iconEl = zone.querySelector(".img-upload-icon");
    const textEl = zone.querySelector(".img-upload-text");
    if (iconEl) iconEl.style.display = "block";
    if (textEl) textEl.style.display = "block";
  }
  if (extra) extra.style.display = "none";

  localStorage.removeItem("rmf247_img_" + imgId);
};

window.removeCartonImg = function () {
  window.removeImg(
    "carton-player-img",
    null,
    "carton-upload-thumb",
    "carton-upload-zone",
    "carton-photo-zone",
  );
};

// ── H2H MATCHES ──
function renderH2HMatches() {
  const raw = document.getElementById("f-h2h-matches")?.value || "";
  const container = document.getElementById("h2h-matches-list");
  if (!container) return;
  const lines = raw.split("\n").filter((l) => l.trim());
  container.innerHTML = lines
    .map((line) => {
      const p = line.split(/·|\t/);
      return `<div class="h2h-match-row">
      <div class="h2h-match-date">${p[0]?.trim() || ""}</div>
      <div class="h2h-match-score">${p[1]?.trim() || ""}</div>
      <div class="h2h-match-comp">${p[2]?.trim() || ""}</div>
    </div>`;
    })
    .join("");
}

// ── ABSENTS ──
function renderAbsents() {
  const raw = document.getElementById("f-abs-list")?.value || "";
  const container = document.getElementById("absents-list");
  if (!container) return;
  const lines = raw.split("\n").filter((l) => l.trim());
  container.innerHTML = lines
    .map((line) => {
      const p = line.split(/·|\t/);
      const raison = p[2]?.trim() || "";
      const isSusp = raison.toLowerCase().includes("suspension");
      return `<div class="absent-row">
      <div class="absent-num">${p[0]?.trim() || ""}</div>
      <div class="absent-name">${p[1]?.trim() || ""}</div>
      <div class="absent-reason${isSusp ? " suspension" : ""}">${raison}</div>
    </div>`;
    })
    .join("");
}

// ── SONDAGE ──
function renderSondage() {
  const raw = document.getElementById("f-sond-options")?.value || "";
  const container = document.getElementById("sond-options");
  if (!container) return;
  const letters = ["A", "B", "C", "D", "E"];
  const lines = raw.split("\n").filter((l) => l.trim());
  container.innerHTML = lines
    .map((line, i) => {
      const p = line.split("·");
      const txt = p[0]?.trim() || "";
      const pct = p[1]?.trim() || "0%";
      const pctNum = parseInt(pct) || 0;
      return `<div class="sondage-option">
      <div class="sondage-option-fill" style="width:${pctNum}%"></div>
      <div class="sondage-option-letter">${letters[i] || ""}</div>
      <div class="sondage-option-txt">${txt}</div>
      <div class="sondage-option-pct">${pct}</div>
    </div>`;
    })
    .join("");
}

// ── INIT NEW TEMPLATES ──
function initNewTemplates() {
  // Stats
  setT("stats-pname", restoreField("f-stats-name", "BENZEMA"));
  setT("stats-prole", restoreField("f-stats-prole", "Attaquant • Real Madrid"));
  setT("stats-rating", restoreField("f-stats-rating", "91"));
  setT("stats-buts", restoreField("f-stats-buts", "18"));
  setT("stats-passes", restoreField("f-stats-passes", "9"));
  setT("stats-matchs", restoreField("f-stats-matchs", "24"));
  setT("stats-tirs", restoreField("f-stats-tirs", "68"));
  setT("stats-comp", restoreField("f-stats-comp", "Real Madrid • Liga"));
  ["vitesse", "dribble", "tir", "passe", "physique"].forEach((n) => {
    const v = restoreField("f-stats-v-" + n, "0");
    updateBar(n, v);
  });

  // Classement — restore textarea THEN render
  restoreField(
    "f-class-data",
    document.getElementById("f-class-data")?.defaultValue || "",
  );
  setT("class-comp", restoreField("f-class-comp", "CLASSEMENT • LIGA"));
  renderClassement();

  // Score Live — restore textarea THEN render
  restoreField(
    "f-slive-events",
    "23'·⚽·Benzema·Éq.1\n45'·🟨·Ramos·Éq.2\n67'·⚽·Mbappé·Éq.1",
  );
  renderLiveEvents();
  setT("slive-t1", restoreField("f-slive-t1", "ÉQUIPE 1"));
  setT("slive-t2", restoreField("f-slive-t2", "ÉQUIPE 2"));
  setT("slive-s1", restoreField("f-slive-s1", "1"));
  setT("slive-s2", restoreField("f-slive-s2", "0"));
  setT("slive-min", "⏱ " + restoreField("f-slive-min", "67'"));
  setT("slive-comp", restoreField("f-slive-comp", "UEFA Champions League"));

  // Résumé — restore textarea THEN render
  restoreField(
    "f-res-events",
    "12'·⚽·Benzema·Éq.1\n34'·🟨·Ramos·Éq.2\n67'·⚽·Mbappé·Éq.1\n78'·⚽·Benzema·Éq.1\n89'·🟥·Silva·Éq.2",
  );
  renderResEvents();
  setT("res-t1", restoreField("f-res-t1", "ÉQUIPE 1"));
  setT("res-t2", restoreField("f-res-t2", "ÉQUIPE 2"));
  setT("res-s1", restoreField("f-res-s1", "2"));
  setT("res-s2", restoreField("f-res-s2", "1"));

  // Carton — restore ALL fields THEN update
  restoreField("f-carton-type", "🟨 Carton Jaune");
  restoreField("f-carton-name", "RAMOS");
  restoreField("f-carton-num", "4");
  restoreField("f-carton-min", "45'");
  restoreField("f-carton-team", "REAL MADRID");
  restoreField("f-carton-match", "EQ1 1-0 EQ2");
  restoreField("f-carton-comp", "UEFA Champions League");
  restoreField("f-carton-vpos", "center");
  restoreField("f-carton-hpos", "center");
  restoreField("f-carton-op", "0");
  updateCarton();
  if (window.updateCartonLayout) window.updateCartonLayout();
  setT(
    "carton-min",
    "⏱ " + (document.getElementById("f-carton-min")?.value || "45'"),
  );
  setT(
    "carton-team",
    document.getElementById("f-carton-team")?.value || "REAL MADRID",
  );
  setT(
    "carton-match",
    document.getElementById("f-carton-match")?.value || "EQ1 1-0 EQ2",
  );
  setT(
    "carton-comp",
    document.getElementById("f-carton-comp")?.value || "UEFA Champions League",
  );

  // H2H — restore textarea THEN render
  restoreField(
    "f-h2h-matches",
    "15/01/25·2-1·Ligue 1\n28/09/24·1-1·Ligue 1\n12/05/24·3-0·Coupe\n10/02/24·0-1·Ligue 1",
  );
  renderH2HMatches();
  setT("h2h-t1", restoreField("f-h2h-t1", "REAL MADRID"));
  setT("h2h-t2", restoreField("f-h2h-t2", "BARCELONA"));
  setT("h2h-v1", restoreField("f-h2h-v1", "8"));
  setT("h2h-v2", restoreField("f-h2h-v2", "4"));
  setT("h2h-nuls", restoreField("f-h2h-nuls", "5"));

  // Absents — restore textarea THEN render
  restoreField(
    "f-abs-list",
    "1·Courtois·Blessure\n4·Alaba·Blessure\n22·Rudiger·Suspension\n14·Valverde·Sélection",
  );
  renderAbsents();
  setT("abs-team", restoreField("f-abs-team", "ÉQUIPE 1"));

  // MOTM — restore ALL fields
  setT("motm-pname", restoreField("f-motm-name", "BENZEMA"));
  setT("motm-prole", restoreField("f-motm-prole", "Attaquant • #9"));
  setT("motm-match", restoreField("f-motm-match", "EQ1 3-0 EQ2"));
  setT("motm-note", restoreField("f-motm-note", "9.2"));
  setT("motm-comp", restoreField("f-motm-comp", "UEFA Champions League"));
  setT("motm-buts", restoreField("f-motm-buts", "2"));
  setT("motm-pd", restoreField("f-motm-pd", "1"));
  setT("motm-duels", restoreField("f-motm-duels", "8/12"));
  setT("motm-tirs", restoreField("f-motm-tirs", "5"));

  // Hat-trick
  setT("hat-pname", restoreField("f-hat-name", "BENZEMA"));
  setT("hat-prole", restoreField("f-hat-prole", "Attaquant • #9"));
  setT("hat-min1", "⏱ " + restoreField("f-hat-min1", "23'"));
  setT("hat-min2", "⏱ " + restoreField("f-hat-min2", "56'"));
  setT("hat-min3", "⏱ " + restoreField("f-hat-min3", "78'"));
  setT("hat-match", restoreField("f-hat-match", "EQ1 3-0 EQ2"));
  setT("hat-date", restoreField("f-hat-date", "15 Mars 2025"));

  // Record
  setT("rec-title", restoreField("f-rec-title", "MEILLEUR BUTEUR"));
  setT("rec-medal", restoreField("f-rec-medal", "🏅"));
  setT("rec-value", restoreField("f-rec-value", "38"));
  setT("rec-unit", restoreField("f-rec-unit", "BUTS EN UNE SAISON"));
  setT("rec-pname", restoreField("f-rec-pname", "CRISTIANO RONALDO"));
  setT("rec-pnum", "# " + restoreField("f-rec-pnum", "7"));
  setT(
    "rec-context",
    restoreField(
      "f-rec-context",
      "Record établi le 15 mars 2025 lors de EQ1 vs EQ2",
    ),
  );

  // Transfer — restore ALL fields
  setT("tr-pname", restoreField("f-tr-pname", "MBAPPÉ"));
  setT("tr-prole", restoreField("f-tr-prole", "Attaquant • #7"));
  setT("tr-club1", restoreField("f-tr-club1", "PSG"));
  setT("tr-club2", restoreField("f-tr-club2", "REAL MADRID"));
  setT("tr-type", restoreField("f-tr-type", "TRANSFERT DÉFINITIF"));
  setT("tr-montant", restoreField("f-tr-montant", "180 M€"));
  setT("tr-contrat", restoreField("f-tr-contrat", "5 ANS"));
  setT("tr-num", restoreField("f-tr-num", "7"));
  setT("tr-comp", restoreField("f-tr-comp", "OFFICIAL MERCATO ESTIVAL"));

  // Sondage — restore textarea THEN render
  restoreField(
    "f-sond-options",
    "Benzema·42%\nMbappé·31%\nNeymar·18%\nHaaland·9%",
  );
  renderSondage();
  setT(
    "sond-question",
    restoreField(
      "f-sond-question",
      "Qui sera le meilleur joueur de la saison ?",
    ),
  );

  // Pronostic
  setT("prono-t1", restoreField("f-prono-t1", "ÉQUIPE 1"));
  setT("prono-t2", restoreField("f-prono-t2", "ÉQUIPE 2"));
  setT("prono-date", restoreField("f-prono-date", "SAM. 15 MARS • 20H45"));
  setT("prono-s1", restoreField("f-prono-s1", "?"));
  setT("prono-s2", restoreField("f-prono-s2", "?"));
  setT("prono-opt1-pct", restoreField("f-prono-p1", "52%"));
  setT("prono-opt2-pct", restoreField("f-prono-p2", "24%"));
  setT("prono-opt3-pct", restoreField("f-prono-p3", "24%"));

  // Next Match
  const nmSub = restoreField("f-nm-sub", "PRÓXIMO PARTIDO");
  setT("nm-sub-val", nmSub);
  const nmStadium = restoreField("f-nm-stadium", "ESTADIO SANTIAGO BERNABÉU");
  setT("nm-stadium-val", nmStadium);
  const nmDate = restoreField("f-nm-date", "06/03 — 21:00 CET");
  setT("nm-datetime-val", nmDate);

  // Restore team logos for all new templates
  const logoMaps = [
    ["slive-logo1-img", "slive-em1", "slive-th1"],
    ["slive-logo2-img", "slive-em2", "slive-th2"],
    ["res-logo1-img", "res-em1", "res-th1"],
    ["res-logo2-img", "res-em2", "res-th2"],
    ["h2h-logo1-img", "h2h-em1", "h2h-th1"],
    ["h2h-logo2-img", "h2h-em2", "h2h-th2"],
    ["tr-logo1-img", "tr-em1", "tr-th1"],
    ["tr-logo2-img", "tr-em2", "tr-th2"],
    ["prono-logo1-img", "prono-em1", "prono-th1"],
    ["prono-logo2-img", "prono-em2", "prono-th2"],
    ["nm-logo1-img", "nm-em1-emoji", "nm-lt1"],
    ["nm-logo2-img", "nm-em2-emoji", "nm-lt2"],
  ];
  logoMaps.forEach(([imgId, emojiId, thumbId]) => {
    const d = loadImg(imgId);
    if (d) {
      const img = document.getElementById(imgId);
      if (img) {
        img.src = d;
        img.classList.add("visible");
        img.style.display = "block";
      }
      const em = document.getElementById(emojiId);
      if (em) em.style.display = "none";
      if (thumbId) {
        const th = document.getElementById(thumbId);
        if (th) {
          th.src = d;
          th.classList.add("visible");
          th.style.display = "block";
        }
      }
    }
  });

  // Player images
  [
    "stats-player-img",
    "motm-img",
    "carton-player-img",
    "hat-img",
    "rec-player-img",
    "tr-player-img",
    "nm-player-img",
    "gen-icon-img",
  ].forEach((imgId) => {
    const iconMap = {
      "stats-player-img": "stats-icon",
      "motm-img": "motm-icon",
      "carton-player-img": "missing",
      "hat-img": "hat-icon",
      "rec-player-img": "rec-icon",
      "tr-player-img": "tr-icon",
      "nm-player-img": "nm-default-icon",
      "gen-icon-img": "gen-emoji-icon",
    };
    const thumbMap = {
      "stats-player-img": "stats-thumb",
      "motm-img": "motm-thumb",
      "carton-player-img": "carton-upload-thumb",
      "hat-img": "hat-thumb",
      "rec-player-img": "rec-upload-thumb",
      "tr-player-img": "tr-player-th",
      "nm-player-img": "nm-up-thumb",
      "gen-icon-img": "gen-icon-th",
    };
    const d = loadImg(imgId);
    if (d) {
      const img = document.getElementById(imgId);
      if (img) {
        img.src = d;
        img.classList.add("visible");
        img.style.display = "block";
        if (imgId === "carton-player-img") {
          const zone = document.getElementById("carton-photo-zone");
          if (zone) zone.style.display = "block";
        }
      }
      const ic = document.getElementById(iconMap[imgId]);
      if (ic) ic.style.display = "none";
      const th = document.getElementById(thumbMap[imgId]);
      if (th) {
        th.src = d;
        th.classList.add("visible");
        th.style.display = "block";
      }
    }
  });

  // Apply logos to new templates
  [
    "stats-logo",
    "motm-logo",
    "class-logo",
    "slive-logo",
    "res-logo",
    "carton-logo",
    "h2h-logo",
    "abs-logo",
    "hat-logo",
    "rec-logo",
    "tr-logo",
    "sond-logo",
    "prono-logo",
    "nm-logo",
    "gen-logo",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.src = LOGO;
  });

  // Generic Background
  const genBgData = loadImg("gen-bg-img");
  if (genBgData) {
    const bgEl = document.getElementById("gen-bg-img");
    if (bgEl) bgEl.style.backgroundImage = `url(${genBgData})`;
    const th = document.getElementById("gen-bg-th");
    if (th) {
      th.src = genBgData;
      th.classList.add("visible");
    }
  }

  // Generic Fields
  setT("gen-title-val", restoreField("f-gen-title", "VOTRE TITRE ICI"));
  const genDesc = restoreField(
    "f-gen-desc",
    "Une description optionnelle pour ajouter du contexte à votre visuel. Vous pouvez tout personnaliser.",
  );
  const genDescVal = document.getElementById("gen-desc-val");
  if (genDescVal) genDescVal.textContent = genDesc;

  restoreField("f-gen-pos-v", "pc-center");
  restoreField("f-gen-align", "al-center");
  restoreField("f-gen-txt-align", "center");
  restoreField("f-gen-tint-op", "40");
  restoreField("f-gen-tsize", "52");
  restoreField("f-gen-dsize", "18");
  restoreField("f-gen-isize", "60");
  restoreField("f-gen-lsize", "32");

  // Generic Layout
  updateGenLayout();
}

// ══════════════════════════════════════
// FIXTURES
// ══════════════════════════════════════
window.renderFixtures = function () {
  const v = document.getElementById("f-fix-list").value.split("\n");
  const c = document.getElementById("fix-container");
  if (!c) return;
  c.innerHTML = "";
  v.forEach((line) => {
    if (!line.trim()) return;
    const parts = line.split(/·|\t/);
    if (parts.length < 5) return;

    // Lieu·Adversaire·Date·Heure·Compétition
    const lieu = parts[0].trim();
    const adv = parts[1].trim();
    const date = parts[2].trim();
    const time = parts[3].trim();
    const comp = parts[4].trim();

    c.innerHTML += `
      <div class="fix-item">
        <div class="fix-date-box">
          <div class="fix-date">${date.split(" ")[0]}</div>
          <div class="fix-time">${date.split(" ")[1] || ""}<br>${time}</div>
        </div>
        <div class="fix-info">
          <div class="fix-meta">${lieu} · ${comp}</div>
          <div class="fix-adv">${adv}</div>
        </div>
      </div>
    `;
  });
};

// ══════════════════════════════════════
// RATINGS
// ══════════════════════════════════════
window.renderRatings = function () {
  const v = document.getElementById("f-rat-list").value.split("\n");
  const c = document.getElementById("rat-container");
  if (!c) return;
  c.innerHTML = "";
  v.forEach((line) => {
    if (!line.trim()) return;
    const parts = line.split("·");
    if (parts.length < 3) return;

    const note = parts[0].trim();
    const name = parts[1].trim();
    const desc = parts[2].trim();

    c.innerHTML += `
      <div class="rat-item">
        <div class="rat-num">${note}</div>
        <div class="rat-details">
          <div class="rat-name">${name}</div>
          <div class="rat-desc">${desc}</div>
        </div>
      </div>
    `;
  });
};

function init() {
  applyLogos();

  // Quote
  setT("quote-comp", restoreField("f-quote-comp", "CONFÉRENCE DE PRESSE"));
  setT(
    "quote-text",
    restoreField(
      "f-quote-text",
      "Gagner est la seule option quand vous portez ce maillot.",
    ),
  );
  setT("quote-author", restoreField("f-quote-author", "CARLO ANCELOTTI"));
  setT("quote-role", restoreField("f-quote-role", "ENTRAÎNEUR"));

  // Comunicado — restore textarea + form field
  const comText = restoreField(
    "f-com-text",
    "À la suite des examens effectués aujourd'hui sur notre joueur par les Services Médicaux du Real Madrid, il a été diagnostiqué une entorse du ligament latéral externe du genou droit.\n\nEn attente d'évolution.",
  );
  const elCom = document.getElementById("com-text");
  if (elCom) elCom.innerHTML = comText.replace(/\n/g, "<br>");
  setT("com-date", restoreField("f-com-date", "15 MARS 2025"));

  // Fixtures — restore textarea THEN render
  restoreField(
    "f-fix-list",
    document.getElementById("f-fix-list")?.defaultValue || "",
  );
  renderFixtures();
  setT("fix-title", restoreField("f-fix-title", "CALENDRIER DU MOIS"));

  // Ratings — restore textarea THEN render
  restoreField(
    "f-rat-list",
    document.getElementById("f-rat-list")?.defaultValue || "",
  );
  renderRatings();
  setT("rat-title", restoreField("f-rat-title", "NOTES DU MATCH"));

  // BUT
  const butName = restoreField("f-but-name", "CRISTIANO RONALDO");
  setText("but-pname", butName);
  const butNum = restoreField("f-but-num", "7");
  setText("but-pnum", "№ " + butNum);
  const butMin = restoreField("f-but-min", "47'");
  setText("but-min", "⏱ " + butMin);
  setText("but-t1", restoreField("f-but-t1", "ÉQUIPE 1"));
  setText("but-s1", restoreField("f-but-s1", "2"));
  setText("but-t2", restoreField("f-but-t2", "ÉQUIPE 2"));
  setText("but-s2", restoreField("f-but-s2", "1"));
  setText("but-comp", restoreField("f-but-comp", "UEFA Champions League"));
  // Restore player image
  const butImgData = loadImg("but-player-img");
  if (butImgData) {
    const img = document.getElementById("but-player-img");
    const icon = document.getElementById("but-default-icon");
    const thumb = document.getElementById("but-upload-thumb");
    if (img) {
      img.src = butImgData;
      img.style.display = "block";
    }
    if (icon) icon.style.display = "none";
    if (thumb) {
      thumb.src = butImgData;
      thumb.classList.add("visible");
    }
    const zone = document.getElementById("but-upload-zone");
    if (zone) {
      const ic = zone.querySelector(".img-upload-icon");
      const tx = zone.querySelector(".img-upload-text");
      if (ic) ic.style.display = "none";
      if (tx) tx.style.display = "none";
    }
  }

  // COMPO
  setText("compo-match", restoreField("f-compo-match", "EQ1 vs EQ2"));
  setText("compo-date", restoreField("f-compo-date", "JOURNÉE 22 • LIGA"));
  const fVal = restoreField("f-compo-form", "4-3-3");
  document.getElementById("f-compo-form").value = fVal;
  setText("compo-coach", restoreField("f-compo-coach", "Carlo Ancelotti"));
  restoreField("f-compo-gk", "1·Courtois");
  restoreField("f-compo-def", "2·Carvajal, 4·Alaba, 5·Militão, 6·Mendy");
  restoreField("f-compo-mid", "8·Kroos, 10·Modrić, 14·Valverde");
  restoreField("f-compo-att", "11·Rodrygo, 9·Benzema, 20·Asensio");
  restoreField(
    "f-compo-subs",
    "13·Lunin, 3·Camavinga, 7·Hazard, 22·Isco, 16·Rüdiger, 18·Tchouaméni",
  );
  renderFormation();

  // CONVO
  setText(
    "convo-match",
    restoreField("f-convo-match", "Real Madrid vs Barcelona • J22"),
  );
  restoreField("f-convo-gk", "1·Courtois, 13·Lunin, 25·González");
  restoreField(
    "f-convo-def",
    "2·Carvajal, 3·Camavinga, 4·Alaba, 5·Militão, 6·Mendy, 23·Rüdiger",
  );
  restoreField(
    "f-convo-mid",
    "8·Kroos, 10·Modrić, 14·Valverde, 15·Ceballos, 16·Tchouaméni, 18·Isco",
  );
  restoreField(
    "f-convo-att",
    "7·Hazard, 9·Benzema, 11·Rodrygo, 20·Asensio, 22·Diaz",
  );
  restoreField("f-convo-subs", "30·Navas, 17·Lucas, 21·Diaz");
  renderConvo();

  // PREVIEW
  // Restore team logos
  const logo1Data = loadImg("prev-logo1-img");
  if (logo1Data) {
    const img = document.getElementById("prev-logo1-img");
    const emoji = document.getElementById("prev-em1-emoji");
    const thumb = document.getElementById("prev-logo1-thumb");
    if (img) {
      img.src = logo1Data;
      img.classList.add("visible");
    }
    if (emoji) emoji.style.display = "none";
    if (thumb) {
      thumb.src = logo1Data;
      thumb.classList.add("visible");
    }
  }
  const logo2Data = loadImg("prev-logo2-img");
  if (logo2Data) {
    const img = document.getElementById("prev-logo2-img");
    const emoji = document.getElementById("prev-em2-emoji");
    const thumb = document.getElementById("prev-logo2-thumb");
    if (img) {
      img.src = logo2Data;
      img.classList.add("visible");
    }
    if (emoji) emoji.style.display = "none";
    if (thumb) {
      thumb.src = logo2Data;
      thumb.classList.add("visible");
    }
  }
  setText("prev-comp", restoreField("f-prev-comp", "UEFA Champions League"));
  setText("prev-t1", restoreField("f-prev-t1", "ÉQUIPE 1"));
  setText("prev-em1", restoreField("f-prev-em1", "🏟️"));
  setText("prev-t2", restoreField("f-prev-t2", "ÉQUIPE 2"));
  setText("prev-em2", restoreField("f-prev-em2", "🏟️"));
  setText("prev-date", restoreField("f-prev-date", "SAM. 08 MARS • 20H45"));
  setText("prev-stade", restoreField("f-prev-stade", "Stade de France"));
  setText("prev-lieu", restoreField("f-prev-lieu", "Vigo, Espagne 🇪🇸"));
  setText("prev-arb", restoreField("f-prev-arb", "M. Dupont"));
  setText("prev-tv", restoreField("f-prev-tv", "Canal+"));
  restoreField("f-prev-p1", "9·Benzema·Attaquant·Équipe 1");
  restoreField("f-prev-p2", "7·Mbappé·Attaquant·Équipe 2");
  restoreField("f-prev-p3", "5·Marquinhos·Défenseur·Équipe 2");
  renderPrevPlayers();
  initNewTemplates();

  // Restore active tab
  const savedTab = localStorage.getItem("rmf_active_tab");
  if (savedTab) {
    switchTab(savedTab, null);
  } else {
    switchTab("home", null);
  }

  // Restore Settings
  const st = load("f-story-mode", false);
  if (st === "true" || st === true) {
    document.body.classList.add("story-mode");
    const chk = document.getElementById("check-story");
    if (chk) chk.checked = true;
  }
  const aw = load("f-theme-away", false);
  if (aw === "true" || aw === true) {
    document.body.classList.add("theme-away");
    const chk = document.getElementById("check-away");
    if (chk) chk.checked = true;
  }

  // WATERMARK RESTORE
  const wmImg = loadImg("watermark-bg");
  if (wmImg) {
    const bgImg = document.getElementById("watermark-bg");
    const bgCanvas = document.getElementById("watermark-bg-canvas");
    const th = document.getElementById("watermark-th");
    const up = document.getElementById("watermark-up");
    if (bgImg) bgImg.src = wmImg;
    if (bgCanvas) bgCanvas.style.backgroundImage = `url(${wmImg})`;
    if (th) {
      th.src = wmImg;
      th.style.display = "block";
    }
    if (up) up.classList.add("has-image");

    // Restore fields
    restoreField("watermark-format", "original");
    restoreField("watermark-pos", "bottom-left");
    restoreField("watermark-size", "15");
    restoreField("watermark-opacity", "80");

    document.getElementById("watermark-logo").style.display = "block";

    // Ensure the image belongs to the DOM before updating
    if (bgImg.complete) {
      window.updateWatermark();
    } else {
      bgImg.onload = window.updateWatermark;
    }
  }
  // BIRTHDAY RESTORE
  const birthImg = loadImg("birth-player-img");
  if (birthImg) {
    const img = document.getElementById("birth-player-img");
    const thumb = document.getElementById("birth-thumb");
    const ico = document.getElementById("birth-default-icon");
    if (img) img.src = birthImg;
    if (thumb) thumb.src = birthImg;
    if (ico) ico.style.display = "none";
  }
  restoreField("f-birth-name", "VINICIUS JR");
  restoreField("f-birth-val", "24");
  restoreField("f-birth-msg", "¡FELIZ CUMPLEAÑOS!");
  restoreField("f-birth-mode", "age");
  renderBirthday();
}

window.renderBirthday = function () {
  const mode = document.getElementById("f-birth-mode").value;
  const lblVal = document.getElementById("lbl-birth-val");
  const birthVal = document.getElementById("f-birth-val").value;
  const pName = document.getElementById("f-birth-name").value;
  const w1 = document.getElementById("birth-title-w1");
  const w2 = document.getElementById("birth-title-w2");
  const metaLabel = document.getElementById("birth-meta-label");

  if (mode === "age") {
    lblVal.textContent = "Âge (ex: 24)";
    if (w1) w1.textContent = "HAPPY";
    if (w2) w2.textContent = "BIRTHDAY";
    if (metaLabel) metaLabel.textContent = "ans";
    document.getElementById("cap-birth").value =
      `🎂 ¡FELIZ CUMPLEAÑOS! Aujourd'hui nous célébrons l'anniversaire de notre star ${pName}. Laisse un message en commentaire ! 🤍👑 #HalaMadrid #RMCFLIVE`;
  } else {
    lblVal.textContent = "Dates / Années (ex: 1994 - 2010)";
    if (w1) w1.textContent = "HÉRITAGE";
    if (w2) w2.textContent = "LEGACY";
    if (metaLabel) metaLabel.textContent = "années";
    document.getElementById("cap-birth").value =
      `👑 LÉGENDE ÉTERNELLE. Merci pour tout ${pName}. Un Madridista ne t'oubliera jamais. 🤍🛡️ #HalaMadrid #RMCFLIVE #Leyenda`;
  }

  setT("birth-val-bg", birthVal);
  setT("birth-pname", pName);
  setT("birth-msg", document.getElementById("f-birth-msg").value);
};

window.toggleSettings = function () {
  const p = document.getElementById("settings-panel");
  if (!p) return;
  p.style.display =
    p.style.display === "none" || p.style.display === "" ? "block" : "none";
};

// init() remains at the end of the file after all functions are defined.

// ══════════════════════════════════════
// WATERMARK TOOL
// ══════════════════════════════════════
window.loadWatermarkBg = function (inputOrEvent) {
  const file = inputOrEvent.target
    ? inputOrEvent.target.files[0]
    : inputOrEvent.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const bgImg = document.getElementById("watermark-bg");
    const bgCanvas = document.getElementById("watermark-bg-canvas");
    const th = document.getElementById("watermark-th");
    const up = document.getElementById("watermark-up");

    if (bgImg) {
      bgImg.onload = () => {
        saveImg("watermark-bg", dataUrl);
        window.updateWatermark();
      };
      bgImg.src = dataUrl;
    }

    if (bgCanvas) bgCanvas.style.backgroundImage = "url(" + dataUrl + ")";
    document.getElementById("watermark-logo").style.display = "block";

    if (th) {
      th.src = dataUrl;
      th.style.display = "block";
    }
    if (up) up.classList.add("has-image");
  };
  reader.readAsDataURL(file);
};

window.updateWatermark = function () {
  const bgImg = document.getElementById("watermark-bg");
  const bgCanvas = document.getElementById("watermark-bg-canvas");
  const tpl = document.getElementById("tpl-watermark");
  const logoImg = document.getElementById("watermark-logo");

  if (!bgImg || !bgImg.src || bgImg.src === "" || bgImg.src.length < 50) return;

  const format = document.getElementById("watermark-format").value;
  save("watermark-format", format);

  if (format === "original") {
    tpl.style.display = "block";
    tpl.style.aspectRatio = "auto";
    tpl.style.width = "100%";
    tpl.style.height = "auto";
    bgImg.style.display = "block";
    bgCanvas.style.display = "none";
  } else if (format === "square") {
    tpl.style.display = "block";
    tpl.style.aspectRatio = "1 / 1";
    tpl.style.width = "100%";
    tpl.style.maxWidth = "480px";
    bgImg.style.display = "none";
    bgCanvas.style.display = "block";
  } else if (format === "story") {
    tpl.style.display = "block";
    tpl.style.aspectRatio = "9 / 16";
    tpl.style.width = "400px";
    tpl.style.maxWidth = "100%";
    bgImg.style.display = "none";
    bgCanvas.style.display = "block";
  }

  const pos = document.getElementById("watermark-pos").value;
  const sizePct = document.getElementById("watermark-size").value;
  const opacity = document.getElementById("watermark-opacity").value;

  save("watermark-pos", pos);
  save("watermark-size", sizePct);
  save("watermark-opacity", opacity);

  document.getElementById("watermark-size-val").textContent = `(${sizePct}%)`;
  document.getElementById("watermark-opacity-val").textContent =
    `(${opacity}%)`;

  logoImg.style.width = sizePct + "%";
  logoImg.style.height = "auto";
  logoImg.style.opacity = opacity / 100;
  logoImg.style.top = "auto";
  logoImg.style.bottom = "auto";
  logoImg.style.left = "auto";
  logoImg.style.right = "auto";
  logoImg.style.transform = "none";

  const margin = "5%";
  if (pos === "bottom-left") {
    logoImg.style.bottom = margin;
    logoImg.style.left = margin;
  } else if (pos === "bottom-right") {
    logoImg.style.bottom = margin;
    logoImg.style.right = margin;
  } else if (pos === "top-left") {
    logoImg.style.top = margin;
    logoImg.style.left = margin;
  } else if (pos === "top-right") {
    logoImg.style.top = margin;
    logoImg.style.right = margin;
  } else if (pos === "center") {
    logoImg.style.top = "50%";
    logoImg.style.left = "50%";
    logoImg.style.transform = "translate(-50%, -50%)";
  }

  // Shadow
  const shadow = document.getElementById("watermark-shadow")?.checked;
  logoImg.style.filter = shadow
    ? "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))"
    : "none";
};

// ══════════════════════════════════════
// GENERIC TEMPLATE
// ══════════════════════════════════════
window.loadGenBg = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    document.getElementById("gen-bg-img").style.backgroundImage =
      `url(${dataUrl})`;
    saveImg("gen-bg-img", dataUrl);
    const th = document.getElementById("gen-bg-th");
    if (th) {
      th.src = dataUrl;
      th.classList.add("visible");
    }
  };
  reader.readAsDataURL(file);
};

window.loadGenIcon = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = document.getElementById("gen-icon-img");
    const emoji = document.getElementById("gen-emoji-icon");
    if (img) {
      img.src = dataUrl;
      img.style.display = "block";
    }
    if (emoji) emoji.style.display = "none";

    saveImg("gen-icon-img", dataUrl);

    const th = document.getElementById("gen-icon-th");
    if (th) {
      th.src = dataUrl;
      th.classList.add("visible");
    }
  };
  reader.readAsDataURL(file);
};

window.updateGenLayout = function () {
  const vPos = document.getElementById("f-gen-pos-v").value;
  const hAlign = document.getElementById("f-gen-align").value;
  const tAlign = document.getElementById("f-gen-txt-align").value;
  const opacity = document.getElementById("f-gen-tint-op").value;
  const tSize = document.getElementById("f-gen-tsize").value;
  const dSize = document.getElementById("f-gen-dsize").value;
  const iSize = document.getElementById("f-gen-isize")?.value || 60;
  const lSize = document.getElementById("f-gen-lsize")?.value || 32;

  const container = document.getElementById("gen-align-container");
  if (container) {
    container.className = `gen-content-area ${vPos} ${hAlign}`;
  }

  const genBox = document.querySelector(".gen-box");
  if (genBox) genBox.style.textAlign = tAlign;

  const tint = document.getElementById("gen-tint");
  if (tint) tint.style.background = `rgba(0,0,0,${opacity / 100})`;

  const titleVal = document.getElementById("gen-title-val");
  if (titleVal) titleVal.style.fontSize = tSize + "px";

  const descVal = document.getElementById("gen-desc-val");
  if (descVal)
    descVal.textContent = document.getElementById("f-gen-desc").value;
  if (descVal) descVal.style.fontSize = dSize + "px";

  const iconBox = document.getElementById("gen-icon-zone");
  if (iconBox) {
    iconBox.style.width = iSize + "px";
    iconBox.style.height = iSize + "px";
  }

  const brandingLogo = document.getElementById("gen-logo");
  if (brandingLogo) {
    brandingLogo.style.width = lSize + "px";
  }
};

// Initialize after all functions are on window global
init();
