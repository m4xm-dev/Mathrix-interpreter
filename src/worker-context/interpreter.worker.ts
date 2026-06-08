/// <reference lib="webworker" />
// ─── Web Worker del intérprete Mathrix ──────────────────────────────────────────
// Corre en un hilo aparte para que el lexing/resolución de expresiones pesadas
// no bloquee la UI. Recibe WorkerRequest y emite WorkerResponse.

import lexer from "../utils/lexer";
import Interpreter from "../utils/interpreter";
import { LiteToken, WorkerRequest, WorkerResponse } from "../types";

// Serializa una lista de tokens de vuelta a una cadena LaTeX legible para KaTeX.
const serialize = (tokens: LiteToken[]): string => {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        switch (t.name) {
            case "lCurly":
                out += "{";
                break;
            case "rCurly":
                out += "}";
                break;
            case "trigonometry":
            case "fraction":
            case "radication":
                out += t.image + " ";
                break;
            case "exponentiation":
                out += "^";
                break;
            default:
                out += t.image;
        }
    }
    return out.trim();
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const { id, input } = event.data;

    try {
        const tokens = lexer(input);

        if (tokens.length === 0) {
            const empty: WorkerResponse = {
                id,
                ok: true,
                input,
                tokens: [],
                steps: [],
                result: "",
            };
            self.postMessage(empty);
            return;
        }

        const interpreter = new Interpreter();
        const rawSteps = interpreter.resolveLoop(tokens);
        const steps = rawSteps.map((step) => step);
        const final = rawSteps[rawSteps.length - 1];
        const result = serialize(final);

        const response: WorkerResponse = {
            id,
            ok: true,
            input,
            tokens,
            steps,
            result,
        };
        self.postMessage(response);
    } catch (err) {
        const response: WorkerResponse = {
            id,
            ok: false,
            input,
            error: err instanceof Error ? err.message : String(err),
        };
        self.postMessage(response);
    }
};

export {};
