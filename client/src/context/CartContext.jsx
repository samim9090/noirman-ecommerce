import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [cartLoading, setCartLoading] = useState(false);
    const { user } = useAuth();

    const fetchCart = async () => {
        if (!user) return;
        try {
            setCartLoading(true);
            const { data } = await api.get('/api/cart');
            setCart(data.cart || { items: [] });
        } catch (e) {
            setCart({ items: [] });
        } finally {
            setCartLoading(false);
        }
    };

    useEffect(() => { fetchCart(); }, [user]);

    const addToCart = async (productId, qty = 1, size = 'M', color = '') => {
        const { data } = await api.post('/api/cart/add', { productId, qty, size, color });
        setCart(data.cart);
        return data;
    };

    const updateCartItem = async (productId, qty, size, color) => {
        const { data } = await api.put('/api/cart/update', { productId, qty, size, color });
        setCart(data.cart);
    };

    const removeFromCart = async (productId, size, color) => {
        const { data } = await api.delete(`/api/cart/remove/${productId}?size=${size}&color=${color}`);
        setCart(data.cart);
    };

    const clearCart = async () => {
        await api.delete('/api/cart/clear');
        setCart({ items: [] });
    };

    const cartCount = cart.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

    const cartTotal = cart.items?.reduce((sum, item) => {
        const product = item.product;
        const price = product?.discountPrice > 0 ? product.discountPrice : product?.price || 0;
        return sum + price * item.qty;
    }, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, setCart, cartCount, cartTotal, cartLoading, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
