import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import Button from '../components/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset email sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally { setLoading(false); }
    };

    return (
        <>
            <Helmet><title>Forgot Password — NOIR MAN</title></Helmet>
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <Link to="/" className="font-heading text-2xl tracking-[6px] text-[#f5f0eb] mb-12 block text-center">
                        NOIR <span className="text-[#c9a84c]">MAN</span>
                    </Link>
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl p-8">
                        {sent ? (
                            <div className="text-center py-4">
                                <div className="text-5xl mb-4">📧</div>
                                <h1 className="font-heading text-2xl text-[#f5f0eb] mb-3">Check Your Inbox</h1>
                                <p className="text-sm text-[#9e9087] mb-6">We've sent a password reset link to <strong className="text-[#c9a84c]">{email}</strong>. Check your inbox and follow the instructions.</p>
                                <Link to="/login" className="text-sm text-[#c9a84c] hover:underline">← Back to Sign In</Link>
                            </div>
                        ) : (
                            <>
                                <h1 className="font-heading text-3xl text-[#f5f0eb] mb-2">Forgot Password?</h1>
                                <p className="text-sm text-[#9e9087] mb-8">Enter your email and we'll send a reset link.</p>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs tracking-wider uppercase text-[#9e9087] mb-2">Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                            className="w-full bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-4 py-3 text-sm text-[#f5f0eb] placeholder-[#9e9087] focus:outline-none focus:border-[#c9a84c]"
                                            placeholder="your@email.com" />
                                    </div>
                                    <Button type="submit" size="lg" loading={loading} className="w-full">Send Reset Link</Button>
                                    <Link to="/login" className="block text-center text-xs text-[#9e9087] hover:text-[#c9a84c]">← Back to Sign In</Link>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
