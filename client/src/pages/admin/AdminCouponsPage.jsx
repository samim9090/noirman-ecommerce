import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Button from '../../components/Button';
import { PageSpinner } from '../../components/Skeleton';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ code: '', discountPercent: '', maxDiscount: '', minOrderAmount: '', expiresAt: '', isActive: true });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/coupons');
            setCoupons(data.coupons);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/coupons', form);
            toast.success('Coupon created!');
            setShowForm(false);
            setForm({ code: '', discountPercent: '', maxDiscount: '', minOrderAmount: '', expiresAt: '', isActive: true });
            fetchCoupons();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await api.delete(`/api/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (e) { toast.error('Delete failed'); }
    };

    const handleToggle = async (coupon) => {
        try {
            await api.put(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive });
            toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
            fetchCoupons();
        } catch (e) { toast.error('Update failed'); }
    };

    const inputClass = "w-full bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-4 py-2.5 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]";

    return (
        <>
            <Helmet><title>Coupons — Admin — NOIR MAN</title></Helmet>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-heading text-3xl text-[#f5f0eb]">Coupons</h1>
                    <Button onClick={() => setShowForm(true)} size="sm"><Plus size={16} /> Create Coupon</Button>
                </div>

                {/* Create Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
                        <div className="relative bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded-xl w-full max-w-md p-8">
                            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#9e9087] hover:text-[#f5f0eb]"><X size={20} /></button>
                            <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">New Coupon</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Code *</label>
                                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className={inputClass} placeholder="e.g. NOIR20" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Discount % *</label>
                                        <input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))} className={inputClass} placeholder="20" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Max Discount (₹)</label>
                                        <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} className={inputClass} placeholder="500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Min Order Amount (₹)</label>
                                    <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className={inputClass} placeholder="999" />
                                </div>
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Expires At *</label>
                                    <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className={inputClass} required />
                                </div>
                                <Button type="submit" loading={saving} className="w-full">Create Coupon</Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Coupons Table */}
                {loading ? <PageSpinner /> : (
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] tracking-widest uppercase text-[#9e9087] border-b border-[rgba(201,168,76,0.05)]">
                                        <th className="px-5 py-3 text-left">Code</th>
                                        <th className="px-5 py-3 text-left">Discount</th>
                                        <th className="px-5 py-3 text-left">Min Order</th>
                                        <th className="px-5 py-3 text-left">Max Discount</th>
                                        <th className="px-5 py-3 text-left">Expires</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(c => {
                                        const expired = new Date(c.expiresAt) < new Date();
                                        return (
                                            <tr key={c._id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                                                <td className="px-5 py-3 text-sm font-mono text-[#c9a84c] font-bold">{c.code}</td>
                                                <td className="px-5 py-3 text-sm text-[#f5f0eb]">{c.discountPercent}%</td>
                                                <td className="px-5 py-3 text-sm text-[#9e9087]">₹{c.minOrderAmount || '—'}</td>
                                                <td className="px-5 py-3 text-sm text-[#9e9087]">{c.maxDiscount ? `₹${c.maxDiscount}` : 'No cap'}</td>
                                                <td className="px-5 py-3 text-xs text-[#9e9087]">
                                                    {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                                                    {expired && <span className="ml-1 text-red-400">(expired)</span>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <button onClick={() => handleToggle(c)}
                                                        className={`text-xs px-2 py-1 rounded-full cursor-pointer ${c.isActive && !expired ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                                        {c.isActive && !expired ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <button onClick={() => handleDelete(c._id)} className="text-[#9e9087] hover:text-red-400"><Trash2 size={15} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {coupons.length === 0 && <p className="text-center py-10 text-[#9e9087] text-sm">No coupons. Create one!</p>}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
