import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to restore user from localStorage
        const stored = localStorage.getItem('noirman_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch (e) { }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        setUser(data.user);
        localStorage.setItem('noirman_user', JSON.stringify(data.user));
        // Store token for axios
        if (data.token) localStorage.setItem('noirman_token', data.token);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/api/auth/register', { name, email, password });
        setUser(data.user);
        localStorage.setItem('noirman_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('noirman_token', data.token);
        return data;
    };

    const logout = async () => {
        try { await api.post('/api/auth/logout'); } catch (e) { }
        setUser(null);
        localStorage.removeItem('noirman_user');
        localStorage.removeItem('noirman_token');
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('noirman_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
