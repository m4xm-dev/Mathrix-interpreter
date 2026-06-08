import LoadingDots from "../components/loading-dots";
import { BlockMath } from 'react-katex';

//~ al colocar <BlockMath math={input} /> el codigo da error sin razon aparente

const ResolutionView = ({ input }: { input: string }) => (
    <div className="flex flex-col gap-4">
        <div className="p-6 bg-bg2 border border-br2 rounded-2xl">
            <p className="text-txt1 font-mono text-sm leading-relaxed">
                {input ? input : <>{"// Esperando entrada"}<LoadingDots num={3} /></>}
            </p>
            <div className="mt-4 h-0.5 w-full bg-linear-to-r from-sp2 to-transparent" />
            <p className="mt-4 text-txt3 text-xs font-mono uppercase tracking-widest">Resultado Final: ---</p>
        </div>
    </div>
);

export default ResolutionView;