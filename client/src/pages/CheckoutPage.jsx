import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card Element styling to match NOIR MAN dark theme
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#f5f0eb',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '15px',
            '::placeholder': { color: '#9e9087' },
            iconColor: '#c9a84c',
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
};

// Inner checkout form (inside Stripe Elements provider)
function CheckoutForm({ cart, cartTotal, discount, couponCode, shippingCost, finalTotal }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({ fullName: user?.name || '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
    const [paymentMethod, setPaymentMethod] = useState('Stripe');
    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const buildOrderItems = () => cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
        qty: item.qty,
        size: item.size,
        color: item.color,
    }));

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
        for (const field of required) {
            if (!form[field]) { toast.error(`Please fill in ${field}`); return; }
        }
        if (cart.items?.length === 0) { toast.error('Your cart is empty'); return; }

        setProcessing(true);
        try {
            if (paymentMethod === 'Stripe') {
                if (!stripe || !elements) { toast.error('Stripe not loaded yet'); setProcessing(false); return; }
                if (!cardComplete) { toast.error('Please complete card details'); setProcessing(false); return; }

                // Step 1: Create Payment Intent on backend
                const { data: intentData } = await api.post('/api/payment/create-intent', { amount: finalTotal });

                // Step 2: Confirm card payment on client
                const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: form.fullName,
                            email: user?.email,
                            phone: form.phone,
                            address: {
                                line1: form.addressLine1,
                                line2: form.addressLine2,
                                city: form.city,
                                state: form.state,
                                postal_code: form.pincode,
                                country: 'IN',
                            },
                        },
                    },
                });

                if (error) {
                    toast.error(error.message);
                    setProcessing(false);
                    return;
                }

                if (paymentIntent.status === 'succeeded') {
                    // Step 3: Verify on backend
                    const { data: verifyData } = await api.post('/api/payment/confirm', {
                        paymentIntentId: paymentIntent.id,
                    });

                    // Step 4: Create order in DB
                    const { data: orderData } = await api.post('/api/orders/create', {
                        items: buildOrderItems(),
                        shippingAddress: form,
                        paymentMethod: 'Stripe',
                        paymentStatus: 'Paid',
                        subtotal: cartTotal,
                        discount,
                        shippingPrice: shippingCost,
                        totalPrice: finalTotal,
                        couponCode,
                        stripePaymentIntentId: paymentIntent.id,
                    });

                    toast.success('Payment successful! Order placed 🎉');
                    navigate(`/order-confirmation/${orderData.order._id}`);
                }
            } else {
                // COD
                const { data: orderData } = await api.post('/api/orders/create', {
                    items: buildOrderItems(),
                    shippingAddress: form,
                    paymentMethod: 'COD',
                    subtotal: cartTotal,
                    discount,
                    shippingPrice: shippingCost,
                    totalPrice: finalTotal,
                    couponCode,
                });
                toast.success('Order placed! Pay on delivery. 🎉');
                navigate(`/order-confirmation/${orderData.order._id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order failed. Please try again.');
            setProcessing(false);
        }
    };

    const inputClass = "w-full bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c] transition-colors";

    return (
        <form onSubmit={handlePlaceOrder}>
            <div className="grid md:grid-cols-3 gap-10">
                {/* Left: Address + Payment */}
                <div className="md:col-span-2 space-y-10">
                    {/* Shipping Address */}
                    <div>
                        <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">Delivery Address</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Full Name *</label>
                                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Phone *</label>
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Pincode *</label>
                                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" className={inputClass} required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Address Line 1 *</label>
                                <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Flat / House no, Building" className={inputClass} required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Address Line 2</label>
                                <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Street, Area, Landmark (optional)" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">City *</label>
                                <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">State *</label>
                                <input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" className={inputClass} required />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">Payment Method</h2>
                        <div className="space-y-3">
                            {[
                                { id: 'Stripe', label: 'Pay with Card', desc: 'Credit / Debit Card via Stripe', icon: '💳' },
                                { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                            ].map(opt => (
                                <label key={opt.id} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === opt.id ? 'border-[#c9a84c] bg-[rgba(201,168,76,0.05)]' : 'border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.3)]'}`}>
                                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="accent-[#c9a84c]" />
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className="font-medium text-[#f5f0eb]">{opt.label}</p>
                                        <p className="text-xs text-[#9e9087]">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Stripe Card Element */}
                        {paymentMethod === 'Stripe' && (
                            <div className="mt-6 bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded-lg p-5">
                                <p className="text-xs tracking-wider uppercase text-[#9e9087] mb-4">Card Details</p>
                                <div className="bg-[#0a0a0a] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-4">
                                    <CardElement
                                        options={CARD_ELEMENT_OPTIONS}
                                        onChange={(e) => setCardComplete(e.complete)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-[10px] text-[#9e9087]">
                                    <span>🔒</span>
                                    <span>Secured by <strong className="text-[#c9a84c]">Stripe</strong>. Your card data never touches our server.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div>
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 sticky top-24">
                        <h2 className="font-heading text-xl text-[#f5f0eb] mb-5">Order Summary</h2>
                        <div className="space-y-3 mb-5">
                            {cart.items?.map(item => {
                                const p = item.product;
                                if (!p) return null;
                                const price = p.discountPrice > 0 ? p.discountPrice : p.price;
                                return (
                                    <div key={`${p._id}-${item.size}`} className="flex items-center gap-3">
                                        <div className="w-12 h-14 rounded overflow-hidden flex-shrink-0">
                                            <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#f5f0eb] truncate">{p.name}</p>
                                            <p className="text-xs text-[#9e9087]">{item.size} × {item.qty}</p>
                                        </div>
                                        <span className="text-sm text-[#c9a84c] flex-shrink-0">₹{(price * item.qty).toLocaleString('en-IN')}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-[rgba(201,168,76,0.1)] pt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-[#9e9087]"><span>Subtotal</span><span className="text-[#f5f0eb]">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                            {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount}</span></div>}
                            <div className="flex justify-between text-[#9e9087]"><span>Shipping</span><span className={shippingCost === 0 ? 'text-green-400' : 'text-[#f5f0eb]'}>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span></div>
                            <div className="border-t border-[rgba(201,168,76,0.1)] pt-3 flex justify-between font-semibold">
                                <span className="text-[#f5f0eb]">Total</span>
                                <span className="text-[#c9a84c] text-xl">₹{finalTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <Button type="submit" size="lg" loading={processing} className="w-full mt-6" disabled={paymentMethod === 'Stripe' && (!stripe || !cardComplete)}>
                            {paymentMethod === 'Stripe' ? `Pay ₹${finalTotal.toLocaleString('en-IN')}` : 'Place Order (COD)'}
                        </Button>
                        <p className="text-[10px] text-[#9e9087] text-center mt-3">🔒 Payments secured by Stripe</p>
                    </div>
                </div>
            </div>
        </form>
    );
}

// Outer wrapper that provides the Stripe Elements context
export default function CheckoutPage() {
    const location = useLocation();
    const { cart, cartTotal } = useCart();
    const { discount = 0, couponCode = '', shipping } = location.state || {};
    const shippingCost = shipping !== undefined ? shipping : (cartTotal > 2999 ? 0 : 149);
    const finalTotal = cartTotal - discount + shippingCost;

    return (
        <>
            <Helmet><title>Checkout — NOIR MAN</title></Helmet>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="font-heading text-4xl text-[#f5f0eb] mb-10">Checkout</h1>
                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        cart={cart}
                        cartTotal={cartTotal}
                        discount={discount}
                        couponCode={couponCode}
                        shippingCost={shippingCost}
                        finalTotal={finalTotal}
                    />
                </Elements>
            </div>
        </>
    );
}
