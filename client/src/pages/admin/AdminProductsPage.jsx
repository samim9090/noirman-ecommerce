import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import Button from '../../components/Button';
import { PageSpinner } from '../../components/Skeleton';

const CATEGORIES = ['Shirts', 'Pants', 'Suits', 'Accessories', 'Jackets', 'T-Shirts', 'Shoes', 'Watches'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', description: '', price: '', discountPrice: '', category: 'Shirts',
        sizes: ['M', 'L', 'XL'], colors: ['Black'], stock: '', isFeatured: false, isBestSeller: false,
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/products?page=${page}&limit=10`);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, [page]);

    const resetForm = () => {
        setForm({ name: '', description: '', price: '', discountPrice: '', category: 'Shirts', sizes: ['M', 'L', 'XL'], colors: ['Black'], stock: '', isFeatured: false, isBestSeller: false });
        setImageFiles([]);
        setEditing(null);
    };

    const handleEdit = (p) => {
        setForm({
            name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '',
            category: p.category, sizes: p.sizes || [], colors: p.colors || [],
            stock: p.stock, isFeatured: p.isFeatured, isBestSeller: p.isBestSeller,
        });
        setEditing(p._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/api/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (e) { toast.error('Delete failed'); }
    };

    const toggleSize = (s) => {
        setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', form.price);
            formData.append('discountPrice', form.discountPrice || 0);
            formData.append('category', form.category);
            formData.append('sizes', JSON.stringify(form.sizes));
            formData.append('colors', JSON.stringify(form.colors));
            formData.append('stock', form.stock);
            formData.append('isFeatured', form.isFeatured);
            formData.append('isBestSeller', form.isBestSeller);
            imageFiles.forEach(f => formData.append('images', f));

            if (editing) {
                await api.put(`/api/products/${editing}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product updated!');
            } else {
                await api.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Product created!');
            }
            resetForm();
            setShowForm(false);
            fetchProducts();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const inputClass = "w-full bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-4 py-2.5 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]";

    return (
        <>
            <Helmet><title>Products — Admin — NOIR MAN</title></Helmet>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-heading text-3xl text-[#f5f0eb]">Products</h1>
                        <p className="text-sm text-[#9e9087]">{products.length} products in catalog</p>
                    </div>
                    <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm">
                        <Plus size={16} /> Add Product
                    </Button>
                </div>

                {/* Product Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60" onClick={() => { setShowForm(false); resetForm(); }} />
                        <div className="relative bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="absolute top-4 right-4 text-[#9e9087] hover:text-[#f5f0eb]"><X size={20} /></button>
                            <h2 className="font-heading text-2xl text-[#f5f0eb] mb-6">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Name *</label>
                                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Description *</label>
                                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass + ' resize-none'} rows={3} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Price (₹) *</label>
                                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputClass} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Discount Price (₹)</label>
                                        <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Category</label>
                                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Stock *</label>
                                        <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputClass} required />
                                    </div>
                                </div>
                                {/* Sizes */}
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Sizes</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(s => (
                                            <button key={s} type="button" onClick={() => toggleSize(s)}
                                                className={`px-3 py-1.5 text-xs rounded border transition-all ${form.sizes.includes(s) ? 'bg-[rgba(201,168,76,0.1)] border-[#c9a84c] text-[#c9a84c]' : 'border-[rgba(201,168,76,0.2)] text-[#9e9087]'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Colors */}
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-1.5">Colors (comma-separated)</label>
                                    <input value={form.colors.join(', ')} onChange={e => setForm(f => ({ ...f, colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean) }))} className={inputClass} placeholder="Black, Navy, White" />
                                </div>
                                {/* Images */}
                                <div>
                                    <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">
                                        <Upload size={14} className="inline mr-1" /> Product Images
                                    </label>
                                    <input type="file" multiple accept="image/*" onChange={e => setImageFiles(Array.from(e.target.files))}
                                        className="block w-full text-sm text-[#9e9087] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#c9a84c] file:text-[#0a0a0a] file:font-medium file:cursor-pointer" />
                                </div>
                                {/* Toggles */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm text-[#9e9087] cursor-pointer">
                                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="accent-[#c9a84c]" />
                                        Featured
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-[#9e9087] cursor-pointer">
                                        <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} className="accent-[#c9a84c]" />
                                        Best Seller
                                    </label>
                                </div>
                                <Button type="submit" loading={saving} className="w-full">
                                    {editing ? 'Update Product' : 'Create Product'}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                {loading ? <PageSpinner /> : (
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] tracking-widest uppercase text-[#9e9087] border-b border-[rgba(201,168,76,0.05)]">
                                        <th className="px-4 py-3 text-left">Product</th>
                                        <th className="px-4 py-3 text-left">Category</th>
                                        <th className="px-4 py-3 text-left">Price</th>
                                        <th className="px-4 py-3 text-left">Stock</th>
                                        <th className="px-4 py-3 text-left">Featured</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-12 rounded overflow-hidden bg-[#0a0a0a] flex-shrink-0">
                                                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <span className="text-sm text-[#f5f0eb] truncate max-w-[200px]">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-[#9e9087]">{p.category}</td>
                                            <td className="px-4 py-3 text-sm text-[#c9a84c]">₹{p.discountPrice || p.price}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{p.isFeatured ? '⭐' : '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(p)} className="p-1.5 text-[#9e9087] hover:text-[#c9a84c] transition-colors"><Edit size={15} /></button>
                                                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-[#9e9087] hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
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
