import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { PageSpinner } from '../components/Skeleton';
import Button from '../components/Button';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [addingToCart, setAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, reviewRes] = await Promise.all([
                    api.get(`/api/products/${id}`),
                    api.get(`/api/products/${id}/reviews`),
                ]);
                const p = prodRes.data.product;
                setProduct(p);
                setReviews(reviewRes.data.reviews);
                setSelectedSize(p.sizes?.[0] || '');
                setSelectedColor(p.colors?.[0] || '');
                // Fetch related
                const relRes = await api.get(`/api/products?category=${p.category}&limit=4`);
                setRelated(relRes.data.products.filter(r => r._id !== id));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return <PageSpinner />;
    if (!product) return <div className="text-center py-24 text-[#9e9087]">Product not found.</div>;

    const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    const discountPct = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
    const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600'];

    const handleAddToCart = async () => {
        if (!user) { navigate('/login'); return; }
        if (!selectedSize && product.sizes?.length > 0) { toast.error('Please select a size'); return; }
        try {
            setAddingToCart(true);
            await addToCart(product._id, qty, selectedSize, selectedColor);
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        } finally { setAddingToCart(false); }
    };

    const handleWishlist = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            setWishlistLoading(true);
            await api.post(`/api/wishlist/add/${product._id}`);
            toast.success('Added to wishlist ❤️');
        } catch (e) { toast.error('Failed'); } finally { setWishlistLoading(false); }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        try {
            setSubmittingReview(true);
            const { data } = await api.post(`/api/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
            setReviews(prev => [data.review, ...prev]);
            setReviewComment('');
            toast.success('Review submitted!');
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review'); }
        finally { setSubmittingReview(false); }
    };

    return (
        <>
            <Helmet><title>{product.name} — NOIR MAN</title></Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-[#9e9087] mb-8">
                    <a href="/" className="hover:text-[#c9a84c]">Home</a><span>/</span>
                    <a href="/shop" className="hover:text-[#c9a84c]">Shop</a><span>/</span>
                    <a href={`/shop?category=${product.category}`} className="hover:text-[#c9a84c]">{product.category}</a><span>/</span>
                    <span className="text-[#f5f0eb]">{product.name}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] bg-[#1e1a18] rounded-lg overflow-hidden group">
                            <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            {discountPct > 0 && (
                                <span className="absolute top-4 left-4 bg-[#c9a84c] text-[#0a0a0a] text-xs font-bold px-3 py-1 rounded">-{discountPct}%</span>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setSelectedImg(p => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0a]/70 rounded-full flex items-center justify-center text-[#f5f0eb] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setSelectedImg(p => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0a]/70 rounded-full flex items-center justify-center text-[#f5f0eb] opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setSelectedImg(i)} className={`flex-shrink-0 w-20 h-24 rounded overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-[#c9a84c]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <p className="text-[11px] tracking-[4px] uppercase text-[#c9a84c] mb-2">{product.category}</p>
                        <h1 className="font-heading text-4xl text-[#f5f0eb] mb-3">{product.name}</h1>
                        <div className="flex items-center gap-3 mb-4">
                            <StarRating rating={product.ratings} size={16} />
                            <span className="text-sm text-[#9e9087]">({product.numReviews} reviews)</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${product.stock > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="font-heading text-4xl text-[#c9a84c]">₹{displayPrice.toLocaleString('en-IN')}</span>
                            {product.discountPrice > 0 && (
                                <span className="text-xl text-[#9e9087] line-through">₹{product.price.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        {/* Size selector */}
                        {product.sizes?.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-xs tracking-widest uppercase text-[#f5f0eb]">Size: <span className="text-[#c9a84c]">{selectedSize}</span></p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map(s => (
                                        <button key={s} onClick={() => setSelectedSize(s)}
                                            className={`px-4 py-2 border text-sm rounded transition-all ${selectedSize === s ? 'border-[#c9a84c] bg-[rgba(201,168,76,0.1)] text-[#c9a84c]' : 'border-[rgba(201,168,76,0.2)] text-[#9e9087] hover:border-[#c9a84c]'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color selector */}
                        {product.colors?.length > 0 && (
                            <div className="mb-6">
                                <p className="text-xs tracking-widest uppercase text-[#f5f0eb] mb-3">Color: <span className="text-[#c9a84c]">{selectedColor}</span></p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.colors.map(c => (
                                        <button key={c} onClick={() => setSelectedColor(c)}
                                            className={`px-4 py-2 border text-sm rounded transition-all ${selectedColor === c ? 'border-[#c9a84c] bg-[rgba(201,168,76,0.1)] text-[#c9a84c]' : 'border-[rgba(201,168,76,0.2)] text-[#9e9087] hover:border-[#c9a84c]'}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="flex items-center gap-4 mb-8">
                            <p className="text-xs tracking-widest uppercase text-[#f5f0eb]">Qty:</p>
                            <div className="flex items-center border border-[rgba(201,168,76,0.2)] rounded overflow-hidden">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 text-[#9e9087] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.05)] transition-colors flex items-center justify-center">−</button>
                                <span className="w-10 text-center text-sm text-[#f5f0eb]">{qty}</span>
                                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 text-[#9e9087] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.05)] transition-colors flex items-center justify-center">+</button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-3 mb-8">
                            <Button onClick={handleAddToCart} loading={addingToCart} disabled={product.stock === 0} size="lg" className="flex-1">
                                <ShoppingBag size={16} /> Add to Cart
                            </Button>
                            <Button onClick={handleWishlist} loading={wishlistLoading} variant="outline" size="lg">
                                <Heart size={16} />
                            </Button>
                        </div>

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 border border-[rgba(201,168,76,0.1)] text-[#9e9087] text-xs rounded-full">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-[rgba(201,168,76,0.1)] mb-8">
                    <div className="flex gap-8">
                        {['description', 'reviews'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm tracking-wider capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-[#9e9087] hover:text-[#f5f0eb]'}`}>
                                {tab} {tab === 'reviews' && `(${reviews.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'description' && (
                    <div className="max-w-2xl text-[#9e9087] leading-relaxed mb-20">{product.description}</div>
                )}

                {activeTab === 'reviews' && (
                    <div className="max-w-2xl mb-20 space-y-8">
                        {/* Review Form */}
                        {user && (
                            <form onSubmit={handleReviewSubmit} className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-lg p-6 space-y-4">
                                <h3 className="font-heading text-xl text-[#f5f0eb]">Write a Review</h3>
                                <StarRating rating={reviewRating} size={24} interactive onRate={setReviewRating} />
                                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} required
                                    placeholder="Share your thoughts..." rows={4}
                                    className="w-full bg-[#0a0a0a] border border-[rgba(201,168,76,0.15)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c] resize-none"
                                />
                                <Button type="submit" loading={submittingReview} size="sm">Submit Review</Button>
                            </form>
                        )}
                        {reviews.length === 0 ? (
                            <p className="text-[#9e9087] py-8">No reviews yet. Be the first!</p>
                        ) : (
                            reviews.map(r => (
                                <div key={r._id} className="border-b border-[rgba(201,168,76,0.08)] pb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-[#f5f0eb]">{r.user?.name || 'Anonymous'}</p>
                                        <span className="text-xs text-[#9e9087]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <StarRating rating={r.rating} size={14} />
                                    <p className="text-sm text-[#9e9087] mt-2 leading-relaxed">{r.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Related Products */}
                {related.length > 0 && (
                    <div>
                        <h2 className="font-heading text-3xl text-[#f5f0eb] mb-8">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {related.map(p => <ProductCard key={p._id} product={p} />)}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
