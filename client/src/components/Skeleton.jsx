export function ProductSkeleton() {
    return (
        <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.08)] rounded-lg overflow-hidden">
            <div className="aspect-[3/4] skeleton" />
            <div className="p-4 space-y-3">
                <div className="h-3 skeleton rounded w-1/3" />
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-4 skeleton rounded w-1/4" />
            </div>
        </div>
    );
}

export function PageSpinner() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(201,168,76,0.15)]" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#c9a84c] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-3 flex items-center justify-center">
                    <span className="font-heading text-[#c9a84c] text-xs">✦</span>
                </div>
            </div>
        </div>
    );
}

export function InlineSpinner({ size = 16 }) {
    return (
        <div
            className="border-2 border-t-current border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin inline-block"
            style={{ width: size, height: size }}
        />
    );
}
