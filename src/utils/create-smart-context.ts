import { createContext, useContext } from 'react';

// Esta función genérica <T> abstrae todo el "ruido"
export function createSmartContext<T>() {
    const Context = createContext<T | undefined>(undefined);

    const useSmartContext = () => {
        const context = useContext(Context);
        if (!context) {
            throw new Error("useSmartContext debe usarse dentro de su Provider correspondiente");
        }
        return context;
    };

    return [Context.Provider, useSmartContext] as const;
}