/* tutorial.js - Guided Tour & SOP panel for Booth Multiplier */
const STEPS = [
  {
    icon: "01",
    title: "Welcome to the Booth Multiplier!",
    body: "You'll build a reversible circuit that multiplies two 2-bit signed numbers using Booth's algorithm.",
    detail: "In plain language: the circuit reads B and decides where the answer should add A, subtract A, or stay unchanged.",
    highlight: null,
  },
  {
    icon: "02",
    title: "Choose Your Inputs",
    body: "Pick signed values for A and B from -2 to 1. The circuit grid and story panels update automatically.",
    detail: "Only four values appear because this simulator uses 2-bit signed numbers: -2, -1, 0, and 1. Start with A=1, B=1 first.",
    highlight: "#left-panel",
  },
  {
    icon: "03",
    title: "Gate Palette",
    body: "Use X, CX, and CCX to build the reference Booth flow on the circuit grid.",
    detail: "For multi-qubit gates, every click must stay in the same column.",
    highlight: "#gate-palette",
  },
  {
    icon: "04",
    title: "The Circuit Grid",
    body: "Each row is a wire and each column is a time step. Place gates on the colored A, B, P, E, and C registers.",
    detail: "A is the first number, B is the second number, P holds the answer, E stores temporary decision notes, and C stores temporary carry.",
    highlight: "#circuit-container",
  },
  {
    icon: "05",
    title: "Build Order",
    body: "If you want to understand why the circuit is built in this exact order, open the SOP panel.",
    detail: "The SOP now explains which phase depends on which earlier phase, and why this reference circuit cannot clean or reorder those steps arbitrarily.",
    highlight: "#btn-sop",
  },
  {
    icon: "06",
    title: "What Just Happened",
    body: "After every placement, the explanation panel tells you what changed and why that row and column make sense.",
    detail: "This is the main beginner view for understanding why a gate belongs in a specific place.",
    highlight: "#right-panel",
  },
  {
    icon: "07",
    title: "Answer Graph + Truth Table",
    body: "The answer graph shows how P changes over time, and the truth table at the bottom shows the current circuit outputs.",
    detail: "Use the graph to spot where the answer jumps and the table to confirm the final register values.",
    highlight: "#truth-table-panel",
  },
  {
    icon: "08",
    title: "Hint System",
    body: "Click Show Hint to highlight the next missing gate from the reference solution.",
    detail: "The hint panel shows the gate type, the qubits involved, and the target column.",
    highlight: "#hint-panel",
  },
  {
    icon: "09",
    title: "Check And Verify",
    body: "Click Check Circuit to verify the result. P must match A x B, A and B must stay intact, and E/C must be cleaned back to 0.",
    detail: "That is how the simulator verifies behavior, not just gate shape.",
    highlight: "#btn-check",
  },
  {
    icon: "10",
    title: "Ready to Build!",
    body: "Start simple, use the gate explanation after every placement, and load the reference solution when you want to inspect the full flow.",
    detail: "Use the SOP panel whenever you need the mentor-facing explanation of how the reference circuit is built and checked.",
    highlight: null,
  },
];

let step = 0;
let overlayEl;
let closeEl;
let prevEl;
let nextEl;
let skipEl;
let indicatorEl;
let titleEl;
let bodyEl;
let detailEl;
let iconEl;

function initTutorial() {
  overlayEl = document.getElementById("tutorial-overlay");
  closeEl = document.getElementById("tutorial-close");
  prevEl = document.getElementById("tutorial-prev");
  nextEl = document.getElementById("tutorial-next");
  skipEl = document.getElementById("tutorial-skip");
  indicatorEl = document.getElementById("tutorial-step-indicator");
  titleEl = document.getElementById("tutorial-title");
  bodyEl = document.getElementById("tutorial-body");
  detailEl = document.getElementById("tutorial-detail");
  iconEl = document.getElementById("tutorial-icon");

  closeEl.addEventListener("click", closeTour);
  skipEl.addEventListener("click", closeTour);
  prevEl.addEventListener("click", () => {
    if (step > 0) {
      step -= 1;
      showStep();
    }
  });
  nextEl.addEventListener("click", () => {
    if (step < STEPS.length - 1) {
      step += 1;
      showStep();
    } else {
      closeTour();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlayEl.classList.contains("active")) {
      closeTour();
    }
  });
  document.getElementById("btn-tour").addEventListener("click", openTour);
  document.getElementById("btn-sop").addEventListener("click", toggleSOP);
  document.getElementById("sop-panel-close").addEventListener("click", () => {
    document.getElementById("sop-panel").classList.remove("open");
  });

  if (!localStorage.getItem("booth-tour-done")) {
    setTimeout(openTour, 600);
  }
}

function openTour() {
  step = 0;
  overlayEl.classList.add("active");
  showStep();
}

function closeTour() {
  overlayEl.classList.remove("active");
  clearHighlight();
  localStorage.setItem("booth-tour-done", "1");
}

function showStep() {
  const current = STEPS[step];
  iconEl.textContent = current.icon;
  titleEl.textContent = current.title;
  bodyEl.textContent = current.body;
  detailEl.textContent = current.detail || "";
  prevEl.style.visibility = step === 0 ? "hidden" : "visible";
  nextEl.textContent = step === STEPS.length - 1 ? "Finish" : "Next";
  indicatorEl.innerHTML = STEPS.map((_, index) => `<span class="dot${index === step ? " active" : ""}"></span>`).join("");

  clearHighlight();
  if (current.highlight) {
    const element = document.querySelector(current.highlight);
    if (element) {
      element.classList.add("tutorial-highlight");
    }
  }
}

function clearHighlight() {
  document.querySelectorAll(".tutorial-highlight").forEach((element) => {
    element.classList.remove("tutorial-highlight");
  });
}

function toggleSOP() {
  document.getElementById("sop-panel").classList.toggle("open");
}

window.initBoothTutorial = initTutorial;
if (!window.__reactBoothSkipAutoInit) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTutorial);
  } else {
    initTutorial();
  }
}
