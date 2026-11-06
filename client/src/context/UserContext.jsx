import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [userData, setUserData] = useState(() => {
        const storedUser = localStorage.getItem('userData');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(false);
    const [hasSkippedCanvas, setHasSkippedCanvas] = useState(false);

    const fetchUserProfile = async () => {
        if (!userData?.id) return;
        try {
            const res = await fetch(`/api/users/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: userData.id,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data);
                localStorage.setItem('userData', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.id) {
            fetchUserProfile();
        }

    }, [userData?.id]);

    const markCanvasConnected = (canvasDomain) => {
        setUserData((prev) => ({
            ...prev,
            hasCanvasToken: true,
            ...(canvasDomain && { canvasDomain }),
        }));
    };

    const skipCanvasPrompt = () => {
        setHasSkippedCanvas(true);
    };

    const loginUser = async (data) => {
        setLoading(true);
        setUserData(data);
        setLoading(false);
    }

    const logoutUser = () => {
        setLoading(true);
        localStorage.removeItem('userData');
        setUserData(null);
        fetch('/api/auth/logout', { method: 'POST' })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <UserContext.Provider
            value={{
                user: {
                    id: userData?.id,
                    name: userData?.name,
                    canvasDomain: userData?.canvasDomain || null,
                },
                loading: loading,
                hasCanvasToken: !!userData?.hasCanvasToken,
                isAuthenticated: !!userData,
                hasSkippedCanvas,
                markCanvasConnected,
                skipCanvasPrompt,
                loginUser,
                logoutUser,
                refreshProfile: fetchUserProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
