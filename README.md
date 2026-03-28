# Quantum Booth Multiplier

Interactive Booth-multiplier simulator for a 2-bit signed quantum-style circuit. Users place `X`, `CX`, `CCX`, and `SWAP` gates, then inspect the live execution trace, truth table, Qiskit text/OpenQASM view, and register outputs.

## What it teaches
- Booth encoding with signed inputs from `-2` to `1`
- Reversible add/subtract via `X`, `CX`, and `CCX`
- Scratch-register cleanup for reversible computation
- How the circuit state maps to `A`, `B`, `P`, `E`, and `C`

## Registers

| Register | Qubits | Purpose |
|----------|--------|---------|
| A | a₀, a₁ | Multiplicand |
| B | b₀, b₁ | Multiplier |
| P | p₀, p₁, p₂, p₃ | Product |
| E | e₀, e₁ | Booth control flags |
| C | c₀, c₁ | Carry scratch bits |

## Run

### Backend
```bash
pip install -r requirements.txt
python QT_HACK-main/app.py
```

### Frontend build
```bash
cd frontend
npm install
npm run build
```

The Flask app serves:
- `/` landing page
- `/puzzle` simulator

## Key API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze_circuit` | POST | Returns timeline, per-gate effects, truth table, metrics, and Qiskit-visible output |
| `/api/check` | POST | Verifies the current circuit against the chosen signed inputs |
| `/api/hint` | POST | Returns the next missing reference gate |
| `/api/solution` | POST | Loads the full Booth reference circuit |

## Tech stack
- Frontend: React + Vite for the shell, plus legacy simulator JS for the SVG circuit editor
- Backend: Flask
- Quantum tooling: Qiskit + Aer
