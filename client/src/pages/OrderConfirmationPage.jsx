import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, MapPin, Calendar } from 'lucide-react';
import api from '../api/axiosInstance';
import OrderStepper from '../components/OrderStepper';
import { PageSpinner } from '../components/Skeleton';

export default function OrderConfirmationPage() {
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

    const shortId = order._id.slice(-8).toUpperCase();

    return (
        <>
            <Helmet><title>Order Confirmed — NOIR MAN</title></Helmet>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
                <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-400" />
                </div>
                <h1 className="font-heading text-4xl text-[#f5f0eb] mb-2">Order Confirmed!</h1>
                <p className="text-[#9e9087] mb-2">Thank you for your purchase. Your order is confirmed.</p>
                <p className="text-[#c9a84c] font-semibold text-lg mb-10">Order #<span>{shortId}</span></p>

                {/* Stepper */}
                <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-8 mb-8 text-left">
                    <h2 className="font-heading text-xl text-[#f5f0eb] mb-1">Order Tracking</h2>
                    <OrderStepper status={order.orderStatus} />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-left">
                        <Package size={18} className="text-[#c9a84c] mb-2" />
                        <p className="text-xs text-[#9e9087] mb-1">Payment</p>
                        <p className="text-sm font-medium text-[#f5f0eb]">{order.paymentMethod}</p>
                        <p className={`text-xs mt-0.5 ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>{order.paymentStatus}</p>
                    </div>
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-left">
                        <Calendar size={18} className="text-[#c9a84c] mb-2" />
                        <p className="text-xs text-[#9e9087] mb-1">Est. Delivery</p>
                        <p className="text-sm font-medium text-[#f5f0eb]">
                            {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '5-7 days'}
                        </p>
                    </div>
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-4 text-left col-span-2 md:col-span-1">
                        <MapPin size={18} className="text-[#c9a84c] mb-2" />
                        <p className="text-xs text-[#9e9087] mb-1">Delivering to</p>
                        <p className="text-sm font-medium text-[#f5f0eb]">{order.shippingAddress?.fullName}</p>
                        <p className="text-xs text-[#9e9087]">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6 mb-8 text-left">
                    <h2 className="font-heading text-xl text-[#f5f0eb] mb-4">Items Ordered</h2>
                    <div className="space-y-3">
                        {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 pb-3 border-b border-[rgba(201,168,76,0.05)] last:border-0 last:pb-0">
                                <div className="w-14 h-16 rounded overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-[#f5f0eb]">{item.name}</p>
                                    <p className="text-xs text-[#9e9087]">{item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`} · Qty: {item.qty}</p>
                                </div>
                                <span className="text-sm text-[#c9a84c]">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[rgba(201,168,76,0.1)] mt-4 pt-4 flex justify-between">
                        <span className="font-semibold text-[#f5f0eb]">Total Paid</span>
                        <span className="font-semibold text-[#c9a84c] text-lg">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link to="/dashboard?tab=orders" className="px-6 py-3 border border-[rgba(201,168,76,0.3)] text-[#c9a84c] text-sm rounded hover:bg-[rgba(201,168,76,0.1)] transition-all">
                        View My Orders
                    </Link>
                    <Link to="/shop" className="px-6 py-3 bg-[#c9a84c] text-[#0a0a0a] text-sm font-medium rounded hover:bg-[#e0c070] transition-all">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </>
    );
}
