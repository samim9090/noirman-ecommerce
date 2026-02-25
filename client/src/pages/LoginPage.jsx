import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const inputClass = "w-full bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c] transition-colors";

    return (
        <>
            <Helmet><title>Sign In — NOIR MAN</title></Helmet>
            <div className="min-h-screen bg-[#0a0a0a] flex">
                {/* Left Image */}
                <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800" alt="Fashion" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute bottom-12 left-12">
                        <h2 className="font-heading text-5xl text-[#f5f0eb] leading-tight">Welcome<br />Back.</h2>
                        <p className="text-[#c9a84c] mt-2 text-sm tracking-widest uppercase">Luxury Awaits</p>
                    </div>
                </div>

                {/* Right Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
                    <div className="max-w-sm w-full mx-auto">
                        <Link to="/" className="font-heading text-2xl tracking-[6px] text-[#f5f0eb] mb-12 block">
                            NOIR <span className="text-[#c9a84c]">MAN</span>
                        </Link>
                        <h1 className="font-heading text-3xl text-[#f5f0eb] mb-2">Sign In</h1>
                        <p className="text-sm text-[#9e9087] mb-8">Don't have an account? <Link to="/register" className="text-[#c9a84c] hover:underline">Register</Link></p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="your@email.com" required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Password</label>
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass + ' pr-10'} placeholder="••••••••" required />
                                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9087] hover:text-[#c9a84c]">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="text-right mt-1">
                                    <Link to="/forgot-password" className="text-xs text-[#9e9087] hover:text-[#c9a84c]">Forgot password?</Link>
                                </div>
                            </div>
                            <Button type="submit" size="lg" loading={loading} className="w-full">Sign In</Button>
                        </form>

                        <div className="mt-6 p-4 border border-[rgba(201,168,76,0.1)] rounded-lg text-xs text-[#9e9087] space-y-1">
                            <p className="text-[#c9a84c] font-medium mb-2">Demo Admin:</p>
                            <p>Email: <span className="text-[#f5f0eb]">admin@noirman.com</span></p>
                            <p>Password: <span className="text-[#f5f0eb]">Admin@123</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
