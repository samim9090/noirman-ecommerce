import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';

export default function CartPage() {
    const { cart, cartTotal, updateCartItem, removeFromCart, cartLoading } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState('');
    const navigate = useNavigate();

    const items = cart?.items || [];
    const shipping = cartTotal > 2999 ? 0 : 149;
    const finalTotal = cartTotal - discount + shipping;

    const handleCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            setCouponLoading(true);
            const { data } = await api.post('/api/coupons/apply', { code: couponCode, orderAmount: cartTotal });
            setDiscount(data.discount);
            setCouponApplied(couponCode.toUpperCase());
            toast.success(data.message);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Invalid coupon');
        } finally { setCouponLoading(false); }
    };

    const handleRemoveCoupon = () => {
        setDiscount(0);
        setCouponApplied('');
        setCouponCode('');
        toast.success('Coupon removed');
    };

    if (items.length === 0) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <Helmet><title>Cart — NOIR MAN</title></Helmet>
            <ShoppingBag size={64} className="text-[rgba(201,168,76,0.2)] mb-6" />
            <h2 className="font-heading text-4xl text-[#f5f0eb] mb-3">Your Cart is Empty</h2>
            <p className="text-[#9e9087] mb-8">Explore our collection and add products you love.</p>
            <Link to="/shop" className="px-8 py-3 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold tracking-widest uppercase rounded hover:bg-[#e0c070] transition-all">
                Continue Shopping
            </Link>
        </div>
    );

    return (
        <>
            <Helmet><title>{`Cart (${items.length}) — NOIR MAN`}</title></Helmet>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="font-heading text-4xl text-[#f5f0eb] mb-10">Shopping Bag</h1>
                <div className="grid md:grid-cols-3 gap-10">
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map(item => {
                            const p = item.product;
                            if (!p) return null;
                            const price = p.discountPrice > 0 ? p.discountPrice : p.price;
                            return (
                                <div key={`${p._id}-${item.size}-${item.color}`} className="flex gap-4 bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-4">
                                    <Link to={`/product/${p._id}`} className="flex-shrink-0 w-24 h-28 rounded overflow-hidden">
                                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=200'} alt={p.name} className="w-full h-full object-cover" />
                                    </Link>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link to={`/product/${p._id}`} className="font-heading text-lg text-[#f5f0eb] hover:text-[#c9a84c] transition-colors">{p.name}</Link>
                                            <div className="flex gap-4 text-xs text-[#9e9087] mt-1">
                                                {item.size && <span>Size: <span className="text-[#f5f0eb]">{item.size}</span></span>}
                                                {item.color && <span>Color: <span className="text-[#f5f0eb]">{item.color}</span></span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {/* Qty control */}
                                            <div className="flex items-center border border-[rgba(201,168,76,0.2)] rounded overflow-hidden">
                                                <button onClick={() => removeFromCart(p._id, item.size, item.color)} disabled={item.qty <= 1 || cartLoading}
                                                    className="w-8 h-8 flex items-center justify-center text-[#9e9087] hover:text-[#c9a84c] transition-colors disabled:opacity-40">
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-sm text-[#f5f0eb]">{item.qty}</span>
                                                <button onClick={() => updateCartItem(p._id, item.qty + 1, item.size, item.color)} disabled={cartLoading}
                                                    className="w-8 h-8 flex items-center justify-center text-[#9e9087] hover:text-[#c9a84c] transition-colors disabled:opacity-40">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <span className="font-semibold text-[#c9a84c]">₹{(price * item.qty).toLocaleString('en-IN')}</span>
                                            <button onClick={() => removeFromCart(p._id, item.size, item.color)} disabled={cartLoading} className="text-[#9e9087] hover:text-red-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 h-fit space-y-5">
                        <h2 className="font-heading text-xl text-[#f5f0eb]">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-[#9e9087]"><span>Subtotal</span><span className="text-[#f5f0eb]">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                            {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
                            <div className="flex justify-between text-[#9e9087]"><span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : 'text-[#f5f0eb]'}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                            <div className="border-t border-[rgba(201,168,76,0.1)] pt-3 flex justify-between font-semibold">
                                <span className="text-[#f5f0eb]">Total</span>
                                <span className="text-[#c9a84c] text-lg">₹{finalTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Coupon */}
                        {couponApplied ? (
                            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-500/30 rounded">
                                <span className="text-sm text-green-400 flex items-center gap-2"><Tag size={14} />{couponApplied} applied</span>
                                <button onClick={handleRemoveCoupon} className="text-xs text-red-400 hover:underline">Remove</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="COUPON CODE"
                                    className="flex-1 bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-3 py-2 text-xs text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c] uppercase" />
                                <Button size="sm" onClick={handleCoupon} loading={couponLoading}>Apply</Button>
                            </div>
                        )}

                        <Button size="lg" className="w-full" onClick={() => navigate('/checkout', { state: { discount, couponCode: couponApplied, shipping } })}>
                            Proceed to Checkout
                        </Button>
                        <Link to="/shop" className="block text-center text-xs text-[#9e9087] hover:text-[#c9a84c] transition-colors">← Continue Shopping</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
