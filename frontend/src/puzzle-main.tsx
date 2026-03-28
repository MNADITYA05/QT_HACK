import "./puzzle-setup";
import { createRoot } from "react-dom/client";
import { PuzzlePage } from "./pages/PuzzlePage";
import "./index.css";
import "./puzzle/puzzle-shell.css";

createRoot(document.getElementById("root")!).render(<PuzzlePage />);
