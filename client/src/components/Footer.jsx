import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0d0b09] border-t border-[rgba(201,168,76,0.15)] mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h3 className="font-heading text-3xl font-light tracking-[6px] text-[#f5f0eb] mb-4">
                            NOIR <span className="text-[#c9a84c]">MAN</span>
                        </h3>
                        <p className="text-sm text-[#9e9087] leading-relaxed mb-6">
                            The modern gentleman's destination for luxury men's fashion. Curated from the finest materials, crafted for the discerning man.
                        </p>
                        <div className="flex gap-3">
                            {[{ Icon: Instagram, href: '#' }, { Icon: Twitter, href: '#' }, { Icon: Facebook, href: '#' }, { Icon: Youtube, href: '#' }].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-9 h-9 border border-[rgba(201,168,76,0.2)] rounded flex items-center justify-center text-[#9e9087] hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all duration-200">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-xs tracking-widest uppercase text-[#c9a84c] mb-5 font-medium">Shop</h4>
                        <ul className="space-y-3">
                            {['Shirts', 'Suits', 'Pants', 'Jackets', 'T-Shirts', 'Shoes', 'Watches', 'Accessories'].map(cat => (
                                <li key={cat}>
                                    <Link to={`/shop?category=${cat}`} className="text-sm text-[#9e9087] hover:text-[#f5f0eb] transition-colors hover-underline">{cat}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h4 className="text-xs tracking-widest uppercase text-[#c9a84c] mb-5 font-medium">Help</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Size Guide', href: '#' },
                                { label: 'Shipping Info', href: '#' },
                                { label: 'Returns & Exchanges', href: '#' },
                                { label: 'Track Your Order', href: '/dashboard?tab=orders' },
                                { label: 'FAQ', href: '#' },
                                { label: 'Contact Us', href: '#' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <Link to={href} className="text-sm text-[#9e9087] hover:text-[#f5f0eb] transition-colors hover-underline">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact + Newsletter */}
                    <div>
                        <h4 className="text-xs tracking-widest uppercase text-[#c9a84c] mb-5 font-medium">Stay Connected</h4>
                        <div className="space-y-3 mb-6 text-sm text-[#9e9087]">
                            <div className="flex items-center gap-2"><Mail size={14} className="text-[#c9a84c]" /><span>support@noirman.com</span></div>
                            <div className="flex items-center gap-2"><Phone size={14} className="text-[#c9a84c]" /><span>+91 98765 43210</span></div>
                            <div className="flex items-center gap-2"><MapPin size={14} className="text-[#c9a84c]" /><span>Mumbai, India</span></div>
                        </div>
                        <p className="text-xs text-[#9e9087] mb-3">Subscribe for exclusive offers</p>
                        <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 bg-[#1e1a18] border border-[rgba(201,168,76,0.15)] rounded px-3 py-2 text-xs text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]"
                            />
                            <button className="px-3 py-2 bg-[#c9a84c] text-[#0a0a0a] text-xs font-medium rounded hover:bg-[#e0c070] transition-colors">Join</button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-[rgba(201,168,76,0.1)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#9e9087]">© {new Date().getFullYear()} NOIR MAN. All rights reserved.</p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                            <a key={l} href="#" className="text-xs text-[#9e9087] hover:text-[#c9a84c] transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
