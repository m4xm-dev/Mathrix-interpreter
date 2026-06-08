import React, { useState, useRef } from 'react';

const App: React.FC = () => {
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<'resolution' | 'analysis' | 'graphics'>('resolution');
    const [tokens, setTokens] = useState<string[]>([]);
    const consoleInputRef = useRef<HTMLInputElement>(null);

    const tokenize = (rawInput: string): string[] => {
        if (!rawInput) return [];
        return rawInput.split(/(\s+|=|\+|\-|\*|\/|\(|\)|\[|\])/).map(t => t.trim()).filter(t => t.length > 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);
        setTokens(tokenize(val));
    };

    // --- SUB-COMPONENTES DE VISTA ---

    const ResolutionView = () => (
        <div className="flex flex-col gap-4">
            <div className="p-6 bg-[#181818] border border-[#252525] rounded-2xl">
                <p className="text-[#f5f5dc] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {input || "// Esperando entrada..."}
                </p>
            </div>
        </div>
    );

    const AnalysisView = () => (
        <div className="flex flex-wrap gap-3">
            {tokens.length > 0 ? (
                tokens.map((token, index) => (
                    <div
                        key={`${index}-${token}`} // Key única para evitar parpadeos innecesarios
                        className="flex items-center bg-[#181818] border border-[#252525] px-4 py-2 rounded-xl animate-token-in"
                    >
                        <span className="text-[9px] font-mono text-[#3a3a3a] mr-3 font-bold">{index}</span>
                        <span className="font-mono text-sm text-[#f5f5dc] opacity-90">{token}</span>
                    </div>
                ))
            ) : (
                <p className="text-[#3a3a3a] text-xs italic tracking-widest uppercase py-20 w-full text-center">
                    Stream vacío
                </p>
            )}
        </div>
    );

    const GraphicsView = () => (
        <div className="h-64 w-full flex items-center justify-center border border-dashed border-[#252525] rounded-[2.5rem]">
            <div className="text-center opacity-20">
                <div className="w-10 h-10 border-t border-[#f5f5dc] rounded-full mx-auto mb-4 animate-spin-slow" />
                <p className="text-[9px] uppercase tracking-[0.4em]">Canvas Ready</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-[#e1e1e1] font-sans p-6 md:p-10 select-none">

            {/* NAVEGACIÓN */}
            <nav className="flex gap-8 mb-6 ml-10">
                {(['resolution', 'analysis', 'graphics'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 pb-2 border-b-2 ${activeTab === tab ? 'text-[#f5f5dc] border-[#f5f5dc]' : 'text-[#2a2a2a] border-transparent hover:text-[#4a4a4a]'
                            }`}
                    >
                        {tab === 'resolution' ? 'Resolución' : tab === 'analysis' ? 'Análisis' : 'Gráficos'}
                    </button>
                ))}
            </nav>

            {/* VISOR PRINCIPAL */}
            <section className="flex-1 flex flex-col mb-8 overflow-hidden">
                <div
                    key={activeTab} // Crucial: La animación de "slide" solo se dispara al cambiar de TAB
                    className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto custom-scrollbar animate-tab-switch"
                >
                    {activeTab === 'resolution' && <ResolutionView />}
                    {activeTab === 'analysis' && <AnalysisView />}
                    {activeTab === 'graphics' && <GraphicsView />}
                </div>
            </section>

            {/* TERMINAL */}
            <footer className="max-w-3xl w-full mx-auto">
                <div className="flex items-center bg-[#111111] border border-[#1f1f1f] px-8 py-5 rounded-[2rem] shadow-2xl focus-within:ring-1 focus-within:ring-[#f5f5dc]/5 transition-all">
                    <span className="text-[#2a2a2a] mr-5 font-mono">›</span>
                    <input
                        ref={consoleInputRef}
                        autoFocus
                        type="text"
                        value={input}
                        onChange={handleChange}
                        placeholder="Comando..."
                        className="flex-1 bg-transparent outline-none text-[#f5f5dc] placeholder:text-[#2a2a2a] font-mono text-sm"
                    />
                </div>
            </footer>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 10px; }
        
        /* Animación suave solo al cambiar de pestaña */
        .animate-tab-switch {
          animation: tabSlide 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes tabSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Animación sutil para nuevos tokens */
        .animate-token-in {
          animation: tokenFade 0.3s ease-out;
        }

        @keyframes tokenFade {
          from { opacity: 0; scale: 0.95; }
          to { opacity: 1; scale: 1; }
        }

        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default App;