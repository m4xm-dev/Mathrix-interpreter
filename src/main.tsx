import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App2.tsx";
import './App.css'
import 'katex/dist/katex.min.css';
import { WorkerProvider } from "./worker-context/worker-context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WorkerProvider>
      <App />
    </WorkerProvider>
  </React.StrictMode>,
);
