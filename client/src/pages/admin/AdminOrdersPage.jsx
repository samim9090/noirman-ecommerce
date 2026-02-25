import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Button from '../../components/Button';
import { PageSpinner } from '../../components/Skeleton';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/orders?page=${page}&limit=15`);
            setOrders(data.orders);
            setTotalPages(data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [page]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
            toast.success(`Order updated to ${newStatus}`);
            fetchOrders();
        } catch (e) { toast.error('Update failed'); }
    };

    const statusColors = {
        Placed: 'bg-blue-900/30 text-blue-400', Confirmed: 'bg-yellow-900/30 text-yellow-400',
        Processing: 'bg-purple-900/30 text-purple-400', Shipped: 'bg-indigo-900/30 text-indigo-400',
        Delivered: 'bg-green-900/30 text-green-400', Cancelled: 'bg-red-900/30 text-red-400',
    };

    const allStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <>
            <Helmet><title>Orders — Admin — NOIR MAN</title></Helmet>
            <div>
                <h1 className="font-heading text-3xl text-[#f5f0eb] mb-8">Orders Management</h1>

                {loading ? <PageSpinner /> : (
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] tracking-widest uppercase text-[#9e9087] border-b border-[rgba(201,168,76,0.05)]">
                                        <th className="px-4 py-3 text-left">Order ID</th>
                                        <th className="px-4 py-3 text-left">Customer</th>
                                        <th className="px-4 py-3 text-left">Items</th>
                                        <th className="px-4 py-3 text-left">Total</th>
                                        <th className="px-4 py-3 text-left">Payment</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-right">Update</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                                            <td className="px-4 py-3 text-xs text-[#c9a84c] font-mono">#{order._id.slice(-8).toUpperCase()}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-[#f5f0eb]">{order.user?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-[#9e9087]">{order.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#9e9087]">{order.items?.length} items</td>
                                            <td className="px-4 py-3 text-sm font-medium text-[#f5f0eb]">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {order.paymentMethod} · {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.orderStatus]}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#9e9087]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={e => handleStatusChange(order._id, e.target.value)}
                                                    className="bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] text-xs text-[#f5f0eb] rounded px-2 py-1.5 focus:outline-none focus:border-[#c9a84c]"
                                                >
                                                    {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && <p className="text-center py-10 text-[#9e9087] text-sm">No orders found.</p>}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 p-4 border-t border-[rgba(201,168,76,0.05)]">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button key={i} onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded text-xs ${page === i + 1 ? 'bg-[#c9a84c] text-[#0a0a0a]' : 'text-[#9e9087] hover:text-[#c9a84c]'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
