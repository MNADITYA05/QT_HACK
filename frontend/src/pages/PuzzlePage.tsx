import { motion } from "framer-motion";
import { useState, useEffect, type CSSProperties } from "react";
import { SimulatorCircuitBackground } from "@/components/simulator-circuit-background";
import { SOP_INNER_HTML } from "./sop-html";
import { TheoryPage } from "./TheoryPage";
import { FundamentalsPage } from "./FundamentalsPage";

const spring = { type: "spring" as const, stiffness: 95, damping: 20, mass: 0.85 };

/* ── Pipeline phase metadata ─────────────────────────────────────────────── */
const PHASES = [
  { key: "U", label: "Compute", icon: "⟩U⟩", color: "#22d3ee", desc: "Place CCX gates to compute A(xᵢ)·B(xᵢ) into Ancilla registers" },
  { key: "V", label: "Extract", icon: "⟩V⟩", color: "#a855f7", desc: "CNOT-copy recovered product from Ancilla into output |P⟩" },
  { key: "U†", label: "Uncompute", icon: "⟩U†⟩", color: "#ec4899", desc: "Reverse gate sequence to return all Ancilla qubits to |0⟩" },
];

export function PuzzlePage() {
  const [activeModule, setActiveModule] = useState<'fundamentals' | 'simulator' | 'shift_add' | 'karatsuba'>('fundamentals');
  const [activeTab, setActiveTab] = useState<'theory' | 'simulation'>('theory');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (activeModule === 'simulator' && activeTab === 'simulation') {
      document.body.classList.add("puzzle-sim-body");
    } else {
      document.body.classList.remove("puzzle-sim-body");
    }
    return () => document.body.classList.remove("puzzle-sim-body");
  }, [activeModule, activeTab]);

  useEffect(() => {
    let cancelled = false;
    function loadScript(src: string) {
      return new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(s);
      });
    }
    void (async () => {
      try {
        await loadScript("/static/js/circuit.js");
        if (cancelled) return;
        window.initBoothCircuit?.();
        await loadScript("/static/js/tutorial.js");
        if (cancelled) return;
        window.initBoothTutorial?.();
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex bg-[#050510] min-h-screen overflow-hidden">
      {/* Global Sidebar */}
      <aside className={`bg-[#0a0a16] border-r border-[#1a1a2e] flex flex-col z-[200] shrink-0 h-screen overflow-y-auto shadow-2xl transition-all duration-300 ${isSidebarCollapsed ? 'w-20 items-center' : 'w-64'}`}>
        <div className={`p-4 border-b border-[#1a1a2e] flex items-center h-[76px] ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
              className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wide whitespace-nowrap overflow-hidden"
            >
              QUANTUM ALGOS
            </motion.h2>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors flex-shrink-0" title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isSidebarCollapsed ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        <nav className={`flex-1 p-3 space-y-3 mt-2 overflow-hidden w-full ${isSidebarCollapsed ? 'flex flex-col items-center px-2' : ''}`}>
          {!isSidebarCollapsed && <div className="px-2 pb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest whitespace-nowrap transition-opacity duration-300">Learning Path</div>}

          <button onClick={() => setActiveModule('fundamentals')} className={`w-full text-left py-3 rounded-xl transition-all duration-200 font-bold relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 aspect-square' : 'px-4 gap-3 text-sm'} ${activeModule === 'fundamentals' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : 'border border-transparent text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`} title="Fundamentals">
            {activeModule === 'fundamentals' && !isSidebarCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)] rounded-r-lg" />}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${activeModule === 'fundamentals' ? 'bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-gray-800'}`}>📖</span>
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Fundamentals</span>}
          </button>

          {!isSidebarCollapsed && <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-t border-[#1a1a2e] whitespace-nowrap transition-opacity duration-300">Algorithm Library</div>}
          {isSidebarCollapsed && <div className="w-8 h-px bg-[#1a1a2e] my-3"></div>}

          <button onClick={() => setActiveModule('shift_add')} className={`w-full text-left py-3 rounded-xl transition-all duration-200 font-bold relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 aspect-square' : 'px-4 gap-3 text-sm'} ${activeModule === 'shift_add' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]' : 'border border-transparent text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`} title="Shift and Add Array">
            {activeModule === 'shift_add' && !isSidebarCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)] rounded-r-lg" />}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${activeModule === 'shift_add' ? 'bg-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-gray-800'}`}>1</span> 
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Shift and Add Array</span>}
          </button>

          <button onClick={() => setActiveModule('simulator')} className={`w-full text-left py-3 rounded-xl transition-all duration-200 font-bold relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 aspect-square' : 'px-4 gap-3 text-sm'} ${activeModule === 'simulator' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]' : 'border border-transparent text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`} title="Toom-Cook">
            {activeModule === 'simulator' && !isSidebarCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-r-lg" />}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${activeModule === 'simulator' ? 'bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-gray-800'}`}>2</span>
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Toom-Cook</span>}
          </button>

          <button onClick={() => setActiveModule('karatsuba')} className={`w-full text-left py-3 rounded-xl transition-all duration-200 font-bold relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 aspect-square' : 'px-4 gap-3 text-sm'} ${activeModule === 'karatsuba' ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'border border-transparent text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`} title="Karatsuba">
            {activeModule === 'karatsuba' && !isSidebarCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)] rounded-r-lg" />}
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${activeModule === 'karatsuba' ? 'bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-800'}`}>3</span> 
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Karatsuba</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto overflow-x-hidden w-full min-w-0">

        {/* Fundamentals View */}
        {activeModule === 'fundamentals' && (
          <div className="w-full min-h-full">
            <FundamentalsPage embedded />
          </div>
        )}

        {/* Coming Soon Views */}
        {(activeModule === 'shift_add' || activeModule === 'karatsuba') && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <div className="mx-auto w-24 h-24 mb-6 rounded-3xl bg-gradient-to-tr from-gray-800 flex items-center justify-center shadow-2xl ring-1" style={{ borderColor: activeModule === 'shift_add' ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)' }}>
                <span className="text-4xl">🚧</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text tracking-tight mb-4 pb-2" style={{ backgroundImage: activeModule === 'shift_add' ? 'linear-gradient(to right, #f97316, #fcd34d)' : 'linear-gradient(to right, #22c55e, #86efac)' }}>
                {activeModule === 'shift_add' ? 'Shift and Add Array' : 'Karatsuba'}
              </h1>
              <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
                <span className="font-bold text-white uppercase tracking-widest text-sm mb-2 block">Coming Soon</span>
                We are still building the quantum circuit simulator for this multiplication algorithm. Check back later!
              </p>
            </motion.div>
          </div>
        )}

        {/* Toom-Cook View */}
        <div style={{ display: activeModule === 'simulator' ? 'block' : 'none' }}>
          {/* Main Top Header for the entire Toom Cook Module */}
          <div className="sticky top-0 z-[200] flex justify-center w-full py-4 bg-[#050510]/90 backdrop-blur-xl border-b border-[#1a1a2e]">
            <div className="flex bg-[#0a0a16] shadow-xl p-1.5 rounded-2xl border border-[#1a1a2e]">
              <button onClick={() => setActiveTab('theory')} className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'theory' ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white'}`}>Theory</button>
              <button onClick={() => setActiveTab('simulation')} className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'simulation' ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white'}`}>Simulation</button>
            </div>
          </div>

          {/* Theory DOM (Hidden when inactive) */}
          <div style={{ display: activeTab === 'theory' ? 'block' : 'none' }} className="w-full min-h-full">
            <TheoryPage embedded />
          </div>

          {/* Simulation DOM (Hidden when inactive, but always mounted!) */}
          <div style={{ display: activeTab === 'simulation' ? 'block' : 'none', minHeight: '100vh' }}>
            <SimulatorCircuitBackground />
            <div className="relative z-[1] min-h-screen">
              <motion.header
                className="sim-top-bar"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.05 }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <motion.a href="/" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    ← Landing
                  </motion.a>
                </div>
                <span className="sim-badge">Toom-Cook simulator &middot; Reversible Polynomial Multiplication</span>
              </motion.header>

              <div className="tutorial-overlay" id="tutorial-overlay">
                <div className="tutorial-backdrop" id="tutorial-backdrop" />
                <div className="tutorial-modal" id="tutorial-modal">
                  <div className="tutorial-header">
                    <div className="tutorial-step-indicator" id="tutorial-step-indicator" />
                    <button type="button" className="tutorial-close" id="tutorial-close">
                      &times;
                    </button>
                  </div>
                  <div className="tutorial-icon" id="tutorial-icon" />
                  <h2 className="tutorial-title" id="tutorial-title" />
                  <p className="tutorial-body" id="tutorial-body" />
                  <div className="tutorial-detail" id="tutorial-detail" />
                  <div className="tutorial-footer">
                    <button type="button" className="tutorial-btn tutorial-btn-secondary" id="tutorial-prev">
                      &larr; Back
                    </button>
                    <button type="button" className="tutorial-btn tutorial-btn-skip" id="tutorial-skip">
                      Skip Tour
                    </button>
                    <button type="button" className="tutorial-btn tutorial-btn-primary" id="tutorial-next">
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </div>

              <div className="sop-panel" id="sop-panel">
                <div className="sop-panel-header">
                  <h3>Standard Operating Procedure</h3>
                  <button type="button" className="sop-panel-close" id="sop-panel-close">
                    &times;
                  </button>
                </div>
                <div
                  className="sop-panel-content"
                  dangerouslySetInnerHTML={{ __html: SOP_INNER_HTML }}
                />
              </div>

              <div className="app-layout">
                {/* ═══════════ LEFT PANEL ═══════════ */}
                <motion.aside
                  className="left-panel sim-glass"
                  id="left-panel"
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.06 }}
                >
                  <div className="panel-brand">
                    <h1>&lang; Quantum Toom-Cook Simulator &rang;</h1>
                    <p id="subtitle">Polynomial Evaluation &amp; Reversible Multiplication</p>
                  </div>

                  {/* ── Inputs ── */}
                  <div className="panel-section">
                    <div className="section-label">INPUTS</div>
                    <div className="input-row">
                      <span className="input-label" style={{ color: "var(--cyan)" }}>
                        A
                      </span>
                      <div className="bit-buttons" id="a-buttons">
                        <button type="button" data-val="-2">
                          -2
                        </button>
                        <button type="button" data-val="-1">
                          -1
                        </button>
                        <button type="button" data-val="0">
                          0
                        </button>
                        <button type="button" data-val="1" className="selected">
                          1
                        </button>
                      </div>
                    </div>
                    <div className="input-row">
                      <span className="input-label" style={{ color: "var(--purple)" }}>
                        B
                      </span>
                      <div className="bit-buttons" id="b-buttons">
                        <button type="button" data-val="-2">
                          -2
                        </button>
                        <button type="button" data-val="-1">
                          -1
                        </button>
                        <button type="button" data-val="0">
                          0
                        </button>
                        <button type="button" data-val="1" className="selected">
                          1
                        </button>
                      </div>
                    </div>
                    <div className="input-help">
                      Only four values appear because this simulator uses <strong>2-bit signed numbers</strong>: <code>10 = -2</code>, <code>11 = -1</code>, <code>00 = 0</code>, <code>01 = 1</code>.
                    </div>
                  </div>

                  {/* ── Gate Palette ── */}
                  <div className="panel-section">
                    <div className="section-label">GATE PALETTE</div>
                    <div className="gate-palette" id="gate-palette">
                      <button
                        type="button"
                        className="gate-btn"
                        data-gate="X"
                        draggable
                        style={{ "--gate-color": "var(--cyan)" } as CSSProperties}
                      >
                        X<span className="gate-desc">Pauli-X</span>
                      </button>
                      <button
                        type="button"
                        className="gate-btn"
                        data-gate="CX"
                        draggable
                        style={{ "--gate-color": "var(--purple)" } as CSSProperties}
                      >
                        CX<span className="gate-desc">CNOT</span>
                      </button>
                      <button
                        type="button"
                        className="gate-btn"
                        data-gate="CCX"
                        draggable
                        style={{ "--gate-color": "var(--pink)" } as CSSProperties}
                      >
                        CCX<span className="gate-desc">Toffoli</span>
                      </button>
                      <button
                        type="button"
                        className="gate-btn"
                        data-gate="SWAP"
                        draggable
                        style={{ "--gate-color": "var(--text-light)" } as CSSProperties}
                      >
                        SWAP<span className="gate-desc">Swap</span>
                      </button>
                      <button
                        type="button"
                        className="gate-btn eraser-btn"
                        data-gate="eraser"
                        style={{ "--gate-color": "var(--orange)" } as CSSProperties}
                      >
                        &times;<span className="gate-desc">Eraser</span>
                      </button>
                    </div>
                  </div>

                  <div className="panel-footer-btns">
                    <button type="button" className="header-btn" id="btn-tour">
                      &#9654; Tour
                    </button>
                    <button type="button" className="header-btn" id="btn-sop">
                      &#128203; SOP
                    </button>
                  </div>
                </motion.aside>

                {/* ═══════════ CENTER AREA ═══════════ */}
                <motion.main
                  className="center-area"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.1 }}
                >
                  {/* Pipeline Stage Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', marginBottom: '8px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(168,85,247,0.06) 50%, rgba(236,72,153,0.06) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {PHASES.map((ph, i) => (
                      <div key={ph.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '6px',
                          background: `${ph.color}20`, border: `1px solid ${ph.color}50`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 900, color: ph.color, fontFamily: 'monospace',
                        }}>{ph.key}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: ph.color }}>{ph.label}</div>
                          <div style={{ fontSize: '8px', color: '#6b7280', lineHeight: 1.2 }}>{ph.desc}</div>
                        </div>
                        {i < PHASES.length - 1 && (
                          <span style={{ color: '#374151', fontSize: '10px', margin: '0 2px' }}>→</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="instruction-bar" id="instruction">
                    Select a gate from the palette, then click on the grid to place it. Click existing gates to
                    delete.
                  </div>

                  <motion.div
                    className="circuit-container sim-glass"
                    id="circuit-container"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...spring, delay: 0.12 }}
                  >
                    <div className="circuit-header">
                      <span>Toom-Cook Circuit Grid</span>
                      <span id="gate-count">0 gates placed</span>
                    </div>
                    <div className="circuit-scroll">
                      <svg id="circuit-svg" xmlns="http://www.w3.org/2000/svg" />
                    </div>
                    <div className="circuit-legend">
                      <div className="legend-item">
                        <span className="legend-dot" style={{ background: "var(--cyan)" }} />
                        X (Input A)
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ background: "var(--purple)" }} />
                        Y (Input B)
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ background: "var(--yellow)" }} />
                        A (Ancilla)
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ background: "var(--green)" }} />
                        P (Product)
                      </div>
                    </div>
                  </motion.div>

                  <div className="output-cards">
                    <div className="panel-card result-card sim-glass" id="result-panel" style={{ display: "none" }}>
                      <div className="card-title">SIMULATION RESULT</div>
                      <div id="result-content" />
                      <div id="result-verdict" className="result-verdict" />
                    </div>
                    <div className="panel-card hint-card sim-glass" id="hint-panel" style={{ display: "none" }}>
                      <div className="card-title">NEXT GATE NEEDED</div>
                      <div id="hint-content" />
                    </div>
                  </div>

                  <div className="truth-table-container sim-glass" id="truth-table-panel">
                    <div className="card-title">TRUTH TABLE</div>
                    <div id="truth-table-content" className="classical-content">
                      <div style={{ opacity: 0.5 }}>The live truth table will appear here as you build the circuit.</div>
                    </div>
                  </div>

                </motion.main>

                {/* ═══════════ RIGHT PANEL ═══════════ */}
                <motion.aside
                  className="right-panel sim-glass"
                  id="right-panel"
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.14 }}
                >
                  <div className="panel-section">
                    <div className="section-label">TARGET</div>
                    <div className="target-display">
                      <span id="target-decimal" className="target-big">
                        1 &times; 1 = 1
                      </span>
                      <span id="target-binary" className="target-small">
                        2-bit signed bits: A=01 | B=01 | target P=0001
                      </span>
                    </div>
                  </div>

                  <div className="panel-section">
                    <div className="section-label" style={{ color: 'var(--pink)' }}>ANSWER SO FAR</div>
                    <div className="target-display" style={{ borderColor: 'rgba(255,45,111,0.3)', background: 'rgba(255,45,111,0.05)' }}>
                      <span id="out-decimal" className="target-big" style={{ color: 'var(--pink)' }}>P = ?</span>
                      <span id="out-binary" className="target-small" style={{ color: 'var(--text-mid)' }}>Place gates to see output</span>
                    </div>
                  </div>

                  <div className="panel-section">
                    <div className="section-label">CONTROLS</div>
                    <button type="button" className="btn-check" id="btn-check">
                      &zwnj;&#9889; Check Circuit
                    </button>
                    <div className="btn-row">
                      <button type="button" className="btn-action btn-clear" id="btn-clear">
                        Clear All
                      </button>
                      <button type="button" className="btn-action btn-hint" id="btn-hint">
                        Show Hint
                      </button>
                    </div>
                    <button type="button" className="btn-solution" id="btn-solution">
                      Load Solution
                    </button>
                  </div>

                  <div className="panel-section">
                    <div className="section-label">CIRCUIT METRICS</div>
                    <div className="metrics-grid">
                      <span className="metric-label">Toffoli (CCX)</span>
                      <span className="metric-value" id="m-ccx" style={{ color: "var(--pink)" }}>
                        0
                      </span>
                      <span className="metric-label">CNOT (CX)</span>
                      <span className="metric-value" id="m-cx" style={{ color: "var(--purple)" }}>
                        0
                      </span>
                      <span className="metric-label">Pauli-X</span>
                      <span className="metric-value" id="m-x" style={{ color: "var(--cyan)" }}>
                        0
                      </span>
                      <span className="metric-label">Total gates</span>
                      <span className="metric-value" id="m-total">
                        0
                      </span>
                    </div>

                    {/* Paper Comparison */}
                    <div style={{
                      marginTop: '10px', paddingTop: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '8px', letterSpacing: '1px', color: '#fb923c', marginBottom: '6px', fontWeight: 700 }}>
                        PAPER OPTIMAL BOUNDS
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {[
                          { label: "Toffoli", value: "O(n¹·⁵⁸⁵)", color: "#ec4899" },
                          { label: "Qubits", value: "O(n¹·⁵⁸⁵)", color: "#a855f7" },
                          { label: "Interp.", value: "Free shifts", color: "#34d399" },
                          { label: "Depth", value: "Sub-quad", color: "#22d3ee" },
                        ].map(m => (
                          <div key={m.label} style={{
                            padding: '4px 6px', borderRadius: '6px',
                            border: `1px solid ${m.color}20`,
                            background: `${m.color}08`,
                            fontFamily: 'monospace', fontSize: '9px',
                          }}>
                            <div style={{ color: '#6b7280', fontSize: '7px', fontWeight: 700, marginBottom: '1px' }}>{m.label}</div>
                            <div style={{ color: m.color, fontWeight: 700 }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div id="opt-metrics" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'none' }}>
                      <div style={{ fontSize: '8px', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '4px' }}>OPTIMIZED (TRANSPILED)</div>
                      <div className="metrics-grid">
                        <span className="metric-label">CX gates</span>
                        <span className="metric-value" id="m-opt-cx" style={{ color: 'var(--purple)' }}>0</span>
                        <span className="metric-label">Circuit depth</span>
                        <span className="metric-value" id="m-opt-depth" style={{ color: 'var(--yellow)' }}>0</span>
                        <span className="metric-label">Total (opt)</span>
                        <span className="metric-value" id="m-opt-total" style={{ color: 'var(--green)' }}>0</span>
                      </div>
                    </div>
                  </div>
                </motion.aside>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
