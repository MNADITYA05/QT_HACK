import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

function Accordion({
  title,
  content,
  accent,
  defaultExpanded = false,
}: {
  title: string;
  content: string;
  accent: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div
      className="rounded-3xl border p-6 transition-colors"
      style={{
        borderColor: expanded ? `${accent}44` : "#1f2937",
        background: expanded ? `${accent}0a` : "#0a0a1a",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: expanded ? accent : "#9ca3af" }}
        >
          {title}
        </h3>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ChevronDown size={18} color={expanded ? accent : "#9ca3af"} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <p className="text-base leading-relaxed text-gray-300">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ConceptGroup =
  | "Mathematical Foundations"
  | "Quantum Gates"
  | "Reversible Circuit Design";

type TruthTableData = {
  inputs: string[];
  outputs: string[];
  rows: { inputs: string[]; outputs: string[] }[];
};

type Concept = {
  id: string;
  group: ConceptGroup;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  short: string;
  math: string;
  mathLabel: string;
  explanation: string;
  example: string;
  truthTable?: TruthTableData;
};

const GROUP_ORDER: ConceptGroup[] = [
  "Mathematical Foundations",
  "Quantum Gates",
  "Reversible Circuit Design",
];

const GROUP_META: Record<
  ConceptGroup,
  { kicker: string; description: string }
> = {
  "Mathematical Foundations": {
    kicker: "Paper-Led Math",
    description:
      "State vectors, tensor products, and measurement concepts pulled from the quantum-circuits survey.",
  },
  "Quantum Gates": {
    kicker: "Simulator Toolbox",
    description:
      "The reversible primitives exposed in the grid and the algebra that explains what each one does.",
  },
  "Reversible Circuit Design": {
    kicker: "Architecture",
    description:
      "Ancilla use, garbage removal, uncomputation, and cost metrics emphasized by the Toom-Cook and Karatsuba papers.",
  },
};

const CONCEPTS: Concept[] = [
  {
    id: "state-vector",
    group: "Mathematical Foundations",
    badge: "Mathematics",
    title: "State Vectors & Bra-Ket Notation",
    subtitle: "Qubits are normalized complex vectors, not classical bits.",
    icon: "|ψ⟩",
    accent: "#22d3ee",
    short:
      "The survey describes a qubit as α|0⟩ + β|1⟩ with amplitudes constrained by normalization.",
    math: "|ψ⟩ = α|0⟩ + β|1⟩\n|α|² + |β|² = 1",
    mathLabel: "Single-qubit state and normalization rule",
    explanation:
      "A qubit lives in a two-dimensional complex vector space. The computational basis states are |0⟩ and |1⟩, and a general qubit is their linear combination. The amplitudes α and β are not probabilities by themselves. Their squared magnitudes become probabilities only during measurement. The 2022 survey uses bra-ket notation because it makes state vectors, adjoints, and matrix actions compact and exact.",
    example:
      "Even though this project visualizes binary wires, the formal circuit model underneath still treats every register as a quantum state vector.",
  },
  {
    id: "tensor",
    group: "Mathematical Foundations",
    badge: "Registers",
    title: "Tensor Products & Register Layout",
    subtitle: "Multiple wires form one joint state space.",
    icon: "⊗",
    accent: "#a78bfa",
    short:
      "The X, Y, A, and P rows are not separate worlds. Together they form one tensor-product register.",
    math: "|X,Y,A,P⟩ = |X⟩ ⊗ |Y⟩ ⊗ |A⟩ ⊗ |P⟩",
    mathLabel: "Composite register used by the simulator",
    explanation:
      "For several qubits, the total system state is built with the tensor product. That means register order matters and local changes can affect the global state. This is why ancilla garbage, swaps, and control structure matter mathematically instead of being mere drawing details.",
    example:
      "The Toom-Cook circuit starts from a combined register |X⟩⊗|Y⟩⊗|A=0⟩⊗|P=0⟩ before any reversible arithmetic runs.",
  },
  {
    id: "measurement",
    group: "Mathematical Foundations",
    badge: "Readout",
    title: "Measurement in the Computational Basis",
    subtitle: "Readout turns amplitudes into observable outcomes.",
    icon: "M",
    accent: "#34d399",
    short:
      "Measurement is a projective operation, so clean output requires garbage to be removed first.",
    math: "Pr(0) = |α|²\nPr(1) = |β|²",
    mathLabel: "Born-rule probabilities for α|0⟩ + β|1⟩",
    explanation:
      "A superposed qubit collapses to a basis state when measured. For α|0⟩ + β|1⟩, the readout probabilities are |α|² and |β|². This matters in arithmetic circuits because entangled garbage changes what those probabilities mean. The product register must therefore be isolated before measurement.",
    example:
      "The simulator's result is only trustworthy when the ancilla register has been reset, because measurement should see the product alone and not product-plus-garbage.",
  },
  {
    id: "x",
    group: "Quantum Gates",
    badge: "Gate",
    title: "Pauli-X Gate",
    subtitle: "The reversible quantum NOT.",
    icon: "X",
    accent: "#22d3ee",
    short: "X swaps |0⟩ and |1⟩ while preserving reversibility.",
    math: "X|0⟩ = |1⟩\nX|1⟩ = |0⟩",
    mathLabel: "Matrix [[0,1],[1,0]]",
    explanation:
      "Pauli-X is the simplest nontrivial gate in this project. It flips a computational-basis state and applying it twice returns the original qubit. Because it is unitary, it is safe to use inside larger reversible arithmetic.",
    example:
      "Placing X on an input row in the simulator toggles that logical input bit before the multiplication circuit runs.",
    truthTable: {
      inputs: ["Input"],
      outputs: ["Output"],
      rows: [
        { inputs: ["|0⟩"], outputs: ["|1⟩"] },
        { inputs: ["|1⟩"], outputs: ["|0⟩"] },
      ],
    },
  },
  {
    id: "cx",
    group: "Quantum Gates",
    badge: "Gate",
    title: "CNOT Gate",
    subtitle: "A controlled XOR on two qubits.",
    icon: "CX",
    accent: "#a855f7",
    short:
      "CNOT flips the target iff the control is |1⟩ and is central to both logic and hardware cost models.",
    math: "CX|c,t⟩ = |c, c ⊕ t⟩",
    mathLabel: "Control passes through, target is XOR-updated",
    explanation:
      "CNOT is the standard two-qubit controlled gate. It preserves the control and conditionally flips the target. The survey paper singles out CNOT-count and CNOT-depth because two-qubit gates are especially relevant on NISQ hardware.",
    example:
      "The extract phase of the Toom-Cook circuit uses CX gates to copy useful information from ancilla into the clean output register.",
    truthTable: {
      inputs: ["Control", "Target in"],
      outputs: ["Target out"],
      rows: [
        { inputs: ["0", "0"], outputs: ["0"] },
        { inputs: ["0", "1"], outputs: ["1"] },
        { inputs: ["1", "0"], outputs: ["1"] },
        { inputs: ["1", "1"], outputs: ["0"] },
      ],
    },
  },
  {
    id: "ccx",
    group: "Quantum Gates",
    badge: "Gate",
    title: "Toffoli Gate",
    subtitle: "The reversible AND primitive behind arithmetic circuits.",
    icon: "CCX",
    accent: "#ec4899",
    short:
      "CCX flips its target only when both controls are 1, which is why it dominates reversible multiplier cost.",
    math: "CCX|c₁,c₂,t⟩ = |c₁,c₂,(c₁∧c₂) ⊕ t⟩",
    mathLabel: "Doubly controlled NOT",
    explanation:
      "The Toffoli gate is the reversible analogue of an AND feeding into XOR. In the Toom-Cook and Karatsuba papers, Toffoli count is a primary complexity metric because arithmetic circuits spend much of their effort on this gate pattern.",
    example:
      "Each CCX placed in the simulator represents a reversible multiplication step that writes structure into ancilla space.",
    truthTable: {
      inputs: ["c₁", "c₂", "t in"],
      outputs: ["t out"],
      rows: [
        { inputs: ["0", "0", "0"], outputs: ["0"] },
        { inputs: ["0", "1", "0"], outputs: ["0"] },
        { inputs: ["1", "0", "0"], outputs: ["0"] },
        { inputs: ["1", "1", "0"], outputs: ["1"] },
      ],
    },
  },
  {
    id: "swap",
    group: "Quantum Gates",
    badge: "Gate",
    title: "SWAP Gate",
    subtitle: "Moves states between wires.",
    icon: "⇄",
    accent: "#d1d5db",
    short:
      "SWAP exchanges two qubit states and often appears because of routing rather than algorithmic need.",
    math: "SWAP|a,b⟩ = |b,a⟩",
    mathLabel: "Equivalent to three CNOT gates",
    explanation:
      "SWAP trades the positions of two quantum states. Abstractly it is simple, but on hardware it matters because nonadjacent qubits often need routing help before a controlled interaction can occur.",
    example:
      "A compiled version of this simulator on constrained hardware would likely insert SWAPs to bring Toffoli controls together.",
    truthTable: {
      inputs: ["a in", "b in"],
      outputs: ["a out", "b out"],
      rows: [
        { inputs: ["0", "1"], outputs: ["1", "0"] },
        { inputs: ["1", "0"], outputs: ["0", "1"] },
      ],
    },
  },
  {
    id: "reversibility",
    group: "Reversible Circuit Design",
    badge: "Principle",
    title: "Strict Reversibility",
    subtitle: "Every valid quantum operation must be undoable.",
    icon: "↺",
    accent: "#8b5cf6",
    short:
      "Quantum circuits preserve information, so any computation U must admit an inverse U†.",
    math: "U†U = I",
    mathLabel: "Unitary evolution",
    explanation:
      "Quantum gates are unitary transformations. That one condition is the reason you cannot discard data mid-computation the way classical logic does. Both the survey and the multiplier papers rely on this rule when they reverse parts of a circuit to clean workspace.",
    example:
      "When the simulator asks you to run the cleanup region in reverse order, it is enforcing U†U = I.",
  },
  {
    id: "ancilla",
    group: "Reversible Circuit Design",
    badge: "Workspace",
    title: "Ancilla Allocation",
    subtitle: "Temporary qubits store intermediate structure.",
    icon: "A",
    accent: "#fb7185",
    short:
      "Reversible arithmetic needs clean helper qubits because information cannot just be overwritten and forgotten.",
    math: "|ψ⟩ ⊗ |0⟩",
    mathLabel: "Attach a clean ancilla register",
    explanation:
      "Ancilla qubits start in a known state, usually |0⟩, and absorb intermediate results. The Toom-Cook and Karatsuba papers both treat ancilla cost as a central design pressure because more workspace means more qubits, more layout burden, and more cleanup work.",
    example:
      "In this simulator, the A rows are ancilla scratch space and should return to 0 when the circuit is complete.",
  },
  {
    id: "garbage",
    group: "Reversible Circuit Design",
    badge: "Hazard",
    title: "Entanglement & Garbage",
    subtitle: "Leftover workspace can corrupt measurement.",
    icon: "⚠",
    accent: "#ef4444",
    short:
      "Garbage outputs are not harmless leftovers. If they remain entangled with the product, measurement sees the wrong object.",
    math: "|ϕ⟩ = Σᵢ αᵢ|garbageᵢ⟩|productᵢ⟩",
    mathLabel: "Product entangled with junk state",
    explanation:
      "Garbage outputs exist only to preserve reversibility during a computation. The survey treats them as a real cost metric, and the Toom-Cook paper explicitly removes them before final readout. If garbage remains, the result register is no longer isolated from the rest of the system.",
    example:
      "A circuit that computes the right value but leaves ancilla dirty is still not a clean quantum multiplier.",
  },
  {
    id: "pebble",
    group: "Reversible Circuit Design",
    badge: "Protocol",
    title: "The Pebble Game",
    subtitle: "Compute, extract, then uncompute.",
    icon: "♟",
    accent: "#3b82f6",
    short:
      "Pebble-game scheduling recycles workspace instead of letting recursive intermediate values pile up forever.",
    math: "U → V → U†",
    mathLabel: "Compute · Extract · Uncompute",
    explanation:
      "The reversible pebble game is the standard pattern for cleaning temporary data. First compute into workspace, then move the useful answer into a clean output, then run the original computation backward. The Toom-Cook paper uses this idea to improve qubit bounds, and the Karatsuba paper pushes the same theme even harder by avoiding stored recursive junk.",
    example:
      "The simulator's top-half compute region and mirrored cleanup region are the pebble game made visible.",
  },
  {
    id: "metrics",
    group: "Reversible Circuit Design",
    badge: "Resources",
    title: "Circuit Cost Metrics",
    subtitle: "Quantum cost is more than raw gate count.",
    icon: "Σ",
    accent: "#f59e0b",
    short:
      "The papers track qubits, depth, CNOT or Toffoli counts, garbage, and KQ-style metrics because hardware punishes different patterns differently.",
    math: "KQ = depth × qubit cost\nKQ_CNOT = CNOT-depth × qubit cost",
    mathLabel: "Representative NISQ metrics from the survey",
    explanation:
      "For NISQ settings, the survey emphasizes qubit cost, CNOT-count, CNOT-depth, garbage output, and KQ because long coherent execution and two-qubit gates are fragile. For arithmetic papers like Toom-Cook, Toffoli count and qubit count become central because they capture the main reversible cost of multiplication.",
    example:
      "The simulator exposes CCX, CX, and total gate counts because those values map directly onto the resource models discussed in the papers.",
  },
];

function TruthTable({ table }: { table: TruthTableData }) {
  const headers = [...table.inputs, ...table.outputs];
  const inputCount = table.inputs.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#070714]">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-gray-800">
            {headers.map((header, index) => (
              <th
                key={header}
                className={`px-3 py-3 text-center font-semibold ${
                  index < inputCount ? "text-gray-400" : "text-emerald-400"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-900">
              {[...row.inputs, ...row.outputs].map((cell, cellIndex) => (
                <td
                  key={`${index}-${cellIndex}`}
                  className={`px-3 py-3 text-center ${
                    cellIndex < inputCount ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConceptVisual({ concept }: { concept: Concept }) {
  if (concept.id === "state-vector") {
    return (
      <div className="grid w-full grid-cols-2 gap-4">
        {[["|0⟩", "65%"], ["|1⟩", "35%"]].map(([label, height], index) => (
          <div key={label} className="rounded-2xl border border-gray-800 bg-black/25 p-3">
            <div className="mb-2 flex justify-between text-xs font-mono text-gray-500">
              <span>{label}</span>
              <span>{index === 0 ? "|α|²" : "|β|²"}</span>
            </div>
            <div className="flex h-24 items-end rounded-xl bg-[#050510] p-2">
              <motion.div
                animate={{ height: [height, index === 0 ? "42%" : "58%", height] }}
                transition={{ duration: 2.8, repeat: Infinity }}
                className="w-full rounded-lg"
                style={{ background: `linear-gradient(180deg, ${concept.accent}, ${concept.accent}55)` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (concept.id === "tensor") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {["|X⟩", "|Y⟩", "|A⟩", "|P⟩"].map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <div
              className="rounded-xl border px-4 py-2 font-mono text-sm font-semibold"
              style={{
                color: concept.accent,
                borderColor: `${concept.accent}55`,
                background: `${concept.accent}15`,
              }}
            >
              {item}
            </div>
            {index < 3 && <span className="text-lg text-gray-600">⊗</span>}
          </div>
        ))}
      </div>
    );
  }

  if (concept.id === "measurement") {
    return (
      <div className="flex w-full items-center justify-between gap-4">
        <div
          className="rounded-2xl border px-4 py-3 font-mono text-sm font-semibold"
          style={{
            color: concept.accent,
            borderColor: `${concept.accent}55`,
            background: `${concept.accent}15`,
          }}
        >
          α|0⟩ + β|1⟩
        </div>
        <span className="text-lg text-gray-600">→</span>
        <div className="grid flex-1 gap-3">
          {["|0⟩", "|1⟩"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-gray-800 bg-black/25 px-4 py-3">
              <div className="font-mono text-sm font-semibold" style={{ color: concept.accent }}>
                {item}
              </div>
              <div className="mt-1 text-xs text-gray-500">{index === 0 ? "|α|²" : "|β|²"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (concept.id === "pebble") {
    return (
      <div className="grid w-full gap-3 md:grid-cols-3">
        {["Compute U", "Extract V", "Uncompute U†"].map((step, index) => (
          <div
            key={step}
            className="rounded-2xl border px-4 py-4 text-center text-sm font-semibold"
            style={{
              color: concept.accent,
              borderColor: `${concept.accent}55`,
              background: index === 1 ? `${concept.accent}12` : "rgba(255,255,255,0.02)",
            }}
          >
            {step}
          </div>
        ))}
      </div>
    );
  }

  if (concept.id === "metrics") {
    return (
      <div className="w-full space-y-3">
        {["Qubits", "Depth", "CNOT / CCX", "Garbage"].map((metric, index) => (
          <div key={metric}>
            <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              <span>{metric}</span>
              <span style={{ color: concept.accent }}>{index === 0 ? "space" : "cost"}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#050510]">
              <motion.div
                animate={{ width: [`${36 + index * 10}%`, `${62 - index * 4}%`, `${36 + index * 10}%`] }}
                transition={{ duration: 2.8, delay: index * 0.15, repeat: Infinity }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${concept.accent}55, ${concept.accent})` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div
        className="rounded-2xl border px-5 py-3 text-lg font-black"
        style={{
          color: concept.accent,
          borderColor: `${concept.accent}55`,
          background: `${concept.accent}12`,
        }}
      >
        {concept.icon}
      </div>
      <div className="rounded-2xl border border-gray-800 bg-black/25 px-4 py-3 font-mono text-sm text-gray-400">
        {concept.math.split("\n")[0]}
      </div>
    </div>
  );
}

function ConceptCard({
  concept,
  onSelect,
}: {
  concept: Concept;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="w-full rounded-3xl border border-gray-800 bg-[#0a0a1a]/90 p-6 text-left shadow-xl"
    >
      <div className="mb-4 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-black"
          style={{
            color: concept.accent,
            borderColor: `${concept.accent}55`,
            background: `${concept.accent}12`,
          }}
        >
          {concept.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-sm font-semibold" style={{ color: concept.accent }}>
            {concept.badge}
          </div>
          <h3 className="text-xl font-bold leading-tight text-white">{concept.title}</h3>
          <p className="mt-2 text-sm leading-7 text-gray-400">{concept.subtitle}</p>
        </div>
      </div>
      <p className="text-sm leading-7 text-gray-500">{concept.short}</p>
    </motion.button>
  );
}

function ConceptDetail({
  concept,
  onBack,
}: {
  concept: Concept;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ type: "spring", stiffness: 150, damping: 22 }}
    >
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-white"
      >
        <span>←</span>
        Back to all concepts
      </button>

      <div className="rounded-[32px] border border-gray-800 bg-[#0a0a1a]/90 p-7 shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border text-3xl font-black"
            style={{
              color: concept.accent,
              borderColor: `${concept.accent}55`,
              background: `${concept.accent}12`,
            }}
          >
            {concept.icon}
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold" style={{ color: concept.accent }}>
              {concept.badge}
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {concept.title}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-gray-400">{concept.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-gray-800 bg-gray-950 p-5 sm:flex-row sm:items-start sm:justify-between">
        <code className="whitespace-pre-line font-mono text-lg font-semibold" style={{ color: concept.accent }}>
          {concept.math}
        </code>
        <span className="max-w-xs text-sm leading-6 text-gray-500">{concept.mathLabel}</span>
      </div>

      <div className="mt-6 rounded-3xl border border-gray-800 bg-black/60 p-6">
        <div className="mx-auto flex min-h-[170px] w-full max-w-xl items-center justify-center">
          <ConceptVisual concept={concept} />
        </div>
      </div>

      {concept.truthTable && (
        <div className="mt-6">
          <TruthTable table={concept.truthTable} />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        <Accordion
          title="Explanation"
          content={concept.explanation}
          accent={concept.accent}
        />
      </div>
    </motion.div>
  );
}

type FundamentalsPageProps = {
  embedded?: boolean;
};

export function FundamentalsPage({ embedded = false }: FundamentalsPageProps) {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [activeTab, setActiveTab] = useState<ConceptGroup>(GROUP_ORDER[0]);

  return (
    <div
      className={`relative w-full bg-[#050510] text-gray-200 ${
        embedded ? "min-h-full" : "min-h-screen"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-purple-900/12 via-cyan-900/6 to-transparent" />

      <div
        className={`relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-12 ${
          embedded ? "pb-20 pt-16 sm:pt-20" : "pb-24 pt-28"
        }`}
      >
        <AnimatePresence mode="wait">
          {selectedConcept ? (
            <ConceptDetail
              key={selectedConcept.id}
              concept={selectedConcept}
              onBack={() => setSelectedConcept(null)}
            />
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mx-auto mb-12 grid max-w-5xl gap-4 lg:grid-cols-[1.35fr_1fr]">
                <div className="rounded-[32px] border border-purple-500/20 bg-[#0a0a1a]/90 p-8 shadow-[0_0_35px_rgba(168,85,247,0.05)]">
                  <div className="mb-4 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">
                    Quantum Fundamentals
                  </div>
                  <h1 className="bg-gradient-to-r from-white via-purple-100 to-cyan-300 bg-clip-text pb-2 text-5xl font-black tracking-tight text-transparent md:text-6xl">
                    Mathematics, gates, and reversible design.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">
                    This page now incorporates ideas from{" "}
                    <span className="font-semibold text-gray-200">
                      Everything You Always Wanted to Know About Quantum Circuits
                    </span>{" "}
                    together with the local Toom-Cook and Karatsuba multiplier papers, so the simulator is grounded in the
                    same mathematical language as the theory.
                  </p>
                </div>

                <div className="rounded-[32px] border border-cyan-500/20 bg-[#0a0a1a]/90 p-7">
                  <h2 className="text-lg font-semibold text-white">Paper threads used here</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-gray-400">
                    <div>
                      <div className="font-semibold text-cyan-300">2208.11725</div>
                      <div>State vectors, measurement, gate primitives, and circuit resource metrics.</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-300">1805.02342</div>
                      <div>Toom-Cook multiplication, reversible pebble games, and Toffoli / qubit bounds.</div>
                    </div>
                    <div>
                      <div className="font-semibold text-pink-300">1904.07356</div>
                      <div>Karatsuba space optimization through careful uncomputation.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto mb-8 flex max-w-5xl flex-wrap gap-2 md:gap-4 lg:justify-center">
                {GROUP_ORDER.map((group) => (
                  <button
                    key={group}
                    onClick={() => setActiveTab(group)}
                    className="relative rounded-full px-5 py-2.5 text-sm font-semibold transition sm:text-base"
                    style={{
                      color: activeTab === group ? "#fff" : "#9ca3af",
                      background: activeTab === group ? "rgba(255,255,255,0.05)" : "transparent",
                    }}
                  >
                    {activeTab === group && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 rounded-full border border-gray-600 bg-gray-800/40"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{group}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto max-w-5xl"
                >
                  <div className="mb-8 rounded-3xl border border-gray-800 bg-[#0a0a1a]/80 p-6 md:p-8">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {GROUP_META[activeTab].kicker}
                    </div>
                    <p className="mt-3 max-w-3xl text-lg leading-relaxed text-gray-300">
                      {GROUP_META[activeTab].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {CONCEPTS.filter((c) => c.group === activeTab).map((concept, index) => (
                      <motion.div
                        key={concept.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ConceptCard concept={concept} onSelect={() => setSelectedConcept(concept)} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
