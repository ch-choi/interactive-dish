import { create } from 'zustand';

type ViewState = 'grid' | 'detail';

interface AppState {
    view: ViewState;
    selectedId: number | null;
    isMenuOpen: boolean;
    isAboutOpen: boolean;
    isContactOpen: boolean;
    isFilterOpen: boolean;
    isSearchOpen: boolean;
    searchQuery: string;
    activeFilter: 'all' | 'plate' | 'bowl';
    setView: (view: ViewState) => void;
    openDetail: (id: number) => void;
    closeDetail: () => void;
    toggleMenu: () => void;
    toggleAbout: () => void;
    toggleContact: () => void;
    toggleFilter: () => void;
    toggleSearch: () => void;
    setFilter: (filter: 'all' | 'plate' | 'bowl') => void;
    setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
    view: 'grid',
    selectedId: null,
    isMenuOpen: false,
    isAboutOpen: false,
    isContactOpen: false,
    isFilterOpen: false,
    isSearchOpen: false,
    searchQuery: '',
    activeFilter: 'all',

    setView: (view) => set({ view }),
    openDetail: (id) => set({ selectedId: id, view: 'detail' }),
    closeDetail: () => set({ selectedId: null, view: 'grid' }),
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen, isAboutOpen: false, isContactOpen: false, isFilterOpen: false, isSearchOpen: false })),
    toggleAbout: () => set((state) => ({ isAboutOpen: !state.isAboutOpen, isMenuOpen: false, isContactOpen: false, isFilterOpen: false, isSearchOpen: false })),
    toggleContact: () => set((state) => ({ isContactOpen: !state.isContactOpen, isMenuOpen: false, isAboutOpen: false, isFilterOpen: false, isSearchOpen: false })),
    toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen, isMenuOpen: false, isAboutOpen: false, isContactOpen: false, isSearchOpen: false })),
    toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen, isMenuOpen: false, isAboutOpen: false, isContactOpen: false, isFilterOpen: false })),
    setFilter: (filter) => set({ activeFilter: filter }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
