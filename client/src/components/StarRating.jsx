import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, total = 5, size = 16, interactive = false, onRate }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: total }).map((_, i) => {
                const filled = i < Math.round(rating);
                return (
                    <button
                        key={i}
                        onClick={() => interactive && onRate && onRate(i + 1)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                        type="button"
                        aria-label={`${i + 1} star`}
                    >
                        <Star
                            size={size}
                            className={filled ? 'text-[#c9a84c] fill-[#c9a84c]' : 'text-[#9e9087]'}
                        />
                    </button>
                );
            })}
        </div>
    );
}
