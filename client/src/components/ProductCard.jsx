import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function ProductCard({ product }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { _id, name, price, discountPrice, images, category, ratings, numReviews, isBestSeller } = product;
    const displayPrice = discountPrice > 0 ? discountPrice : price;
    const discountPercent = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        try {
            setAddingToCart(true);
            await addToCart(_id, 1, product.sizes?.[0] || 'M', product.colors?.[0] || '');
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        try {
            if (isWishlisted) {
                await api.delete(`/api/wishlist/remove/${_id}`);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await api.post(`/api/wishlist/add/${_id}`);
                setIsWishlisted(true);
                toast.success('Added to wishlist ❤️');
            }
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <Link to={`/product/${_id}`} className="group block">
            <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg overflow-hidden hover:border-[rgba(201,168,76,0.35)] transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.05)]">
                {/* Image */}
                <div className="relative overflow-hidden aspect-[3/4] bg-[#161210]">
                    <img
                        src={images?.[0] || `https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400`}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {isBestSeller && (
                            <span className="px-2 py-0.5 bg-[#c9a84c] text-[#0a0a0a] text-[10px] font-bold tracking-wider uppercase rounded">Bestseller</span>
                        )}
                        {discountPercent > 0 && (
                            <span className="px-2 py-0.5 bg-black/70 text-[#c9a84c] text-[10px] font-bold tracking-wider uppercase rounded border border-[rgba(201,168,76,0.3)]">-{discountPercent}%</span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-3 right-3 w-8 h-8 bg-[#0a0a0a]/70 rounded-full flex items-center justify-center text-[#9e9087] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Add to wishlist"
                    >
                        <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-red-400' : ''} />
                    </button>

                    {/* Quick Add */}
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="absolute bottom-3 left-3 right-3 py-2 bg-[#c9a84c] text-[#0a0a0a] text-xs font-semibold tracking-wider uppercase rounded opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <ShoppingBag size={13} />
                        {addingToCart ? 'Adding...' : 'Quick Add'}
                    </button>
                </div>

                {/* Info */}
                <div className="p-4">
                    <p className="text-[10px] tracking-widest uppercase text-[#9e9087] mb-1">{category}</p>
                    <h3 className="font-heading text-base text-[#f5f0eb] line-clamp-2 mb-2 group-hover:text-[#c9a84c] transition-colors">{name}</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[#c9a84c] font-semibold">₹{displayPrice.toLocaleString('en-IN')}</span>
                            {discountPrice > 0 && (
                                <span className="text-[#9e9087] text-xs line-through">₹{price.toLocaleString('en-IN')}</span>
                            )}
                        </div>
                        {numReviews > 0 && (
                            <div className="flex items-center gap-1">
                                <Star size={11} className="text-[#c9a84c] fill-[#c9a84c]" />
                                <span className="text-xs text-[#9e9087]">{ratings?.toFixed(1)} ({numReviews})</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
