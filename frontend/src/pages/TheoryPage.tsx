import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function FPill({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-400">📖 {label}</span>;
}
function MathBox({ expr, label, color = "#67e8f9" }: { expr: string; label?: string; color?: string }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-baseline gap-2">
      <code className="font-mono text-base font-bold whitespace-pre-wrap" style={{ color }}>{expr}</code>
      {label && <span className="text-gray-600 text-xs sm:ml-auto">{label}</span>}
    </div>
  );
}

// ─── Animations ───────────────────────────────────────────────────────────────
function SplitAnim() {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="290" height="90" viewBox="0 0 290 90">
        <motion.rect x="95" y="6" width="100" height="28" rx="7" animate={{ opacity: [1,1,0,0,1] }} transition={{ duration: 4, repeat: Infinity }} fill="none" stroke="#4b5563" strokeWidth="1.5"/>
        <motion.text x="145" y="25" textAnchor="middle" fill="#9ca3af" fontSize="11" fontFamily="monospace" animate={{ opacity: [1,1,0,0,1] }} transition={{ duration: 4, repeat: Infinity }}>N = 10 11 01</motion.text>
        {[{ x:30,c:"#22d3ee",l:"Aₖ₋₁" },{ x:115,c:"#818cf8",l:"A₁" },{ x:200,c:"#a78bfa",l:"A₀" }].map((b,i)=>(
          <g key={i}>
            <motion.rect x={b.x} y="55" width="65" height="26" rx="6" animate={{ opacity:[0,0,1,1,0], y:[72,72,55,55,72] }} transition={{ duration:4,delay:i*0.12,repeat:Infinity }} fill="none" stroke={b.c} strokeWidth="1.5"/>
            <motion.text x={b.x+32} y="72" textAnchor="middle" fill={b.c} fontSize="11" fontFamily="monospace" fontWeight="bold" animate={{ opacity:[0,0,1,1,0], y:[88,88,72,72,88] }} transition={{ duration:4,delay:i*0.12,repeat:Infinity }}>{b.l}</motion.text>
          </g>
        ))}
      </svg>
      <div className="text-center font-mono text-xs text-gray-400">A(x) = <span className="text-cyan-400">Aₖ₋₁</span>xᵏ⁻¹ + … + <span className="text-violet-400">A₀</span></div>
    </div>
  );
}

function RecurrenceAnim() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {[
        { k:"k=2 (Toom-2/Karatsuba)",e:"α = log₂(3) ≈ 1.585",c:"#22d3ee" },
        { k:"k=3 (Toom-3)",          e:"α = log₃(5) ≈ 1.465",c:"#818cf8" },
        { k:"k=4 (Toom-4)",          e:"α = log₄(7) ≈ 1.404",c:"#a78bfa" },
      ].map((r,i)=>(
        <motion.div key={i} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.1 }} className="flex items-center justify-between p-3 rounded-xl border border-gray-800 bg-black/30 font-mono text-xs">
          <span className="text-gray-500">{r.k}</span>
          <span className="font-bold" style={{ color:r.c }}>{r.e}</span>
        </motion.div>
      ))}
      <div className="text-[9px] text-gray-600 font-mono text-center">Higher k → smaller exponent → fewer Toffoli gates asymptotically</div>
    </div>
  );
}

function LagrangeAnim() {
  const steps = [
    { label:"Evaluate\nA(xᵢ)·B(xᵢ)", color:"#22d3ee" },
    { label:"Form\nVandermonde\nmatrix V", color:"#818cf8" },
    { label:"Solve V·p = c\n(bit-shifts only)", color:"#34d399" },
    { label:"Read\nP(x)", color:"#fb923c" },
  ];
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-1.5">
        {steps.map((s,i)=>(
          <motion.button key={i} onClick={()=>setStep(i)}
            animate={{ borderColor: step===i?s.color:"rgba(75,85,99,0.4)", backgroundColor: step===i?`${s.color}18`:"transparent" }}
            className="flex-1 px-1 py-2 rounded-xl border text-center font-bold text-[9px] cursor-pointer"
            style={{ color:step===i?s.color:"#6b7280" }}>
            {i+1}<br/><span className="whitespace-pre-wrap">{s.label}</span>
          </motion.button>
        ))}
      </div>
      <motion.p key={step} initial={{ opacity:0,y:5 }} animate={{ opacity:1,y:0 }} className="text-[10px] text-gray-400 leading-relaxed font-mono">
        {["Compute each P(xᵢ) = A(xᵢ) · B(xᵢ) independently — just 5 smaller multiplications instead of one large one.",
          "The Vandermonde matrix V encodes the 5 evaluation points. Its known inverse gives the interpolation formula.",
          "Matrix-vector multiply V⁻¹·[P(x₀)…P(x₄)] recovers polynomial coefficients. For points {0,±1,±2}, every entry is a power of 2 → division by 2 = free right-shift.",
          "Concatenate coefficients to reconstruct the 2n-bit product P = A × B.",
        ][step]}
      </motion.p>
    </div>
  );
}

function DepthAnim() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {[
        { label:"Schoolbook",     w:["5%","98%","98%","5%"],c:"#ef4444",note:"O(n²)" },
        { label:"Karatsuba",      w:["5%","60%","60%","5%"],c:"#f97316",note:"O(n¹·⁵⁸⁵)" },
        { label:"Toom-3",         w:["5%","45%","45%","5%"],c:"#facc15",note:"O(n¹·⁴⁶⁵)  but ÷3" },
        { label:"Toom-2.5 (ours)",w:["5%","42%","42%","5%"],c:"#34d399",note:"O(n¹·⁵⁸⁵)  no div" },
      ].map((r,i)=>(
        <div key={i} className="space-y-0.5">
          <div className="flex justify-between text-[9px] font-mono"><span className="text-gray-500">{r.label}</span><span style={{ color:r.c }}>{r.note}</span></div>
          <div className="h-3.5 bg-gray-950 rounded overflow-hidden border" style={{ borderColor:`${r.c}30` }}>
            <motion.div animate={{ width:r.w }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut" }} className="h-full" style={{ background:`linear-gradient(to right, ${r.c}aa, ${r.c})` }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function GateLayerAnim() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {[
        { g:"X",   role:"Prepare input coefficient bits before evaluation",c:"#22d3ee" },
        { g:"CCX", role:"Reversible AND → computes Aᵢ·Bᵢ into Ancilla |0⟩",c:"#ec4899" },
        { g:"CX",  role:"CNOT-copy product out of Ancilla into output |P⟩",c:"#a855f7" },
      ].map((r,i)=>(
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-800 bg-black/20">
          <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-sm font-black font-mono ring-1" style={{ background:`${r.c}18`,color:r.c,boxShadow:`0 0 0 1px ${r.c}40` }}>{r.g}</span>
          <span className="text-[10px] text-gray-400 leading-relaxed">{r.role}</span>
        </div>
      ))}
    </div>
  );
}

function AncillaAnim() {
  return (
    <svg width="280" height="90" viewBox="0 0 280 90">
      <text x="4" y="18" fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">|X⟩</text>
      <line x1="26" y1="16" x2="260" y2="16" stroke="#22d3ee" strokeWidth="1.5"/>
      <text x="4" y="44" fill="#a78bfa" fontSize="9" fontFamily="monospace" fontWeight="bold">|Y⟩</text>
      <line x1="26" y1="42" x2="260" y2="42" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="4" y="72" fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">|A⟩</text>
      <line x1="26" y1="70" x2="105" y2="70" stroke="#374151" strokeWidth="1.5"/>
      <line x1="165" y1="70" x2="260" y2="70" stroke="#fbbf24" strokeWidth="1.5"/>
      <line x1="135" y1="16" x2="135" y2="59" stroke="#ec4899" strokeWidth="1.5"/>
      <circle cx="135" cy="16" r="5" fill="#ec4899"/>
      <circle cx="135" cy="42" r="5" fill="#ec4899"/>
      <circle cx="135" cy="70" r="11" fill="none" stroke="#ec4899" strokeWidth="1.5"/>
      <line x1="124" y1="70" x2="146" y2="70" stroke="#ec4899" strokeWidth="1.5"/>
      <line x1="135" y1="59" x2="135" y2="81" stroke="#ec4899" strokeWidth="1.5"/>
      <text x="170" y="66" fill="#fbbf24" fontSize="8" fontFamily="monospace">X·Y written!</text>
      <motion.circle animate={{ cx:[26,135,135,260],cy:[42,42,70,70],opacity:[0,1,1,0] }} transition={{ duration:4,repeat:Infinity }} r="4" fill="#ec4899"/>
    </svg>
  );
}

function PebbleAnim() {
  const phases = [
    { label:"① Compute U",   color:"#22d3ee", desc:"Apply forward circuit: place CCX gates to compute A(xᵢ)·B(xᵢ) into Ancilla registers. Both input registers preserved." },
    { label:"② Extract V",   color:"#a855f7", desc:"CNOT-copy the recovered polynomial coefficients from Ancilla into the clean output register |P⟩. The ancilla still holds garbage at this point." },
    { label:"③ Uncompute U†",color:"#ec4899", desc:"Run the exact reverse gate sequence (U†). Every Ancilla qubit returns to |0⟩, erasing all garbage and breaking the entanglement with |P⟩." },
  ];
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-1.5">
        {phases.map((p,i)=>(
          <motion.button key={i} onClick={()=>setActive(i)}
            animate={{ borderColor:active===i?p.color:"rgba(75,85,99,0.4)", backgroundColor:active===i?`${p.color}18`:"transparent" }}
            className="flex-1 px-2 py-2 rounded-xl border font-bold text-[9px] cursor-pointer text-center"
            style={{ color:active===i?p.color:"#6b7280" }}>{p.label}</motion.button>
        ))}
      </div>
      <svg width="280" height="44" viewBox="0 0 280 44">
        {phases.map((_,i)=>(
          <g key={i}>
            <motion.circle cx={38+i*102} cy="22" r="16" animate={{ fill:active>=i?phases[i].color:"#1f2937" }} strokeWidth="0"/>
            <text x={38+i*102} y="26" textAnchor="middle" fill={active>=i?"#000":"#4b5563"} fontSize="11" fontWeight="bold">{i+1}</text>
            {i<2&&<motion.line x1={54+i*102} y1="22" x2={124+i*102} y2="22" animate={{ stroke:active>i?phases[i].color:"#374151" }} strokeWidth="1.5"/>}
          </g>
        ))}
      </svg>
      <motion.p key={active} initial={{ opacity:0,y:5 }} animate={{ opacity:1,y:0 }} className="text-[10px] text-gray-400 leading-relaxed">{phases[active].desc}</motion.p>
    </div>
  );
}

function ComplexityTableAnim() {
  const rows = [
    { method:"Schoolbook",toffoli:"O(n²)",qubits:"O(n²)",depth:"O(n)",note:"Baseline" },
    { method:"Karatsuba",toffoli:"O(n^1.585)",qubits:"O(n^1.585)",depth:"O(n)",note:"Prior best" },
    { method:"Toom-3",toffoli:"O(n^1.465)",qubits:"O(n^1.465)",depth:"Sub-quad",note:"+÷3 cost" },
    { method:"Toom-2.5 ✓",toffoli:"O(n^1.585)",qubits:"O(n^1.585)",depth:"Sub-quad",note:"Best trade-off" },
  ];
  return (
    <div className="overflow-auto rounded-xl border border-gray-800">
      <table className="w-full text-[10px] font-mono">
        <thead><tr className="border-b border-gray-800 text-gray-500">
          <th className="py-2 px-2 text-left">Method</th>
          <th className="py-2 px-2">Toffoli</th>
          <th className="py-2 px-2">Qubits</th>
          <th className="py-2 px-2">Notes</th>
        </tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className={`border-b border-gray-900 ${r.method.includes("✓")?"bg-green-900/10":""}`}>
              <td className={`py-2 px-2 font-bold ${r.method.includes("✓")?"text-green-400":"text-gray-400"}`}>{r.method}</td>
              <td className="py-2 px-2 text-center text-gray-400">{r.toffoli}</td>
              <td className="py-2 px-2 text-center text-gray-400">{r.qubits}</td>
              <td className={`py-2 px-2 text-center ${r.method.includes("✓")?"text-green-400":r.note==="Prior best"?"text-yellow-500/70":"text-gray-600"}`}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Sub = { id: string; title: string; math: string; mathLabel: string; body: React.ReactNode; anim?: React.ReactNode; fundLink?: string };
type Sec = { num: number; icon: string; title: string; short: string; accent: string; tags: string[]; subs: Sub[] };

// ─── Section data ─────────────────────────────────────────────────────────────
const SECS: Sec[] = [
  {
    num:1, icon:"f(x)", accent:"#22d3ee",
    title:"Classical Toom-Cook Foundation",
    short:"Understand how Toom-Cook transforms multiplication into polynomial evaluation — the mathematical bedrock before any quantum circuit is drawn.",
    tags:["Polynomial Splitting","Sample Points","Lagrange Interpolation","Recurrence"],
    subs:[
      {
        id:"1.1", title:"Polynomial Splitting & Evaluation",
        math:"A(x) = Aₖ₋₁xᵏ⁻¹ + … + A₁x + A₀\nP(xᵢ) = A(xᵢ) · B(xᵢ)  ∀ xᵢ ∈ {0,1,−1,2,−2}",
        mathLabel:"k chunks → 2k−1 sub-multiplications",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>Two n-bit integers A and B are each sliced into k equal chunks and treated as coefficients of a degree-(k−1) polynomial. Instead of multiplying A·B directly, we evaluate A(xᵢ)·B(xᵢ) at exactly <strong>2k−1 carefully chosen points</strong>.</p>
            <p>This converts one hard big-number multiplication into 2k−1 smaller, completely <em>independent</em> multiplications. For Toom-2.5 (k=2), that is 5 sub-multiplications of roughly n/2 bits each.</p>
            <div className="border border-cyan-800/30 rounded-lg p-3 font-mono text-[10px] bg-cyan-950/10">
              <div className="text-cyan-500 font-bold mb-1">Example — Toom-2.5 (k=2)</div>
              <div>A = 1011₂ → A₁ = 10, A₀ = 11</div>
              <div>{"A(x) = 2x + 3,  evaluate at x ∈ {0,1,−1,2,−2}"}</div>
            </div>
          </div>
        ),
        anim:<SplitAnim/>, fundLink:"Fundamentals → Ancilla Allocation",
      },
      {
        id:"1.2", title:"Lagrange Interpolation & Why Toom-2.5 Wins",
        math:"T(n) = (2k−1)·T(n/k) + O(n)\n→ T(n) = O(n^α)  where  α = logₖ(2k−1)",
        mathLabel:"For k=2: α = log₂(3) ≈ 1.585",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>After 5 pointwise products {"{P(xᵢ)}"} are computed, Lagrange interpolation recovers all 2k−1 = 5 polynomial coefficient of P(x). The key insight from the paper:</p>
            <p>Choosing sample points <strong>{"{0, 1, −1, 2, −2}"}</strong> ensures that every entry of the inverse Vandermonde matrix is a power of 2. Hence every division in the interpolation formula is by 2 — implementable as a <span className="text-green-400 font-bold">free right-shift</span>, costing <strong>zero Toffoli gates</strong>.</p>
            <p>Standard Toom-3 uses the point x=∞, which forces division by 3 and 6 — extremely expensive in quantum circuits.</p>
          </div>
        ),
        anim:<LagrangeAnim/>,
      },
    ],
  },
  {
    num:2, icon:"↺", accent:"#818cf8",
    title:"Complexity Analysis",
    short:"Derive the Toffoli count recurrence from the paper and compare Toom-Cook against schoolbook and Karatsuba quantum multipliers.",
    tags:["Recurrence Relation","Toffoli Count","Qubit Bound","Comparison"],
    subs:[
      {
        id:"2.1", title:"The Recurrence Relation",
        math:"T(n) = (2k−1)·T(n/k) + O(n)\nSolution:  T(n) = Θ(n^(logₖ(2k−1)))",
        mathLabel:"By the Master Theorem",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>The recursive tree for Toom-k has depth log_k(n). At each node, 2k−1 sub-problems of size n/k are spawned. The linear O(n) overhead accounts for the evaluation and interpolation arithmetic (bit-shifts).</p>
            <p>By the Master Theorem, the solution is T(n) = Θ(n^α) where α = logₖ(2k−1). The table below shows how α shrinks as k grows — but so does the constant factor and ancilla overhead.</p>
          </div>
        ),
        anim:<RecurrenceAnim/>,
      },
      {
        id:"2.2", title:"Algorithm Comparison",
        math:"Toom-2.5:  Toffoli count = O(n^1.585)  with  zero division overhead",
        mathLabel:"vs Toom-3 which also needs ÷3 circuits",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>The paper benchmarks Toom-2.5 against three previous quantum multiplier designs. The key finding: <strong>Toom-2.5 matches Karatsuba's asymptotic exponent (1.585) but with a significantly better constant factor</strong> because interpolation is completely free.</p>
            <p>Toom-3 achieves a lower exponent (1.465) but requires expensive ÷3 quantum division circuits, making its actual gate count higher for practical n (&lt; 10,000 bits).</p>
          </div>
        ),
        anim:<DepthAnim/>, fundLink:"Fundamentals → Toffoli Gate",
      },
    ],
  },
  {
    num:3, icon:"CCX", accent:"#ec4899",
    title:"The Quantum Circuit Layer",
    short:"Map the 5 scalar sub-multiplications to reversible quantum gates. Every step uses exactly the gates described in Fundamentals.",
    tags:["X Gate","CCX Toffoli","CX CNOT","Register Layout","Ancilla"],
    subs:[
      {
        id:"3.1", title:"Gate Vocabulary & Register Layout",
        math:"|X⟩ ⊗ |Y⟩ ⊗ |A=0⟩ ⊗ |P=0⟩",
        mathLabel:"4 logical registers — 2n+2n+2n+2n qubits total",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>The paper defines 4 logical registers for the Toom-Cook circuit. Every gate from Fundamentals maps to a specific role:</p>
            <div className="space-y-2">
              {[
                { g:"X",   color:"border-cyan-500/40 text-cyan-400 bg-cyan-900/10",   note:"Flip input bits in |X⟩ or |Y⟩ to set coefficient values before evaluation" },
                { g:"CCX", color:"border-pink-500/40 text-pink-400 bg-pink-900/10",   note:"Reversible AND: computes Aᵢ·Bᵢ → writes product into Ancilla |A⟩" },
                { g:"CX",  color:"border-purple-500/40 text-purple-400 bg-purple-900/10", note:"CNOT-copy: extracts result from |A⟩ into output register |P⟩" },
              ].map(r=>(
                <div key={r.g} className={`flex items-start gap-2 p-2 rounded-lg border ${r.color}`}>
                  <span className="font-mono font-black text-sm shrink-0">{r.g}</span>
                  <span className="text-[10px] leading-relaxed">{r.note}</span>
                </div>
              ))}
            </div>
          </div>
        ),
        anim:<GateLayerAnim/>, fundLink:"Fundamentals → X, CX, CCX gates",
      },
      {
        id:"3.2", title:"Ancilla Registers & Reversible Multiplication",
        math:"CCX|X⟩|Y⟩|0⟩ → |X⟩|Y⟩|X·Y⟩",
        mathLabel:"Both inputs preserved — quantum no-cloning theorem",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>Since quantum gates cannot overwrite information (no-cloning), every intermediate product must be written into a fresh Ancilla register initialised to |0⟩. The CCX gate targets the Ancilla as its third wire.</p>
            <p>Both X and Y inputs are <strong>completely unchanged</strong> by the CCX. This makes the gate trivially reversible: apply CCX again and the Ancilla returns to |0⟩ — exactly what the Uncompute phase needs.</p>
            <div className="border border-yellow-800/30 rounded-lg p-2 font-mono text-[10px] bg-yellow-950/10">
              <div className="text-yellow-400 font-bold mb-0.5">Circuit register layout (Simulator)</div>
              <div>|X⟩: Input A coefficients (2 qubits)</div>
              <div>|Y⟩: Input B coefficients (2 qubits)</div>
              <div>|A⟩: Ancilla scratch pad (2 qubits, init=0)</div>
              <div>|P⟩: Product output (2 qubits)</div>
            </div>
          </div>
        ),
        anim:<AncillaAnim/>, fundLink:"Fundamentals → Ancilla Allocation",
      },
    ],
  },
  {
    num:4, icon:"U†", accent:"#34d399",
    title:"Reversible Pebble Game",
    short:"The paper's central technique: a 3-phase Compute–Extract–Uncompute protocol that recycles Ancilla qubits and prevents garbage entanglement.",
    tags:["Pebble Game","Uncomputation","U†","Entanglement","Qubit Recycling"],
    subs:[
      {
        id:"4.1", title:"Why Uncomputation Is Mandatory",
        math:"|ϕ⟩ = Σᵢ αᵢ |garbageᵢ⟩|productᵢ⟩",
        mathLabel:"Garbage entangled with product → random collapse on measurement",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>After Phase 1 (Compute), the Ancilla registers hold intermediate garbage values — the residual footprints of each CCX evaluation. These garbage bits are quantum-mechanically <strong>entangled</strong> with the product register.</p>
            <p>If we measure the product now, the entanglement forces a random collapse across all (garbage, product) pairs, producing incorrect results. The only remedy is to <strong>erase all garbage via uncomputation</strong> before reading |P⟩.</p>
            <p>The paper proves that qubit recycling via the pebble game keeps total ancilla overhead at O(n^1.585) — the same order as the Toffoli count, making the design practical.</p>
          </div>
        ),
        fundLink:"Fundamentals → Entanglement & Garbage",
      },
      {
        id:"4.2", title:"The 3-Phase Pebble Protocol",
        math:"U → V → U†\nCompute · Extract · Uncompute",
        mathLabel:"Bennett 1989 — applied to Toom-Cook recursion tree",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>Click each phase to understand what happens at the circuit level:</p>
            <div className="space-y-1.5 text-[10px] font-mono border border-gray-800 rounded-lg p-3 bg-black/30">
              <div><span className="text-cyan-400 font-bold">Phase U:</span>   Place CCX gates top-to-bottom to fill Ancilla</div>
              <div><span className="text-purple-400 font-bold">Phase V:</span>   CX-copy Ancilla result into output register |P⟩</div>
              <div><span className="text-pink-400 font-bold">Phase U†:</span>  Place CCX gates bottom-to-top (reverse order) to zero Ancilla</div>
            </div>
          </div>
        ),
        anim:<PebbleAnim/>, fundLink:"Fundamentals → The Pebble Game",
      },
    ],
  },
  {
    num:5, icon:"∑", accent:"#fb923c",
    title:"Results & Comparison",
    short:"Asymptotic bounds from the paper and how this Toom-Cook implementation compares to prior quantum multiplier designs.",
    tags:["T-count","Qubit Bound","Schoolbook vs Karatsuba","Toom-2.5 Advantage"],
    subs:[
      {
        id:"5.1", title:"Asymptotic Bounds (from the Paper)",
        math:"Toffoli count:  O(n^1.585)\nQubit count:    O(n^1.585)\nInterpolation:  O(n)  [bit-shifts only]",
        mathLabel:"All bounds match Karatsuba but with smaller constants",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>The paper's Theorem 1 establishes that the Toom-2.5 quantum circuit achieves <strong>sub-quadratic Toffoli count O(n^1.585)</strong>, matching the Karatsuba bound. However, because the interpolation stage requires no extra Toffoli gates (only free bit-shifts), the <em>hidden constant</em> in the O() notation is significantly smaller.</p>
            <p>The qubit count is also O(n^1.585) when the reversible pebble game is applied — ancilla registers are re-used across recursion levels rather than allocated fresh at each level.</p>
          </div>
        ),
        anim:<ComplexityTableAnim/>,
      },
      {
        id:"5.2", title:"Connection Back to the Simulator",
        math:"CCX count  =  primary optimisation target\nAncilla final state |0⟩  =  correctness check",
        mathLabel:"Both verified live in the Simulation metrics panel",
        body:(
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>Every theoretical concept from the paper maps directly to a measurable quantity in the Simulator:</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              {[
                { p:"Toffoli count O(n^1.585)",s:"Metrics: CCX count"},
                { p:"Ancilla must end at |0⟩",s:"Check Circuit: Ancilla warning"},
                { p:"Phase U (compute)",s:"Top-half gate placements"},
                { p:"Phase U† (uncompute)",s:"Bottom-half reverse gates"},
                { p:"Phase V (extract)",s:"CNOT rows to |P⟩ register"},
                { p:"Toom-2.5 sample pts",s:"5 rows in circuit grid"},
              ].map((r,i)=>(
                <div key={i} className="border border-gray-800 rounded-lg p-2 bg-black/20">
                  <div className="text-gray-500 mb-0.5">{r.p}</div>
                  <div className="text-orange-400 font-bold">{r.s}</div>
                </div>
              ))}
            </div>
          </div>
        ),
        fundLink:"Fundamentals → The Pebble Game",
      },
    ],
  },
];

// ─── Card ─────────────────────────────────────────────────────────────────────
function SecCard({ s, onClick }: { s: Sec; onClick: () => void }) {
  return (
    <motion.button onClick={onClick}
      whileHover={{ y:-4, scale:1.02 }} whileTap={{ scale:0.97 }}
      transition={{ type:"spring", stiffness:200, damping:22 }}
      className="w-full text-left p-6 rounded-2xl bg-[#0a0a1a]/90 border border-gray-800 transition-all duration-300 group cursor-pointer shadow-xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex shrink-0 items-center justify-center w-14 h-14 rounded-xl font-black text-lg ring-1"
          style={{ background:`${s.accent}15`, color:s.accent, boxShadow:`0 0 0 1px ${s.accent}40` }}>{s.icon}</div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5" style={{ color:s.accent }}>Section {s.num}</div>
          <div className="text-base font-extrabold text-white leading-tight">{s.title}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">{s.subs.length} subsections</div>
        </div>
        <div className="ml-auto text-gray-700 group-hover:text-gray-300 group-hover:translate-x-1 transition-all text-lg">→</div>
      </div>
      <p className="text-gray-600 text-[11px] leading-relaxed mb-4">{s.short}</p>
      <div className="flex flex-wrap gap-1.5">
        {s.tags.map(t=>(
          <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono" style={{ borderColor:`${s.accent}40`, color:s.accent, background:`${s.accent}0d` }}>{t}</span>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────────
function SecDetail({ s, onBack }: { s: Sec; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:40 }} transition={{ type:"spring", stiffness:150, damping:22 }} className="pt-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium mb-10 transition group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to all sections
      </button>
      <div className="flex items-center gap-5 mb-12">
        <div className="flex shrink-0 items-center justify-center w-20 h-20 rounded-2xl font-black text-3xl ring-1"
          style={{ background:`${s.accent}15`, color:s.accent, boxShadow:`0 0 0 1px ${s.accent}40` }}>{s.icon}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60" style={{ color:s.accent }}>Section {s.num}</div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">{s.title}</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-lg">{s.short}</p>
        </div>
      </div>
      <div className="space-y-10">
        {s.subs.map((sub,idx)=>(
          <motion.div key={sub.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:idx*0.12 }}
            className="bg-[#0a0a1a]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-5 border-b border-gray-800/60 pb-4">
              <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-base ring-1"
                style={{ background:`${s.accent}12`, color:s.accent, boxShadow:`0 0 0 1px ${s.accent}40` }}>{sub.id}</span>
              <h3 className="text-xl font-bold text-white">{sub.title}</h3>
            </div>
            <MathBox expr={sub.math} label={sub.mathLabel} color={s.accent} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-5">
              <div>{sub.body}</div>
              {sub.anim && (
                <div className="bg-black/50 border border-gray-800 rounded-2xl p-5 flex items-center justify-center min-h-[140px]">{sub.anim}</div>
              )}
            </div>
            {sub.fundLink && (
              <div className="pt-4 border-t border-gray-800/50 flex items-center gap-3">
                <FPill label={sub.fundLink}/>
                <span className="text-gray-600 text-xs">→ Open Fundamentals page to review this concept.</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type TheoryPageProps = {
  embedded?: boolean;
};

export function TheoryPage({ embedded = false }: TheoryPageProps) {
  const [selected, setSelected] = useState<Sec | null>(null);
  return (
    <div className={`bg-[#050510] text-gray-200 font-sans relative selection:bg-cyan-500/30 w-full ${embedded ? "min-h-full" : "min-h-screen"}`}>
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-cyan-900/8 to-transparent pointer-events-none z-0"/>
      <div className={`max-w-6xl mx-auto relative z-10 px-6 sm:px-10 lg:px-12 ${embedded ? "pt-36 sm:pt-40 pb-20" : "pt-28 pb-24"}`}>
        <AnimatePresence mode="wait">
          {selected ? (
            <SecDetail key={selected.num} s={selected} onBack={()=>setSelected(null)}/>
          ) : (
            <motion.div key="grid" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {/* Header */}
              <div className="mb-10 text-center max-w-3xl mx-auto">
                <div className="inline-block px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold tracking-[0.2em] text-xs uppercase mb-5">Toom-Cook Algorithm</div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-400 pb-3">Algorithm Theory</h1>
                <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto font-light leading-relaxed">
                  Click any section card to explore its subsections, math formulations, and interactive animations.
                </p>
              </div>

              {/* Paper reference */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }} className="mb-12 mx-auto max-w-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-[#0a0a1a] border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
                  <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xl">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-1">Research Paper</div>
                    <div className="text-sm font-bold text-white leading-tight mb-0.5">Quantum Circuits for Toom-Cook Multiplication</div>
                    <div className="text-[10px] text-gray-500 font-mono">Dutta · Bhattacharjee · Chattopadhyay · Phys. Rev. A 98, 012311 (2018) · arXiv:1805.02342</div>
                  </div>
                  <a href="https://arxiv.org/pdf/1805.02342" target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/60 transition-all duration-200 group">
                    Read Paper <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                  </a>
                </div>
              </motion.div>

              {/* Grid */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
                  {SECS.map((s,i)=>(
                    <motion.div key={s.num} initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2+i*0.09 }}>
                      <SecCard s={s} onClick={()=>setSelected(s)}/>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-12 max-w-3xl mx-auto flex items-center gap-2">
                {SECS.map(s=>(
                  <div key={s.num} className="flex-1 h-0.5 rounded-full" style={{ background:`linear-gradient(to right, ${s.accent}60, ${s.accent}20)` }}/>
                ))}
              </div>
              <div className="max-w-3xl mx-auto flex justify-between mt-2">
                <span className="text-xs text-gray-700 font-mono">Fundamentals →</span>
                <span className="text-xs text-gray-700 font-mono">→ Simulation</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
