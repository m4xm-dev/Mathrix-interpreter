import 'katex/dist/katex.min.css'; // ¡No olvides este import!
import { useState } from 'react';
import { BlockMath } from 'react-katex';

const FormulaSimple = () => {
    // Definimos la fórmula en una constante para mayor limpieza
    const [formule, setFormule] = useState<string>('')

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <input className='bg-zinc-600 text-white' type="text" value={formule} onChange={e => setFormule(e.target.value)} />

            <BlockMath math={formule} />
        </div>
    );
};

export default FormulaSimple;