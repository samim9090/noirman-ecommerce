import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axiosInstance';
import OrderStepper from '../components/OrderStepper';
import { PageSpinner } from '../components/Skeleton';

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/api/orders/${id}`);
                setOrder(data.order);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <PageSpinner />;
    if (!order) return <div className="text-center py-24 text-[#9e9087]">Order not found.</div>;

    const statusColors = {
        Placed: 'text-blue-400', Confirmed: 'text-yellow-400', Processing: 'text-purple-400',
        Shipped: 'text-indigo-400', Delivered: 'text-green-400', Cancelled: 'text-red-400',
    };

    return (
        <>
            <Helmet><title>Order #{order._id.slice(-8).toUpperCase()} — NOIR MAN</title></Helmet>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/dashboard?tab=orders" className="flex items-center gap-2 text-sm text-[#9e9087] hover:text-[#c9a84c] transition-colors mb-8">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="font-heading text-3xl text-[#f5f0eb]">Order Details</h1>
                        <p className="text-[#9e9087] text-sm mt-1">#{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-sm font-semibold ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>

                {/* Stepper */}
                <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6 mb-6">
                    <h2 className="font-heading text-xl text-[#f5f0eb] mb-2">Order Tracking</h2>
                    <OrderStepper status={order.orderStatus} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Shipping Address */}
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6">
                        <h2 className="font-heading text-lg text-[#f5f0eb] mb-4">Shipping Address</h2>
                        <p className="font-medium text-[#f5f0eb]">{order.shippingAddress?.fullName}</p>
                        <p className="text-sm text-[#9e9087] mt-1">{order.shippingAddress?.addressLine1}</p>
                        {order.shippingAddress?.addressLine2 && <p className="text-sm text-[#9e9087]">{order.shippingAddress.addressLine2}</p>}
                        <p className="text-sm text-[#9e9087]">{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
                        <p className="text-sm text-[#9e9087] mt-1">📞 {order.shippingAddress?.phone}</p>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6">
                        <h2 className="font-heading text-lg text-[#f5f0eb] mb-4">Payment Info</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-[#9e9087]">Method</span><span className="text-[#f5f0eb]">{order.paymentMethod}</span></div>
                            <div className="flex justify-between"><span className="text-[#9e9087]">Status</span><span className={order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>{order.paymentStatus}</span></div>
                            {order.razorpayPaymentId && <div className="flex justify-between"><span className="text-[#9e9087]">Payment ID</span><span className="text-xs text-[#f5f0eb] font-mono">{order.razorpayPaymentId.slice(-12)}</span></div>}
                            <div className="border-t border-[rgba(201,168,76,0.1)] pt-2 mt-2 flex justify-between font-semibold">
                                <span className="text-[#f5f0eb]">Total</span>
                                <span className="text-[#c9a84c]">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6">
                    <h2 className="font-heading text-xl text-[#f5f0eb] mb-4">Items ({order.items?.length})</h2>
                    <div className="space-y-4">
                        {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-[rgba(201,168,76,0.05)] last:border-0 last:pb-0">
                                <div className="w-16 h-20 rounded overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[#f5f0eb]">{item.name}</p>
                                    <p className="text-xs text-[#9e9087] mt-1">
                                        {item.size && `Size: ${item.size}`}{item.color && ` · Color: ${item.color}`} · Qty: {item.qty}
                                    </p>
                                    <p className="text-sm text-[#c9a84c] mt-1">₹{item.price?.toLocaleString('en-IN')} × {item.qty}</p>
                                </div>
                                <span className="font-semibold text-[#f5f0eb]">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[rgba(201,168,76,0.1)] mt-4 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-[#9e9087]"><span>Subtotal</span><span className="text-[#f5f0eb]">₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                        {order.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{order.discount?.toLocaleString('en-IN')}</span></div>}
                        <div className="flex justify-between text-[#9e9087]"><span>Shipping</span><span className={order.shippingPrice === 0 ? 'text-green-400' : 'text-[#f5f0eb]'}>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
                        <div className="border-t border-[rgba(201,168,76,0.1)] pt-2 flex justify-between font-bold">
                            <span className="text-[#f5f0eb]">Total</span><span className="text-[#c9a84c] text-lg">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
