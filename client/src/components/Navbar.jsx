import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, logout, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const categories = [
        { name: 'Shirts', href: '/shop?category=Shirts' },
        { name: 'Suits', href: '/shop?category=Suits' },
        { name: 'Pants', href: '/shop?category=Pants' },
        { name: 'Jackets', href: '/shop?category=Jackets' },
        { name: 'Shoes', href: '/shop?category=Shoes' },
        { name: 'Accessories', href: '/shop?category=Accessories' },
    ];

    return (
        <>
            {/* Top promo strip */}
            <div className="bg-[#c9a84c] text-[#0a0a0a] text-center text-xs py-2 font-medium tracking-widest uppercase">
                Free Shipping on Orders Above ₹2999 · Use Code <strong>NOIR10</strong> for 10% Off
            </div>

            {/* Main Navbar */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg shadow-black/40' : 'bg-[#0a0a0a]'} border-b border-[rgba(201,168,76,0.15)]`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <span className="font-heading text-2xl font-light tracking-[6px] text-[#f5f0eb]">
                                NOIR <span className="text-[#c9a84c]">MAN</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/shop" className="text-[#9e9087] hover:text-[#c9a84c] text-sm tracking-wider uppercase transition-colors hover-underline">Shop All</Link>
                            {categories.slice(0, 4).map(cat => (
                                <Link key={cat.name} to={cat.href} className="text-[#9e9087] hover:text-[#c9a84c] text-sm tracking-wider uppercase transition-colors hover-underline">
                                    {cat.name}
                                </Link>
                            ))}
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-[#9e9087] hover:text-[#c9a84c] transition-colors" aria-label="Search">
                                <Search size={20} />
                            </button>

                            {/* Wishlist */}
                            {user && (
                                <Link to="/dashboard?tab=wishlist" className="p-2 text-[#9e9087] hover:text-[#c9a84c] transition-colors" aria-label="Wishlist">
                                    <Heart size={20} />
                                </Link>
                            )}

                            {/* Cart */}
                            <Link to="/cart" className="relative p-2 text-[#9e9087] hover:text-[#c9a84c] transition-colors" aria-label="Cart">
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#c9a84c] text-[#0a0a0a] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User */}
                            {user ? (
                                <div className="relative">
                                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 p-2 text-[#9e9087] hover:text-[#c9a84c] transition-colors">
                                        <User size={20} />
                                        <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded-lg shadow-xl overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-[rgba(201,168,76,0.1)]">
                                                <p className="text-sm font-medium text-[#f5f0eb] truncate">{user.name}</p>
                                                <p className="text-xs text-[#9e9087] truncate">{user.email}</p>
                                            </div>
                                            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-[#9e9087] hover:text-[#c9a84c] hover:bg-black/30 transition-colors">
                                                <Package size={15} /> My Orders
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-[#c9a84c] hover:bg-black/30 transition-colors">
                                                    <Settings size={15} /> Admin Panel
                                                </Link>
                                            )}
                                            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#9e9087] hover:text-red-400 hover:bg-black/30 transition-colors">
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-1.5 px-4 py-1.5 border border-[rgba(201,168,76,0.4)] text-[#c9a84c] text-sm rounded hover:bg-[#c9a84c] hover:text-[#0a0a0a] transition-all duration-200">
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile hamburger */}
                            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#9e9087] hover:text-[#c9a84c]" aria-label="Menu">
                                {menuOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {searchOpen && (
                    <div className="border-t border-[rgba(201,168,76,0.1)] px-4 py-3">
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for products..."
                                className="flex-1 bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-4 py-2 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]"
                            />
                            <button type="submit" className="px-6 py-2 bg-[#c9a84c] text-[#0a0a0a] text-sm font-medium rounded hover:bg-[#e0c070] transition-colors">Search</button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-[rgba(201,168,76,0.1)] bg-[#0a0a0a]">
                        <div className="px-4 py-4 space-y-4">
                            <Link to="/shop" className="block text-sm tracking-wider uppercase text-[#9e9087] hover:text-[#c9a84c]">Shop All</Link>
                            {categories.map(cat => (
                                <Link key={cat.name} to={cat.href} className="block text-sm tracking-wider uppercase text-[#9e9087] hover:text-[#c9a84c]">
                                    {cat.name}
                                </Link>
                            ))}
                            {!user && (
                                <div className="pt-4 border-t border-[rgba(201,168,76,0.1)] flex gap-3">
                                    <Link to="/login" className="flex-1 text-center py-2 border border-[rgba(201,168,76,0.4)] text-[#c9a84c] text-sm rounded">Sign In</Link>
                                    <Link to="/register" className="flex-1 text-center py-2 bg-[#c9a84c] text-[#0a0a0a] text-sm font-medium rounded">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
