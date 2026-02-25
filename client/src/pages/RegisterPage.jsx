import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Account created! Welcome to NOIR MAN.');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const inputClass = "w-full bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]";

    return (
        <>
            <Helmet><title>Create Account — NOIR MAN</title></Helmet>
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <Link to="/" className="font-heading text-2xl tracking-[6px] text-[#f5f0eb] mb-12 block text-center">
                        NOIR <span className="text-[#c9a84c]">MAN</span>
                    </Link>
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-8">
                        <h1 className="font-heading text-3xl text-[#f5f0eb] mb-2">Create Account</h1>
                        <p className="text-sm text-[#9e9087] mb-8">Already have an account? <Link to="/login" className="text-[#c9a84c] hover:underline">Sign In</Link></p>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Full Name</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="your@email.com" required />
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Password</label>
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass + ' pr-10'} placeholder="Min 6 characters" required />
                                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9e9087]">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Confirm Password</label>
                                <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className={inputClass} placeholder="Repeat password" required />
                            </div>
                            <Button type="submit" size="lg" loading={loading} className="w-full">Create Account</Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
