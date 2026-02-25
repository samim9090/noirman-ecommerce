import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <>
            <Helmet><title>404 — NOIR MAN</title></Helmet>
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <p className="font-heading text-[150px] text-[rgba(201,168,76,0.08)] leading-none select-none">404</p>
                <h1 className="font-heading text-4xl text-[#f5f0eb] -mt-12 mb-3">Page Not Found</h1>
                <p className="text-[#9e9087] max-w-md mb-10">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div className="flex gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a84c] text-[#0a0a0a] text-sm font-semibold tracking-wider uppercase rounded hover:bg-[#e0c070] transition-all">
                        <Home size={16} /> Go Home
                    </Link>
                    <Link to="/shop" className="px-6 py-3 border border-[rgba(201,168,76,0.4)] text-[#c9a84c] text-sm rounded hover:bg-[rgba(201,168,76,0.1)] transition-all">
                        Browse Shop
                    </Link>
                </div>
            </div>
        </>
    );
}
