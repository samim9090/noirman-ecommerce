import { CheckCircle, Package, Truck, Home } from 'lucide-react';

const STEPS = [
    { label: 'Order Placed', icon: CheckCircle, key: 'Placed' },
    { label: 'Confirmed', icon: Package, key: 'Confirmed' },
    { label: 'Shipped', icon: Truck, key: 'Shipped' },
    { label: 'Delivered', icon: Home, key: 'Delivered' },
];

export default function OrderStepper({ status }) {
    const currentIdx = STEPS.findIndex(s => s.key === status);
    const isCancelled = status === 'Cancelled';

    return (
        <div className="py-6">
            {isCancelled ? (
                <div className="text-center py-4 border border-red-500/30 rounded-lg bg-red-500/5">
                    <p className="text-red-400 font-medium">Order Cancelled</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-[rgba(201,168,76,0.1)]">
                        <div
                            className="h-full bg-[#c9a84c] transition-all duration-500"
                            style={{ width: `${currentIdx >= 0 ? (currentIdx / (STEPS.length - 1)) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="relative flex justify-between">
                        {STEPS.map((step, i) => {
                            const isCompleted = i <= currentIdx;
                            const isCurrent = i === currentIdx;
                            const Icon = step.icon;
                            return (
                                <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isCompleted
                                            ? 'bg-[#c9a84c] border-[#c9a84c] text-[#0a0a0a]'
                                            : 'bg-[#1e1a18] border-[rgba(201,168,76,0.2)] text-[#9e9087]'
                                        } ${isCurrent ? 'ring-2 ring-[#c9a84c]/30 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className={`text-xs font-medium text-center ${isCompleted ? 'text-[#c9a84c]' : 'text-[#9e9087]'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
