# Quantum Multiplier Simulator

An interactive educational web application that teaches **quantum integer multiplication** by letting users build reversible circuits gate-by-gate. The simulator covers three classical multiplication algorithms — **Shift and Add Array**, **Toom-Cook**, and **Karatsuba** — mapped onto quantum gates, with real-time truth tables, Qiskit diagrams, execution timelines, and plain-English explanations at every step.

Built for [QT_HACK](https://github.com/QT-HACK).

## The three algorithms

The app is structured as a progressive **Algorithm Library** with a shared Fundamentals foundation:

| # | Algorithm | Status | Color | Description |
|---|-----------|--------|-------|-------------|
| — | **Fundamentals** | Implemented | Purple | Mathematical foundations, quantum gates (X, CX, CCX), and reversible circuit design |
| 1 | **Shift and Add Array** | Coming soon | Orange | Classical schoolbook multiplication — partial products via AND, accumulated via addition, mapped to reversible gates |
| 2 | **Toom-Cook (Toom-2)** | Implemented | Cyan | Polynomial multiplication — evaluate inputs at chosen points, pointwise multiply, interpolate to recover the product. Uses the U → V → U† reversible pipeline |
| 3 | **Karatsuba** | Coming soon | Green | Divide-and-conquer multiplication — reduces three sub-multiplications to two using the identity (a+b)(c+d) − ac − bd = ad + bc |

All three share the same 8-qubit circuit grid, gate palette, simulation backend, and educational UI. The learning path guides users from fundamentals through increasingly sophisticated multiplication strategies, showing how each maps to reversible quantum operations.

## What it teaches

- **Reversible arithmetic** — why quantum circuits cannot overwrite data, and how ancilla registers + uncomputation maintain unitarity
- **The Pebble Game** — allocate ancilla, compute into it, copy the answer out, then run the gates in reverse to erase the scratchpad
- **Toom-Cook polynomial multiplication** — splitting inputs into polynomial coefficients, pointwise evaluation, and Lagrange interpolation via bit-shifts
- **Toom-Cook complexity** — how Toom-2 achieves O(n^1.585) Toffoli complexity vs. schoolbook O(n²), and why Toom-2.5 avoids the costly division-by-3 of Toom-3
- **Gate semantics** — what X (NOT), CX (CNOT), and CCX (Toffoli) physically do, and how each maps to a multiplication sub-step

## Toom-Cook implementation (the fully built algorithm)

### Registers (8 qubits)

| Register | Qubits | Color | Purpose |
|----------|--------|-------|---------|
| **X** (Input A) | x₀, x₁ (qubits 0-1) | Cyan | First polynomial input — 2-bit signed multiplicand |
| **Y** (Input B) | y₀, y₁ (qubits 2-3) | Purple | Second polynomial input — 2-bit signed multiplier |
| **A** (Ancilla) | a₀, a₁ (qubits 4-5) | Yellow | Reversible scratchpad — intermediate evaluation products; must uncompute to |0⟩ |
| **P** (Product) | p₀, p₁ (qubits 6-7) | Green | Final answer — recovered product coefficients |

Inputs are 2-bit two's complement: valid values are **-2, -1, 0, +1**.

### U → V → U† pipeline (24 columns)

| Phase | Columns | Color | Gates | What happens |
|-------|---------|-------|-------|-------------|
| **LOAD INPUTS** | 0-1 | Cyan | X | Encode classical input values into X and Y |
| **Phase U — Compute** | 2-7 | Pink | CCX | Toffoli gates compute sub-products A(xᵢ)·B(xᵢ) into Ancilla |
| **Phase V — Extract** | 8-13 | Purple | CX | CNOT gates extract recovered coefficients from Ancilla into Product |
| **Phase U† — Uncompute** | 14-21 | Cyan | CCX | Same CCX gates from Phase U in reverse order, returning Ancilla to |0⟩ |
| **DONE** | 22-23 | Gray | — | Circuit complete — Product register holds the answer |

### Reference circuit

For X = (x₁ x₀) and Y = (y₁ y₀), the 2-bit product P = (p₁ p₀):

- **p₀ = x₀ · y₀** (direct bit product)
- **p₁ = x₀·y₁ ⊕ x₁·y₀** (cross-term XOR)

**Phase U:** `CCX(x₀,y₀,a₀)` → `CCX(x₀,y₁,a₁)` → `CCX(x₁,y₀,a₁)`
**Phase V:** `CX(a₀,p₀)` → `CX(a₁,p₁)`
**Phase U†:** `CCX(x₁,y₀,a₁)` → `CCX(x₀,y₁,a₁)` → `CCX(x₀,y₀,a₀)`

## Features

### Interactive circuit editor
- 8-qubit × 24-column SVG grid with click-to-place gate placement
- Gate palette: X (NOT), CX (CNOT), CCX (Toffoli), SWAP, and eraser
- Phase lane labels above columns showing the current pipeline stage
- Hover tooltips on qubit labels with plain-English descriptions

### Educational panels
- **Gate Insight ("What Just Happened")** — explains each placed gate's role in the pipeline with a phase badge (INIT / COMPUTE / EXTRACT / UNCOMPUTE)
- **Story Panel** — explains the current phase, register roles, why only four inputs are allowed, and why uncomputation matters
- **Timeline** — column-by-column execution trace showing register state evolution
- **SOP Guide** — 8-section reference covering objectives, registers, the pebble game, Toom-3 vs. Toom-2.5 costs, pipeline phases, gate types, answer evolution, and circuit metrics

### Simulation & analysis
- **Truth table** — real-time quantum output states with probabilities and register breakdowns
- **Circuit metrics** — raw and transpiled gate counts, circuit depth, CX count after optimization
- **Qiskit integration** — ASCII circuit diagram, OpenQASM export, measurement histogram (1-4096 shots)
- **Check / Hint / Solution** — verify correctness, get the next missing reference gate, or load the full solution

### Theory & Fundamentals
- **Theory page** — animated explanations of polynomial splitting, Toom-Cook recurrence (Toom-2/3/4), Lagrange interpolation, and depth comparison (schoolbook vs. Karatsuba vs. Toom-3 vs. Toom-2.5)
- **Fundamentals page** — accordion-style reference covering mathematical foundations, quantum gates, and reversible circuit design

### Other
- 10-step interactive guided tour
- Neural vortex WebGL landing page
- Dark theme with color-coded registers and algorithm-matched UI accents
- Fonts: IBM Plex Mono (technical), Lexend (headings)

## Project structure

```
quantum-multiplier-simulator/
├── QT_HACK-main/                        # Flask backend + served frontend
│   ├── app.py                           # Flask server (3 page routes + 8 API endpoints)
│   ├── simulator.py                     # Toom-Cook quantum simulation engine
│   ├── requirements.txt                 # Python dependencies
│   ├── templates/
│   │   └── puzzle.html                  # Puzzle page template
│   └── static/
│       ├── css/style.css                # Full UI styling
│       ├── js/
│       │   ├── circuit.js               # SVG circuit editor, gate placement, insight panels
│       │   └── tutorial.js              # 10-step guided tour
│       └── landing/                     # Built React assets (Vite output)
│           ├── index.html               # Landing page
│           ├── puzzle.html              # Simulator (all 3 algorithms + fundamentals)
│           └── theory.html              # Theory page
│
├── frontend/                            # React + TypeScript source
│   ├── src/
│   │   ├── App.tsx                      # Landing page (neural vortex)
│   │   ├── pages/
│   │   │   ├── PuzzlePage.tsx           # Main shell — sidebar with 4 modules, theory/sim tabs
│   │   │   ├── TheoryPage.tsx           # Toom-Cook theory with animations
│   │   │   ├── FundamentalsPage.tsx     # Quantum basics (math, gates, reversibility)
│   │   │   └── sop-html.ts             # SOP panel content (8 sections)
│   │   └── components/                  # Background animations, UI primitives
│   ├── package.json
│   └── vite.config.ts                   # Build → ../QT_HACK-main/static/landing/
│
├── implementation_plan.md               # UI enhancement spec
├── requirements.txt                     # Python dependencies (top-level copy)
└── README.md                            # This file
```

## Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Flask + flask-cors | latest |
| Quantum simulation | Qiskit + Qiskit-Aer | latest |
| Production server | Gunicorn | latest |
| Frontend framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build tool | Vite | 8.0 |
| Styling | Tailwind CSS | 4.2 |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.577 |
| Circuit editor | Vanilla JavaScript (ES2023) | — |

## Setup & run

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd QT_HACK-main
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                   # → http://localhost:5000
```

### Frontend (development with hot reload)

```bash
cd frontend
npm install
npm run dev                     # → http://localhost:5173
```

Vite proxies `/api/*` requests to the Flask backend at `localhost:5000` — both servers must be running during development.

### Frontend (production build)

```bash
cd frontend
npm run build                   # Outputs to QT_HACK-main/static/landing/
```

After building, Flask serves everything from `http://localhost:5000`:

| Route | Page |
|-------|------|
| `/` | Landing page (neural vortex) |
| `/puzzle` | Simulator — all algorithm modules |
| `/theory` | Toom-Cook theory |

### Production deployment

```bash
cd QT_HACK-main
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API endpoints

All POST endpoints accept and return JSON. Gates use the format: `{ "type": "X|CX|CCX|SWAP", "col": 0, "target": 0, "controls": [1, 2] }`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze_circuit` | POST | Full analysis: timeline, effects, truth table, metrics, Qiskit output |
| `/api/check` | POST | Verify circuit correctness for given inputs A and B |
| `/api/hint` | POST | Return the next missing gate from the reference circuit |
| `/api/solution` | POST | Load the complete reference circuit for inputs A and B |
| `/api/simulate_step` | POST | Statevector quantum simulation |
| `/api/simulate_columns` | POST | Column-by-column classical execution timeline |
| `/api/truth_table` | POST | Output state probabilities with register breakdowns |
| `/api/metrics` | POST | Gate counts and circuit depth (raw + optimized/transpiled) |

## Optimal complexity bounds (Toom-2)

Per the Toom-2.5 theoretical framework referenced in the SOP:

| Metric | Bound |
|--------|-------|
| Toffoli (CCX) complexity | O(n^1.585) |
| Qubit complexity | O(n^1.585) |
| Interpolation cost | Free (bit-shifts only) |
| Circuit depth | Sub-quadratic |

## License

See repository for license details.
