import { LiteToken } from "../types";

interface SolveResult {
    next: LiteToken[];
    reduced: boolean;
}

interface BraceResult {
    List: LiteToken[];
    Result: number;
}

const makeNum = (value: number): LiteToken => ({
    name: "num",
    image: String(parseFloat(value.toFixed(10))),
});

const lCurly: LiteToken = { name: "lCurly", image: "{" };
const rCurly: LiteToken = { name: "rCurly", image: "}" };

const projectSteps = (
    innerSteps: LiteToken[][],
    left: LiteToken[],
    right: LiteToken[]
): LiteToken[][] =>
    innerSteps.map(step => [...left, lCurly, ...step, rCurly, ...right]);

class Interpreter {
    private tokens: LiteToken[] = [];
    private pos: number = 0;
    private levelIndex: number = 0;
    private allSteps: LiteToken[][] = [];

    private static readonly LEVELS = [
        new Set(["exponentiation", "fraction", "radication", "trigonometry"]),
        new Set(["sLevel"]),
        new Set(["fLevel"]),
    ] as const;

    private static readonly TRIG: Readonly<Record<string, (x: number) => number>> = {
        "\\sin": (x) => Math.sin(Interpreter.toRad(x)),
        "\\cos": (x) => Math.cos(Interpreter.toRad(x)),
        "\\tan": (x) => Math.tan(Interpreter.toRad(x)),
        "\\csc": (x) => 1 / Math.sin(Interpreter.toRad(x)),
        "\\sec": (x) => 1 / Math.cos(Interpreter.toRad(x)),
        "\\cot": (x) => 1 / Math.tan(Interpreter.toRad(x)),
    };

    private static readonly toRad = (val: number): number => val * Math.PI / 180;

    // ─── Cursor ──────────────────────────────────────────────────────────────────
    private tok  = () => this.tokens[this.pos];
    private is   = (n: string) => this.tok()?.name === n;
    private img  = () => this.tok()?.image ?? "";
    private next = () => this.tokens[this.pos++];
    private eat  = (n: string) => {
        if (!this.is(n)) throw new Error(`Expected '${n}', got '${this.tok()?.name ?? "EOF"}' ("${this.img()}")`);
        return this.next();
    };

    // ─── Math helpers ────────────────────────────────────────────────────────────
    private static safediv(a: number, b: number): number {
        if (b === 0) throw new Error(`Division by zero: ${a} / ${b}`);
        return a / b;
    }
    private static safesqrt(x: number): number {
        if (x < 0) throw new Error(`sqrt of negative: ${x}`);
        return Math.sqrt(x);
    }
    private static safetrig(name: string, arg: number): number {
        const fn = Interpreter.TRIG[name];
        if (!fn) throw new Error(`Unknown trig function: '${name}'`);
        const r = fn(arg);
        if (!isFinite(r)) throw new Error(`'${name}' undefined at ${arg}`);
        return r;
    }

    // ─── eatBraceValue ───────────────────────────────────────────────────────────
    // `left` = tokens a la izquierda del bloque (para proyección).
    // `right` se calcula internamente DESPUÉS de consumir las llaves,
    //  por lo que siempre es exactamente lo que queda tras el rCurly.
    private eatBraceValue(left: LiteToken[]): BraceResult {
        this.eat("lCurly");

        const inner: LiteToken[] = [];
        let depth = 1;

        while (this.tok()) {
            const t = this.next();
            if (t.name === "lCurly") {
                depth++;
                inner.push(t);
            } else if (t.name === "rCurly") {
                depth--;
                if (depth === 0) break;
                inner.push(t);
            } else {
                inner.push(t);
            }
        }

        if (depth !== 0) throw new Error("Unmatched '{' in expression");

        // right capturado DESPUÉS de consumir el rCurly: pos ya apunta a lo que
        // realmente queda, sin incluir las llaves que acabamos de consumir.
        const right = this.tokens.slice(this.pos);

        // Guardar estado del cursor padre
        const savedTokens     = this.tokens;
        const savedPos        = this.pos;
        const savedLevelIndex = this.levelIndex;

        // Resolver el interior capturando sus pasos en innerSteps
        const innerSteps: LiteToken[][] = [inner];
        const result = this.runLevels(inner, innerSteps);

        // Restaurar estado del cursor padre
        this.tokens     = savedTokens;
        this.pos        = savedPos;
        this.levelIndex = savedLevelIndex;

        // Proyectar pasos internos al contexto del padre.
        // Saltamos solo el primero (estado inicial, ya en allSteps del padre).
        // El último (ej: \sin{3}) también se pushea: es el paso previo al resultado final.
        const projected = projectSteps(innerSteps, left, right);
        for (let i = 1; i < projected.length; i++) {
            this.allSteps.push(projected[i]);
        }

        if (result.length !== 1 || result[0].name !== "num")
            throw new Error(
                `Brace content did not reduce to a single number: [${result.map(t => t.image).join(", ")}]`
            );

        return { List: result, Result: parseFloat(result[0].image) };
    }

    // ─── runLevels ───────────────────────────────────────────────────────────────
    private runLevels(t: LiteToken[], sink?: LiteToken[][]): LiteToken[] {
        this.levelIndex = 0;
        let current = t;
        const target = sink ?? this.allSteps;

        while (this.levelIndex < Interpreter.LEVELS.length) {
            const { next, reduced } = this.solve(current);
            if (reduced) {
                target.push(next);
                current = next;
            } else {
                this.levelIndex++;
            }
        }

        return current;
    }

    // ─── API pública ─────────────────────────────────────────────────────────────
    public resolveLoop(t: LiteToken[]): LiteToken[][] {
        this.allSteps = [t];
        this.runLevels(t);
        return this.allSteps;
    }

    // ─── solve ───────────────────────────────────────────────────────────────────
    private solve(t: LiteToken[]): SolveResult {
        this.tokens = t;
        this.pos    = 0;

        const level = Interpreter.LEVELS[this.levelIndex];
        const out: LiteToken[] = [];
        let reduced = false;

        while (this.tok()) {
            const name = this.tok().name;

            if (!reduced && level.has(name as any)) {
                switch (name) {

                    case "exponentiation": {
                        const baseTok = out.pop()!;
                        const opTok   = this.eat("exponentiation");
                        const left    = [...out, baseTok, opTok];
                        const exp     = this.eatBraceValue(left);
                        out.push(makeNum(Math.pow(parseFloat(baseTok.image), exp.Result)));
                        break;
                    }

                    case "fraction": {
                        const fnTok = this.eat("fraction");

                        // numerador: right incluye el bloque del denominador y lo que sigue,
                        // pero lo calcula eatBraceValue internamente tras consumir {num}
                        const leftNum = [...out, fnTok];
                        const num     = this.eatBraceValue(leftNum);

                        // denominador: left ya incluye '\frac {num}'
                        const leftDen = [...out, fnTok, lCurly, ...num.List, rCurly];
                        const den     = this.eatBraceValue(leftDen);

                        out.push(makeNum(Interpreter.safediv(num.Result, den.Result)));
                        break;
                    }

                    case "radication": {
                        const fnTok = this.eat("radication");
                        const left  = [...out, fnTok];
                        const val   = this.eatBraceValue(left);
                        out.push(makeNum(Interpreter.safesqrt(val.Result)));
                        break;
                    }

                    case "trigonometry": {
                        const fnTok = this.next();
                        const left  = [...out, fnTok];
                        const arg   = this.eatBraceValue(left);
                        out.push(makeNum(Interpreter.safetrig(fnTok.image, arg.Result)));
                        break;
                    }

                    case "sLevel": {
                        const left  = parseFloat(out.pop()!.image);
                        const op    = this.next().image;
                        const right = parseFloat(this.eat("num").image);
                        out.push(makeNum(op === "*" ? left * right : Interpreter.safediv(left, right)));
                        break;
                    }

                    case "fLevel": {
                        const left  = parseFloat(out.pop()!.image);
                        const op    = this.next().image;
                        const right = parseFloat(this.eat("num").image);
                        out.push(makeNum(op === "+" ? left + right : left - right));
                        break;
                    }
                }
                reduced = true;

            } else {
                out.push(this.next());
            }
        }

        return { next: out, reduced };
    }
}

export default Interpreter;