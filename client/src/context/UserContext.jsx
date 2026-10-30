import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasSkippedCanvas, setHasSkippedCanvas] = useState(false);

    const fetchUserProfile = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/users/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.sub,
                    email: user.email,
                    name: user.name,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setUserData(data);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUserProfile();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [isAuthenticated, user, authLoading]);

    const markCanvasConnected = () => {
        setUserData((prev) => ({ ...prev, hasCanvasToken: true }));
    };

    const skipCanvasPrompt = () => {
        setHasSkippedCanvas(true);
    };

    return (
        <UserContext.Provider
            value={{
                userData,
                loading: authLoading || loading,
                hasCanvasToken: !!userData?.hasCanvasToken,
                hasSkippedCanvas,
                markCanvasConnected,
                skipCanvasPrompt,
                refreshProfile: fetchUserProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
