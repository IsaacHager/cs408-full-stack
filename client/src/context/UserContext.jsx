import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [userData, setUserData] = useState(() => {
        const storedUser = localStorage.getItem('userData');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    const fetchUserProfile = async () => {
        if (!userData?.id) return;
        try {
            const res = await fetch(`/api/auth/sync?userId=${userData.id}`, { credentials: 'include' });

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
                markCanvasConnected,
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
