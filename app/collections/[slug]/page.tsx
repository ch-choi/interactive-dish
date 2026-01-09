'use client';

import { use, useRef } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { COLLECTIONS, PRODUCTS } from '../../../data/products';
import BottomNav from '../../../components/ui/BottomNav';
import NavOverlays from '../../../components/ui/NavOverlays';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const collection = COLLECTIONS[slug];
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Filter products for this collection
    const collectionData = Object.entries(PRODUCTS)
        .filter(([_, product]) => product.collection.toLowerCase() === collection?.title.toLowerCase())
        .map(([src, product]) => ({ ...product, src }));

    if (!collection) {
        notFound();
    }

    useGSAP(() => {
        const tl = gsap.timeline();

        // Hero Init Animation
        // Hero Init Animation
        const title = heroRef.current?.querySelector('h1');
        const subtitle = heroRef.current?.querySelector('p');

        if (title) {
            tl.fromTo(title,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );
        }

        if (subtitle) {
            tl.fromTo(subtitle,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
                title ? "-=0.5" : 0
            );
        }

        // Hero Parallax
        if (heroRef.current) {
            const img = heroRef.current.querySelector('img');
            if (img) {
                gsap.to(img, {
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    },
                    y: 150, // Parallax movement
                    scale: 1.1 // Subtle scale up
                });
            }
        }

        // Text Reveal
        const texts = textRef.current?.querySelectorAll('h2');
        if (texts) {
            gsap.fromTo(texts,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.2,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: "top 75%"
                    }
                }
            );
        }

        // Specs Animation
        const specs = textRef.current?.querySelectorAll('.spec-item');
        if (specs) {
            gsap.fromTo(specs,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: specs[0],
                        start: "top 85%"
                    }
                }
            );
        }

        // Grid Animation
        const items = gridRef.current?.children;
        if (items) {
            gsap.fromTo(items,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 70%"
                    }
                }
            );
        }

    }, { dependencies: [slug] });

    return (
        <main className="min-h-screen bg-[#f1f1eb] text-neutral-900 pb-32">
            <NavOverlays />

            {/* Hero Section */}
            <div ref={heroRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-neutral-900">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={collection.heroImage}
                        alt={collection.title}
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 text-center text-white p-8">
                    <h1 className="text-7xl md:text-[10rem] font-serif mb-6 tracking-tighter leading-none">
                        {collection.title}
                    </h1>
                    <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto opacity-90">
                        {collection.subtitle}
                    </p>
                </div>
            </div>

            {/* Story & Specs */}
            <div ref={textRef} className="container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <h2 className="text-3xl md:text-6xl font-serif leading-tight text-neutral-800">
                        {collection.description}
                    </h2>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-neutral-300 py-16 text-center md:text-left">
                    <div className="spec-item">
                        <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Products</span>
                        <span className="text-3xl font-serif">{collection.specs.products} items</span>
                    </div>
                    <div className="spec-item">
                        <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Material</span>
                        <span className="text-3xl font-serif">{collection.specs.material}</span>
                    </div>
                    <div className="spec-item">
                        <span className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Palette</span>
                        <span className="text-3xl font-serif">{collection.specs.color}</span>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4">
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-24">
                    {collectionData.map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="relative aspect-square mb-6 overflow-hidden bg-white/50 rounded-sm">
                                <Image
                                    src={product.src}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-12 transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-serif mb-2 group-hover:text-neutral-600 transition-colors">{product.name}</h3>
                                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">{product.dimensions}</p>
                                <p className="text-lg font-medium">{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer space */}
            <div className="h-32" />

            {/* Reusing BottomNav for consistency */}
            <BottomNav />
        </main>
    );
}
