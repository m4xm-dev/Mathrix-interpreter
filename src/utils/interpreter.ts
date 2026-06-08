import { IToken } from "chevrotain";

interface HydratedTokens {
    values: Float64Array;
    types: Int8Array;
    active: Uint8Array;
    len: number;
}


class Interpreter {
    constructor() { }

    private static readonly IDS: Record<string, number> = {
        num: 0,
        var: 1,
        trigonometry: 2,
        fraction: 3,
        radication: 4,
        exponentiation: 5,
        sLevel: 6, // * y /
        fLevel: 7  // + y -
    };

    private static readonly priorities = [
        [Interpreter.IDS.fraction, Interpreter.IDS.radication, Interpreter.IDS.trigonometry],
        [Interpreter.IDS.exponentiation],
        [Interpreter.IDS.sLevel],
        [Interpreter.IDS.fLevel]
    ];

    private execTrig(op: string, val: number): number {
        switch (op) {
            case '\\sin': return Math.sin(val);
            case '\\cos': return Math.cos(val);
            case '\\tan': return Math.tan(val);
            default: return 0;
        }
    }

    private static hydrate(tokens: IToken[]): HydratedTokens {
        const len = tokens.length;
        const values = new Float64Array(len)
        const types = new Int8Array(len);
        const active = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            const token = tokens[i]
            const name = token.tokenType.name

            active[i] = 1
            if (name === 'num') {
                values[i] = Number(token.image)
                types[i] = Interpreter.IDS.num
            } else if (name === 'var') {
                values[i] = 0;
                types[i] = Interpreter.IDS.var
            } else {
                types[i] = Interpreter.IDS[name] ?? -1;
            }
        }

        return { values, types, active, len };
    }


    //~ obtiene los tokens
    public resolveLegacy(tokens: IToken[]) {
        const len = tokens.length;
        if (len === 0) return [];

        //~ creamos typedArrays para mayor rapidez y organizacion
        const values = new Float64Array(len)
        const types = new Int8Array(len);
        const active = new Uint8Array(len);

        //~ hidratamos las arrays con los datos de los tokens
        for (let i = 0; i < len; i++) {
            //* nombres y token actual
            const token = tokens[i]
            const name = token.tokenType.name

            //* e el array de tokens activos, marcamos como activo el token con el index actual 
            //* (significa que actualmente no lo borramos/colapsamos)
            active[i] = 1
            //* introducimos cada token en su array
            //* marcamos en el array de tipos con el index actual la prioridad quecontiene
            if (name === 'num') {
                values[i] = Number(token.image)
                types[i] = Interpreter.IDS.num
            } else if (name === 'var') {
                values[i] = 0;
                types[i] = Interpreter.IDS.var
            } else {
                types[i] = Interpreter.IDS[name] ?? -1;
            }
        }

        const priorities = [
            [Interpreter.IDS.fraction, Interpreter.IDS.radication, Interpreter.IDS.trigonometry],
            [Interpreter.IDS.exponentiation],
            [Interpreter.IDS.sLevel],
            [Interpreter.IDS.fLevel]
        ];

        for (let p = 0; p < priorities.length; p++) {
            const currentGroup = priorities[p];
            for (let i = 0; i < len; i++) {
                if (active[i] === 0) continue;

                const type = types[i];
                // Verificamos si el token actual pertenece a la capa de prioridad
                let inPriority = false;
                for (let g = 0; g < currentGroup.length; g++) {
                    if (type === currentGroup[g]) {
                        inPriority = true;
                        break;
                    }
                }

                if (inPriority) {
                    const tokenImage = tokens[i].image;

                    // Buscamos operandos activos (izquierda y derecha)
                    let leftIdx = i - 1;
                    while (leftIdx >= 0 && active[leftIdx] === 0) leftIdx--;

                    let rightIdx = i + 1;
                    while (rightIdx < len && active[rightIdx] === 0) rightIdx++;

                    let result = 0;

                    // Lógica de cálculo por tipo
                    switch (type) {
                        case Interpreter.IDS.fLevel:
                            result = tokenImage === '+'
                                ? values[leftIdx] + values[rightIdx]
                                : values[leftIdx] - values[rightIdx];
                            break;

                        case Interpreter.IDS.sLevel:
                            result = tokenImage === '*'
                                ? values[leftIdx] * values[rightIdx]
                                : values[leftIdx] / values[rightIdx];
                            break;

                        case Interpreter.IDS.exponentiation:
                            result = Math.pow(values[leftIdx], values[rightIdx]);
                            break;

                        case Interpreter.IDS.radication:
                            // Nota: \sqrt usualmente precede al valor, por eso usamos solo right
                            result = Math.sqrt(values[rightIdx]);
                            break;

                        case Interpreter.IDS.trigonometry:
                            result = Interpreter.prototype.execTrig(tokenImage, values[rightIdx]);
                            break;

                        // Para \frac, dependerá de cómo tu lexer agrupe {num}{num}
                        // Aquí un ejemplo simple asumiendo que el valor está a la derecha
                        case Interpreter.IDS.fraction:
                            // Lógica personalizada para manejar los bloques de la fracción
                            break;
                    }

                    // Colapsamos: el resultado va a la posición del primer operando involucrado
                    // Si es una función unaria (\sqrt), se guarda en su propia posición o en la del valor
                    const targetIdx = (type === Interpreter.IDS.radication || type === Interpreter.IDS.trigonometry) ? i : leftIdx;

                    values[targetIdx] = result;
                    active[i] = 0;
                    if (rightIdx < len) active[rightIdx] = 0;

                    // Si el resultado reemplazó al operador (unario), reactivamos el target
                    active[targetIdx] = 1;
                }
            }

        }

        // 3. Retorno del valor final remanente
        for (let i = 0; i < len; i++) {
            if (active[i] === 1) return values[i];
        }
        return 0;
    }

    //~ necesito re crear la funcion resolve para mas legibilidad

    public resolve(tokens: IToken[]) {
        const hydrated = Interpreter.hydrate(tokens);

        // Aquí iría la lógica de resolución usando hydrated.values, hydrated.types, etc.
        // El proceso sería similar al de resolveLegacy pero con mejor organización y legibilidad.

        return 0; // Retornar el resultado final
    }

    public analyze(tokens: IToken[]) {

    }

}

export default Interpreter

