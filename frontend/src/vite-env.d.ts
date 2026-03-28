/// <reference types="vite/client" />

interface Window {
  __reactBoothSkipAutoInit?: boolean;
  initBoothCircuit?: () => void;
  initBoothTutorial?: () => void;
}
