// finished

import { useEffect, useState } from "react";

const LoadingDots = ({ num }: { num: number }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < num ? prev + '.' : ''));
        }, 700); // Cambia cada 500ms

        return () => clearInterval(interval);
    }, []);

    return <span>{dots}</span>;
};

export default LoadingDots;