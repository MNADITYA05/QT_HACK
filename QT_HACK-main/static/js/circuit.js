// === Toom-Cook 8-qubit layout ===
// Index: 0=x₀, 1=x₁, 2=y₀, 3=y₁, 4=a₀, 5=a₁, 6=p₀, 7=p₁
const QUBITS     = ["x₀", "x₁", "y₀", "y₁", "a₀", "a₁", "p₀", "p₁"];
const QUBITS_ASCII = ["x0", "x1", "y0", "y1", "a0", "a1", "p0", "p1"];
const Q_COLORS   = ["#00e5ff", "#00e5ff", "#b388ff", "#b388ff", "#ffd740", "#ffd740", "#69f0ae", "#69f0ae"];
const NUM_QUBITS = 8;
const NUM_COLS   = 24;
const CELL_W     = 42;
const CELL_H     = 42;
const LABEL_W    = 65;
const HEADER_H   = 62;
const PHASE_LANE_H = 22;
const GATE_BOX   = 28;
const CTRL_R     = 6;
const TGT_R      = 11;
const SVG_NS     = "http://www.w3.org/2000/svg";

// Register groupings matching simulator.py
const QUBIT_REGISTER = ["X", "X", "Y", "Y", "A", "A", "P", "P"];
const REG_ROLE = {
  X: "first number (input)",
  Y: "second number (input)",
  A: "ancilla / scratchpad",
  P: "product (answer)",
};
const REG_COLOR = {
  X: "var(--cyan)",
  Y: "var(--purple)",
  A: "var(--yellow)",
  P: "var(--green)",
};

// Toom-Cook U → V → U† phase bands
const PHASE_BANDS = [
  { start: 0,  end: 1,  color: "#00e5ff", opacity: 0.18, getLabel: () => "LOAD INPUTS" },
  { start: 2,  end: 7,  color: "#ff2d6f", opacity: 0.14, getLabel: () => "PHASE U — Compute (CCX into Ancilla)" },
  { start: 8,  end: 13, color: "#b388ff", opacity: 0.14, getLabel: () => "PHASE V — Extract (CX into Product)" },
  { start: 14, end: 21, color: "#00e5ff", opacity: 0.14, getLabel: () => "PHASE U† — Uncompute (CCX reverse)" },
  { start: 22, end: 23, color: "#8b949e", opacity: 0.14, getLabel: () => "DONE" },
];

const colColors = [
  "#00e5ff","#b388ff","#69f0ae","#ff2d6f","#ffd740","#ffab40",
  "#00e5ff","#b388ff","#69f0ae","#ff2d6f","#ffd740","#ffab40",
  "#00e5ff","#b388ff","#69f0ae","#ff2d6f","#ffd740","#ffab40",
  "#00e5ff","#b388ff","#69f0ae","#ff2d6f","#ffd740","#ffab40",
];

const QUBIT_REGISTER_MAP = {
  0: "X", 1: "X", 2: "Y", 3: "Y", 4: "A", 5: "A", 6: "P", 7: "P"
};

const QUBIT_TOOLTIPS = [
  "x₀ — ones bit of Input X (worth 1)",
  "x₁ — twos bit of Input X (worth 2)",
  "y₀ — ones bit of Input Y (worth 1)",
  "y₁ — twos bit of Input Y (worth 2)",
  "a₀ — Ancilla bit 0 (temporary scratchpad for Compute / Uncompute)",
  "a₁ — Ancilla bit 1 (temporary scratchpad for Compute / Uncompute)",
  "p₀ — Product bit 0 (ones place of the final answer, worth 1)",
  "p₁ — Product bit 1 (twos place of the final answer, worth 2)",
];

function getPhaseLabel(d, idx) {
  const place = idx === 0 ? "ones place" : "twos place";
  if (d === -1) return `${place}: subtract A`;
  if (d === 1) return `${place}: add A`;
  return `${place}: skip`;
}

function computePhaseBands() {
  const b0 = inputB & 1;
  const b1 = (inputB >> 1) & 1;
  const d0 = 0 - b0;
  const d1 = b0 - b1;
  return { d0, d1 };
}

function renderPhaseLanes() {
  const digits = computePhaseBands();
  PHASE_BANDS.forEach((band) => {
    const x = LABEL_W + band.start * CELL_W;
    const width = (band.end - band.start + 1) * CELL_W;
    svg.appendChild(
      svgEl("rect", {
        x,
        y: 1,
        width,
        height: PHASE_LANE_H,
        fill: band.color,
        opacity: band.opacity,
        rx: 4,
      }),
    );
    const text = svgEl("text", {
      x: x + width / 2,
      y: PHASE_LANE_H / 2 + 1,
      class: "phase-label",
      fill: band.color,
    });
    text.textContent = band.getLabel(digits);
    svg.appendChild(text);
  });
}

function getPlainEnglishExplanation(gateType, target, controls) {
  const tReg = QUBIT_REGISTER_MAP[target];
  const cRegs = controls.map(c => QUBIT_REGISTER_MAP[c]);
  const tInX = tReg === "X";
  const tInY = tReg === "Y";
  const tInA = tReg === "A";
  const tInP = tReg === "P";
  const anyControlInX = cRegs.includes("X");
  const anyControlInY = cRegs.includes("Y");
  const anyControlInA = cRegs.includes("A");

  if (gateType === "X" && tInX) {
    return { title: "Initializing Input X", body: "This X (NOT) gate flips a qubit in the X register from |0⟩ to |1⟩, encoding the classical value of your first input number. x₀ = ones place (worth 1). x₁ = twos place (worth 2).", phase: "INIT" };
  }
  if (gateType === "X" && tInY) {
    return { title: "Initializing Input Y", body: "This X gate sets a bit in the Y register, encoding the classical value of your second input number. y₀ = ones place. y₁ = twos place.", phase: "INIT" };
  }

  if (gateType === "CCX") {
    if (tInA && anyControlInX && anyControlInY) {
      return { title: "Phase U — Compute partial product into Ancilla", body: "This Toffoli gate checks two input bits (one from X, one from Y). If both are 1, it XORs the result into the Ancilla register. This is the reversible AND check that computes a partial product A(xᵢ)·B(xᵢ) and stores it safely without destroying the inputs.", phase: "COMPUTE" };
    }
    if (tInA) {
      return { title: "Phase U† — Uncomputing the Ancilla", body: "This is the same Toffoli gate from Phase U, applied again in reverse order. In reversible computing, running the same gate twice returns the qubit to exactly |0⟩, cleaning the Ancilla scratchpad without losing any information.", phase: "UNCOMPUTE" };
    }
  }

  if (gateType === "CX") {
    if (anyControlInA && tInP) {
      return { title: "Phase V — Extracting result into Product", body: "This CNOT gate copies information from the now-populated Ancilla register into the Product register. This is the 'extraction' step — moving the computed partial product out of the scratchpad and into the final answer.", phase: "EXTRACT" };
    }
  }

  return { title: "Gate placed: " + gateType, body: "This gate is part of the Toom-Cook multiplication circuit.", phase: "PROCESSING" };
}

function updateGateInsightPanel(gateType, target, controls, placementFeedback = null) {
  const panel = document.getElementById("gate-info-panel");
  if (!panel) return;
  const info = getPlainEnglishExplanation(gateType, target, controls);
  const phaseColors = {
    "INIT":      "#00e5ff",
    "COMPUTE":   "#ff2d6f",
    "EXTRACT":   "#b388ff",
    "UNCOMPUTE": "#00e5ff",
    "PROCESSING": "#b388ff",
  };
  const color = phaseColors[info.phase] || "#b388ff";
  let html =
    `<div class="gate-insight-phase-badge" style="background:${color}20;color:${color};border:1px solid ${color}40">${info.phase}</div>` +
    `<div class="gate-insight-title">${escapeHtml(info.title)}</div>` +
    `<div class="gate-insight-body">${escapeHtml(info.body)}</div>`;

  if (placementFeedback) {
    const statusColors = {
      correct_next: "var(--green)",
      valid_later: "var(--yellow)",
      duplicate: "var(--orange)",
      not_in_reference: "var(--pink)",
    };
    const statusColor = statusColors[placementFeedback.status] || "var(--purple)";
    html +=
      `<div class="placement-why-card">` +
      `<div class="placement-why-label">Why this exact spot?</div>` +
      `<div class="placement-why-headline" style="color:${statusColor}">${escapeHtml(placementFeedback.headline)}</div>` +
      `<div class="placement-why-copy">${escapeHtml(placementFeedback.summary)}</div>` +
      `<div class="placement-why-list">` +
      `<div><strong>Column ${placementFeedback.column}:</strong> ${escapeHtml(placementFeedback.why_column)}</div>` +
      `<div><strong>Why now:</strong> ${escapeHtml(placementFeedback.why_now)}</div>` +
      `<div><strong>Wire ${placementFeedback.target_label}:</strong> ${escapeHtml(placementFeedback.why_wire)}</div>` +
      `${placementFeedback.control_labels && placementFeedback.control_labels.length ? `<div><strong>Controls ${placementFeedback.control_labels.join(", ")}:</strong> ${escapeHtml(placementFeedback.why_controls)}</div>` : ""}` +
      `<div><strong>If moved elsewhere:</strong> ${escapeHtml(placementFeedback.why_not_elsewhere)}</div>` +
      `</div>` +
      `${
        placementFeedback.next_expected
          ? `<div class="placement-next-step"><strong>Next useful step:</strong> ${escapeHtml(placementFeedback.next_expected.summary)}<br><span>${escapeHtml(placementFeedback.next_expected.why)}</span></div>`
          : ""
      }` +
      `</div>`;
  }

  panel.innerHTML = html;
}

function renderPlacementFeedback(placementFeedback) {
  if (!lastPlacedInsight) {
    renderTracePlaceholder();
    return;
  }
  updateGateInsightPanel(
    lastPlacedInsight.gateType,
    lastPlacedInsight.target,
    lastPlacedInsight.controls,
    placementFeedback || null,
  );
}

let inputA = 1;
let inputB = 1;
let gates = [];
let nextId = 0;
let activeTool = null;
let pendingClicks = [];
let pendingCol = null;
let hintVisible = false;
let hintGate = null;
let svg;
let instrBar;
let gateCountEl;
let hoverEl = null;
let analysisRequestToken = 0;
let lastPlacedInsight = null;

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatSignedBits(value, width) {
  const mask = (1 << width) - 1;
  return (value & mask).toString(2).padStart(width, "0");
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function cellCenter(qubit, col) {
  return {
    x: LABEL_W + col * CELL_W + CELL_W / 2,
    y: HEADER_H + qubit * CELL_H + CELL_H / 2,
  };
}

function serializeGates() {
  return gates.map((gate) => ({
    id: gate.id,
    type: gate.type,
    col: gate.col,
    target: gate.target,
    controls: gate.controls,
  }));
}

function joinWords(items) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function buildGrid() {
  if (!svg) return;
  const width = LABEL_W + NUM_COLS * CELL_W + 16;
  const height = HEADER_H + NUM_QUBITS * CELL_H + 8;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.maxHeight = `${NUM_QUBITS * CELL_H + HEADER_H + 20}px`;
  svg.innerHTML = "";

  const x0 = LABEL_W;
  const y0 = HEADER_H;
  const x1 = LABEL_W + NUM_COLS * CELL_W;
  const y1 = HEADER_H + NUM_QUBITS * CELL_H;

  renderPhaseLanes();

  for (let col = 0; col <= NUM_COLS; col += 1) {
    svg.appendChild(svgEl("line", { x1: x0 + col * CELL_W, y1: y0, x2: x0 + col * CELL_W, y2: y1, class: "grid-line" }));
  }
  for (let qubit = 0; qubit <= NUM_QUBITS; qubit += 1) {
    svg.appendChild(svgEl("line", { x1: x0, y1: y0 + qubit * CELL_H, x2: x1, y2: y0 + qubit * CELL_H, class: "grid-line" }));
  }
  for (let col = 0; col < NUM_COLS; col += 1) {
    const text = svgEl("text", {
      x: LABEL_W + col * CELL_W + CELL_W / 2,
      y: PHASE_LANE_H + (HEADER_H - PHASE_LANE_H) / 2 + 2,
      class: "col-header",
      fill: colColors[col],
    });
    text.textContent = col + 1;
    svg.appendChild(text);
  }
  for (let qubit = 0; qubit < NUM_QUBITS; qubit += 1) {
    const cy = HEADER_H + qubit * CELL_H + CELL_H / 2;
    const text = svgEl("text", {
      x: LABEL_W - 6, y: cy, class: "qubit-label", fill: Q_COLORS[qubit],
      style: "cursor:pointer",
    });
    text.textContent = `|${QUBITS[qubit]}⟩`;
    text.textContent = QUBITS_ASCII[qubit];
    text.setAttribute("pointer-events", "all");
    text.addEventListener("mouseenter", (e) => {
      let existing = document.getElementById("qubit-tooltip");
      if (existing) existing.remove();
      const tip = document.createElement("div");
      tip.id = "qubit-tooltip";
      tip.className = "qubit-tooltip";
      tip.textContent = QUBIT_TOOLTIPS[qubit];
      const svgRect = svg.getBoundingClientRect();
      const textRect = e.target.getBoundingClientRect();
      tip.style.left = `${textRect.left - svgRect.left + textRect.width + 6}px`;
      tip.style.top = `${textRect.top - svgRect.top - 4}px`;
      svg.parentElement.style.position = "relative";
      svg.parentElement.appendChild(tip);
    });
    text.addEventListener("mouseleave", () => {
      const tip = document.getElementById("qubit-tooltip");
      if (tip) tip.remove();
    });
    svg.appendChild(text);
  }
  for (let qubit = 0; qubit < NUM_QUBITS; qubit += 1) {
    const cy = HEADER_H + qubit * CELL_H + CELL_H / 2;
    svg.appendChild(svgEl("line", { x1: x0, y1: cy, x2: x1, y2: cy, class: "wire", stroke: Q_COLORS[qubit] }));
  }
  for (let qubit = 0; qubit < NUM_QUBITS; qubit += 1) {
    for (let col = 0; col < NUM_COLS; col += 1) {
      const x = LABEL_W + col * CELL_W;
      const y = HEADER_H + qubit * CELL_H;
      const rect = svgEl("rect", {
        x,
        y,
        width: CELL_W,
        height: CELL_H,
        fill: "transparent",
        "data-qubit": qubit,
        "data-col": col,
        class: "click-cell",
      });
      rect.addEventListener("click", () => handleCellClick(qubit, col));
      rect.addEventListener("mouseenter", () => showHover(qubit, col));
      rect.addEventListener("mouseleave", clearHover);
      rect.addEventListener("dragover", (event) => {
        event.preventDefault();
        showHover(qubit, col);
      });
      rect.addEventListener("dragleave", clearHover);
      rect.addEventListener("drop", (event) => {
        event.preventDefault();
        clearHover();
        const gateType = event.dataTransfer.getData("text/plain");
        if (gateType) handleDrop(gateType, qubit, col);
      });
      svg.appendChild(rect);
    }
  }
}

function showHover(qubit, col) {
  clearHover();
  if (!svg || !activeTool || activeTool === "eraser") return;
  hoverEl = svgEl("rect", {
    x: LABEL_W + col * CELL_W + 1,
    y: HEADER_H + qubit * CELL_H + 1,
    width: CELL_W - 2,
    height: CELL_H - 2,
    class: "hover-rect",
    rx: 4,
  });
  svg.appendChild(hoverEl);
}

function clearHover() {
  if (hoverEl) {
    hoverEl.remove();
    hoverEl = null;
  }
}

function gateAt(qubit, col) {
  return gates.find((gate) => gate.col === col && (gate.target === qubit || gate.controls.includes(qubit)));
}

function addGate(type, col, target, controls = []) {
  if (type !== "X") {
    const sortedControls = JSON.stringify([...controls].sort());
    const exists = gates.some(
      (gate) =>
        gate.type === type &&
        gate.col === col &&
        gate.target === target &&
        JSON.stringify([...gate.controls].sort()) === sortedControls,
    );
    if (exists) return;
  }
  gates.push({ id: nextId += 1, type, col, target, controls });
  lastPlacedInsight = { gateType: type, target, controls };
  updateGateInsightPanel(type, target, controls);
  onCircuitChanged();
}

function removeGate(id) {
  gates = gates.filter((gate) => gate.id !== id);
  if (!gates.length) {
    lastPlacedInsight = null;
    renderTracePlaceholder();
  } else {
    const latest = [...gates].sort((left, right) => right.id - left.id)[0];
    lastPlacedInsight = { gateType: latest.type, target: latest.target, controls: latest.controls };
  }
  onCircuitChanged();
}

function clearResultPanels() {
  document.getElementById("result-panel").style.display = "none";
  document.getElementById("hint-panel").style.display = "none";
}

function renderTracePlaceholder() {
  const panel = document.getElementById("gate-info-panel");
  if (!panel) return;
  panel.innerHTML = '<div style="opacity:0.5;font-size:0.85em">Place a gate to get a plain-English explanation of what changed, why this exact spot is correct, and why the step belongs now.</div>';
}

function renderTimelinePlaceholder() {
  const panel = document.getElementById("timeline-state");
  if (!panel) return;
  panel.innerHTML = '<div style="opacity:0.5;font-size:0.85em">Place gates to see the answer graph and the step-by-step answer build-up.</div>';
}

function renderBoothStoryPlaceholder() {
  const panel = document.getElementById("booth-story-panel");
  if (!panel) return;
  panel.innerHTML = '<div style="opacity:0.5;font-size:0.85em">Choose A and B, then place gates. This panel explains Booth in one sentence, shows who A/B/P/E/C are, and tells you why the current phase is happening now.</div>';
}

function renderTruthTablePlaceholder() {
  const panel = document.getElementById("truth-table-content");
  if (!panel) return;
  panel.innerHTML = '<div style="opacity:0.5">The live truth table will appear here as you build the circuit.</div>';
}

function resetOutput() {
  const outDec = document.getElementById("out-decimal");
  const outBin = document.getElementById("out-binary");
  if (outDec) outDec.textContent = "P = ?";
  if (outBin) {
    outBin.textContent = "Place gates to see output";
    outBin.style.color = "var(--text-mid)";
  }
}

function clearAll() {
  gates = [];
  nextId = 0;
  lastPlacedInsight = null;
  pendingClicks = [];
  pendingCol = null;
  hintVisible = false;
  hintGate = null;
  document.getElementById("btn-hint").textContent = "Show Hint";
  clearResultPanels();
  renderBoothStoryPlaceholder();
  renderTracePlaceholder();
  renderTimelinePlaceholder();
  onCircuitChanged();
  setInstruction("All gates cleared. Select a gate to start building.");
}

function handleCellClick(qubit, col) {
  if (activeTool === "eraser" || !activeTool) {
    const gate = gateAt(qubit, col);
    if (gate) removeGate(gate.id);
    return;
  }

  const tool = activeTool;
  const needed = { X: 1, CX: 2, CCX: 3, SWAP: 2 }[tool] || 1;

  if (pendingClicks.length > 0) {
    if (col !== pendingCol) {
      pendingClicks = [];
      pendingCol = null;
      renderGates();
      return;
    }
    if (pendingClicks.includes(qubit)) return;
    pendingClicks.push(qubit);
    if (pendingClicks.length >= needed) {
      addGate(tool, col, pendingClicks[pendingClicks.length - 1], pendingClicks.slice(0, -1));
      pendingClicks = [];
      pendingCol = null;
    } else {
      renderGates();
      updatePendingInstruction();
    }
    return;
  }

  if (needed === 1) {
    addGate(tool, col, qubit);
    return;
  }

  pendingClicks = [qubit];
  pendingCol = col;
  renderGates();
  updatePendingInstruction();
}

function handleDrop(gateType, qubit, col) {
  if (!["X", "CX", "CCX", "SWAP"].includes(gateType)) return;
  const needed = { X: 1, CX: 2, CCX: 3, SWAP: 2 }[gateType];
  if (needed === 1) {
    addGate(gateType, col, qubit);
    return;
  }
  pendingClicks = [qubit];
  pendingCol = col;
  selectTool(gateType);
  renderGates();
  updatePendingInstruction();
}

function renderGates() {
  if (!svg) return;
  svg.querySelectorAll(".gate-group,.pending-group,.hint-group").forEach((el) => el.remove());

  gates.forEach((gate) => {
    const group = svgEl("g", { class: "gate-group" });
    if (gate.type === "X") {
      const { x, y } = cellCenter(gate.target, gate.col);
      const size = GATE_BOX / 2;
      const box = svgEl("rect", { x: x - size, y: y - size, width: GATE_BOX, height: GATE_BOX, class: "gate-box", stroke: "#00e5ff" });
      box.addEventListener("click", (event) => {
        if (activeTool && activeTool !== "eraser") return;
        event.stopPropagation();
        removeGate(gate.id);
      });
      group.appendChild(box);
      const label = svgEl("text", { x, y, class: "gate-label", fill: "#00e5ff" });
      label.textContent = "X";
      group.appendChild(label);
    } else {
      const color = gate.type === "SWAP" ? "#e2e8f0" : gate.type === "CCX" ? "#ff2d6f" : "#b388ff";
      const allQubits = [...gate.controls, gate.target];
      const minQubit = Math.min(...allQubits);
      const maxQubit = Math.max(...allQubits);
      const cx = LABEL_W + gate.col * CELL_W + CELL_W / 2;
      const minY = HEADER_H + minQubit * CELL_H + CELL_H / 2;
      const maxY = HEADER_H + maxQubit * CELL_H + CELL_H / 2;
      const targetY = HEADER_H + gate.target * CELL_H + CELL_H / 2;
      group.appendChild(svgEl("line", { x1: cx, y1: minY, x2: cx, y2: maxY, stroke: color, class: "gate-connector" }));

      gate.controls.forEach((ctrl) => {
        const cy = HEADER_H + ctrl * CELL_H + CELL_H / 2;
        const dot = svgEl("circle", { cx, cy, r: CTRL_R, fill: color, class: "ctrl-dot" });
        dot.addEventListener("click", (event) => {
          if (activeTool && activeTool !== "eraser") return;
          event.stopPropagation();
          removeGate(gate.id);
        });
        group.appendChild(dot);
      });

      const targetCircle = svgEl("circle", { cx, cy: targetY, r: TGT_R, stroke: color, class: "target-circle" });
      targetCircle.addEventListener("click", (event) => {
        if (activeTool && activeTool !== "eraser") return;
        event.stopPropagation();
        removeGate(gate.id);
      });
      group.appendChild(targetCircle);
      group.appendChild(svgEl("line", { x1: cx - TGT_R, y1: targetY, x2: cx + TGT_R, y2: targetY, stroke: color, "stroke-width": 1.5 }));
      group.appendChild(svgEl("line", { x1: cx, y1: targetY - TGT_R, x2: cx, y2: targetY + TGT_R, stroke: color, "stroke-width": 1.5 }));
      const label = svgEl("text", { x: cx, y: maxY + 12, class: "gate-type-label", fill: color });
      label.textContent = gate.type;
      group.appendChild(label);
    }
    svg.appendChild(group);
  });

  if (pendingClicks.length > 0 && pendingCol !== null) {
    const pending = svgEl("g", { class: "pending-group" });
    pendingClicks.forEach((qubit, index) => {
      const { x, y } = cellCenter(qubit, pendingCol);
      pending.appendChild(svgEl("circle", { cx: x, cy: y, r: 6, class: "pending-dot" }));
      const label = svgEl("text", { x: x + 10, y: y - 6, class: "pending-label" });
      label.textContent = `C${index + 1}`;
      pending.appendChild(label);
    });
    svg.appendChild(pending);
  }

  if (hintGate) {
    const hint = svgEl("g", { class: "hint-group" });
    [...(hintGate.controls || []), hintGate.target].forEach((qubit) => {
      const { x, y } = cellCenter(qubit, hintGate.col);
      const size = GATE_BOX / 2 + 1;
      hint.appendChild(svgEl("rect", { x: x - size, y: y - size, width: size * 2, height: size * 2, class: "hint-rect" }));
    });
    svg.appendChild(hint);
  }
}

function updateMetrics() {
  document.getElementById("m-ccx").textContent = gates.filter((gate) => gate.type === "CCX").length;
  document.getElementById("m-cx").textContent = gates.filter((gate) => gate.type === "CX").length;
  document.getElementById("m-x").textContent = gates.filter((gate) => gate.type === "X").length;
  document.getElementById("m-total").textContent = gates.length;
}

function renderOptimizedMetrics(metrics) {
  const panel = document.getElementById("opt-metrics");
  if (!panel) return;
  if (!metrics || !metrics.optimized || !metrics.optimized.total_gates) {
    panel.style.display = "none";
    return;
  }
  document.getElementById("m-opt-cx").textContent = metrics.optimized.cx_count || 0;
  document.getElementById("m-opt-depth").textContent = metrics.optimized.depth || 0;
  document.getElementById("m-opt-total").textContent = metrics.optimized.total_gates || 0;
  panel.style.display = "block";
}

function selectTool(tool) {
  activeTool = activeTool === tool ? null : tool;
  pendingClicks = [];
  pendingCol = null;
  renderGates();
  updateToolButtons();
  updateInstructionForTool();
}

function updateToolButtons() {
  document.querySelectorAll(".gate-btn").forEach((button) => {
    button.classList.toggle("selected", button.dataset.gate === activeTool);
  });
}

function setInstruction(text, type = "") {
  if (!instrBar) return;
  instrBar.textContent = text;
  instrBar.className = `instruction-bar${type ? ` ${type}` : ""}`;
}

function updateInstructionForTool() {
  if (activeTool === "eraser") {
    setInstruction("Eraser active — click any gate to remove it.");
  } else if (activeTool === "X") {
    setInstruction("Click a cell to place an X (NOT) gate.", "pending");
  } else if (activeTool === "CX") {
    setInstruction("Click CONTROL qubit first, then TARGET in the same column.", "pending");
  } else if (activeTool === "CCX") {
    setInstruction("Click 2 CONTROL qubits, then TARGET in the same column.", "pending");
  } else if (activeTool === "SWAP") {
    setInstruction("Click the first qubit, then the second qubit to swap them.", "pending");
  } else {
    setInstruction("Select a gate from the palette, then click or drag onto the grid. Click existing gates to delete.");
  }
}

function updatePendingInstruction() {
  const needed = { CX: 2, CCX: 3, SWAP: 2 }[activeTool] || 1;
  const remaining = needed - pendingClicks.length;
  if (remaining === 1) {
    setInstruction(`Click TARGET qubit in column ${pendingCol + 1}`, "pending");
  } else {
    setInstruction(`Click control ${pendingClicks.length + 1} in column ${pendingCol + 1} (${remaining} more)`, "pending");
  }
}

function setInput(register, value) {
  if (register === "a") inputA = value;
  else inputB = value;
  document.querySelectorAll(`#${register}-buttons button`).forEach((button) => {
    button.classList.toggle("selected", Number.parseInt(button.dataset.val, 10) === value);
  });
  clearAll();
  updateTarget();
  syncTargetBits();
  updateClassical();
  buildGrid();
}

function updateTarget() {
  const product = inputA * inputB;
  document.getElementById("target-decimal").textContent = `${inputA} × ${inputB} = ${product}`;
  document.getElementById("target-binary").textContent = `(${inputA}) × (${inputB}) = ${product}`;
  document.getElementById("subtitle").textContent = `Booth multiplier: (${inputA}) × (${inputB}) = ${product}`;
}

function updateClassical() {
  const panel = document.getElementById("classical-hint");
  if (panel) panel.innerHTML = "";
}

function syncTargetBits() {
  const targetBinary = document.getElementById("target-binary");
  if (!targetBinary) return;
  const product = inputA * inputB;
  targetBinary.textContent = `2-bit signed bits: A=${formatSignedBits(inputA, 2)} | B=${formatSignedBits(inputB, 2)} | target P=${formatSignedBits(product, 4)}`;
}

function renderTimelineView(timeline) {
  const panel = document.getElementById("timeline-state");
  if (!panel) return;
  if (!timeline || !timeline.length) {
    panel.innerHTML = '<div style="opacity:0.5;font-size:0.85em">Place gates to watch the answer build up step by step.</div>';
    return;
  }

  const points = timeline.map((step) => step.regs.P);
  const minP = Math.min(...points);
  const maxP = Math.max(...points);
  const range = Math.max(1, maxP - minP);
  const chartW = 250;
  const chartH = 78;
  const chartPoints = timeline.map((step, idx) => {
    const x = timeline.length === 1 ? chartW / 2 : (idx / (timeline.length - 1)) * chartW;
    const y = chartH - ((step.regs.P - minP) / range) * (chartH - 16) - 8;
    return { x, y, col: step.col, value: step.regs.P };
  });
  const polyline = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const markers = chartPoints
    .map((point, idx) => `<circle cx="${point.x}" cy="${point.y}" r="${idx === chartPoints.length - 1 ? 4 : 3}" fill="${idx === chartPoints.length - 1 ? '#69f0ae' : '#b388ff'}"></circle>`)
    .join("");

  let html = '<div style="color:var(--text-dim);font-size:0.78em;margin-bottom:6px">Watch how the answer changes as each useful column runs:</div>';
  html += `<div class="timeline-graph-card">` +
    `<div class="timeline-graph-title">Answer graph</div>` +
    `<svg viewBox="0 0 ${chartW} ${chartH}" class="timeline-graph" aria-label="Answer evolution graph">` +
    `<line x1="0" y1="${chartH - 8}" x2="${chartW}" y2="${chartH - 8}" stroke="rgba(255,255,255,0.1)" stroke-width="1"></line>` +
    `<polyline fill="none" stroke="url(#timelineGradient)" stroke-width="3" points="${polyline}"></polyline>` +
    `<defs><linearGradient id="timelineGradient" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#b388ff"></stop><stop offset="100%" stop-color="#69f0ae"></stop></linearGradient></defs>` +
    markers +
    `</svg>` +
    `<div class="timeline-graph-caption">Use this to see whether the answer changes at the right moment. Flat parts usually mean the circuit skipped work there; jumps mean a gate changed P.</div>` +
    `</div>`;
  html += '<div style="display:flex;flex-direction:column;gap:4px;max-height:260px;overflow-y:auto;padding-right:2px">';

  timeline.forEach((step, idx) => {
    const isLast = idx === timeline.length - 1;
    const label = `After column ${step.col}: Your A = ${step.regs.A} | Your B = ${step.regs.B} | Answer so far = ${step.regs.P}`;
    const bg = isLast ? "rgba(105,240,174,0.08)" : "rgba(255,255,255,0.02)";
    const border = isLast ? "rgba(105,240,174,0.25)" : "rgba(255,255,255,0.04)";

    let notes = [];
    if (step.register_deltas) {
      step.register_deltas.forEach(d => {
        if (d.register === "P" && d.before !== d.after) notes.push("product register updated");
        if (d.register === "C" && d.before !== d.after) notes.push("carry happened");
        if (d.register === "E" && d.before !== d.after) notes.push("temporary decision note stored");
      });
    }
    const noteHtml = notes.length
      ? `<div style="font-size:0.72em;color:var(--yellow);margin-top:2px">(${notes.join(", ")})</div>`
      : `<div style="font-size:0.72em;color:var(--text-dim);margin-top:2px">${escapeHtml(step.phase_label)}</div>`;

    html += `<div style="padding:6px 8px;border-radius:6px;background:${bg};border:1px solid ${border}">`;
    html += `<div style="font-size:0.78em;color:${isLast ? 'var(--green)' : 'var(--text-light)'};font-weight:700">${label}</div>`;
    if (isLast) {
      html += `<div style="font-size:0.72em;margin-top:3px;color:var(--green)">Current state</div>`;
    }
    html += noteHtml;
    html += `</div>`;
  });

  html += '</div>';
  panel.innerHTML = html;
}

function renderTruthTable(rows) {
  const panel = document.getElementById("truth-table-content");
  if (!panel) return;
  if (!rows || !rows.length) {
    renderTruthTablePlaceholder();
    return;
  }

  // Build a lookup: for each possible input combination, what does P come out as?
  // rows comes from simulate_quantum — each row has regs: {X, Y, A, P} and prob
  // We run the circuit for all 4 input combos: X in {0,1}, Y in {0,1}
  // The simulate_quantum returns states for the current inputA/inputB wiring.
  // Since we only simulate for one input combination, we show a "multiplication table"
  // comparing expected vs actual for the current inputs, plus all 4 combos textually.

  // Group rows by highest probability (the deterministic classical result)
  const topRow = rows[0]; // highest probability state
  const topRegs = (topRow && topRow.regs) ? topRow.regs : {};

  // Determine current X and Y from top state
  const curX = topRegs.X !== undefined ? topRegs.X : (topRegs.A || 0);
  const curY = topRegs.Y !== undefined ? topRegs.Y : (topRegs.B || 0);
  const curA = topRegs.A || 0;
  const curP = topRegs.P || 0;
  const expectedP = curX * curY;
  const isCorrect = curP === expectedP;

  // Build a step-by-step narrative for what the circuit did
  const steps = [];
  if (curX !== 0) steps.push(`<span style="color:var(--cyan)">X = ${curX}</span> (loaded via X gate)`);
  if (curY !== 0) steps.push(`<span style="color:var(--purple)">Y = ${curY}</span> (loaded via X gate)`);
  if (curA !== 0) steps.push(`<span style="color:var(--yellow)">A = ${curA}</span> (CCX wrote X·Y into Ancilla)`);
  if (curP !== 0) steps.push(`<span style="color:var(--green)">P = ${curP}</span> (CX copied Ancilla → Product)`);

  const stepsHtml = steps.length
    ? `<div style="font-size:0.8em;line-height:1.9;margin-bottom:10px">${steps.join(' &rarr; ')}</div>`
    : '';

  // Multiplication correctness row
  const correctIcon = isCorrect ? '✓' : '✗';
  const correctColor = isCorrect ? 'var(--green)' : 'var(--pink)';
  const correctText = isCorrect
    ? `${curX} × ${curY} = <strong style="color:var(--green)">${curP}</strong> ✓ Correct!`
    : `${curX} × ${curY} should be <strong>${expectedP}</strong>, got <strong style="color:var(--pink)">${curP}</strong> — keep building`;

  panel.innerHTML =
    `<div style="color:var(--text-dim);font-size:0.78em;margin-bottom:8px">` +
    `What the circuit computed for the current inputs:` +
    `</div>` +
    stepsHtml +
    `<div style="font-size:0.92em;padding:8px 10px;border-radius:6px;` +
    `border:1px solid ${correctColor};background:rgba(0,0,0,0.25);margin-bottom:10px">` +
    correctText +
    `</div>` +
    `<div style="color:var(--text-dim);font-size:0.74em">` +
    `P is only correct once all three phases are complete: CCX (Compute) → CX (Extract) → CCX† (Uncompute).` +
    `</div>`;
}


function renderBoothStory(data) {
  const panel = document.getElementById("booth-story-panel");
  if (!panel) return;

  const hasGates = gates.length > 0;
  const lastStep = data.timeline && data.timeline.length ? data.timeline[data.timeline.length - 1] : null;
  const regs = data.final_registers || { P: 0 };
  let stage = "start";
  let headline = "Booth in one sentence: read B, then decide whether each place should add A, subtract A, or do nothing.";
  let body = "This circuit follows one fixed order: load the numbers, create temporary decision notes in E, build the answer in P, and then erase temporary helper bits so only the answer remains.";
  let whyNow = "Nothing has started yet. The first job is to load the chosen input bits into A and B.";

  if (lastStep) {
    if (lastStep.phase_key === "input_init") {
      stage = "load";
      headline = "Step 1: load your two numbers into the circuit.";
      body = "The X gates are just writing the bits of A and B into their starting wires.";
      whyNow = "This must happen first because every later step reads A or B. Before loading, the circuit has no real input values to work with.";
    } else if (lastStep.phase_key === "booth_encode") {
      stage = "encode";
      headline = "Step 2: Booth reads B and creates temporary instructions.";
      body = "The E wires are short-lived reminder notes. One note can later turn on the add path, and the other can later turn on the subtract path.";
      whyNow = "This must happen before the arithmetic because later controlled gates look at E to know which path should turn on.";
    } else if (lastStep.phase_key === "booth_cleanup") {
      stage = "cleanup";
      headline = "Step 4: cleanup is happening now.";
      body = "The answer is already in P. The circuit is now erasing temporary helper bits so only the real output remains.";
      whyNow = "Cleanup comes last because E and C are still needed until the answer has been fully written into P.";
    } else {
      stage = "operate";
      headline = "Step 3: the circuit is building the answer in P.";
      body = "This is the long-multiplication part. The circuit writes one contribution at a time into P, using A as the number being copied, E as temporary decision notes, and C as temporary carry.";
      whyNow = lastStep.phase_key.startsWith("d0")
        ? "The first contribution happens before the shifted one so the low product bits are correct first, and so the circuit can clean A and carry before reusing them."
        : "This shifted contribution happens only after the earlier low-place work is finished and its temporary changes have been cleaned up.";
    }
  } else if (!hasGates) {
    stage = "start";
  }

  const cards = [
    { key: "load", title: "1. Load", text: "Write A and B into the wires." },
    { key: "encode", title: "2. Read B", text: "Create temporary add/subtract notes." },
    { key: "operate", title: "3. Build P", text: "Write the answer into the product wires." },
    { key: "cleanup", title: "4. Clean Up", text: "Reset E and C so only the answer stays." },
  ];
  const strip = cards
    .map((card, idx) => {
      const statusClass = card.key === stage ? "booth-story-card active" : hasGates && idx < cards.findIndex((item) => item.key === stage) ? "booth-story-card done" : "booth-story-card";
      return `<div class="${statusClass}"><strong>${card.title}</strong><span>${card.text}</span></div>`;
    })
    .join('<div class="booth-story-arrow">→</div>');

  const storyStrip = strip.replaceAll(String.fromCharCode(26), "&rarr;");
  const registerCards = Object.entries(REG_ROLE)
    .map(([name, role]) =>
      `<div class="booth-register-card" style="--register-accent:${REG_COLOR[name]}">` +
      `<span class="booth-register-name">${name}</span>` +
      `<span class="booth-register-role">${role}</span>` +
      `</div>`
    )
    .join("");

  panel.innerHTML =
    `<div class="booth-story-summary">` +
    `<div class="booth-story-headline">${escapeHtml(headline)}</div>` +
    `<div class="booth-story-body">${escapeHtml(body)}</div>` +
    `</div>` +
    `<div class="booth-story-strip">${storyStrip}</div>` +
    `<div class="booth-register-block">` +
    `<div class="booth-register-title">Who is who?</div>` +
    `<div class="booth-register-grid">${registerCards}</div>` +
    `</div>` +
    `<div class="booth-story-math">` +
    `<div class="booth-story-math-line"><span class="booth-story-label">Why only four inputs?</span> X and Y are 2-bit signed numbers, so the only possible values are -2, -1, 0, and 1.</div>` +
    `<div class="booth-story-math-line"><span class="booth-story-label">Why this phase now?</span> ${escapeHtml(whyNow)}</div>` +
    `<div class="booth-story-math-line"><span class="booth-story-label">Why Uncompute?</span> The Ancilla (A) register is a temporary scratchpad. It must return to |0⟩ so the circuit ends with only the real answer in P.</div>` +
    `</div>` +
    `<div class="booth-story-math">` +
    `<div class="booth-story-math-line"><span class="booth-story-label">Answer so far:</span> P = <strong style="color:var(--green)">${regs.P}</strong></div>` +
    `<div class="booth-story-math-line"><span class="booth-story-label">Target answer:</span> ${inputA} × ${inputB} = ${inputA * inputB}</div>` +
    `</div>`;
}

function renderCurrentOutput(data) {
  const outDec = document.getElementById("out-decimal");
  const outBin = document.getElementById("out-binary");
  if (!outDec || !outBin) return;

  if (!gates.length) {
    resetOutput();
    return;
  }

  // Backend returns X, Y, A, P — Toom-Cook register names
  const regs = data.final_registers || { X: 0, Y: 0, A: 0, P: 0 };
  const bits = data.final_register_bits || { X: "00", Y: "00", A: "00", P: "00" };

  // Show P value — if P is still 0 but inputs are set, show input state as hint
  const pVal = regs.P;
  if (pVal !== 0 || regs.A !== 0) {
    // If P has been computed OR Ancilla has been computed (CCX placed), show the full stack
    outDec.textContent = `P = ${pVal}`;
    if (pVal !== 0) outDec.style.color = "var(--green)";
    else outDec.style.color = "var(--text-mid)";
  } else if (regs.X !== 0 || regs.Y !== 0) {
    // Only X gates placed (A=0, P=0) — show input state feedback
    outDec.textContent = `P = 0`;
    outDec.style.color = "var(--pink)";
    outBin.innerHTML = `<div style="font-size:0.82em;color:var(--text-mid);line-height:1.6">
      <span style="color:var(--cyan)">X = ${regs.X}</span> (input set) &nbsp;|
      <span style="color:var(--purple)"> Y = ${regs.Y}</span> (input set)<br>
      Place CCX gates to compute into Ancilla (A), then CX gates to extract into P.
    </div>`;
    outBin.style.color = "inherit";
    return;
  } else {
    outDec.textContent = `P = 0`;
    outDec.style.color = "var(--text-mid)";
  }

  outBin.innerHTML = '';
  outBin.style.color = 'inherit';
}

function renderAnalysis(data) {
  renderBoothStory(data);
  renderPlacementFeedback(data.placement_feedback || null);
  renderTimelineView(data.timeline || []);
  renderTruthTable(data.truth_table || []);
  renderCurrentOutput(data);
  renderOptimizedMetrics(data.metrics);
}

async function fetchCircuitAnalysis() {
  const token = ++analysisRequestToken;
  try {
    const response = await fetch("/api/analyze_circuit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: inputA, b: inputB, gates: serializeGates(), shots: 256 }),
    });
    const data = await response.json();
    if (token !== analysisRequestToken) return;
    renderAnalysis(data);
  } catch (error) {
    console.error(error);
    if (token !== analysisRequestToken) return;
    renderBoothStoryPlaceholder();
    renderPlacementFeedback(null);
    renderTimelinePlaceholder();
    renderTruthTablePlaceholder();
    resetOutput();
    renderOptimizedMetrics(null);
  }
}

function onCircuitChanged() {
  renderGates();
  updateMetrics();
  document.getElementById("result-panel").style.display = "none";
  if (gateCountEl) gateCountEl.textContent = `${gates.length} gate${gates.length !== 1 ? "s" : ""} placed`;
  if (hintVisible) updateHint();
  if (pendingClicks.length === 0) updateInstructionForTool();
  fetchCircuitAnalysis();
}

async function checkCircuit() {
  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: inputA, b: inputB, gates: serializeGates() }),
    });
    const result = await response.json();
    showResult(result.correct ? { ...result, correct: result.c_val === 0 && result.e_val === 0 } : result);
  } catch (error) {
    console.error(error);
  }
}

function showResult(result) {
  const panel = document.getElementById("result-panel");
  const content = document.getElementById("result-content");
  const verdict = document.getElementById("result-verdict");

  // ── Trace every placed gate, compute its Boolean effect step-by-step ──────
  const x = result.a_val !== undefined ? result.a_val : 0;  // inputA (X register)
  const y = result.b_val !== undefined ? result.b_val : 0;  // inputB (Y register)

  // Simulate bit-level state as we walk through the gate list
  const state = { x0: 0, x1: 0, y0: 0, y1: 0, a0: 0, a1: 0, p0: 0, p1: 0 };
  const QUBIT_NAMES_MAP = { 0: 'x0', 1: 'x1', 2: 'y0', 3: 'y1', 4: 'a0', 5: 'a1', 6: 'p0', 7: 'p1' };

  const steps = [];

  gates.forEach(function(g) {
    var q = QUBIT_NAMES_MAP[g.target] || ('q' + g.target);
    var before = state[q] !== undefined ? state[q] : 0;

    if (g.type === 'X') {
      var after = 1 - (state[q] || 0);
      state[q] = after;
      var regName = g.target <= 1 ? 'X' : 'Y';
      steps.push({
        gate: 'X',
        color: 'var(--cyan)',
        gateLabel: 'X(' + q + ')',
        role: 'Phase INIT — encode ' + regName + ' input',
        q_name: q,
        calc: q + ' = ' + before + ' → ' + after,
        eqParts: {}
      });
    } else if (g.type === 'CCX') {
      var ctrl0 = QUBIT_NAMES_MAP[g.controls[0]];
      var ctrl1 = QUBIT_NAMES_MAP[g.controls[1]];
      var c0 = state[ctrl0] || 0;
      var c1 = state[ctrl1] || 0;
      var andVal = c0 & c1;
      var after = (state[q] || 0) ^ andVal;
      var phaseLabel = before === 1 ? 'Phase U† — Uncompute Ancilla' : 'Phase U — Compute into Ancilla';
      state[q] = after;
      steps.push({
        gate: 'CCX',
        color: 'var(--pink)',
        gateLabel: 'CCX(' + ctrl0 + ', ' + ctrl1 + ' → ' + q + ')',
        role: phaseLabel,
        q_name: q,
        calc: '',
        eqParts: { q: q, ctrl0: ctrl0, ctrl1: ctrl1, c0: c0, c1: c1, andVal: andVal, before: before, after: after }
      });
    } else if (g.type === 'CX') {
      var ctrl0 = QUBIT_NAMES_MAP[g.controls[0]];
      var c0 = state[ctrl0] || 0;
      var after = (state[q] || 0) ^ c0;
      state[q] = after;
      steps.push({
        gate: 'CX',
        color: 'var(--purple)',
        gateLabel: 'CX(' + ctrl0 + ' → ' + q + ')',
        role: 'Phase V — Extract into Product',
        q_name: q,
        calc: '',
        eqParts: { q: q, ctrl0: ctrl0, c0: c0, before: before, after: after }
      });
    }
  });

  // ── Build validation cards per gate ─────────────────────────────────────────
  // Reference roles: what each gate position should be computing
  function gateRole(g, state, q, ctrl0, ctrl1) {
    if (g.type === 'X') {
      return g.target <= 1
        ? 'Encodes input bit into X register. Sets ' + q + ' = 1 as the first multiplicand bit.'
        : 'Encodes input bit into Y register. Sets ' + q + ' = 1 as the second multiplicand bit.';
    }
    if (g.type === 'CCX') {
      var t = q;
      // determine which phase this CCX is in based on ancilla current state before gate
      return 'CCX implements reversible AND: ' + ctrl0 + ' · ' + ctrl1 + ' → XOR into ' + t +
             '. Used in Phase U (Compute) to write sub-product into Ancilla, or Phase U† (Uncompute) to erase it.';
    }
    if (g.type === 'CX') {
      return 'CX implements reversible COPY: ' + ctrl0 + ' → XOR into ' + q +
             '. Used in Phase V (Extract) to copy the Ancilla partial product into the Product register.';
    }
    return '';
  }

  const stepsHtml = steps.length ? steps.map(function(s, i) {
    // Derive a formal equation for the gate
    var equation = '';
    var verdict = '';
    var verdictColor = 'var(--green)';

    if (s.gate === 'X') {
      var bit = s.calc.split(' → ')[1];
      equation = s.q_name + ' ← NOT(' + (parseInt(bit) ^ 1) + ') = ' + bit;
      verdict = bit === '1' ? '✓ Bit set — input loaded correctly' : '✓ Bit cleared (NOT applied)';
    } else if (s.gate === 'CCX') {
      var parts = s.eqParts;
      equation = parts.q + ' ← ' + parts.q + ' ⊕ (' + parts.ctrl0 + ' · ' + parts.ctrl1 + ') = ' +
                 parts.before + ' ⊕ (' + parts.c0 + ' · ' + parts.c1 + ') = ' +
                 parts.before + ' ⊕ ' + parts.andVal + ' = ' + parts.after;
      if (parts.before === 0 && parts.after === 1) verdict = '✓ Ancilla correctly stored ' + parts.ctrl0 + '·' + parts.ctrl1 + ' = ' + parts.after;
      else if (parts.before === 1 && parts.after === 0) verdict = '✓ Ancilla uncomputed back to 0 (Phase U†)';
      else verdict = '○ Ancilla unchanged (' + parts.before + ' ⊕ ' + parts.andVal + ' = ' + parts.after + ')';
    } else if (s.gate === 'CX') {
      var parts = s.eqParts;
      equation = parts.q + ' ← ' + parts.q + ' ⊕ ' + parts.ctrl0 + ' = ' + parts.before + ' ⊕ ' + parts.c0 + ' = ' + parts.after;
      verdict = parts.after !== 0
        ? '✓ ' + parts.ctrl0 + ' = ' + parts.c0 + ' successfully copied into ' + parts.q
        : parts.c0 === 0
          ? '○ ' + parts.ctrl0 + ' = 0, nothing copied — ' + parts.q + ' stays 0'
          : '✓ ' + parts.q + ' = 0';
    }

    return '<div style="margin-bottom:10px;padding:10px 12px;border-left:3px solid ' + s.color + ';background:rgba(0,0,0,0.2);border-radius:0 6px 6px 0">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px">' +
        '<span style="color:' + s.color + ';font-family:var(--mono);font-weight:700;font-size:0.88em">' + s.gateLabel + '</span>' +
        '<span style="color:var(--text-dim);font-size:0.73em;font-style:italic">' + s.role + '</span>' +
      '</div>' +
      '<div style="color:#e0e0e0;font-family:var(--mono);font-size:0.85em;background:rgba(0,0,0,0.3);padding:5px 8px;border-radius:4px;margin-bottom:5px">' + equation + '</div>' +
      '<div style="color:' + verdictColor + ';font-size:0.78em">' + verdict + '</div>' +
    '</div>';
  }).join('') : '<div style="color:var(--text-dim);font-size:0.85em">No gates placed yet.</div>';

  // ── Final validation equation ─────────────────────────────────────────────
  const finalP0 = state.p0 || 0;
  const finalP1 = state.p1 || 0;
  const finalA0 = state.a0 || 0;
  const finalA1 = state.a1 || 0;
  const computedP = finalP0 | (finalP1 << 1);
  const expectedP = result.a_val * result.b_val;
  const pMatch = computedP === result.p_val;
  const aClean = finalA0 === 0 && finalA1 === 0;

  content.innerHTML =
    '<div style="font-size:0.78em;color:var(--text-dim);margin-bottom:12px;letter-spacing:0.05em">GATE-BY-GATE CALCULATION TRACE</div>' +
    stepsHtml +
    '<div style="margin-top:14px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.3)">' +
      '<div style="font-size:0.78em;color:var(--text-dim);margin-bottom:8px">FINAL VALIDATION</div>' +
      '<div style="font-family:var(--mono);font-size:0.85em;line-height:2">' +
        '<span style="color:var(--cyan)">X</span> = ' + result.a_val + ' &nbsp;×&nbsp; <span style="color:var(--purple)">Y</span> = ' + result.b_val + ' &nbsp;=&nbsp; <strong>' + expectedP + '</strong><br>' +
        'p0 = x0·y0 = ' + (state.x0||0) + '·' + (state.y0||0) + ' = ' + Math.min(1,(state.x0||0)*(state.y0||0)) + '&nbsp; ' +
        '&nbsp; p1 = x0·y1 ⊕ x1·y0 = ' + (state.x0||0) + '·' + (state.y1||0) + ' ⊕ ' + (state.x1||0) + '·' + (state.y0||0) + '<br>' +
        '<span style="color:var(--green)">P (computed)</span> = p1p0 = ' + finalP1 + '' + finalP0 + ' = ' + computedP + ' &nbsp;' + (computedP === expectedP ? '<span style="color:var(--green)">✓ matches</span>' : '<span style="color:var(--pink)">✗ expected ' + expectedP + '</span>') + '<br>' +
        '<span style="color:var(--yellow)">A (ancilla)</span> = a1a0 = ' + finalA1 + '' + finalA0 + ' &nbsp;' + (aClean ? '<span style="color:var(--green)">✓ returned to |0⟩</span>' : '<span style="color:var(--pink)">✗ not uncomputed — must be 00</span>') +
      '</div>' +
    '</div>';

  if (result.correct) {
    verdict.textContent = "🎉 CORRECT!";
    verdict.style.color = "var(--green)";
    panel.className = "panel-card result-card correct sim-glass";
    setInstruction("🎉 Circuit is correct! Product register holds the right answer.", "success");
  } else {
    verdict.textContent = "Not quite — keep trying!";
    verdict.style.color = "var(--pink)";
    panel.className = "panel-card result-card incorrect sim-glass";
  }
  panel.style.display = "block";
}

async function updateHint() {
  try {
    const response = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: inputA, b: inputB, gates: serializeGates() }),
    });
    const data = await response.json();
    const panel = document.getElementById("hint-panel");
    const content = document.getElementById("hint-content");
    if (data.found) {
      hintGate = data;
      const controls = data.controls.map((idx) => QUBITS[idx]).join(", ");
      content.innerHTML = `<div class="hint-gate">${data.type}(${controls ? `${controls}, ` : ""}${QUBITS[data.target]})</div><div class="hint-detail">Column ${data.col + 1}</div>`;
      panel.className = "panel-card hint-card sim-glass";
      panel.style.display = "block";
    } else if (gates.length > 0) {
      hintGate = null;
      content.innerHTML = `<div class="hint-gate">All reference gates present!</div><div class="hint-detail">Hit ⚡ Check to verify.</div>`;
      panel.className = "panel-card hint-card complete sim-glass";
      panel.style.display = "block";
    } else {
      hintGate = null;
      panel.style.display = "none";
    }
    renderGates();
  } catch (error) {
    console.error(error);
  }
}

async function loadSolution() {
  try {
    const response = await fetch("/api/solution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: inputA, b: inputB }),
    });
    const data = await response.json();
    gates = [];
    nextId = 0;
    data.gates.forEach((gate) => {
      gates.push({ id: nextId += 1, type: gate.type, col: gate.col, target: gate.target, controls: gate.controls });
    });
    if (data.gates.length) {
      const lastGate = data.gates[data.gates.length - 1];
      lastPlacedInsight = { gateType: lastGate.type, target: lastGate.target, controls: lastGate.controls };
      updateGateInsightPanel(lastGate.type, lastGate.target, lastGate.controls);
    }
    pendingClicks = [];
    pendingCol = null;
    onCircuitChanged();
    setInstruction("Booth reference solution loaded. Press ⚡ Check to verify!", "success");
  } catch (error) {
    console.error(error);
  }
}

function init() {
  svg = document.getElementById("circuit-svg");
  instrBar = document.getElementById("instruction");
  gateCountEl = document.getElementById("gate-count");
  if (!svg || !instrBar || !gateCountEl) return;

  gates = [];
  nextId = 0;
  activeTool = null;
  pendingClicks = [];
  pendingCol = null;
  hintVisible = false;
  hintGate = null;
  hoverEl = null;
  lastPlacedInsight = null;

  buildGrid();
  updateTarget();
  syncTargetBits();
  updateClassical();
  updateMetrics();
  renderBoothStoryPlaceholder();
  renderTracePlaceholder();
  renderTimelinePlaceholder();
  renderTruthTablePlaceholder();
  resetOutput();

  document.querySelectorAll("#a-buttons button").forEach((button) =>
    button.addEventListener("click", () => setInput("a", Number.parseInt(button.dataset.val, 10))),
  );
  document.querySelectorAll("#b-buttons button").forEach((button) =>
    button.addEventListener("click", () => setInput("b", Number.parseInt(button.dataset.val, 10))),
  );
  document.querySelectorAll(".gate-btn").forEach((button) =>
    button.addEventListener("click", () => selectTool(button.dataset.gate)),
  );
  document.querySelectorAll(".gate-btn[draggable]").forEach((button) =>
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", button.dataset.gate);
      event.dataTransfer.effectAllowed = "copy";
      selectTool(button.dataset.gate);
    }),
  );

  document.getElementById("btn-check").addEventListener("click", checkCircuit);
  document.getElementById("btn-clear").addEventListener("click", clearAll);
  document.getElementById("btn-hint").addEventListener("click", () => {
    hintVisible = !hintVisible;
    document.getElementById("btn-hint").textContent = hintVisible ? "Hide Hint" : "Show Hint";
    if (hintVisible) {
      updateHint();
    } else {
      hintGate = null;
      document.getElementById("hint-panel").style.display = "none";
      renderGates();
    }
  });
  document.getElementById("btn-solution").addEventListener("click", loadSolution);

  fetchCircuitAnalysis();
}

window.initBoothCircuit = init;
if (!window.__reactBoothSkipAutoInit) {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}

