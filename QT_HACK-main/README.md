# Quantum Booth Multiplier Puzzle

An interactive web-based puzzle where you build a **quantum circuit implementing Booth's multiplication algorithm** for signed 2-bit inputs from `-2` to `1`.

## Booth's Algorithm on Quantum Gates

Booth's algorithm encodes the multiplier B into signed digits (+1, 0, −1), then performs conditional add/subtract of the multiplicand A at shifted positions. This is the same technique used in real CPU multipliers, mapped to reversible quantum gates (X, CX, CCX).

### Circuit Structure
- **12 qubits**: A (2), B (2), Product (4), Booth encoding (2), Carry (2)
- **Reference phases**: Init → Booth encode → `d₀ = -b₀` subtract path → `d₁ = b₀-b₁` add path → `d₁ = b₀-b₁` subtract path
- **Live explanations**: execution trace, bottom truth table, and Qiskit text/OpenQASM + shot histogram

## Run

```bash
pip install flask
python app.py
# Landing: http://127.0.0.1:5000/
# Puzzle:  http://127.0.0.1:5000/puzzle
```

Run `python app.py` from this directory (the folder that contains `app.py`).

### Landing page (React + Vite)

The neural vortex hero lives in `../frontend` and builds into `static/landing/`. After editing the React app:

```bash
cd ../frontend
npm install
npm run build
```

Local UI dev (hot reload):

```bash
cd ../frontend
npm run dev
```

## Features
- Neural vortex WebGL landing page at `/` (React + TypeScript + Tailwind)
- Simulator at `/puzzle`: Framer Motion shell, SVG circuit grid, glass panels
- Drag-and-drop gate placement on the Booth circuit
- Execution trace that explains each gate in plain language
- Live truth table under the circuit and Qiskit-visible circuit output
- Classical Booth digit breakdown panel
- Step-by-step hint system and full reference solution loader
- Interactive guided tour & SOP guide
- All signed input combinations from `-2` to `1` verified correct
