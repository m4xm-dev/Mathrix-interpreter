//* in-process

const GraphicsView = () => (
    <div className="h-full w-full flex items-center justify-center border border-dashed border-br2 rounded-2x1">
        <div className="text-center">
            <div className="w-16 h-16 border-t-2 border-sp2 rounded-full mx-auto mb-4 animate-spin-slow" />
            <p className="text-[10px] text-xs uppercase tracking-[0.4em] text-txt2">Canvas Renderer Ready</p>
        </div>
    </div>
);

export default GraphicsView;