import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';

const CATEGORIES = ['Shirts', 'Pants', 'Suits', 'Accessories', 'Jackets', 'T-Shirts', 'Shoes', 'Watches'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ShopPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const category = searchParams.get('category') || '';
    const size = searchParams.get('size') || '';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page')) || 1;
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (size) params.set('size', size);
            if (sort) params.set('sort', sort);
            if (search) params.set('search', search);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            params.set('page', page);
            params.set('limit', 12);
            const { data } = await api.get(`/api/products?${params}`);
            setProducts(data.products);
            setTotal(data.total);
            setPages(data.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [category, size, sort, search, page, minPrice, maxPrice]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        next.delete('page');
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const Sidebar = () => (
        <div className="w-full">
            {/* Category */}
            <div className="mb-8">
                <h3 className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-4">Category</h3>
                <div className="space-y-2">
                    <button onClick={() => setParam('category', '')} className={`w-full text-left text-sm py-1.5 transition-colors ${!category ? 'text-[#c9a84c]' : 'text-[#9e9087] hover:text-[#f5f0eb]'}`}>
                        All Categories
                    </button>
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setParam('category', c)} className={`w-full text-left text-sm py-1.5 transition-colors ${category === c ? 'text-[#c9a84c]' : 'text-[#9e9087] hover:text-[#f5f0eb]'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div className="mb-8">
                <h3 className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                    {SIZES.map(s => (
                        <button key={s} onClick={() => setParam('size', size === s ? '' : s)}
                            className={`px-3 py-1.5 border text-xs rounded transition-all ${size === s ? 'border-[#c9a84c] text-[#c9a84c] bg-[rgba(201,168,76,0.1)]' : 'border-[rgba(201,168,76,0.2)] text-[#9e9087] hover:border-[#c9a84c]'}`}
                        >{s}</button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
                <h3 className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-4">Price Range</h3>
                <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setParam('minPrice', e.target.value)}
                        className="w-full bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-3 py-2 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)}
                        className="w-full bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-3 py-2 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]" />
                </div>
            </div>

            <button onClick={clearFilters} className="text-xs text-[#9e9087] hover:text-red-400 transition-colors flex items-center gap-1">
                <X size={12} /> Clear All Filters
            </button>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>{category ? `${category} — NOIR MAN` : 'Shop — NOIR MAN'}</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-[#c9a84c] text-[11px] tracking-[5px] uppercase mb-2">Explore</p>
                    <h1 className="font-heading text-4xl text-[#f5f0eb]">
                        {search ? `Search: "${search}"` : category || 'All Products'}
                    </h1>
                    <p className="text-[#9e9087] text-sm mt-1">{total} products found</p>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-56 flex-shrink-0">
                        <Sidebar />
                    </aside>

                    {/* Products */}
                    <div className="flex-1">
                        {/* Sort + Filter bar */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(201,168,76,0.1)]">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden flex items-center gap-2 text-sm text-[#9e9087] border border-[rgba(201,168,76,0.2)] px-4 py-2 rounded hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
                                <SlidersHorizontal size={15} /> Filters
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[#9e9087]">Sort by:</span>
                                <select value={sort} onChange={e => setParam('sort', e.target.value)}
                                    className="bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] text-sm text-[#f5f0eb] px-3 py-1.5 rounded focus:outline-none focus:border-[#c9a84c]">
                                    <option value="newest">Newest</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {loading
                                ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                                : products.length === 0
                                    ? (
                                        <div className="col-span-3 py-24 text-center">
                                            <p className="font-heading text-3xl text-[#f5f0eb] mb-3">No Products Found</p>
                                            <p className="text-[#9e9087] mb-6">Try adjusting your filters or search term.</p>
                                            <button onClick={clearFilters} className="px-6 py-2 border border-[#c9a84c] text-[#c9a84c] text-sm rounded hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all">
                                                Clear Filters
                                            </button>
                                        </div>
                                    )
                                    : products.map(p => <ProductCard key={p._id} product={p} />)
                            }
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pages }).map((_, i) => (
                                    <button key={i} onClick={() => setParam('page', i + 1)}
                                        className={`w-10 h-10 rounded border text-sm transition-all ${page === i + 1 ? 'bg-[#c9a84c] border-[#c9a84c] text-[#0a0a0a] font-bold' : 'border-[rgba(201,168,76,0.2)] text-[#9e9087] hover:border-[#c9a84c]'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-72 bg-[#0d0b09] border-r border-[rgba(201,168,76,0.1)] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-heading text-xl text-[#f5f0eb]">Filters</h3>
                            <button onClick={() => setSidebarOpen(false)}><X size={20} className="text-[#9e9087]" /></button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}
        </>
    );
}
