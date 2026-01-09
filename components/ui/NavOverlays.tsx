'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { getAllCollections } from '@/data/products';
import { useStore } from '@/store/useStore';
import Image from 'next/image';

const collections = getAllCollections();

export default function NavOverlays() {
    const {
        isMenuOpen,
        isAboutOpen,
        isContactOpen,
        isFilterOpen,
        isSearchOpen,
        toggleMenu,
        toggleAbout,
        toggleContact,
        toggleFilter,
        toggleSearch
    } = useStore();

    const menuRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);

    useGSAP(() => {
        // Menu Animation
        gsap.to(menuRef.current, {
            y: isMenuOpen ? 0 : '100%',
            autoAlpha: isMenuOpen ? 1 : 0,
            duration: 0.8,
            ease: 'power4.inOut' // More dramatic ease for premium feel
        });

        // About Animation
        gsap.to(aboutRef.current, {
            x: isAboutOpen ? 0 : '100%', // Slide from right
            autoAlpha: isAboutOpen ? 1 : 0,
            duration: 0.6,
            ease: 'power3.out'
        });

        // Contact Animation
        gsap.to(contactRef.current, {
            x: isContactOpen ? 0 : '-100%', // Slide from left
            autoAlpha: isContactOpen ? 1 : 0,
            duration: 0.6,
            ease: 'power3.out'
        });

        // Filter Animation
        gsap.to(filterRef.current, {
            y: isFilterOpen ? 0 : '100%',
            autoAlpha: isFilterOpen ? 1 : 0,
            duration: 0.5,
            ease: 'power3.out'
        });

        // Search Animation
        gsap.to(searchRef.current, {
            y: isSearchOpen ? 0 : '-100%', // Slide from top
            autoAlpha: isSearchOpen ? 1 : 0,
            duration: 0.5,
            ease: 'power3.out'
        });

    }, [isMenuOpen, isAboutOpen, isContactOpen, isFilterOpen, isSearchOpen]);

    // Handle Image Preview Transitions
    useGSAP(() => {
        if (!previewRef.current) return;

        const images = previewRef.current.querySelectorAll('.collection-preview');

        images.forEach((img) => {
            const isTarget = img.getAttribute('data-collection') === hoveredCollection;

            gsap.to(img, {
                opacity: isTarget ? 1 : 0,
                scale: isTarget ? 1.05 : 1, // Subtle zoom in
                duration: 0.6,
                ease: 'power2.out',
                overwrite: true
            });
        });

    }, [hoveredCollection]);


    // Common overlay classes
    const overlayClasses = "fixed inset-0 bg-[#EAE7E0] z-40 flex flex-col p-6 md:p-12 pt-24 invisible opacity-0";

    return (
        <>
            {/* --- MAIN MENU (COLLECTIONS) --- */}
            <div ref={menuRef} className={`${overlayClasses} bg-[#EAE7E0] text-[#2C3E50]`}>
                <div className="w-full h-full flex flex-col md:flex-row gap-8 relative overflow-hidden">

                    {/* Background/Preview Area (Desktop) */}
                    <div ref={previewRef} className="absolute inset-0 pointer-events-none hidden md:block opacity-20 md:opacity-100 md:relative md:w-1/2 md:h-full md:order-2 rounded-xl overflow-hidden">
                        {collections.map((col) => (
                            <div
                                key={col.slug}
                                data-collection={col.slug}
                                className="collection-preview absolute inset-0 w-full h-full opacity-0"
                            >
                                <Image
                                    src={col.heroImage}
                                    alt={col.title}
                                    fill
                                    className="object-cover"
                                    priority={true} // Prioritize loading menu images
                                />
                                <div className="absolute inset-0 bg-black/10" /> {/* Subtle overlay */}
                            </div>
                        ))}
                        {/* Default/Fallback State (Optional - or show first collection) */}
                        <div
                            className={`collection-preview absolute inset-0 w-full h-full flex items-center justify-center bg-[#D8D3C8] transition-opacity duration-500 ${hoveredCollection ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <p className="font-serif text-2xl italic text-[#2C3E50]/50">Select a collection</p>
                        </div>
                    </div>

                    {/* Navigation List */}
                    <div className="flex flex-col justify-center items-start w-full md:w-1/2 md:order-1 z-10 h-full">
                        <h2 className="text-sm uppercase tracking-widest mb-8 text-[#2C3E50]/60 font-medium">Collections</h2>
                        <ul className="space-y-6">
                            {collections.map((col) => (
                                <li
                                    key={col.slug}
                                    onMouseEnter={() => setHoveredCollection(col.slug)}
                                // onMouseLeave={() => setHoveredCollection(null)} // Optional: keep last selection
                                >
                                    <Link
                                        href={`/collections/${col.slug}`}
                                        className="text-4xl md:text-6xl font-serif hover:italic transition-all group flex items-center gap-4 text-[#2C3E50]"
                                        onClick={toggleMenu}
                                    >
                                        <span className={`text-2xl transition-all duration-300 ${hoveredCollection === col.slug ? 'opacity-100 translate-x-2' : 'opacity-0 -translate-x-2'}`}>
                                            →
                                        </span>
                                        <span className="relative">
                                            {col.title}
                                            <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-[#2C3E50] origin-left transition-transform duration-300 ${hoveredCollection === col.slug ? 'scale-x-100' : 'scale-x-0'}`} />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={toggleMenu}
                        className="absolute top-0 right-0 p-4 hover:rotate-90 transition-transform duration-300 text-[#2C3E50]"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* --- ABOUT OVERLAY --- */}
            <div ref={aboutRef} className={`${overlayClasses} bg-[#2C3E50] text-[#EAE7E0]`}>
                <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
                    <h2 className="text-5xl md:text-7xl font-serif mb-8">Our Story</h2>
                    <p className="text-xl md:text-2xl font-light leading-relaxed max-w-2xl">
                        Interactive Dish is an exploration of form, function, and digital craftsmanship.
                        Inspired by the tactile nature of ceramics, we aim to bring the physical experience
                        of fine dinnerware into the digital realm.
                    </p>
                    <div className="mt-12 grid grid-cols-2 gap-8 max-w-lg">
                        <div>
                            <h3 className="uppercase tracking-widest text-sm mb-2 opacity-60">Established</h3>
                            <p className="text-xl">2024</p>
                        </div>
                        <div>
                            <h3 className="uppercase tracking-widest text-sm mb-2 opacity-60">Location</h3>
                            <p className="text-xl">Tokyo, Japan</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={toggleAbout}
                    className="absolute top-6 right-6 p-4 hover:rotate-90 transition-transform duration-300"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* --- CONTACT OVERLAY --- */}
            <div ref={contactRef} className={`${overlayClasses} bg-[#AABAA1] text-[#2C3E50]`}>
                <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
                    <h2 className="text-5xl md:text-7xl font-serif mb-8">Get in Touch</h2>
                    <ul className="space-y-6 text-2xl md:text-4xl font-light">
                        <li><a href="mailto:hello@interactivedish.com" className="hover:italic underline decoration-1 underline-offset-8">hello@interactivedish.com</a></li>
                        <li><a href="tel:+81000000000" className="hover:italic">+81 (0) 00 0000 0000</a></li>
                        <li className="pt-8 flex gap-6 text-lg uppercase tracking-widest">
                            <a href="#" className="hover:underline">Instagram</a>
                            <a href="#" className="hover:underline">Twitter/X</a>
                        </li>
                    </ul>
                </div>
                <button
                    onClick={toggleContact}
                    className="absolute top-6 right-6 p-4 hover:rotate-90 transition-transform duration-300"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* --- FILTER OVERLAY --- */}
            <div ref={filterRef} className={`${overlayClasses} bg-white text-black`}>
                <h2 className="text-4xl font-serif mb-8">Filters</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold mb-4 uppercase text-sm tracking-wider">Material</h3>
                        <ul className="space-y-2">
                            <li className="hover:underline cursor-pointer">Stoneware</li>
                            <li className="hover:underline cursor-pointer">Porcelain</li>
                            <li className="hover:underline cursor-pointer">Ceramic</li>
                        </ul>
                    </div>
                    {/* Add more filter categories as needed */}
                </div>
                <button
                    onClick={toggleFilter}
                    className="absolute top-6 right-6 p-4"
                >
                    Close
                </button>
            </div>

            {/* --- SEARCH OVERLAY --- */}
            <div ref={searchRef} className={`${overlayClasses} bg-white text-black`}>
                <div className="max-w-3xl mx-auto w-full mt-20">
                    <input
                        type="text"
                        placeholder="Search for plates, bowls..."
                        className="w-full text-4xl md:text-6xl font-serif border-b-2 border-black/20 py-4 bg-transparent outline-none placeholder:text-black/30 focus:border-black transition-colors"
                        autoFocus={isSearchOpen}
                    />
                </div>
                <button
                    onClick={toggleSearch}
                    className="absolute top-6 right-6 p-4"
                >
                    Close
                </button>
            </div>
        </>
    );
}
