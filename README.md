# Quantum Booth Multiplier Simulator

Interactive educational web app that teaches Booth's multiplication algorithm through a quantum circuit simulator. Users place `X`, `CX` (CNOT), `CCX` (Toffoli), and `SWAP` gates on an 8-qubit circuit grid, then get real-time feedback via truth tables, execution timelines, Qiskit diagrams, and register state visualizations.

Built for [QT_HACK](https://github.com/QT-HACK).

## What it teaches

- **Booth encoding** — converting a signed 2-bit multiplier into (+1, 0, -1) digits
- **Reversible arithmetic** — add/subtract via X, CX, and CCX gates (no information loss)
- **Uncomputation** — cleaning up ancilla (scratch) registers so they return to |0⟩
- **Toom-Cook phases** — how the circuit maps through LOAD INPUTS → PHASE U → PHASE V → PHASE U† → DONE
- **Register semantics** — understanding what X, Y, A, and P represent at each step

## Registers (8 qubits)

| Register | Qubits | Label | Purpose |
|----------|--------|-------|---------|
| X | x₀, x₁ (qubits 0-1) | Input A / Multiplicand | Holds the first signed 2-bit input (cyan) |
| Y | y₀, y₁ (qubits 2-3) | Input B / Multiplier | Holds the second signed 2-bit input (purple) |
| A | a₀, a₁ (qubits 4-5) | Ancilla / Scratchpad | Temporary storage for partial products; must be uncomputed back to |0⟩ (yellow) |
| P | p₀, p₁ (qubits 6-7) | Product / Answer | Final multiplication result, 2-bit signed (green) |

Inputs are 2-bit two's complement: supported values are **-2, -1, 0, +1**.

## Circuit structure

The reference Booth circuit spans 24 columns across 5 phases:

1. **INIT (col 0-1)** — Load classical inputs into X and Y with X gates
2. **PHASE U (col 2-7)** — Compute partial products into Ancilla via CCX gates
3. **PHASE V (col 8-13)** — Extract results from Ancilla into Product via CX gates
4. **PHASE U† (col 14-21)** — Reverse Phase U to uncompute Ancilla back to |0⟩
5. **DONE (col 22-23)** — Final state; Product register holds the answer

## Features

- **Interactive circuit grid** — 8 × 24 SVG canvas with click-to-place gates, hover tooltips, and phase lane labels
- **Gate palette** — X, CX, CCX, SWAP, and eraser tools
- **Real-time truth table** — shows all basis states with probabilities and register breakdowns
- **Execution timeline** — column-by-column classical simulation showing register state evolution
- **Gate insight panel** — plain-English explanation of what each placed gate does and which phase it belongs to
- **Booth story panel** — explains the Booth digit plan (d0, d1) for the selected inputs
- **Circuit metrics** — raw and transpiled gate counts, circuit depth, CX count after optimization
- **Qiskit integration** — ASCII circuit diagram, OpenQASM export, and measurement histogram (1-4096 shots)
- **Check / Hint / Solution** — verify your circuit, get the next missing gate, or load the full reference
- **Guided tutorial** — 10-step interactive tour of the interface
- **SOP panel** — 7-section reference covering objectives, gate types, registers, and the Booth procedure
- **Theory & Fundamentals pages** — educational content on the algorithm and quantum computing basics
- **Dark theme** — color-coded registers (cyan, purple, yellow, green) with IBM Plex Mono + Lexend fonts

## Project structure

```
booth-algorithm-simulator-main_k/
├── QT_HACK-main/                    # Flask backend + served frontend
│   ├── app.py                       # Flask server (11 endpoints)
│   ├── simulator.py                 # Quantum simulation & Booth logic
│   ├── requirements.txt             # Python dependencies
│   ├── templates/
│   │   └── puzzle.html              # Puzzle page template
│   └── static/
│       ├── css/style.css            # Full UI styling
│       ├── js/
│       │   ├── circuit.js           # SVG circuit editor (vanilla JS)
│       │   └── tutorial.js          # Guided tour system
│       └── landing/                 # Built React assets (Vite output)
│
├── frontend/                        # React + TypeScript source
│   ├── src/
│   │   ├── App.tsx                  # Landing page
│   │   ├── pages/
│   │   │   ├── PuzzlePage.tsx       # Puzzle page shell + sidebar
│   │   │   ├── TheoryPage.tsx       # Algorithm theory
│   │   │   ├── FundamentalsPage.tsx # Quantum basics
│   │   │   └── sop-html.ts         # SOP panel content
│   │   └── components/             # Background animations, UI elements
│   ├── package.json
│   └── vite.config.ts               # Build → ../QT_HACK-main/static/landing/
│
├── implementation_plan.md           # Feature roadmap and specs
├── requirements.txt                 # Python dependencies (top-level copy)
└── README.md
```

## Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Flask | latest |
| Quantum sim | Qiskit + Qiskit-Aer | latest |
| CORS | flask-cors | latest |
| Production server | Gunicorn | latest |
| Frontend framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build tool | Vite | 8.0 |
| Styling | Tailwind CSS | 4.2 |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.577 |
| Circuit editor | Vanilla JavaScript | ES2023 |

## Setup & run

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

### Backend

```bash
cd QT_HACK-main
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                   # → http://localhost:5000
```

### Frontend (development)

```bash
cd frontend
npm install
npm run dev                     # → http://localhost:5173
```

Vite proxies `/api/*` requests to the Flask backend at `localhost:5000`, so both servers must be running during development.

### Frontend (production build)

```bash
cd frontend
npm run build                   # Outputs to QT_HACK-main/static/landing/
```

After building, the Flask app serves everything from `http://localhost:5000`:

- `/` — Landing page
- `/puzzle` — Interactive simulator
- `/theory` — Algorithm theory

### Production (Gunicorn)

```bash
cd QT_HACK-main
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API endpoints

All POST endpoints accept and return JSON.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page (React) |
| `/puzzle` | GET | Puzzle simulator page |
| `/theory` | GET | Theory / education page |
| `/api/analyze_circuit` | POST | Full analysis: timeline, gate effects, truth table, metrics, Qiskit output |
| `/api/check` | POST | Verify circuit correctness for given inputs A and B |
| `/api/hint` | POST | Return the next missing gate from the reference circuit |
| `/api/solution` | POST | Load the complete reference Booth circuit for inputs A and B |
| `/api/simulate_step` | POST | Statevector quantum simulation of the full circuit |
| `/api/simulate_columns` | POST | Column-by-column classical execution timeline |
| `/api/truth_table` | POST | Generate output truth table with probabilities and register values |
| `/api/metrics` | POST | Gate counts and circuit depth (raw + transpiled) |

### Gate format

```json
{
  "type": "X | CX | CCX | SWAP",
  "col": 0,
  "target": 0,
  "controls": [1, 2]
}
```

### Example: check a circuit

```bash
curl -X POST http://localhost:5000/api/check \
  -H "Content-Type: application/json" \
  -d '{"gates": [{"type":"X","col":0,"target":0,"controls":[]}], "a": -1, "b": -1}'
```

## License

See repository for license details.
