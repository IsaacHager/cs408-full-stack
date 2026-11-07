import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import LoadingSpinner from './LoadingSpinner';

function AddCourseContextMenu({ x, y, visible, onClose, callback }) {
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);
    const { user } = useUser();

    const handleAddFavorite = async (courseId) => {
        const response = await fetch('/api/canvas/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contextUserId: user?.id, courseIds: [courseId]})
        });
        if (!response.ok) {
            console.error("Failed to add course to favorites.");
        }
        if (onClose) onClose();
        if (callback) callback();
    }

    useEffect(() => {
        if (!user?.id) return;
        if (!visible) return;

        const loadAllUserCourses = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/all-courses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user.id })
                });

                if (response.ok) {
                    const data = await response.json();
                    setAllCourses(data);
                }
            } catch (error) {
                console.error("Dashboard error resolving course list payloads:", error.message);
            } finally {
                setLoading(false);
            }
        };

        loadAllUserCourses();
    }, [visible]);

    useEffect(() => {

        if (visible && inputRef.current) {
            inputRef.current.focus();
            setSearchTerm('');
        }

    }, [visible]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.closest('.contextMenu')) return;
            onClose();
        };

        if (visible) {
            window.addEventListener('mousedown', handleClickOutside);
        }
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [visible, onClose]);

    if (!visible) return null;

    const filteredItems = allCourses.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="contextMenu flex flex-col min-h-[200px] min-w-[400px] max-h-[200px] max-w-[400px] bg-slate-600 absolute p-1"
            style={{ top: `${y}px`, left: `${x}px` }}>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-1 mb-2 w-full text-xs border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />
            {loading && <LoadingSpinner />}
            <ul className="overflow-y-auto max-h-[160]">
                {filteredItems.map(course => (
                    <li key={course.id} className="p-4 border shadow-sm bg-white text-xs" onClick={() => handleAddFavorite(course.id)}>
                        <span className="font-semibold">{course.course_code}</span> - {course.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AddCourseContextMenu;
