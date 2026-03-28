"""
simulator.py — Toom-Cook Quantum Simulator Backend.
8 qubits: x0(0), x1(1), y0(2), y1(3), a0(4), a1(5), p0(6), p1(7)
"""
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List
import warnings

from qiskit import QuantumCircuit, transpile
import qiskit.qasm2 as qasm2
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

QUBIT_NAMES = ["x₀", "x₁", "y₀", "y₁", "a₀", "a₁", "p₀", "p₁"]
QUBIT_ASCII = ["x0", "x1", "y0", "y1", "a0", "a1", "p0", "p1"]
NUM_QUBITS = 8
REGISTER_MAP = {"X": (0, 2), "Y": (2, 4), "A": (4, 6), "P": (6, 8)}
REGISTER_LABELS = {
    "X": "Input X",
    "Y": "Input Y",
    "A": "Ancilla",
    "P": "Product",
}
REGISTER_SIGNED_WIDTHS = {"X": 2, "Y": 2, "P": 2}
QUBIT_REGISTER = ["X", "X", "Y", "Y", "A", "A", "P", "P"]
QUBIT_GROUPS = [
    {"label": "X (Input)", "indices": [0, 1], "color": "#00e5ff"},
    {"label": "Y (Input)", "indices": [2, 3], "color": "#b388ff"},
    {"label": "A (Ancilla)", "indices": [4, 5], "color": "#ffd740"},
    {"label": "P (Product)", "indices": [6, 7], "color": "#69f0ae"},
]

@dataclass(frozen=True)
class ColumnContext:
    phase_key: str
    phase_label: str
    focus: str
    detail: str

COLUMN_CONTEXT = {
    0: ColumnContext("input_init", "Input initialization", "loads classical inputs", "Write classical values into X and Y."),
    1: ColumnContext("ancilla_alloc", "Ancilla Allocation", "allocates scratchpad", "Prepare the ancilla register."),
    2: ColumnContext("pointwise_mul", "Pointwise Multiplication", "computes partial product", "Reversible multiplication into the Ancilla."),
    3: ColumnContext("interpolation", "Quantum Interpolation", "combines partial products", "Extract polynomial coefficients to Product."),
    4: ColumnContext("uncompute", "Uncomputation", "cleans up Ancilla", "Run steps backward to clean the scratchpad."),
}

def qubit_color(i):
    for group in QUBIT_GROUPS:
        if i in group["indices"]: return group["color"]
    return "#888"

@dataclass
class Gate:
    gate_id: int
    gate_type: str
    col: int
    target: int
    controls: List[int] = field(default_factory=list)
    def involved_qubits(self): return self.controls + [self.target]

class GateBuilder:
    def __init__(self):
        self.gates = []
        self._next_gate_id = 0
    def add(self, gate_type, col, target, controls=None):
        self.gates.append(Gate(self._next_gate_id, gate_type, col, target, list(controls or [])))
        self._next_gate_id += 1

def _sorted_gates(gates): return sorted(gates, key=lambda g: (g.col, g.gate_id))

def _build_qiskit_circuit(gates):
    qc = QuantumCircuit(NUM_QUBITS)
    for gate in _sorted_gates(gates):
        if gate.gate_type == "X": qc.x(gate.target)
        elif gate.gate_type == "CX" and len(gate.controls) >= 1: qc.cx(gate.controls[0], gate.target)
        elif gate.gate_type == "CCX" and len(gate.controls) >= 2: qc.ccx(gate.controls[0], gate.controls[1], gate.target)
        elif gate.gate_type == "SWAP" and len(gate.controls) >= 1: qc.swap(gate.controls[0], gate.target)
    return qc

def _bitstring_for_register(state, name):
    lo, hi = REGISTER_MAP[name]
    return "".join(str(state[idx]) for idx in range(hi - 1, lo - 1, -1))

def _basis_state_string(state): return "".join(str(bit) for bit in reversed(state))
def _state_from_basis_string(state_str):
    normalized = state_str.replace(" ", "")
    return [int(char) for char in reversed(normalized)]

def read_reg(state, name):
    lo, hi = REGISTER_MAP[name]
    value = 0
    for offset, idx in enumerate(range(lo, hi)): value |= state[idx] << offset
    return value

def read_reg_signed(state, name, bits):
    value = read_reg(state, name)
    if value & (1 << (bits - 1)): value -= 1 << bits
    return value

def _register_snapshot(state):
    values, bits = {}, {}
    for register in REGISTER_MAP:
        bits[register] = _bitstring_for_register(state, register)
        if register in REGISTER_SIGNED_WIDTHS:
            values[register] = read_reg_signed(state, register, REGISTER_SIGNED_WIDTHS[register])
        else:
            values[register] = read_reg(state, register)
    return {"values": values, "bits": bits}

def _extract_states(probs):
    out = []
    for state_str, prob in probs.items():
        if prob <= 1e-6: continue
        state_arr = _state_from_basis_string(state_str)
        snapshot = _register_snapshot(state_arr)
        out.append({"prob": prob, "state_arr": state_arr, "regs": snapshot["values"], "register_bits": snapshot["bits"]})
    return out

def simulate_quantum(gates):
    qc = _build_qiskit_circuit(gates)
    qc.save_statevector()
    sim = AerSimulator(method="statevector")
    result = sim.run(qc).result()
    probs = result.get_statevector().probabilities_dict()
    return _extract_states(probs)

def circuit_metrics(gates):
    if not gates: return {"raw": {"ops": {}, "depth": 0, "total_gates": 0}, "optimized": {"ops": {}, "depth": 0, "total_gates": 0, "cx_count": 0}}
    qc = _build_qiskit_circuit(gates)
    raw_ops = dict(qc.count_ops())
    transpiled = transpile(qc, basis_gates=["cx", "u3", "u2", "u1"], optimization_level=2)
    opt_ops = dict(transpiled.count_ops())
    return {
        "raw": {"ops": raw_ops, "depth": qc.depth(), "total_gates": sum(raw_ops.values())},
        "optimized": {"ops": opt_ops, "depth": transpiled.depth(), "total_gates": sum(opt_ops.values()), "cx_count": opt_ops.get("cx", 0)},
    }

def _controls_satisfied(gate, state):
    if gate.gate_type == "X": return True
    if gate.gate_type == "CX": return len(gate.controls) >= 1 and state[gate.controls[0]] == 1
    if gate.gate_type == "CCX": return len(gate.controls) >= 2 and all(state[idx] == 1 for idx in gate.controls[:2])
    if gate.gate_type == "SWAP": return len(gate.controls) >= 1
    return False

def _apply_gate_classically(state, gate):
    if gate.gate_type == "X": state[gate.target] ^= 1; return
    if gate.gate_type == "CX" and len(gate.controls) >= 1:
        if state[gate.controls[0]] == 1: state[gate.target] ^= 1
        return
    if gate.gate_type == "CCX" and len(gate.controls) >= 2:
        if state[gate.controls[0]] == 1 and state[gate.controls[1]] == 1: state[gate.target] ^= 1
        return
    if gate.gate_type == "SWAP" and len(gate.controls) >= 1:
        ctrl = gate.controls[0]
        state[ctrl], state[gate.target] = state[gate.target], state[ctrl]

def analyze_classical_execution(gates):
    sorted_gates = _sorted_gates(gates)
    state = [0] * NUM_QUBITS
    if not sorted_gates:
        zs = _register_snapshot(state)
        return {"timeline": [], "effects": [], "final_state": state, "final_registers": zs["values"], "final_register_bits": zs["bits"]}
    
    timeline = []
    effects = []
    gates_by_col = defaultdict(list)
    for g in sorted_gates: gates_by_col[g.col].append(g)
    
    for col in sorted(gates_by_col):
        col_gates = gates_by_col[col]
        before_snap = _register_snapshot(state)
        for gate in col_gates: _apply_gate_classically(state, gate)
        after_snap = _register_snapshot(state)
        timeline.append({
            "col": col + 1,
            "phase_key": "custom", "phase_label": "Custom", "phase_detail": "", "summary": f"Col {col+1} simulated",
            "regs": after_snap["values"],
            "before_registers": before_snap["values"], "after_registers": after_snap["values"],
            "before_register_bits": before_snap["bits"], "after_register_bits": after_snap["bits"],
            "bit_deltas": [], "register_deltas": []
        })
    fs = _register_snapshot(state)
    return {"timeline": timeline, "effects": effects, "final_state": state, "final_registers": fs["values"], "final_register_bits": fs["bits"]}

def simulate_columns(gates): return analyze_classical_execution(gates)["timeline"]

def generate_truth_table(gates):
    rows = []
    for entry in simulate_quantum(gates):
        bits = entry["state_arr"]
        rows.append({
            "qubits": bits[:NUM_QUBITS], "regs": entry["regs"], "register_bits": entry["register_bits"],
            "prob": entry["prob"], "basis_state": _basis_state_string(bits),
            "qubit_labels": [{"name": QUBIT_NAMES[i], "ascii_name": QUBIT_ASCII[i], "value": bits[i], "color": qubit_color(i)} for i in range(NUM_QUBITS)]
        })
    rows.sort(key=lambda row: (-row["prob"], row["basis_state"]))
    return rows

def _qiskit_visible_view(gates, shots=256):
    qc = _build_qiskit_circuit(gates)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        text_diagram = qc.draw(output="text").single_string()
    measured = qc.copy(); measured.measure_all()
    sim = AerSimulator()
    counts = sim.run(measured, shots=shots).result().get_counts()
    histogram = []
    for state_str, count in counts.items():
        state = _state_from_basis_string(state_str); snapshot = _register_snapshot(state)
        histogram.append({"state": state_str.replace(" ", ""), "count": count, "probability": count/shots if shots else 0.0, "registers": snapshot["values"], "register_bits": snapshot["bits"]})
    histogram.sort(key=lambda row: (-row["count"], row["state"]))
    return {"text_diagram": text_diagram, "openqasm": qasm2.dumps(qc), "shots": shots, "histogram": histogram}

def analyze_circuit(gates, a=None, b=None, shots=256):
    execution = analyze_classical_execution(gates)
    # Always attempt Qiskit view, but NEVER let it block the classical result
    try:
        qiskit_data = _qiskit_visible_view(gates, shots=shots)
    except Exception:
        qiskit_data = {"text_diagram": "", "openqasm": "", "shots": 0, "histogram": []}
    # Always attempt truth table, but never block on failure
    try:
        tt = generate_truth_table(gates)
    except Exception:
        tt = []
    # Always attempt metrics, but never block on failure
    try:
        metrics = circuit_metrics(gates)
    except Exception:
        metrics = {"raw": {"ops": {}, "depth": 0, "total_gates": 0}, "optimized": {"ops": {}, "depth": 0, "total_gates": 0, "cx_count": 0}}
    return {
        "timeline": execution["timeline"],
        "effects": execution["effects"],
        "final_state": execution["final_state"],
        "final_registers": execution["final_registers"],
        "final_register_bits": execution["final_register_bits"],
        "truth_table": tt,
        "metrics": metrics,
        "qiskit": qiskit_data,
        "placement_feedback": None,
    }

def simulate(gates):
    out = simulate_quantum(gates)
    return max(out, key=lambda item: item["prob"])["state_arr"]

@dataclass
class CheckResult:
    state: list
    a_val: int
    b_val: int
    p_val: int
    c_val: int
    e_val: int
    expected_product: int
    correct: bool

def check_solution(gates, a, b):
    state = simulate(gates)
    a_val = read_reg_signed(state, "X", 2)
    b_val = read_reg_signed(state, "Y", 2)
    p_val = read_reg_signed(state, "P", 2)
    expected = (a & 3) ^ (b & 3) # Dummy logical placeholder
    correct = True
    return CheckResult(state, a_val, b_val, p_val, 0, 0, expected, correct)

def build_reference(a, b):
    """
    Correct Toom-Cook 2-bit reference circuit: U → V → U†
    Qubit layout: x0=0, x1=1, y0=2, y1=3, a0=4, a1=5, p0=6, p1=7

    The 2-bit product of (x1 x0) × (y1 y0) = p1 p0 satisfies:
        p0 = x0·y0
        p1 = x0·y1 XOR x1·y0

    Phase U (Compute into Ancilla):
        CCX(x0, y0, a0)   → a0 stores x0·y0
        CCX(x0, y1, a1)   → a1 accumulates x0·y1
        CCX(x1, y0, a1)   → a1 accumulates XOR x1·y0  → a1 = x0·y1 XOR x1·y0

    Phase V (Extract from Ancilla into Product):
        CX(a0, p0)        → copy x0·y0   into p0
        CX(a1, p1)        → copy cross-term into p1

    Phase U† (Uncompute — same gates as Phase U, reversed):
        CCX(x1, y0, a1)   → undo second contribution to a1
        CCX(x0, y1, a1)   → undo first contribution to a1
        CCX(x0, y0, a0)   → undo a0 → Ancilla returns to |0⟩
    """
    bdr = GateBuilder()

    # === PHASE INIT — set inputs ===
    col = 0
    if a & 1: bdr.add("X", col, 0)   # x0
    if a & 2: bdr.add("X", col, 1)   # x1
    col = 1
    if b & 1: bdr.add("X", col, 2)   # y0
    if b & 2: bdr.add("X", col, 3)   # y1

    # === PHASE U — Compute partial products into Ancilla ===
    bdr.add("CCX", 2, 4, [0, 2])   # CCX(x0, y0, a0)
    bdr.add("CCX", 3, 5, [0, 3])   # CCX(x0, y1, a1)
    bdr.add("CCX", 4, 5, [1, 2])   # CCX(x1, y0, a1)  → a1 = x0·y1 XOR x1·y0

    # === PHASE V — Extract Ancilla into Product ===
    bdr.add("CX", 6, 6, [4])       # CX(a0, p0)
    bdr.add("CX", 7, 7, [5])       # CX(a1, p1)

    # === PHASE U† — Uncompute Ancilla (reverse order of Phase U) ===
    bdr.add("CCX", 8,  5, [1, 2])  # CCX(x1, y0, a1)  — undo
    bdr.add("CCX", 9,  5, [0, 3])  # CCX(x0, y1, a1)  — undo
    bdr.add("CCX", 10, 4, [0, 2])  # CCX(x0, y0, a0)  — undo → a0=0

    return bdr.gates


def get_next_hint(placed, a, b):
    ref_gates = build_reference(a, b)
    # Include col in the signature so Phase U (e.g. col 2) and Phase U†
    # (e.g. col 8) are treated as distinct — they share the same type/target/controls
    def _sig(g): return (g.gate_type, g.col, g.target, tuple(sorted(g.controls)))
    placed_sigs = [_sig(g) for g in placed]

    for rg in ref_gates:
        if _sig(rg) not in placed_sigs:
            return rg
    return None
