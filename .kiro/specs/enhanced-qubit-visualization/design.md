# Design Document: Enhanced Qubit Visualization

## Overview

This design specifies the implementation of an enhanced qubit visualization system for the Quantum Booth Multiplier simulator. The system adds step-by-step visual representations of qubit states, animated transitions, and playback controls to make quantum gate operations understandable to beginners and laypeople.

### Goals

- Provide intuitive visual feedback showing how gates affect individual qubit states
- Enable step-by-step playback of circuit execution with animation
- Display before/after state comparisons for each gate operation
- Integrate seamlessly with the existing vanilla JavaScript circuit editor
- Maintain performance with smooth 60fps animations

### Non-Goals

- Rewriting the existing circuit editor in React
- Supporting quantum superposition visualization (only basis states)
- Real-time animation during circuit editing (only during playback)
- Mobile-first design (mobile is supported but desktop is primary)

## Architecture

### High-Level Structure

The visualization system consists of three main components integrated into the existing vanilla JavaScript circuit editor:

```
┌─────────────────────────────────────────────────────────────┐
│                     PuzzlePage (React)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Circuit Editor (Vanilla JS - circuit.js)      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          Circuit Grid (SVG)                     │  │  │
│  │  │  - 12 qubit rows × 24 columns                   │  │  │
│  │  │  - Gate rendering                               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   Qubit State Visualizer (NEW)                  │  │  │
│  │  │  - 12 visual indicators (circles)               │  │  │
│  │  │  - Positioned left of qubit labels              │  │  │
│  │  │  - Color-coded by register                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   Animation Controller (NEW)                    │  │  │
│  │  │  - Playback controls (play/pause/step/reset)    │  │  │
│  │  │  - Speed control (slow/normal/fast)             │  │  │
│  │  │  - Mode toggle (gate-by-gate/column-by-column)  │  │  │
│  │  │  - Step counter display                         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   State Transition Display (NEW)                │  │  │
│  │  │  - Highlight affected qubits                    │  │  │
│  │  │  - Animate state changes                        │  │  │
│  │  │  - Show before/after comparison                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────────┐
│  Flask Backend   │              │  Execution Trace     │
│  /api/analyze    │◄─────────────│  (Right Panel)       │
│  - effects[]     │              │  - Synchronized      │
│  - timeline[]    │              │  - Auto-scroll       │
└──────────────────┘              └──────────────────────┘
```

### Technology Stack

- **Visualization Components**: Vanilla JavaScript (to match existing circuit.js)
- **SVG Rendering**: Direct DOM manipulation using existing `svgEl()` helper
- **Animation**: CSS transitions + requestAnimationFrame for smooth updates
- **State Management**: Module-level variables in circuit.js (consistent with existing pattern)
- **Data Source**: Existing `/api/analyze_circuit` endpoint (provides `effects` and `timeline` arrays)

### Integration Strategy

The new components will be added to `circuit.js` as additional functions and will hook into existing lifecycle events:

1. **Initialization**: Add visualizer setup to existing `init()` function
2. **Circuit Changes**: Hook into existing `onCircuitChanged()` to reset playback
3. **Data Flow**: Reuse existing `fetchCircuitAnalysis()` and `renderAnalysis()` pipeline
4. **UI Placement**: Insert new SVG elements and HTML controls into existing DOM structure

## Components and Interfaces

### 1. Qubit State Visualizer

**Purpose**: Display visual indicators for each qubit's current state (0 or 1)

**DOM Structure**:
```html
<svg id="circuit-svg">
  <!-- Existing grid elements -->
  <g id="qubit-state-indicators" class="state-visualizer">
    <g class="qubit-indicator" data-qubit="0">
      <circle class="indicator-bg" cx="30" cy="..." r="10" />
      <circle class="indicator-fill" cx="30" cy="..." r="8" />
      <text class="indicator-label" x="30" y="...">0</text>
    </g>
    <!-- Repeat for qubits 1-11 -->
  </g>
</svg>
```

**Visual Design**:
- **Position**: 30px left of qubit labels (x = 30, y = HEADER_H + qubit * CELL_H + CELL_H/2)
- **Size**: 10px radius circles
- **State 0 (off)**: Hollow circle with 2px stroke, no fill, opacity 0.4
- **State 1 (on)**: Filled circle with solid color, opacity 1.0
- **Colors**: Use existing Q_COLORS array (cyan for A, purple for B, green for P, yellow for E, orange for C)
- **Label**: Small text inside circle showing "0" or "1"

**Interface**:
```javascript
// Initialize visualizer (called once in init())
function initQubitStateVisualizer() {
  // Create SVG group and 12 indicator elements
  // Append to circuit SVG
  // Set initial state to all zeros
}

// Update visualizer to show specific basis state
function updateQubitStateVisualizer(stateArray) {
  // stateArray: [0,0,0,0,0,0,0,0,0,0,0,0] (12 bits)
  // For each qubit:
  //   - Update fill opacity
  //   - Update label text
  //   - Apply transition class for animation
}

// Highlight specific qubits (for state transitions)
function highlightQubits(qubitIndices, highlightType) {
  // qubitIndices: [2, 4] (qubits to highlight)
  // highlightType: 'changed' | 'evaluated' | 'none'
  // Add/remove CSS classes for visual feedback
}
```

### 2. Animation Controller

**Purpose**: Manage step-by-step playback of circuit execution

**DOM Structure**:
```html
<div class="animation-controls sim-glass">
  <div class="control-row">
    <button id="anim-reset" class="anim-btn" title="Reset to start">⏮</button>
    <button id="anim-step-back" class="anim-btn" title="Step backward">◀</button>
    <button id="anim-play-pause" class="anim-btn primary" title="Play/Pause">▶</button>
    <button id="anim-step-forward" class="anim-btn" title="Step forward">▶</button>
  </div>
  <div class="control-row">
    <label class="control-label">
      <input type="checkbox" id="anim-mode-toggle" />
      <span>Column-by-column</span>
    </label>
  </div>
  <div class="control-row">
    <label class="control-label">Speed:</label>
    <select id="anim-speed">
      <option value="1500">Slow</option>
      <option value="800" selected>Normal</option>
      <option value="300">Fast</option>
    </select>
  </div>
  <div class="step-counter">
    <span id="anim-current-step">0</span> / <span id="anim-total-steps">0</span>
  </div>
</div>
```

**State Management**:
```javascript
// Animation state (module-level variables)
let animationState = {
  mode: 'gate-by-gate', // 'gate-by-gate' | 'column-by-column'
  playbackState: 'stopped', // 'playing' | 'paused' | 'stopped'
  currentStep: 0, // Current position in effects/timeline array
  totalSteps: 0, // Total number of steps
  speed: 800, // Milliseconds between steps
  executionData: null, // Cached analysis data from /api/analyze_circuit
  playbackTimer: null, // setTimeout handle for auto-advance
};
```

**Interface**:
```javascript
// Initialize controller (called once in init())
function initAnimationController() {
  // Create DOM elements
  // Attach event listeners
  // Set initial state
}

// Load execution data from analysis
function loadExecutionData(analysisData) {
  // analysisData: { effects: [...], timeline: [...], ... }
  // Store in animationState.executionData
  // Set totalSteps based on mode
  // Reset currentStep to 0
  // Update UI
}

// Playback control functions
function playAnimation() {
  // Set playbackState to 'playing'
  // Start auto-advance timer
  // Update play/pause button icon
}

function pauseAnimation() {
  // Set playbackState to 'paused'
  // Clear auto-advance timer
  // Update play/pause button icon
}

function stepForward() {
  // Increment currentStep
  // Apply next gate/column effect
  // Update visualizer
  // Highlight current gate on grid
  // Scroll execution trace
  // If at end, auto-pause
}

function stepBackward() {
  // Decrement currentStep
  // Revert to previous state
  // Update visualizer
  // Highlight previous gate on grid
}

function resetAnimation() {
  // Set currentStep to 0
  // Reset visualizer to all zeros
  // Clear highlights
  // Set playbackState to 'stopped'
}

// Auto-advance (called by timer)
function advancePlayback() {
  if (animationState.playbackState !== 'playing') return;
  stepForward();
  if (animationState.currentStep < animationState.totalSteps) {
    animationState.playbackTimer = setTimeout(advancePlayback, animationState.speed);
  } else {
    pauseAnimation();
  }
}

// Mode toggle
function toggleExecutionMode() {
  // Switch between 'gate-by-gate' and 'column-by-column'
  // Recalculate totalSteps
  // Reset to step 0
  // Update UI
}

// Speed change
function setPlaybackSpeed(milliseconds) {
  animationState.speed = milliseconds;
  // If currently playing, restart timer with new speed
}
```

### 3. State Transition Display

**Purpose**: Highlight qubits affected by the current gate and animate state changes

**Visual Design**:
- **Highlight Ring**: 14px radius circle around affected qubit indicators
- **Changed Qubits**: Pulsing green ring (2px stroke, 0.8 opacity)
- **Evaluated but Unchanged**: Dim yellow ring (1px stroke, 0.4 opacity)
- **Animation**: 300ms ease-in-out transition for state changes
- **Persistence**: Highlights remain for 500ms after step completes

**Interface**:
```javascript
// Show transition for current step
function displayStateTransition(stepData) {
  // stepData: effect object from effects array
  // {
  //   qubit_deltas: [{index, before, after, ...}],
  //   controls: [0, 1],
  //   target: 4,
  //   controls_satisfied: true,
  //   ...
  // }
  
  // 1. Identify affected qubits
  const affectedQubits = [...stepData.controls, stepData.target];
  const changedQubits = stepData.qubit_deltas.map(d => d.index);
  
  // 2. Highlight affected qubits
  affectedQubits.forEach(q => {
    if (changedQubits.includes(q)) {
      highlightQubits([q], 'changed');
    } else {
      highlightQubits([q], 'evaluated');
    }
  });
  
  // 3. Animate state changes
  changedQubits.forEach(q => {
    const delta = stepData.qubit_deltas.find(d => d.index === q);
    animateQubitTransition(q, delta.before, delta.after);
  });
  
  // 4. Schedule highlight removal
  setTimeout(() => clearHighlights(), 500);
}

// Animate single qubit transition
function animateQubitTransition(qubitIndex, beforeState, afterState) {
  // Add 'transitioning' class
  // Update state value
  // CSS transition handles animation
  // Remove 'transitioning' class after 300ms
}

// Clear all highlights
function clearHighlights() {
  // Remove highlight classes from all indicators
}

// Highlight current gate on grid
function highlightCurrentGate(gateData) {
  // gateData: { col, target, controls, type }
  // Add 'current-gate' class to gate SVG elements
  // Remove from previous gate
}
```

### 4. Before/After State Comparison

**Purpose**: Display basis states before and after gate execution

**DOM Structure**:
```html
<div class="state-comparison sim-glass">
  <div class="comparison-header">State Comparison</div>
  <div class="comparison-content">
    <div class="state-column">
      <div class="state-label">Before</div>
      <div class="state-bits" id="before-state">000000000000</div>
      <div class="state-registers" id="before-registers">
        <span class="reg-a">A=00</span>
        <span class="reg-b">B=00</span>
        <span class="reg-p">P=0000</span>
        <span class="reg-e">E=00</span>
        <span class="reg-c">C=00</span>
      </div>
    </div>
    <div class="state-arrow">→</div>
    <div class="state-column">
      <div class="state-label">After</div>
      <div class="state-bits" id="after-state">000000000000</div>
      <div class="state-registers" id="after-registers">
        <span class="reg-a">A=00</span>
        <span class="reg-b">B=00</span>
        <span class="reg-p">P=0000</span>
        <span class="reg-e">E=00</span>
        <span class="reg-c">C=00</span>
      </div>
    </div>
  </div>
  <div class="gate-description" id="gate-description">
    <!-- Plain-language explanation of current gate -->
  </div>
</div>
```

**Interface**:
```javascript
// Update comparison display
function updateStateComparison(stepData) {
  // stepData: effect object with before/after register data
  // Update before state display
  document.getElementById('before-state').textContent = 
    formatBasisState(stepData.before_registers);
  updateRegisterDisplay('before-registers', stepData.before_register_bits);
  
  // Update after state display
  document.getElementById('after-state').textContent = 
    formatBasisState(stepData.after_registers);
  updateRegisterDisplay('after-registers', stepData.after_register_bits);
  
  // Update gate description
  document.getElementById('gate-description').textContent = stepData.layman;
  
  // Highlight changed bits
  highlightChangedBits(stepData.qubit_deltas);
}

// Format basis state string
function formatBasisState(registers) {
  // Convert register values to 12-bit string
  // Returns: "000000000000"
}

// Update register display
function updateRegisterDisplay(elementId, registerBits) {
  // registerBits: { A: "00", B: "00", P: "0000", E: "00", C: "00" }
  // Update each register span with color-coded text
}

// Highlight changed bits in comparison
function highlightChangedBits(qubitDeltas) {
  // Add 'changed' class to specific bit positions
  // Use CSS to highlight with color
}
```

### 5. Execution Trace Synchronization

**Purpose**: Scroll execution trace panel to current step and highlight active entry

**Interface**:
```javascript
// Sync trace panel with animation
function syncExecutionTrace(stepIndex) {
  const panel = document.getElementById('gate-info-panel');
  const entries = panel.querySelectorAll('.trace-entry'); // Need to add this class in renderExecutionTrace
  
  // Remove previous highlight
  entries.forEach(e => e.classList.remove('active-step'));
  
  // Highlight current entry
  if (entries[stepIndex]) {
    entries[stepIndex].classList.add('active-step');
    entries[stepIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
```

## Data Models

### Execution Data Structure

The animation system consumes data from the existing `/api/analyze_circuit` endpoint:

```typescript
interface AnalysisData {
  effects: Effect[];        // Gate-by-gate execution steps
  timeline: TimelineEntry[]; // Column-by-column execution steps
  final_state: number[];    // Final basis state [0,0,0,0,0,0,0,0,0,0,0,0]
  final_registers: RegisterValues;
  final_register_bits: RegisterBits;
  // ... other fields (truth_table, metrics, qiskit)
}

interface Effect {
  order: number;           // Sequential step number
  col: number;             // Column number (1-24)
  gate: string;            // Gate type: "X" | "CX" | "CCX" | "SWAP"
  controls: number[];      // Control qubit indices
  control_labels: string[]; // Control qubit names ["a0", "b1"]
  target: number;          // Target qubit index
  target_label: string;    // Target qubit name "p2"
  controls_satisfied: boolean; // Whether gate actually fired
  phase_key: string;       // Phase identifier "booth_encode"
  phase_label: string;     // Human-readable phase "Booth encoding"
  phase_detail: string;    // Detailed phase description
  summary: string;         // Short description "sets a0=1"
  layman: string;          // Plain-language explanation
  before_registers: RegisterValues;
  after_registers: RegisterValues;
  before_register_bits: RegisterBits;
  after_register_bits: RegisterBits;
  qubit_deltas: QubitDelta[];
  register_deltas: RegisterDelta[];
}

interface QubitDelta {
  index: number;           // Qubit index 0-11
  name: string;            // Unicode name "a₀"
  ascii_name: string;      // ASCII name "a0"
  register: string;        // Register "A" | "B" | "P" | "E" | "C"
  register_label: string;  // Register description "multiplicand"
  before: number;          // State before (0 or 1)
  after: number;           // State after (0 or 1)
  color: string;           // Hex color "#00e5ff"
}

interface RegisterDelta {
  register: string;        // "A" | "B" | "P" | "E" | "C"
  label: string;           // "multiplicand"
  before: number;          // Signed integer value before
  after: number;           // Signed integer value after
  before_bits: string;     // Bit string "01"
  after_bits: string;      // Bit string "11"
}

interface TimelineEntry {
  col: number;             // Column number (1-24)
  phase_key: string;
  phase_label: string;
  phase_detail: string;
  summary: string;         // Column-level summary
  regs: RegisterValues;    // Final register values after column
  before_registers: RegisterValues;
  after_registers: RegisterValues;
  before_register_bits: RegisterBits;
  after_register_bits: RegisterBits;
  bit_deltas: QubitDelta[];
  register_deltas: RegisterDelta[];
}

interface RegisterValues {
  A: number;  // Signed 2-bit (-2 to 1)
  B: number;  // Signed 2-bit (-2 to 1)
  P: number;  // Signed 4-bit (-8 to 7)
  E: number;  // Unsigned 2-bit (0 to 3)
  C: number;  // Unsigned 2-bit (0 to 3)
}

interface RegisterBits {
  A: string;  // "01"
  B: string;  // "11"
  P: string;  // "0010"
  E: string;  // "00"
  C: string;  // "00"
}
```

### Animation State Model

```typescript
interface AnimationState {
  mode: 'gate-by-gate' | 'column-by-column';
  playbackState: 'playing' | 'paused' | 'stopped';
  currentStep: number;      // 0-based index into effects or timeline
  totalSteps: number;       // Length of effects or timeline array
  speed: number;            // Milliseconds between steps (300, 800, or 1500)
  executionData: AnalysisData | null;
  playbackTimer: number | null; // setTimeout handle
  currentBasisState: number[]; // Current state during playback [0,0,0,0,0,0,0,0,0,0,0,0]
}
```

### Persistence Model

State is persisted to `sessionStorage` to survive page navigation:

```typescript
interface PersistedState {
  currentStep: number;
  mode: 'gate-by-gate' | 'column-by-column';
  speed: number;
  circuitHash: string; // Hash of gates array to detect circuit changes
}

// Save to sessionStorage
function saveAnimationState() {
  const state: PersistedState = {
    currentStep: animationState.currentStep,
    mode: animationState.mode,
    speed: animationState.speed,
    circuitHash: hashGates(gates),
  };
  sessionStorage.setItem('animation-state', JSON.stringify(state));
}

// Restore from sessionStorage
function restoreAnimationState() {
  const saved = sessionStorage.getItem('animation-state');
  if (!saved) return;
  
  const state: PersistedState = JSON.parse(saved);
  
  // Only restore if circuit hasn't changed
  if (state.circuitHash === hashGates(gates)) {
    animationState.currentStep = state.currentStep;
    animationState.mode = state.mode;
    animationState.speed = state.speed;
    // Update UI to reflect restored state
  }
}

// Simple hash function for gates array
function hashGates(gates) {
  return JSON.stringify(gates.map(g => [g.type, g.col, g.target, g.controls]));
}
```


## Error Handling

### Invalid State Scenarios

**Empty Circuit**:
- **Condition**: User clicks play with no gates placed
- **Handling**: Disable play button, show tooltip "Place gates to enable playback"
- **UI State**: Animation controls grayed out except reset button

**Analysis API Failure**:
- **Condition**: `/api/analyze_circuit` returns error or timeout
- **Handling**: Show error message in state comparison panel, disable playback
- **Recovery**: Retry button to re-fetch analysis data
- **Fallback**: Display last known good state if available

**Corrupted Execution Data**:
- **Condition**: Analysis data missing required fields (effects, timeline)
- **Handling**: Log error to console, show user-friendly message "Unable to load execution data"
- **Prevention**: Validate data structure before loading into animationState

### User Interaction Edge Cases

**Circuit Modified During Playback**:
- **Condition**: User places/removes gate while animation is playing
- **Handling**: Immediately pause playback, reset to step 0, clear visualizer
- **Notification**: Show instruction bar message "Circuit changed - playback reset"
- **Implementation**: Hook into existing `onCircuitChanged()` function

**Input Changed During Playback**:
- **Condition**: User changes A or B input values while animation is playing
- **Handling**: Same as circuit modification - pause, reset, clear
- **Implementation**: Hook into existing `setInput()` function

**Rapid Step Clicks**:
- **Condition**: User rapidly clicks step-forward/step-backward buttons
- **Handling**: Debounce clicks to prevent animation queue buildup
- **Implementation**: Disable buttons during transition (300ms), re-enable after

**Step Beyond Bounds**:
- **Condition**: currentStep goes negative or exceeds totalSteps
- **Handling**: Clamp to valid range [0, totalSteps-1]
- **UI Feedback**: Disable step-backward at step 0, disable step-forward at last step

### Performance Degradation

**Large Circuit (50+ gates)**:
- **Condition**: Circuit has many gates, causing slow rendering
- **Handling**: Show loading indicator during analysis fetch
- **Optimization**: Batch DOM updates, use requestAnimationFrame
- **Fallback**: If frame rate drops below 30fps, disable transition animations

**Memory Leaks**:
- **Condition**: Animation timers not cleared properly
- **Prevention**: Always clear `playbackTimer` in pause/reset/destroy functions
- **Cleanup**: Add cleanup function called when navigating away from page

**Browser Tab Inactive**:
- **Condition**: User switches to another tab while animation is playing
- **Handling**: Detect `visibilitychange` event, pause playback automatically
- **Resume**: Do not auto-resume when tab becomes active (user must click play)

### Accessibility Errors

**Screen Reader Announcements**:
- **Condition**: ARIA live region updates too frequently during fast playback
- **Handling**: Throttle announcements to max 1 per second
- **Content**: Announce step number and register changes only

**Keyboard Navigation Trap**:
- **Condition**: Focus gets stuck in animation controls
- **Prevention**: Ensure Tab key can exit control panel
- **Implementation**: Proper tabindex management, focus trap only when modal is open

**Color Contrast**:
- **Condition**: Highlight colors may not meet WCAG AA standards
- **Validation**: Test all highlight colors against background
- **Fallback**: Provide pattern/texture in addition to color for state indication

### Data Consistency

**State Desynchronization**:
- **Condition**: Visualizer state doesn't match execution data
- **Detection**: Compare visualizer state to expected state from effects[currentStep]
- **Recovery**: Force re-render from authoritative data source
- **Logging**: Log desync events for debugging

**Stale Execution Data**:
- **Condition**: Circuit changes but executionData not updated
- **Prevention**: Clear executionData in `onCircuitChanged()`
- **Validation**: Check circuit hash before using cached data

## Testing Strategy

### Unit Testing

**Test Framework**: Jest for JavaScript unit tests

**Component Tests**:

1. **Qubit State Visualizer**:
   - Test: Visualizer initializes with 12 indicators at correct positions
   - Test: State 0 renders as hollow circle, state 1 as filled circle
   - Test: updateQubitStateVisualizer correctly updates all 12 indicators
   - Test: Highlight classes are applied/removed correctly
   - Test: Colors match Q_COLORS array for each register

2. **Animation Controller**:
   - Test: Play button starts playback and changes icon to pause
   - Test: Pause button stops playback and clears timer
   - Test: Step forward increments currentStep and updates visualizer
   - Test: Step backward decrements currentStep and reverts state
   - Test: Reset button returns to step 0 and clears all highlights
   - Test: Auto-advance timer fires at correct intervals based on speed
   - Test: Playback auto-pauses at last step
   - Test: Mode toggle switches between gate-by-gate and column-by-column
   - Test: Speed change updates timer interval during active playback

3. **State Transition Display**:
   - Test: Changed qubits receive 'changed' highlight class
   - Test: Evaluated but unchanged qubits receive 'evaluated' highlight class
   - Test: Highlights are cleared after 500ms timeout
   - Test: Transition animation completes in 300ms
   - Test: Multiple simultaneous transitions don't interfere

4. **State Comparison**:
   - Test: Before state displays correctly from stepData
   - Test: After state displays correctly from stepData
   - Test: Changed bits are highlighted in comparison view
   - Test: Register values are formatted with correct colors
   - Test: Gate description updates with layman explanation

5. **Execution Trace Sync**:
   - Test: Active step is highlighted in trace panel
   - Test: Trace panel scrolls to show active step
   - Test: Previous highlight is removed when step changes

6. **State Persistence**:
   - Test: saveAnimationState writes to sessionStorage
   - Test: restoreAnimationState reads from sessionStorage
   - Test: State is not restored if circuit hash doesn't match
   - Test: State is cleared when reset button is clicked

### Integration Testing

**Test Scenarios**:

1. **Full Playback Cycle**:
   - Place gates, click play, verify all steps execute in order
   - Verify visualizer updates at each step
   - Verify execution trace scrolls and highlights correctly
   - Verify playback auto-pauses at end

2. **Circuit Modification During Playback**:
   - Start playback, add a gate mid-execution
   - Verify playback resets to step 0
   - Verify visualizer clears to all zeros
   - Verify new execution data is fetched

3. **Mode Switching**:
   - Execute in gate-by-gate mode, verify step count
   - Switch to column-by-column mode, verify step count changes
   - Verify state updates correctly in both modes

4. **Speed Changes**:
   - Start playback at normal speed
   - Change to fast speed during playback
   - Verify timer interval updates without stopping playback

5. **Keyboard Navigation**:
   - Tab through all controls, verify focus order
   - Use Enter/Space to activate buttons
   - Use arrow keys in speed dropdown
   - Verify no focus traps

6. **State Persistence**:
   - Set playback to step 5, navigate away, return
   - Verify playback position is restored
   - Modify circuit, navigate away, return
   - Verify playback position is reset

### End-to-End Testing

**Test Framework**: Playwright for browser automation

**User Scenarios**:

1. **Beginner Learning Flow**:
   - User places X gate on qubit 0
   - User clicks play
   - Verify visualizer shows qubit 0 changing from 0 to 1
   - Verify state comparison shows before/after
   - Verify execution trace highlights the gate
   - Verify tooltip appears on hover

2. **Step-by-Step Exploration**:
   - User places multiple gates
   - User clicks step-forward repeatedly
   - Verify each step updates correctly
   - User clicks step-backward
   - Verify state reverts correctly

3. **Column-by-Column Mode**:
   - User places gates in multiple columns
   - User toggles column-by-column mode
   - User clicks step-forward
   - Verify all gates in column execute simultaneously
   - Verify visualizer shows cumulative effect

4. **Mobile Touch Interaction**:
   - User taps play button on mobile device
   - Verify playback starts
   - User swipes left/right for step navigation
   - Verify steps advance/revert correctly

5. **Accessibility with Screen Reader**:
   - User navigates with keyboard only
   - Verify all controls are reachable
   - Verify ARIA announcements are made
   - Verify state changes are announced

### Performance Testing

**Metrics**:
- Frame rate during animation (target: 60fps)
- Time to render state update (target: <16ms)
- Time to execute step transition (target: <100ms excluding delay)
- Memory usage over 100 steps (target: <10MB increase)

**Test Cases**:
1. Measure frame rate during fast playback of 50-gate circuit
2. Measure DOM update time for visualizer with 12 indicators
3. Measure memory usage before/after 100 playback cycles
4. Verify no memory leaks by checking timer cleanup

### Browser Compatibility Testing

**Target Browsers**:
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

**Test Matrix**:
- SVG rendering consistency across browsers
- CSS transition support
- requestAnimationFrame behavior
- sessionStorage persistence
- Touch event handling (mobile browsers)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Qubit State Visual Consistency

*For any* qubit in state 0, the visualizer SHALL render it with hollow styling and low opacity, and *for any* qubit in state 1, the visualizer SHALL render it with filled styling and full opacity.

**Validates: Requirements 1.2, 1.3**

### Property 2: Step Forward Increments State

*For any* valid animation state where currentStep < totalSteps - 1, calling stepForward() SHALL increment currentStep by exactly 1 and update the visualizer to display the state from effects[currentStep].

**Validates: Requirements 2.3, 2.6**

### Property 3: Step Backward Decrements State

*For any* valid animation state where currentStep > 0, calling stepBackward() SHALL decrement currentStep by exactly 1 and update the visualizer to display the state from effects[currentStep].

**Validates: Requirements 2.4, 2.7**

### Property 4: Affected Qubits Are Highlighted

*For any* gate execution during playback, all qubits in the gate's controls array and the target qubit SHALL receive highlight CSS classes.

**Validates: Requirements 3.1**

### Property 5: State Transitions Trigger Animations

*For any* qubit whose value changes (0→1 or 1→0) during a step, a visual transition animation SHALL be applied to that qubit's indicator element.

**Validates: Requirements 3.2, 3.3**

### Property 6: Unsatisfied Controls Show Evaluation

*For any* gate where controls_satisfied is false, the affected qubits SHALL receive the 'evaluated' highlight class instead of the 'changed' highlight class.

**Validates: Requirements 3.4**

### Property 7: Gate Highlight Follows Playback

*For any* step transition, the previous gate's 'current-gate' highlight SHALL be removed and the new gate at effects[currentStep] SHALL receive the 'current-gate' highlight.

**Validates: Requirements 4.2**

### Property 8: Execution Trace Synchronization

*For any* step change, the execution trace panel SHALL scroll to display the entry corresponding to currentStep and highlight that entry.

**Validates: Requirements 4.4**

### Property 9: Before State Matches Previous Step

*For any* gate execution at step N > 0, the displayed "before state" SHALL match the after_registers from step N-1.

**Validates: Requirements 6.1**

### Property 10: After State Matches Current Step

*For any* gate execution at step N, the displayed "after state" SHALL match the after_registers from step N.

**Validates: Requirements 6.2**

### Property 11: Changed Bits Are Highlighted in Comparison

*For any* state transition, all qubit positions where before_state[i] ≠ after_state[i] SHALL be visually highlighted in the state comparison display.

**Validates: Requirements 6.4**

### Property 12: Visualizer State Consistency

*For any* basis state array [b0, b1, ..., b11], after calling updateQubitStateVisualizer(state), the visual representation SHALL match the state array such that indicator[i] shows state[i] for all i in 0..11.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 13: Animation Speed Persistence

*For any* circuit modification event, the animationState.speed value SHALL remain unchanged (only currentStep and executionData are reset).

**Validates: Requirements 8.5**

### Property 14: Mode Persistence

*For any* circuit modification event, the animationState.mode value SHALL remain unchanged.

**Validates: Requirements 9.5**

### Property 15: Session State Round-Trip

*For any* valid animation state, calling saveAnimationState() followed by restoreAnimationState() with an unchanged circuit SHALL restore currentStep, mode, and speed to their original values.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 16: Circuit Change Invalidates Persistence

*For any* saved animation state, if the circuit hash changes, calling restoreAnimationState() SHALL NOT restore the saved currentStep (it SHALL remain 0).

**Validates: Requirements 14.5**

### Property 17: Step Bounds Clamping

*For any* attempt to set currentStep to a value outside [0, totalSteps-1], the actual currentStep value SHALL be clamped to the nearest valid boundary.

**Validates: Requirements 2.3, 2.4** (edge case handling)

### Property 18: Playback Auto-Pause at End

*For any* playback sequence, when currentStep reaches totalSteps - 1, the playbackState SHALL automatically transition to 'paused' and the playbackTimer SHALL be cleared.

**Validates: Requirements 2.8**

### Property 19: Highlight Timing Invariant

*For any* state transition, highlight CSS classes applied to qubit indicators SHALL remain present for at least 500 milliseconds after the transition completes.

**Validates: Requirements 3.5**

### Property 20: Keyboard Accessibility Completeness

*For any* animation control button, it SHALL be reachable via Tab key navigation and activatable via Enter or Space key.

**Validates: Requirements 13.5**

### Property 21: ARIA Label Presence

*For any* qubit indicator element, it SHALL have an aria-label attribute describing the qubit's name, register, and current state.

**Validates: Requirements 13.1**

### Property 22: Touch Target Minimum Size

*For any* animation control button, its computed width and height SHALL both be at least 44 pixels.

**Validates: Requirements 11.1**

### Property 23: Color Scheme Consistency

*For any* qubit indicator at index i, its color SHALL match Q_COLORS[i] from the existing color scheme array.

**Validates: Requirements 1.4**

### Property 24: Column Mode Step Granularity

*For any* animation state in column-by-column mode, calling stepForward() SHALL advance currentStep to the next distinct column number in the timeline array, skipping all gates in the current column.

**Validates: Requirements 9.2**

### Property 25: Responsive Layout Threshold

*For any* viewport width < 768 pixels, the state comparison display SHALL have a CSS class or style that repositions it to avoid overlapping the circuit grid.

**Validates: Requirements 11.3**

### Property 26: Performance Frame Budget

*For any* state update operation, the time from calling updateQubitStateVisualizer() to DOM paint completion SHALL be ≤ 16 milliseconds (measured via performance.now()).

**Validates: Requirements 12.1**

### Property 27: GPU-Accelerated Animations

*For any* transition animation on qubit indicators, the CSS transition property SHALL use only 'transform' and 'opacity' (not 'left', 'top', 'width', 'height').

**Validates: Requirements 12.4**

### Property 28: Circuit Modification Resets Playback

*For any* circuit modification event (gate added, gate removed, or input changed), the animation controller SHALL reset currentStep to 0, clear executionData, and update the visualizer to show all qubits at state 0.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

