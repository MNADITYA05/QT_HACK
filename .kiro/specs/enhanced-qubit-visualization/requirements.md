# Requirements Document

## Introduction

This document specifies requirements for enhanced qubit-level visualizations in the Quantum Booth Multiplier simulator. The current system displays a circuit grid with quantum gates but lacks intuitive visual feedback showing how each gate affects individual qubit states. This feature will add step-by-step visual representations that make quantum gate operations understandable to complete beginners and laypeople.

## Glossary

- **Qubit_State_Visualizer**: The component that displays visual representations of qubit values (0 or 1)
- **Animation_Controller**: The component that manages step-by-step playback of gate execution
- **State_Transition_Display**: Visual representation showing before/after qubit values when a gate is applied
- **Circuit_Grid**: The existing SVG-based quantum circuit editor with 12 qubit rows and 24 columns
- **Gate**: A quantum operation (X, CX, CCX, or SWAP) placed on the Circuit_Grid
- **Execution_Trace**: The existing text panel showing chronological gate effects
- **Qubit_Register**: One of five register groups (A, B, P, E, C) containing related qubits
- **Basis_State**: The classical bit values (0 or 1) of all 12 qubits at a specific point in execution
- **Step**: A single gate application or a complete column of gates in the circuit
- **Playback_Mode**: The state of animation (playing, paused, or stopped)

## Requirements

### Requirement 1: Visual Qubit State Display

**User Story:** As a layperson learning quantum computing, I want to see the current value of each qubit visually, so that I can understand the circuit state without reading binary strings.

#### Acceptance Criteria

1. THE Qubit_State_Visualizer SHALL display a visual indicator for each of the 12 qubits showing whether the qubit is in state 0 or state 1
2. WHEN a qubit is in state 0, THE Qubit_State_Visualizer SHALL render the qubit indicator in an "off" visual state
3. WHEN a qubit is in state 1, THE Qubit_State_Visualizer SHALL render the qubit indicator in an "on" visual state
4. THE Qubit_State_Visualizer SHALL use the existing register color scheme (cyan for A, purple for B, green for P, yellow for E, orange for C)
5. THE Qubit_State_Visualizer SHALL position indicators adjacent to the Circuit_Grid qubit labels

### Requirement 2: Step-by-Step Animation Control

**User Story:** As a user trying to understand circuit execution, I want to step through gates one at a time, so that I can see exactly what each gate does.

#### Acceptance Criteria

1. THE Animation_Controller SHALL provide a play button that executes gates sequentially with visible delays between steps
2. THE Animation_Controller SHALL provide a pause button that stops automatic playback while preserving the current step position
3. THE Animation_Controller SHALL provide a step-forward button that advances execution by one gate
4. THE Animation_Controller SHALL provide a step-backward button that reverses execution by one gate
5. THE Animation_Controller SHALL provide a reset button that returns the circuit to the initial state with all qubits at 0
6. WHEN the user clicks step-forward, THE Animation_Controller SHALL advance to the next gate and update the Qubit_State_Visualizer
7. WHEN the user clicks step-backward, THE Animation_Controller SHALL reverse to the previous gate and update the Qubit_State_Visualizer
8. WHEN playback reaches the final gate, THE Animation_Controller SHALL automatically pause

### Requirement 3: State Transition Highlighting

**User Story:** As a beginner, I want to see which qubits change when a gate is applied, so that I can understand the gate's effect.

#### Acceptance Criteria

1. WHEN a gate is executed during playback, THE State_Transition_Display SHALL highlight all qubits affected by that gate
2. WHEN a qubit value changes from 0 to 1, THE State_Transition_Display SHALL display a visual transition animation on that qubit indicator
3. WHEN a qubit value changes from 1 to 0, THE State_Transition_Display SHALL display a visual transition animation on that qubit indicator
4. WHEN a gate's controls are not satisfied, THE State_Transition_Display SHALL indicate that the gate was evaluated but no qubits changed
5. THE State_Transition_Display SHALL maintain highlighting for a minimum of 500 milliseconds after a state change
6. THE State_Transition_Display SHALL use a distinct visual style for qubits that changed versus qubits that were evaluated but unchanged

### Requirement 4: Current Step Indicator

**User Story:** As a user stepping through the circuit, I want to know which gate is currently being executed, so that I can follow along with the execution trace.

#### Acceptance Criteria

1. THE Animation_Controller SHALL highlight the currently executing gate on the Circuit_Grid
2. WHEN playback advances to a new gate, THE Animation_Controller SHALL update the highlight to the new gate position
3. WHEN playback is paused, THE Animation_Controller SHALL maintain the highlight on the current gate
4. THE Animation_Controller SHALL synchronize the current step with the Execution_Trace panel by scrolling to the corresponding entry
5. THE Animation_Controller SHALL display a step counter showing the current step number and total number of steps

### Requirement 5: Playback Speed Control

**User Story:** As a user with varying levels of understanding, I want to control how fast the animation plays, so that I can learn at my own pace.

#### Acceptance Criteria

1. THE Animation_Controller SHALL provide a speed control with at least three settings: slow, normal, and fast
2. WHEN speed is set to slow, THE Animation_Controller SHALL wait 1500 milliseconds between gate executions
3. WHEN speed is set to normal, THE Animation_Controller SHALL wait 800 milliseconds between gate executions
4. WHEN speed is set to fast, THE Animation_Controller SHALL wait 300 milliseconds between gate executions
5. THE Animation_Controller SHALL allow speed changes during active playback without stopping the animation

### Requirement 6: Before/After State Comparison

**User Story:** As a learner, I want to see the qubit states before and after a gate is applied, so that I can understand exactly what changed.

#### Acceptance Criteria

1. WHEN a gate is selected or being executed, THE State_Transition_Display SHALL show the basis state before the gate executes
2. WHEN a gate completes execution, THE State_Transition_Display SHALL show the basis state after the gate executes
3. THE State_Transition_Display SHALL display before and after states side-by-side or in a clear temporal sequence
4. THE State_Transition_Display SHALL highlight the specific qubit positions that differ between before and after states
5. WHERE the user hovers over a gate on the Circuit_Grid, THE State_Transition_Display SHALL show a preview of that gate's effect without changing the current playback position

### Requirement 7: Educational Tooltips

**User Story:** As a complete beginner, I want explanations of what I'm seeing, so that I can learn quantum concepts while using the visualizer.

#### Acceptance Criteria

1. WHEN the user hovers over a qubit indicator, THE Qubit_State_Visualizer SHALL display a tooltip explaining the qubit's current state and register purpose
2. WHEN the user hovers over an animation control button, THE Animation_Controller SHALL display a tooltip explaining the button's function
3. WHEN a gate is highlighted during playback, THE State_Transition_Display SHALL display a tooltip with a plain-language explanation of what the gate does
4. THE tooltips SHALL use simple language avoiding technical jargon where possible
5. THE tooltips SHALL appear within 300 milliseconds of hover and disappear within 100 milliseconds of hover end

### Requirement 8: Integration with Existing Circuit Editor

**User Story:** As a user building circuits, I want the visualization to update automatically when I place or remove gates, so that I can see the effect of my changes immediately.

#### Acceptance Criteria

1. WHEN the user places a new gate on the Circuit_Grid, THE Animation_Controller SHALL reset to the initial state and update the total step count
2. WHEN the user removes a gate from the Circuit_Grid, THE Animation_Controller SHALL reset to the initial state and update the total step count
3. WHEN the user changes input values A or B, THE Animation_Controller SHALL reset to the initial state
4. THE Qubit_State_Visualizer SHALL update to reflect the current playback position whenever the circuit changes
5. THE Animation_Controller SHALL preserve the playback speed setting when the circuit is modified

### Requirement 9: Column-Based Execution Mode

**User Story:** As a user understanding circuit structure, I want the option to step through entire columns at once, so that I can see the effect of parallel gate operations.

#### Acceptance Criteria

1. THE Animation_Controller SHALL provide a toggle to switch between gate-by-gate mode and column-by-column mode
2. WHEN column-by-column mode is active and the user clicks step-forward, THE Animation_Controller SHALL execute all gates in the next column simultaneously
3. WHEN column-by-column mode is active, THE State_Transition_Display SHALL highlight all gates in the current column
4. WHEN column-by-column mode is active, THE step counter SHALL display column numbers instead of gate numbers
5. THE Animation_Controller SHALL maintain the selected mode when the circuit is modified

### Requirement 10: Visual Metaphor Consistency

**User Story:** As a layperson, I want the visual representations to use familiar metaphors, so that I can understand quantum states without prior knowledge.

#### Acceptance Criteria

1. THE Qubit_State_Visualizer SHALL use a consistent visual metaphor for qubit states across all 12 qubits
2. THE visual metaphor SHALL clearly distinguish between state 0 and state 1 using both color and shape
3. THE visual metaphor SHALL be understandable without requiring the user to read documentation
4. WHERE a qubit is in state 0, THE Qubit_State_Visualizer SHALL use visual cues suggesting "off", "empty", or "inactive"
5. WHERE a qubit is in state 1, THE Qubit_State_Visualizer SHALL use visual cues suggesting "on", "filled", or "active"

### Requirement 11: Mobile Responsiveness

**User Story:** As a mobile user, I want the visualization controls to work on touch devices, so that I can learn on any device.

#### Acceptance Criteria

1. THE Animation_Controller buttons SHALL be touch-friendly with a minimum tap target size of 44 pixels
2. THE Qubit_State_Visualizer SHALL scale appropriately on screens with width less than 768 pixels
3. WHEN the viewport width is less than 768 pixels, THE State_Transition_Display SHALL reposition to avoid overlapping the Circuit_Grid
4. THE tooltips SHALL be accessible on touch devices through tap-and-hold gestures
5. THE Animation_Controller SHALL support swipe gestures for step-forward and step-backward on touch devices

### Requirement 12: Performance Requirements

**User Story:** As a user with a slower device, I want the animations to run smoothly, so that I can use the visualizer without frustration.

#### Acceptance Criteria

1. THE Qubit_State_Visualizer SHALL render state updates within 16 milliseconds to maintain 60 frames per second
2. THE Animation_Controller SHALL execute a single step transition within 100 milliseconds excluding the configured delay time
3. WHEN the circuit contains 50 or more gates, THE Animation_Controller SHALL maintain smooth playback at normal speed
4. THE State_Transition_Display SHALL use CSS transforms and opacity for animations to enable GPU acceleration
5. THE Qubit_State_Visualizer SHALL debounce rapid state changes to prevent visual flickering

### Requirement 13: Accessibility Requirements

**User Story:** As a user with visual impairments, I want the visualizer to be accessible with screen readers, so that I can learn quantum computing concepts.

#### Acceptance Criteria

1. THE Qubit_State_Visualizer SHALL provide ARIA labels describing each qubit's current state
2. THE Animation_Controller buttons SHALL have descriptive ARIA labels and keyboard shortcuts
3. WHEN playback state changes, THE Animation_Controller SHALL announce the change to screen readers using ARIA live regions
4. THE State_Transition_Display SHALL provide text alternatives for all visual state changes
5. THE Animation_Controller SHALL be fully operable using only keyboard navigation with Tab, Enter, and arrow keys

### Requirement 14: State Persistence

**User Story:** As a user exploring a circuit, I want my playback position to be preserved when I switch between tabs, so that I don't lose my place.

#### Acceptance Criteria

1. WHEN the user navigates away from the puzzle page and returns, THE Animation_Controller SHALL restore the previous playback position
2. WHEN the user navigates away from the puzzle page and returns, THE Animation_Controller SHALL restore the previous playback speed setting
3. WHEN the user navigates away from the puzzle page and returns, THE Animation_Controller SHALL restore the previous execution mode (gate-by-gate or column-by-column)
4. THE Animation_Controller SHALL clear persisted state when the user clicks the reset button
5. THE Animation_Controller SHALL clear persisted state when the circuit is modified
