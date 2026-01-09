'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Draggable } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import { useStore } from '../../store/useStore';
import { PRODUCTS } from '../../data/products';
import { ALL_IMAGES } from '../../data/all_images';

gsap.registerPlugin(Draggable, useGSAP);

const ITEM_WIDTH = 400;
const ITEM_HEIGHT = 400;
const VIEWPORT_PADDING = 200;

// Calculate grid dimensions dynamically
const TOTAL_ITEMS = ALL_IMAGES.length;
const GRID_COLS = 25; // Approx square root
const GRID_ROWS = Math.ceil(TOTAL_ITEMS / GRID_COLS);

type GridItem = {
    id: number;
    src: string;
    baseX: number;
    baseY: number;
    rotation: number;
    scale: number;
    type: 'plate' | 'bowl';
    name: string;
    collection: string;
};

export default function InfiniteGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
    const updateLayoutRef = useRef<() => void>(() => { });
    const visibleStatusRef = useRef<boolean[]>([]);
    const { view, openDetail, activeFilter, searchQuery } = useStore();
    const [cloneData, setCloneData] = useState<{ rect: DOMRect, src: string, rotation: number } | null>(null);

    const [cursorLabel, setCursorLabel] = useState<{ visible: boolean, text: string, x: number, y: number }>({ visible: false, text: '', x: 0, y: 0 });

    const gridItems = useMemo(() => {
        const items: GridItem[] = [];
        let count = 0;

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (count >= TOTAL_ITEMS) break;

                const src = ALL_IMAGES[count];
                let type: 'plate' | 'bowl' = 'plate';
                if (src.toLowerCase().includes('bowl')) type = 'bowl';

                // Masonry Stagger
                const staggerOffset = (col % 2 !== 0) ? ITEM_HEIGHT * 0.5 : 0;

                // Subtle static rotation and scale for "natural" feel
                const rotation = (Math.random() - 0.5) * 15;
                const scale = 0.85 + Math.random() * 0.25;

                const product = PRODUCTS[src];

                items.push({
                    id: count,
                    src,
                    baseX: col * ITEM_WIDTH,
                    baseY: row * ITEM_HEIGHT + staggerOffset,
                    rotation,
                    scale,
                    type,
                    name: product?.name || 'Palmer Collection',
                    collection: product?.collection || 'General',
                });
                count++;
            }
        }
        return items;
    }, []);

    const totalWidth = GRID_COLS * ITEM_WIDTH;
    const totalHeight = GRID_ROWS * ITEM_HEIGHT + (ITEM_HEIGHT * 0.5); // Add buffer for stagger

    useEffect(() => {
        gridItems.forEach((item, i) => {
            const matchesCategory = activeFilter === 'all' || activeFilter === item.type;
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.collection.toLowerCase().includes(searchQuery.toLowerCase());
            visibleStatusRef.current[i] = matchesCategory && matchesSearch;
        });

        if (updateLayoutRef.current) {
            updateLayoutRef.current();
        }
    }, [activeFilter, searchQuery, gridItems]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorLabel.visible) {
                setCursorLabel(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [cursorLabel.visible]);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Center the grid initially
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const initialX = -(totalWidth - screenWidth) / 2;
        const initialY = -(totalHeight - screenHeight) / 2;

        const proxy = document.createElement('div');
        gsap.set(proxy, { x: initialX, y: initialY });

        const updateMap = () => {
            const x = gsap.getProperty(proxy, 'x') as number;
            const y = gsap.getProperty(proxy, 'y') as number;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            itemsRef.current.forEach((item, i) => {
                if (!item) return;
                const data = gridItems[i];
                const isFilteredMatch = visibleStatusRef.current[i];

                // Simple position calculation (Finite Grid)
                const newX = data.baseX + x;
                const newY = data.baseY + y;

                gsap.set(item, {
                    x: newX,
                    y: newY,
                    rotation: data.rotation,
                    scale: data.scale,
                    overwrite: 'auto',
                });

                const isInViewport =
                    newX < screenWidth + VIEWPORT_PADDING &&
                    newX + ITEM_WIDTH > -VIEWPORT_PADDING &&
                    newY < screenHeight + VIEWPORT_PADDING &&
                    newY + ITEM_HEIGHT > -VIEWPORT_PADDING;

                if (isFilteredMatch && isInViewport) {
                    if (!(item as any)._isRevealed) {
                        gsap.to(item, {
                            opacity: 1,
                            filter: 'blur(0px)',
                            duration: 0.6,
                            ease: 'power2.out',
                        });
                        (item as any)._isRevealed = true;
                    }
                    item.style.pointerEvents = 'auto';
                } else {
                    // Hide off-screen items for performance
                    gsap.set(item, { opacity: 0 });
                    (item as any)._isRevealed = false;
                    item.style.pointerEvents = 'none';
                }
            });
        };

        updateLayoutRef.current = updateMap;

        const draggable = Draggable.create(proxy, {
            trigger: containerRef.current,
            type: 'x,y',
            edgeResistance: 0.5,
            dragResistance: 0.4, // Add friction for heavier feel
            inertia: true,
            bounds: {
                minX: -(totalWidth - screenWidth) - VIEWPORT_PADDING,
                maxX: 0 + VIEWPORT_PADDING,
                minY: -(totalHeight - screenHeight) - VIEWPORT_PADDING,
                maxY: 0 + VIEWPORT_PADDING
            },
            onDrag: updateMap,
            onThrowUpdate: updateMap,
        })[0];

        updateMap();

        if (view === 'detail') {
            draggable.disable();
        } else {
            draggable.enable();
        }

    }, { scope: containerRef, dependencies: [view] });

    const handleItemClick = (index: number, e: React.MouseEvent) => {
        if (view === 'detail') return;
        const itemEl = itemsRef.current[index];
        if (!itemEl) return;
        const rect = itemEl.getBoundingClientRect();
        const data = gridItems[index];

        const currentRotation = gsap.getProperty(itemEl, "rotation");

        setCloneData({
            rect,
            src: data.src,
            rotation: typeof currentRotation === 'number' ? currentRotation : 0,
        });
        openDetail(data.id);
    };

    useGSAP(() => {
        if (view === 'detail' && cloneData) {
            const targetEl = document.getElementById('detail-image-target');
            let targetRect = { left: window.innerWidth / 2 - 250, top: window.innerHeight / 2 - 250, width: 500, height: 500 };

            if (targetEl) {
                const r = targetEl.getBoundingClientRect();
                targetRect = { left: r.left, top: r.top, width: r.width, height: r.height };
            }

            gsap.fromTo('#flying-clone',
                {
                    x: cloneData.rect.left,
                    y: cloneData.rect.top,
                    width: cloneData.rect.width,
                    height: cloneData.rect.height,
                    rotation: cloneData.rotation,
                    filter: 'blur(0px)',
                },
                {
                    x: targetRect.left,
                    y: targetRect.top,
                    width: targetRect.width,
                    height: targetRect.height,
                    rotation: 0,
                    duration: 0.8,
                    ease: 'power3.inOut',
                }
            );

            gsap.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.5 });
            itemsRef.current.forEach(el => {
                gsap.to(el, { opacity: 0, duration: 0.5 });
            });

        } else if (view === 'grid') {
            gsap.to(containerRef.current, { backgroundColor: '#f1f1eb', duration: 0.5 });

            // Exit Animation
            if (cloneData) {
                gsap.to('#flying-clone', {
                    x: cloneData.rect.left,
                    y: cloneData.rect.top,
                    width: cloneData.rect.width,
                    height: cloneData.rect.height,
                    rotation: cloneData.rotation,
                    duration: 0.6,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        setCloneData(null);
                    }
                });
            } else {
                setCloneData(null);
            }

            itemsRef.current.forEach(item => {
                if (item) (item as any)._isRevealed = false;
            });
            // Force re-reveal of visible items
            if (updateLayoutRef.current) updateLayoutRef.current();
        }
    }, { dependencies: [view, cloneData] });

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 w-full h-[100dvh] overflow-hidden cursor-grab active:cursor-grabbing bg-[#f1f1eb] transition-colors"
            >
                <div className="relative w-full h-full">
                    {gridItems.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => { itemsRef.current[index] = el; }}
                            className="absolute will-change-transform flex items-center justify-center select-none"
                            style={{
                                width: ITEM_WIDTH,
                                height: ITEM_HEIGHT,
                                opacity: 0,
                                left: 0,
                                top: 0,
                            }}
                            onMouseEnter={(e) => {
                                setCursorLabel({
                                    visible: true,
                                    text: `+ ${item.name}`,
                                    x: e.clientX,
                                    y: e.clientY
                                });
                            }}
                            onMouseLeave={() => {
                                setCursorLabel(prev => ({ ...prev, visible: false }));
                            }}
                            onClick={(e) => {
                                setCursorLabel(prev => ({ ...prev, visible: false }));
                                handleItemClick(index, e);
                            }}
                        >
                            <div className="relative w-full h-full p-8 md:p-12 drop-shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer">
                                <Image
                                    src={item.src}
                                    alt={item.name}
                                    fill
                                    className="object-contain"
                                    draggable={false}
                                    sizes="(max-width: 768px) 300px, 450px"
                                    priority={index < 20} // Prioritize center items (approx) if possible, or just first few
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`absolute top-8 left-8 z-10 pointer-events-none mix-blend-difference text-neutral-800 transition-opacity duration-500 ${view === 'detail' ? 'opacity-0' : 'opacity-100'}`}>
                    <h1 className="text-2xl font-serif tracking-widest uppercase">Palmer</h1>
                </div>
            </div>

            {cloneData && (
                <div
                    id="flying-clone"
                    className="fixed z-50 pointer-events-none drop-shadow-2xl"
                    style={{
                        top: 0,
                        left: 0,
                    }}
                >
                    <Image
                        src={cloneData.src}
                        alt="Transitioning Plate"
                        fill
                        className="object-contain"
                    />
                </div>
            )}

            <div
                className="fixed z-[100] pointer-events-none px-4 py-2 bg-neutral-900 border border-white/10 text-white text-xs font-medium rounded-full uppercase tracking-wider backdrop-blur-md transition-opacity duration-200"
                style={{
                    left: 0,
                    top: 0,
                    opacity: cursorLabel.visible ? 1 : 0,
                    transform: `translate(${cursorLabel.x + 20}px, ${cursorLabel.y + 20}px)`,
                }}
            >
                {cursorLabel.text}
            </div>
        </>
    );
}
