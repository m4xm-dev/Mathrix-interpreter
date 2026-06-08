
const PATTERNS = {
    space: /\s+/,
    trigonometry: /\\(?:sin|cos|tan|csc|sec|cot)/,
    fraction: /\\frac/,
    radication: /\\sqrt/,
    exponentiation: /\^/,
    lCurly: /\{/,
    rCurly: /\}/,
    sLevel: /[*\/]/,
    fLevel: /[+\-]/,
    num: /\d+(?:\.\d*)?/,
    var: /[a-zA-Z_]+/,
    any: /./
};


export const TOKEN_ORDER: (keyof typeof PATTERNS)[] = ['space', 'trigonometry', 'fraction', 'radication', 'exponentiation', 'lCurly', 'rCurly', 'sLevel', 'fLevel', 'num', 'var', 'any'];

const reg = () => {
    const len = TOKEN_ORDER.length;
    const parts = new Array(len);
    for (let i = 0; i < len; i++) {
        const element = TOKEN_ORDER[i];
        parts[i] = `(?<${element}>${PATTERNS[element].source})`;
    }
    return parts.join('|');
}

export const masterRegex = new RegExp(reg(), 'g');


