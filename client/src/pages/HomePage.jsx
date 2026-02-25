import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Star, ChevronRight } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';

const CATEGORIES = [
    { name: 'Shirts', icon: '👔', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', href: '/shop?category=Shirts' },
    { name: 'Suits', icon: '🤵', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', href: '/shop?category=Suits' },
    { name: 'Pants', icon: '👖', img: 'https://images.unsplash.com/photo-1594938298603-3d7c6e3f3b92?w=400', href: '/shop?category=Pants' },
    { name: 'Accessories', icon: '⌚', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', href: '/shop?category=Accessories' },
];

export default function HomePage() {
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [newRes, bestRes] = await Promise.all([
                    api.get('/api/products?limit=8&sort=newest'),
                    api.get('/api/products?limit=4&bestSeller=true'),
                ]);
                setNewArrivals(newRes.data.products);
                setBestSellers(bestRes.data.products);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <>
            <Helmet>
                <title>NOIR MAN — Luxury Men's Fashion</title>
                <meta name="description" content="Discover premium men's fashion at NOIR MAN. Shop suits, shirts, pants, accessories and more." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/20" />
                <div className="relative z-10 px-6 max-w-3xl">
                    <p className="text-[#c9a84c] text-xs tracking-[6px] uppercase mb-4 animate-pulse">New Collection 2024</p>
                    <h1 className="font-heading text-6xl md:text-8xl font-light text-[#f5f0eb] leading-none mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        Dress for<br />
                        <span className="text-[#c9a84c] italic">Excellence</span>
                    </h1>
                    <p className="text-[#9e9087] text-lg mb-10 max-w-md leading-relaxed">
                        Curated luxury menswear for the modern gentleman. Crafted from the finest materials, designed to command attention.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-4 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold tracking-widest uppercase rounded hover:bg-[#e0c070] transition-all duration-300 flex items-center gap-2"
                        >
                            Shop The Collection <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => navigate('/shop?category=Suits')}
                            className="px-8 py-4 border border-[rgba(201,168,76,0.4)] text-[#f5f0eb] text-sm font-semibold tracking-widest uppercase rounded hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all duration-300"
                        >
                            View Suits
                        </button>
                    </div>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <span className="text-[10px] tracking-widest uppercase text-[#9e9087]">Scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c] to-transparent animate-pulse" />
                </div>
            </section>

            {/* Marquee Strip */}
            <div className="border-y border-[rgba(201,168,76,0.15)] py-3 overflow-hidden">
                <div className="flex gap-16 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
                    {Array(4).fill(['✦ NEW ARRIVALS', '✦ FREE SHIPPING', '✦ PREMIUM QUALITY', '✦ TAILORED FIT', '✦ LUXURY FABRICS', '✦ EXCLUSIVE DESIGNS']).flat().map((text, i) => (
                        <span key={i} className="text-[11px] tracking-[4px] uppercase text-[#c9a84c] flex-shrink-0">{text}</span>
                    ))}
                </div>
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
            </div>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-14">
                    <p className="text-[#c9a84c] text-[11px] tracking-[5px] uppercase mb-3">Browse by Category</p>
                    <h2 className="font-heading text-4xl md:text-5xl text-[#f5f0eb]">The Collection</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <Link key={cat.name} to={cat.href} className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer">
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-5">
                                <h3 className="font-heading text-2xl text-[#f5f0eb] mb-1">{cat.name}</h3>
                                <span className="text-[#c9a84c] text-xs tracking-wider flex items-center gap-1 group-hover:gap-3 transition-all duration-300">
                                    Shop Now <ChevronRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-[#c9a84c] text-[11px] tracking-[5px] uppercase mb-3">Just Arrived</p>
                        <h2 className="font-heading text-4xl md:text-5xl text-[#f5f0eb]">New Arrivals</h2>
                    </div>
                    <Link to="/shop" className="text-sm text-[#9e9087] hover:text-[#c9a84c] transition-colors flex items-center gap-1 hover-underline">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {loading
                        ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                        : newArrivals.map(p => <ProductCard key={p._id} product={p} />)
                    }
                </div>
            </section>

            {/* Promo Banner */}
            <section className="relative py-24 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600)` }}
                />
                <div className="absolute inset-0 bg-[#0a0a0a]/85" />
                <div className="relative z-10 text-center px-6">
                    <p className="text-[#c9a84c] text-xs tracking-[6px] uppercase mb-4">Limited Time</p>
                    <h2 className="font-heading text-5xl md:text-7xl text-[#f5f0eb] mb-4">Up to <span className="text-[#c9a84c]">40% Off</span></h2>
                    <p className="text-[#9e9087] mt-3 mb-10 text-lg">On selected suits and jackets. Use code <strong className="text-[#c9a84c]">NOIR10</strong> for an extra 10%.</p>
                    <Link to="/shop?category=Suits" className="inline-flex items-center gap-2 px-10 py-4 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold tracking-widest uppercase rounded hover:bg-[#e0c070] transition-all duration-300">
                        Claim Offer <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-14">
                    <p className="text-[#c9a84c] text-[11px] tracking-[5px] uppercase mb-3">Editor's Choice</p>
                    <h2 className="font-heading text-4xl md:text-5xl text-[#f5f0eb]">Best Sellers</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {loading
                        ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                        : bestSellers.map(p => <ProductCard key={p._id} product={p} />)
                    }
                </div>
            </section>

            {/* Features Strip */}
            <section className="border-y border-[rgba(201,168,76,0.15)] py-14">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹2999' },
                        { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
                        { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay protected' },
                        { icon: '✦', title: 'Premium Quality', desc: 'Curated luxury materials' },
                    ].map(f => (
                        <div key={f.title}>
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-heading text-lg text-[#f5f0eb] mb-1">{f.title}</h3>
                            <p className="text-xs text-[#9e9087]">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
