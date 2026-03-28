# Educational UI Enhancements for Booth Algorithm Simulator

Make the quantum circuit simulator understandable for someone with zero quantum computing knowledge. Five features target the core interpretability gaps.

## Proposed Changes

### Feature 1: Phase Lane Labels

Add colored horizontal bands above the circuit grid columns to show what each column range does.

#### [MODIFY] [circuit.js](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js)

In [buildGrid()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#110-183), add SVG `rect` + [text](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/simulator.py#38-44) elements above the column header row for each phase:

| Phase | Columns | Color | Label (dynamic) |
|-------|---------|-------|-----------------|
| INIT | 1 | #00e5ff | "INIT" |
| ENCODE | 2-4 | #ffd740 | "ENCODE" |
| d0 | 5-10 | #ff2d6f | "d0: subtract A" / "d0: skip" |
| d1 | 11-22 | #b388ff | "d1: add A" / "d1: skip" / "d1: subtract A" |

Add a `PHASE_BANDS` constant and a `renderPhaseLanes()` function. Increase `HEADER_H` from 38 to 60 to make room. Call `renderPhaseLanes()` from [buildGrid()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#110-183) and from [setInput()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#478-488).

Compute d0/d1 values using the same logic as [updateClassical()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#496-516):
```js
const d0 = 0 - (inputB & 1);
const d1 = (inputB & 1) - ((inputB >> 1) & 1);
```

---

### Feature 2: Gate Insight Panel

Replace the existing "LAST GATE PLACED" execution trace panel with a persistent plain-English insight panel that updates on every gate placement.

#### [MODIFY] [puzzle.html](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/templates/puzzle.html)

Replace the "LAST GATE PLACED" section label with "WHAT JUST HAPPENED" and keep the `#gate-info-panel` div.

#### [MODIFY] [circuit.js](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js)

Add:
- `QUBIT_REGISTER_MAP` constant (qubit index to register letter)
- `getPlainEnglishExplanation(gateType, target, controls)` with all the rule-based explanations from the spec
- `updateGateInsightPanel(gateType, target, controls)` that writes title/body/phase into `#gate-info-panel`

Modify [addGate()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#209-224) to call `updateGateInsightPanel()` after pushing the gate.

#### [MODIFY] [style.css](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/css/style.css)

Add styles for `.gate-insight-title`, `.gate-insight-body`, `.gate-insight-phase-badge`.

---

### Feature 3: Plain English Booth Plan

Rewrite [updateClassical()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#496-516) to show three readable sections instead of math notation.

#### [MODIFY] [circuit.js](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js)

Rewrite the innerHTML of `#classical-hint` to show:
1. **YOUR NUMBERS**: A and B in decimal + binary with roles
2. **THE BOOTH PLAN**: d0/d1/d2 with colored badges (red SUBTRACT, grey SKIP, green ADD) and plain English
3. **HOW IT ADDS UP**: The arithmetic spelled out, e.g., "(-1 x 1 x A) + (0 x 2 x A) + (+1 x 4 x A) = -3 + 0 + 12 = 9"

#### [MODIFY] [style.css](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/css/style.css)

Add styles for `.booth-badge`, `.booth-step`, `.booth-numbers`, `.booth-math`.

---

### Feature 4: Improved Timeline Rendering

Rewrite the Qiskit/timeline view to use plain English labels.

#### [MODIFY] [circuit.js](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js)

Modify [renderQiskitView()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#559-602) or add a new `renderTimeline()` function that:
- Changes "Col N: A=X B=Y P=Z" to "After column N: Your A = X | Your B = Y | Answer so far = Z"
- Adds annotations when P/C/E change from previous step
- Highlights last row in green with "Current state"
- Adds header: "Watch the answer build up as each column runs:"

---

### Feature 5: Qubit Label Tooltips

Add hover tooltips to qubit labels in the SVG circuit grid.

#### [MODIFY] [circuit.js](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js)

In [buildGrid()](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/js/circuit.js#110-183), for each qubit label text element:
- Add a `QUBIT_TOOLTIPS` constant mapping qubit indices to plain English descriptions
- Attach `mouseenter`/`mouseleave` event listeners
- On hover, create a positioned tooltip `div` using `foreignObject` in SVG or an absolute-positioned DOM div over the SVG
- Style with existing CSS variables

#### [MODIFY] [style.css](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/static/css/style.css)

Add `.qubit-tooltip` styles.

---

## Verification Plan

### Manual Testing (run Flask app locally)

1. **Start the server**:
   ```
   cd c:\Users\itska\Desktop\booth-algorithm-simulator-main\booth-algorithm-simulator-main\QT_HACK-main
   python app.py
   ```
   Open `http://localhost:5000` in the browser, navigate to `/puzzle`.

2. **Phase lanes**: Verify colored bands above columns. Change inputs A/B and confirm the d0/d1 labels update dynamically.

3. **Gate insight panel**: Place an X gate on qubit a0. Confirm the right sidebar shows "Setting up your first number (A)" with an explanation. Place a CX gate and verify it updates with a new explanation. Confirm the panel persists (no timer).

4. **Booth plan**: Check the BOOTH DIGITS panel shows "YOUR NUMBERS", "THE BOOTH PLAN" with colored badges, and "HOW IT ADDS UP". Change inputs and verify the plan updates.

5. **Timeline**: Click "Load Solution", scroll down on right panel, verify timeline shows "After column N: Your A = ..." format with annotations.

6. **Qubit tooltips**: Hover over any qubit label (e.g., |a0>) and verify a tooltip appears with the plain English description.

### Existing Tests

The project has [simulator.py](file:///c:/Users/itska/Desktop/booth-algorithm-simulator-main/booth-algorithm-simulator-main/QT_HACK-main/simulator.py)'s `__main__` block which tests all signed multiplications. This is unaffected by frontend-only changes. No frontend tests exist.
