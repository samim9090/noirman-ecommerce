export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
    const sizes = { sm: 'px-4 py-1.5 text-xs', md: 'px-6 py-2.5 text-sm', lg: 'px-8 py-3.5 text-sm', xl: 'px-10 py-4 text-base' };
    const variants = {
        primary: 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#e0c070] active:scale-[0.98]',
        outline: 'border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0a0a] active:scale-[0.98]',
        ghost: 'text-[#9e9087] hover:text-[#f5f0eb] hover:bg-white/5',
        danger: 'border border-red-500/40 text-red-400 hover:bg-red-500/10 active:scale-[0.98]',
        dark: 'bg-[#1e1a18] border border-[rgba(201,168,76,0.2)] text-[#f5f0eb] hover:border-[#c9a84c] active:scale-[0.98]',
    };
    return (
        <button
            disabled={disabled || loading}
            className={`${base} ${sizes[size]} ${variants[variant]} rounded ${className}`}
            {...props}
        >
            {loading && <span className="w-4 h-4 border-2 border-t-current border-r-transparent rounded-full animate-spin" />}
            {children}
        </button>
    );
}
