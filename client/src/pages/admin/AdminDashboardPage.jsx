import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { PageSpinner } from '../../components/Skeleton';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    api.get('/api/orders/stats'),
                    api.get('/api/orders?limit=5'),
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data.orders);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <PageSpinner />;

    const cards = [
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20' },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-500/20' },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-500/20' },
        { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-[#c9a84c]', bg: 'bg-[rgba(201,168,76,0.1)] border-[rgba(201,168,76,0.2)]' },
    ];

    const statusColors = {
        Placed: 'bg-blue-900/30 text-blue-400', Confirmed: 'bg-yellow-900/30 text-yellow-400',
        Shipped: 'bg-indigo-900/30 text-indigo-400', Delivered: 'bg-green-900/30 text-green-400', Cancelled: 'bg-red-900/30 text-red-400',
    };

    return (
        <>
            <Helmet><title>Admin Dashboard — NOIR MAN</title></Helmet>
            <div>
                <div className="mb-8">
                    <h1 className="font-heading text-3xl text-[#f5f0eb]">Dashboard</h1>
                    <p className="text-[#9e9087] text-sm mt-1">Welcome back, Admin. Here's your overview.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {cards.map(card => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className={`border rounded-xl p-5 ${card.bg}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <Icon size={20} className={card.color} />
                                    <TrendingUp size={14} className="text-[#9e9087]" />
                                </div>
                                <p className="font-heading text-2xl text-[#f5f0eb] mb-1">{card.value}</p>
                                <p className="text-xs text-[#9e9087]">{card.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Orders Table */}
                <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(201,168,76,0.1)]">
                        <h2 className="font-heading text-xl text-[#f5f0eb]">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-xs text-[#c9a84c] hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] tracking-widest uppercase text-[#9e9087] border-b border-[rgba(201,168,76,0.05)]">
                                    <th className="px-6 py-3 text-left">Order ID</th>
                                    <th className="px-6 py-3 text-left">Customer</th>
                                    <th className="px-6 py-3 text-left">Total</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)] transition-colors">
                                        <td className="px-6 py-4 text-xs text-[#c9a84c] font-mono">#{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-[#f5f0eb]">{order.user?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-sm text-[#f5f0eb]">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-gray-900/30 text-gray-400'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#9e9087]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentOrders.length === 0 && <p className="text-center py-10 text-[#9e9087] text-sm">No orders yet.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
