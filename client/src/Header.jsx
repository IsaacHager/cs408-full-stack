import { useEffect, useState, useRef } from 'react';
import './Header.css';

function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const touchStartY = useRef(0);

    useEffect(() => {
        const handleWheel = (e) => {
        if (e.deltaY > 0) {
            setIsVisible(true);
        } else if (e.deltaY < 0) {
            setIsVisible(false);
        }
        };

        const handleTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            const touchEndY = e.touches[0].clientY;
            const diffY = touchStartY.current - touchEndY;

            if (diffY > 10) {
                setIsVisible(false);
            } else if (diffY < -10) {
                setIsVisible(true);
            }
            };

        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        };
    },[]);

    return (
        <header className={`sticky top-0 z-50 header h-18 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
            <div className="p-5 text-white">Canvas<strong>Desk</strong></div>
        </header>
    );
}

export default Header;