'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { X } from 'lucide-react';

const DetailOverlay = () => {
    const { selectedId, closeDetail } = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Derived state for product
    const product = selectedId ? Object.values(PRODUCTS).find((p) => p.id === selectedId) : null;
    const isActive = !!(selectedId && product);

    // Sync URL with selectedId
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (selectedId) {
            params.set('product', selectedId.toString());
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        } else {
            if (params.has('product')) {
                params.delete('product');
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }
    }, [selectedId, pathname, router, searchParams]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}
            aria-hidden={!isActive}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                onClick={isActive ? closeDetail : undefined}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row pointer-events-none">

                {/* Close Button */}
                <button
                    onClick={closeDetail}
                    className="absolute top-6 right-6 z-20 p-2 text-white/80 hover:text-white pointer-events-auto transition-colors"
                >
                    <X size={32} />
                </button>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center relative p-8 md:p-12">
                    {/* Hero Image */}
                    {/* This container MUST exist for FLIP target even if empty/hidden */}
                    <div
                        id="detail-image-target"
                        className="relative w-[80vw] h-[60vh] md:w-[60vw] md:h-[70vh] pointer-events-auto"
                    >
                        {/* Iterate to find image src for selectedId */}
                        {isActive && Object.entries(PRODUCTS).map(([src, p]) => {
                            if (p.id === selectedId) {
                                return (
                                    <Image
                                        key={src}
                                        src={src}
                                        alt={p.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        priority
                                    />
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="absolute bottom-32 left-8 md:static md:w-96 md:h-full md:bg-black/20 md:backdrop-blur-sm flex flex-col justify-center p-8 text-white pointer-events-auto">
                    {isActive && product && (
                        <div className="space-y-4">
                            <span className="text-sm tracking-widest uppercase opacity-70 border-b border-white/20 pb-1 inline-block">
                                {product.collection} Collection
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight">
                                {product.name}
                            </h2>
                            <p className="text-lg opacity-80 font-light max-w-sm">
                                {product.description}
                            </p>
                            <div className="pt-4 flex items-center gap-4">
                                <span className="text-2xl font-medium">{product.price}</span>
                                <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 transition-colors uppercase text-sm tracking-wider font-medium">
                                    Add to Quote
                                </button>
                            </div>

                            {/* Specs */}
                            <div className="pt-8 grid grid-cols-2 gap-4 text-sm opacity-60">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider mb-1">Dimensions</span>
                                    {product.dimensions}
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wider mb-1">Material</span>
                                    {product.material}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collection Strip */}
            <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-black/80 to-transparent z-20 flex items-center px-8 pointer-events-auto overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-6">
                    {isActive && product && product.relatedIds && product.relatedIds.length > 0 && (
                        <>
                            <span className="text-xs uppercase tracking-widest text-white/50 shrink-0 mr-2">
                                Also in {product.collection}
                            </span>
                            {product.relatedIds.map((relId) => {
                                const relProductEntry = Object.entries(PRODUCTS).find(([_, p]) => p.id === relId);
                                if (!relProductEntry) return null;
                                const [relSrc, relProduct] = relProductEntry;

                                return (
                                    <button
                                        key={relId}
                                        onClick={() => useStore.getState().openDetail(relId)}
                                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-white/10 hover:border-white/50 transition-colors shrink-0 group"
                                    >
                                        <Image
                                            src={relSrc}
                                            alt={relProduct.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailOverlay;
