import { useNavigate } from 'react-router-dom';

// Custom hook for authentication
export function useAuth() {
    const navigate = useNavigate();

    const getUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            return null;
        }
    };

    const setUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const requireAuth = () => {
        const user = getUser();
        if (!user || !user.userId) {
            navigate('/login');
            return null;
        }
        return user;
    };

    return {
        getUser,
        setUser,
        logout,
        requireAuth
    };
}
