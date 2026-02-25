import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Package, Heart, MapPin, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import OrderStepper from '../components/OrderStepper';
import { PageSpinner } from '../components/Skeleton';

export default function UserDashboardPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const { user, updateUser } = useAuth();

    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'wishlist') fetchWishlist();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/orders/my-orders');
            setOrders(data.orders);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/wishlist');
            setWishlist(data.wishlist);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await api.put('/api/users/profile', profileForm);
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
        finally { setSavingProfile(false); }
    };

    const handleRemoveWishlist = async (productId) => {
        try {
            await api.delete(`/api/wishlist/remove/${productId}`);
            setWishlist(w => w.filter(p => p._id !== productId));
            toast.success('Removed from wishlist');
        } catch (e) { toast.error('Failed'); }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
    ];

    const statusColors = {
        Placed: 'bg-blue-900/30 text-blue-400',
        Confirmed: 'bg-yellow-900/30 text-yellow-400',
        Processing: 'bg-purple-900/30 text-purple-400',
        Shipped: 'bg-indigo-900/30 text-indigo-400',
        Delivered: 'bg-green-900/30 text-green-400',
        Cancelled: 'bg-red-900/30 text-red-400',
    };

    const inputClass = "w-full bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]";

    return (
        <>
            <Helmet><title>My Account — NOIR MAN</title></Helmet>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="font-heading text-4xl text-[#f5f0eb] mb-8">My Account</h1>
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-6 mb-4">
                            <div className="w-14 h-14 bg-[rgba(201,168,76,0.1)] rounded-full flex items-center justify-center mb-3">
                                <User size={24} className="text-[#c9a84c]" />
                            </div>
                            <p className="font-medium text-[#f5f0eb]">{user?.name}</p>
                            <p className="text-xs text-[#9e9087] mt-0.5">{user?.email}</p>
                        </div>
                        <nav className="space-y-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setSearchParams({ tab: tab.id })}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === tab.id ? 'bg-[rgba(201,168,76,0.1)] text-[#c9a84c] border border-[rgba(201,168,76,0.2)]' : 'text-[#9e9087] hover:text-[#f5f0eb] hover:bg-[#1e1a18]'}`}>
                                        <Icon size={16} />{tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="md:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-8">
                                <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">Edit Profile</h2>
                                <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Full Name</label>
                                        <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Email</label>
                                        <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Phone</label>
                                        <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} placeholder="+91 9876543210" />
                                    </div>
                                    <div className="col-span-2">
                                        <Button type="submit" loading={savingProfile}>Save Changes</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">My Orders</h2>
                                {loading ? <PageSpinner /> : orders.length === 0 ? (
                                    <div className="text-center py-16 bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl">
                                        <Package size={48} className="text-[rgba(201,168,76,0.2)] mx-auto mb-4" />
                                        <p className="text-[#9e9087] mb-4">No orders yet.</p>
                                        <Link to="/shop" className="text-sm text-[#c9a84c] hover:underline">Start Shopping</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map(order => (
                                            <div key={order._id} className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-5">
                                                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                                                    <div>
                                                        <p className="text-xs text-[#9e9087]">Order #{order._id.slice(-8).toUpperCase()}</p>
                                                        <p className="text-xs text-[#9e9087] mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.orderStatus] || 'bg-gray-900/30 text-gray-400'}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                        <span className="text-sm font-semibold text-[#c9a84c]">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mb-4 overflow-x-auto pb-1">
                                                    {order.items?.slice(0, 4).map((item, i) => (
                                                        <div key={i} className="flex-shrink-0 w-12 h-14 rounded overflow-hidden bg-[#0a0a0a]">
                                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                                        </div>
                                                    ))}
                                                    {order.items?.length > 4 && <div className="flex-shrink-0 w-12 h-14 rounded bg-[#0a0a0a] flex items-center justify-center text-xs text-[#9e9087]">+{order.items.length - 4}</div>}
                                                </div>
                                                <Link to={`/orders/${order._id}`} className="text-xs text-[#c9a84c] hover:underline">View Details →</Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">Wishlist</h2>
                                {loading ? <PageSpinner /> : wishlist.length === 0 ? (
                                    <div className="text-center py-16 bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl">
                                        <Heart size={48} className="text-[rgba(201,168,76,0.2)] mx-auto mb-4" />
                                        <p className="text-[#9e9087] mb-4">Your wishlist is empty.</p>
                                        <Link to="/shop" className="text-sm text-[#c9a84c] hover:underline">Explore Products</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                        {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
