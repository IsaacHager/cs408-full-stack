import { useEffect, useRef } from 'react';

const DESMOS_SRC =
    'https://www.desmos.com/api/v1.12/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

let desmosPromise = null;

function loadDesmos() {
    if (window.Desmos) return Promise.resolve(window.Desmos);
    if (!desmosPromise) {
        desmosPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = DESMOS_SRC;
            script.async = true;
            script.onload = () => resolve(window.Desmos);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    return desmosPromise;
}

function Calculator() {
    const containerRef = useRef(null);

    useEffect(() => {
        let calc = null;
        let observer = null;
        let cancelled = false;

        loadDesmos()
            .then((Desmos) => {
                if (cancelled || !containerRef.current) return;

                calc = Desmos.ScientificCalculator(containerRef.current);
                observer = new ResizeObserver(() => calc.resize());
                observer.observe(containerRef.current);
            })
            .catch((err) => console.error('Failed to load Desmos:', err));

        return () => {
            cancelled = true;
            observer?.disconnect();
            calc?.destroy();
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full min-h-[260px]" />;
}

export default Calculator;