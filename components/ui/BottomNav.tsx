'use client';

import { useState } from 'react';
import { useStore } from '../../store/useStore';

export default function BottomNav() {
    const {
        isMenuOpen, toggleMenu,
        isAboutOpen, toggleAbout,
        isContactOpen, toggleContact,
        isFilterOpen, toggleFilter,
        isSearchOpen, toggleSearch
    } = useStore();

    return (
        <>
            {/* Center Capsule: Collections, About, Contact */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-[#1a1a1a] text-[#f1f1eb] rounded-full p-1.5 shadow-2xl transition-transform hover:scale-105">
                <button
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors ${isMenuOpen ? 'bg-white/20' : ''}`}
                    onClick={toggleMenu}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-white mb-0.5" />
                    <span className="text-sm font-medium tracking-wide lowercase">collections</span>
                </button>

                <div className="w-[1px] h-3 bg-white/20 mx-1" />

                <button
                    className={`px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium tracking-wide lowercase ${isAboutOpen ? 'bg-white/20' : ''}`}
                    onClick={toggleAbout}
                >
                    about
                </button>

                <div className="w-[1px] h-3 bg-white/20 mx-1" />

                <button
                    className={`px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium tracking-wide lowercase ${isContactOpen ? 'bg-white/20' : ''}`}
                    onClick={toggleContact}
                >
                    contact
                </button>
            </nav>

            {/* Left: Search Button */}
            <button
                className={`fixed bottom-8 left-8 z-[100] flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all hover:scale-110 ${isSearchOpen ? 'bg-[#1a1a1a] text-white' : 'bg-[#f1f1eb] text-[#1a1a1a]'}`}
                onClick={toggleSearch}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
            </button>

            {/* Right: Filter Button */}
            <button
                className={`fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-6 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 font-medium tracking-wide text-sm lowercase ${isFilterOpen ? 'bg-[#1a1a1a] text-white' : 'bg-[#f1f1eb] text-[#1a1a1a]'}`}
                onClick={toggleFilter}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                {isFilterOpen ? 'close' : 'filter'}
            </button>
        </>
    );
}
