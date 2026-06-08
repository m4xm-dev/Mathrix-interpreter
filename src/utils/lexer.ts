import { TOKEN_ORDER, masterRegex } from "./tokens";
import { LiteToken } from "../types";


const lexer = (text: string): LiteToken[] => {
    masterRegex.lastIndex = 0;
    const tokens: LiteToken[] = [];
    let match: RegExpExecArray | null;

    while ((match = masterRegex.exec(text)) !== null) {
        for (let i = 0; i < TOKEN_ORDER.length; i++) {
            const image = match[i + 1]; // Acceso numérico directo, mucho más rápido que match.groups

            if (image !== undefined) {
                const name = TOKEN_ORDER[i];
                if (name !== 'space') {
                    tokens.push({ name, image });
                }
                break;
            }
        }
    }
    return tokens;
}

export default lexer;