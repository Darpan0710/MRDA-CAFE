import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { CAFE_DETAILS, POURED_MENU, PLATED_MENU } from '../data/cafeData';
import { publicApi } from '../services/publicApi';
import { Footer } from './Footer';

interface MenuPageProps {
  initialTab?: 'poured' | 'plated';
  onNavigateHome: (sectionId?: string) => void;
  onOpenBooking: () => void;
  onNavigateToSpace?: () => void;
  onNavigateToEvents?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  initialTab = 'poured',
  onNavigateHome,
  onOpenBooking,
  onNavigateToSpace,
  onNavigateToEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'poured' | 'plated'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockMap, setStockMap] = useState<Record<string, boolean>>({});
  const [dbMenuItems, setDbMenuItems] = useState<any[]>([]);

  // Sync activeTab when initialTab prop updates
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch live menu items and stock availability from server
  useEffect(() => {
    publicApi
      .fetchMenu()
      .then((res) => {
        const items = res?.menuItems || res?.items || [];
        setDbMenuItems(items);
        const map: Record<string, boolean> = {};
        items.forEach((m: any) => {
          map[m.name.toLowerCase().trim()] = m.inStock !== false;
        });
        setStockMap(map);
      })
      .catch(() => {});
  }, []);

  // Update browser URL query parameter when tab changes without full page reload
  const handleTabChange = (tab: 'poured' | 'plated' = 'poured') => {
    setActiveTab(tab);
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      const newUrl = `/menu/${tab}`;
      window.history.pushState({ tab }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getItemsForCategories = (
    catIds: string[],
    fallback: Array<{ name: string; price: string | number; desc?: string; inStock?: boolean }>
  ) => {
    if (!dbMenuItems || dbMenuItems.length === 0) return fallback;
    const filtered = dbMenuItems.filter((item: any) =>
      catIds.includes(item.categoryId || item.category)
    );
    if (filtered.length === 0) return fallback;
    return filtered.map((item: any) => ({
      name: item.name,
      price: typeof item.price === 'number' ? `₹${item.price}` : item.price,
      desc: item.description,
      inStock: item.inStock,
    }));
  };

  const renderItem = (item: { name: string; price: string | number; desc?: string; inStock?: boolean }, idx: number) => {
    const norm = item.name.toLowerCase().trim();
    const isAvailable = item.inStock !== false && stockMap[norm] !== false;
    return (
      <div
        key={idx}
        className={`group flex flex-col sm:flex-row sm:items-baseline justify-between pb-2.5 sm:pb-3 border-b border-[#DCCBB4]/40 hover:border-[#873A35]/40 transition-colors ${
          !isAvailable ? 'opacity-65' : ''
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base lg:text-lg font-serif font-medium text-[#292723] group-hover:text-[#873A35] transition-colors">
              {item.name}
            </span>
            {!isAvailable && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#873A35] bg-[#873A35]/10 px-2 py-0.5 rounded-xs font-semibold">
                Sold Out
              </span>
            )}
          </div>
          {item.desc && (
            <p className="text-xs text-[#70452D]/80 font-light max-w-md leading-relaxed">
              {item.desc}
            </p>
          )}
        </div>
        <div className="mt-0.5 sm:mt-0 font-mono text-xs sm:text-sm lg:text-base font-semibold text-[#873A35] shrink-0">
          {item.price}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F1E9DC] text-[#292723] pt-0 pb-0 selection:bg-[#873A35] selection:text-[#FFF3DF] overflow-x-hidden animate-fade-in">
      
      {/* ================= STICKY SUB-BAR: COMPACT BALANCED CATEGORY NAVIGATION ================= */}
      <div className="sticky top-16 md:top-18 z-30 bg-[#F1E9DC]/95 backdrop-blur-md py-2 sm:py-2.5 px-3 sm:px-6 md:px-10 lg:px-12 border-b border-[#DCCBB4]/60 shadow-2xs">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Back to Homepage Overview */}
          <div className="w-auto sm:w-1/4 flex items-center shrink-0">
            <button
              onClick={() => onNavigateHome('menu')}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-mono text-[#70452D] hover:text-[#873A35] transition-colors cursor-pointer group py-1"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Overview</span>
            </button>
          </div>

          {/* Center: Pill Segmented Control (Poured / Plated) */}
          <div className="flex-1 flex justify-center">
            <div className="inline-flex items-center p-0.5 sm:p-1 bg-[#DCCBB4] rounded-full shadow-inner max-w-full">
              <button
                onClick={() => handleTabChange('poured')}
                className={`px-2.5 sm:px-6 md:px-7 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-300 cursor-pointer ${
                  activeTab === 'poured'
                    ? 'bg-[#873A35] text-[#FFF3DF] shadow-md scale-[1.02]'
                    : 'text-[#70452D] hover:text-[#292723]'
                }`}
              >
                <span className="hidden sm:inline">01 POURED (DRINKS)</span>
                <span className="sm:hidden">01 POURED</span>
              </button>
              <button
                onClick={() => handleTabChange('plated')}
                className={`px-2.5 sm:px-6 md:px-7 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-300 cursor-pointer ${
                  activeTab === 'plated'
                    ? 'bg-[#873A35] text-[#FFF3DF] shadow-md scale-[1.02]'
                    : 'text-[#70452D] hover:text-[#292723]'
                }`}
              >
                <span className="hidden sm:inline">02 PLATED (FOOD)</span>
                <span className="sm:hidden">02 PLATED</span>
              </button>
            </div>
          </div>

          {/* Right: Menu Search Bar */}
          <div className="w-auto sm:w-1/4 flex items-center justify-end shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-[#70452D]/60 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 sm:pl-8 pr-2 sm:pr-3 py-1 sm:py-1.5 text-[11px] sm:text-xs bg-[#FFF3DF]/80 border border-[#DCCBB4] rounded-full text-[#292723] placeholder-[#70452D]/50 focus:outline-none focus:border-[#873A35] w-16 sm:w-32 md:w-36 transition-all focus:w-24 sm:focus:w-44"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: POURED (DRINKS) VIEW ================= */}
      {activeTab === 'poured' && (
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 transition-all duration-500 animate-fade-in pb-4 sm:pb-6">
          
          {/* SECTION 1: POURED INTRO BANNER (Begins naturally below navigation) */}
          <section className="pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 border-b border-[#DCCBB4]/70">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
              
              {/* Left Dark Feature Card */}
              <div className="lg:col-span-5 bg-[#292723] text-[#FFF3DF] rounded-xs p-6 sm:p-7 xl:p-8 shadow-lg relative overflow-hidden flex flex-col justify-between max-h-[500px]">
                
                {/* Card Header & Circular Rotating Stamp */}
                <div className="flex items-start justify-between mb-4 z-10">
                  <div className="space-y-0.5">
                    <h3 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.25em] uppercase text-[#FFF3DF]">
                      POURED
                    </h3>
                    <span className="text-[11px] font-mono tracking-[0.25em] text-[#FFF3DF]/70 uppercase block">
                      DRINKS
                    </span>
                  </div>

                  {/* Circular Stamp */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full animate-[spin_24s_linear_infinite]"
                    >
                      <path
                        id="circle-poured"
                        d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                        fill="none"
                      />
                      <text className="text-[8.5px] uppercase font-mono tracking-[0.14em] fill-[#FFF3DF]/90 font-medium">
                        <textPath href="#circle-poured" startOffset="0%">
                          · CRAFTED SLOWLY · SERVED THOUGHTFULLY ·
                        </textPath>
                      </text>
                    </svg>
                    <span className="absolute text-[#873A35] text-sm font-bold">✦</span>
                  </div>
                </div>

                {/* Central Signature Photograph */}
                <div className="relative my-2 w-full aspect-[4/3] max-h-[260px] overflow-hidden rounded-xs bg-[#1C1A18] shadow-inner group">
                  <img
                    src="/MDRA/featured/ref_poured.jpg"
                    alt="MRDĀ poured layered coffee on terrazzo"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/featured/menu_feature_latte.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#FFF3DF]/80 uppercase">
                    <span>Specialty Roast</span>
                    <span>Ahmedabad</span>
                  </div>
                </div>

                {/* Bottom Categories List */}
                <div className="pt-3 border-t border-[#FFF3DF]/15 flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-[#FFF3DF]/80">
                  <span className="hover:text-[#FFF3DF] transition-colors">COFFEE</span>
                  <span>·</span>
                  <span className="hover:text-[#FFF3DF] transition-colors">TEA</span>
                  <span>·</span>
                  <span className="hover:text-[#FFF3DF] transition-colors">SIGNATURES</span>
                </div>
              </div>

              {/* Right Header Area: Title & Prose Intro */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                
                {/* Small Kicker */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
                    01
                  </span>
                  <span className="w-12 h-[1px] bg-[#873A35]/40" />
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#70452D] font-medium">
                    CRAFT &amp; EXTRACTION
                  </span>
                </div>

                {/* Large Serif Title */}
                <h1 className="font-editorial-display text-4xl sm:text-5xl lg:text-6xl text-[#292723] font-medium tracking-tight">
                  Beverages
                </h1>

                {/* Intro Narrative */}
                <p className="text-xs sm:text-sm md:text-base text-[#70452D] font-light leading-relaxed max-w-xl">
                  Brewed gently, poured with thought. Single origins, slow cold brews, and botanical coffee craft.
                  Every pour honors the bean's origin and the water's gentle flow.
                </p>

                {/* Category Quick Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCCBB4]/60">
                  <a
                    href="#category-coffee"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Coffee
                  </a>
                  <a
                    href="#category-cold-brews"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Cold Brews
                  </a>
                  <a
                    href="#category-signatures"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Signatures
                  </a>
                  <a
                    href="#category-choices"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Choices That Matter
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 2: COFFEE ── RICH & BALANCED ================= */}
          <section id="category-coffee" className="min-h-[calc(100svh-8.5rem)] flex flex-col justify-center py-6 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  COFFEE
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                RICH &amp; BALANCED
              </span>
            </div>

            {/* Content Grid: Listings on Left, Vertical Latte Art Image on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* Menu Items List */}
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                {getItemsForCategories(['grounded'], [
                  { name: 'Espresso', price: '₹190', desc: 'Double shot single origin extraction, rich and intense.' },
                  { name: 'Americano', price: '₹210', desc: 'Double shot over hot water or ice, smooth clean finish.' },
                  { name: 'Cappuccino', price: '₹260', desc: 'Espresso with textured velvety steamed milk and light microfoam.' },
                  { name: 'Café Latte', price: '₹260', desc: 'Silky, balanced, and comforting with organic whole or oat milk.' },
                  { name: 'Flat White', price: '₹260', desc: 'Bold espresso punch beneath a thin, velvety sheet of microfoam.' },
                  { name: 'Cortado', price: '₹230', desc: 'Equal parts single origin espresso and warm textured milk.' },
                  { name: 'Spanish Latte', price: '₹360', desc: 'Sweetened condensed milk, bold espresso, chilled fresh milk.' },
                  { name: 'Affogato', price: '₹390', desc: 'Double espresso poured hot over artisanal Madagascar vanilla gelato.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>

              {/* Right Side: Editorial Photograph */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-[3/4] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/featured/menu_latte_art.jpg"
                    alt="Barista pouring latte art at MRDĀ"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/images/for video/drink-4.webp';
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    SMOOTH TEXTURES / BOLDER MORNINGS
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 3: COLD BREWS ── REFRESHING & BOLD ================= */}
          <section id="category-cold-brews" className="min-h-[calc(100svh-8.5rem)] flex flex-col justify-center py-6 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  COLD BREWS
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                REFRESHING &amp; BOLD
              </span>
            </div>

            {/* Content Grid: Horizontal Image on Left, Listings on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* Left Side: Photo of Iced Coffee */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="w-full aspect-[16/10] max-h-[280px] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/featured/menu_cold_brew.jpg"
                    alt="MRDĀ cold brew over ice with fresh mint"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/images/for video/drink-1.jpg';
                    }}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    COLD BREWS / BRIGHTER DAYS
                  </span>
                </div>
              </div>

              {/* Right Side: Menu Items List */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {getItemsForCategories(['slow-brewed'], [
                  { name: 'Classic Cold Brew', price: '₹260', desc: '18-hour slow cold-steeped single-origin roast, naturally sweet & chocolatey.' },
                  { name: 'Vanilla Cream Cold Brew', price: '₹290', desc: 'Cold brew topped with house-made Madagascar vanilla bean sweet cream.' },
                  { name: 'Hazelnut Cold Brew', price: '₹290', desc: 'Roasted hazelnut infusion, cold brew, and a hint of dark cocoa.' },
                  { name: 'Citrus Tonic Brew', price: '₹290', desc: 'Single origin cold brew layered with sparkling tonic and fresh citrus peel.' },
                  { name: 'Ginger Ajwain Cold Brew', price: '₹290', desc: 'Infused with fresh crushed organic ginger and carom seeds.' },
                  { name: 'Cinnamon Honey Cold Brew', price: '₹290', desc: 'Warm Ceylon cinnamon bark with wild Himalayan forest honey.' },
                  { name: 'Coconut Cold Brew', price: '₹330', desc: 'Layered gently with fresh tender coconut water.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>
            </div>
          </section>

          {/* ================= SECTION 4: SIGNATURES ── HOUSE CREATIONS ================= */}
          <section id="category-signatures" className="min-h-[calc(100svh-8.5rem)] flex flex-col justify-center py-6 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  SIGNATURES
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                HOUSE CREATIONS
              </span>
            </div>

            {/* Content Grid: Listings on Left, Matcha Drink Image on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* Menu Items List */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {getItemsForCategories(['signatures', 'matcha-tea'], [
                  { name: 'MRDĀ Signature (The OJ)', price: '₹360', desc: 'Malta orange concentrate, fresh jalapeno, Thai basil & lemon.' },
                  { name: 'Garden Puff', price: '₹360', desc: 'Fresh cucumber, housemade rosemary cordial, smoked dried rosemary.' },
                  { name: 'Bees & Beans', price: '₹390', desc: 'Single origin espresso, raw unprocessed ajwain honey, sparkling tonic.' },
                  { name: 'Purple Sea', price: '₹390', desc: 'Lavender buds, butterfly pea infusion, macerated pineapple, dairy cream cloud.' },
                  { name: 'Bloody Jasmine', price: '₹390', desc: 'Jasmine Pearl Tea, fermented Falsa juice, lemon zest, Himalayan honey.' },
                  { name: 'Penicillin', price: '₹390', desc: 'Single origin espresso, ginger honey potion, raw sugar, house soda.' },
                  { name: 'Matcha Cloud', price: '₹530', desc: 'Ceremonial Kagoshima matcha, citrus tonic, and emerald botanical foam.' },
                  { name: 'Soul Kaaphi', price: '₹430', desc: 'Inspired by Solkadhi, a grounded drink for your soul.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>

              {/* Right Side: Image of Matcha Drink */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="w-full aspect-[16/11] max-h-[280px] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/featured/menu_matcha.jpg"
                    alt="MRDĀ ceremonial iced matcha beverage"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/images/for video/drink-3.jpg';
                    }}
                  />
                </div>
                <div className="mt-2 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    SEASONAL FLAVOURS / ALL DAY
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 5: CHOICES THAT MATTER ================= */}
          <section
            id="category-choices"
            aria-labelledby="choices-heading"
            className="pt-10 sm:pt-14 pb-6 sm:pb-8 border-t border-[#DCCBB4] scroll-mt-28"
          >
            {/* Header: CHOICES THAT MATTER, Section Number 01 */}
            <div className="pb-6 sm:pb-8 border-b border-[#DCCBB4]">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
                  01
                </span>
                <span className="w-10 h-[1px] bg-[#873A35]/40" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#873A35] font-semibold">
                  CUSTOMISATIONS &amp; CRAFT
                </span>
              </div>

              <h2
                id="choices-heading"
                className="font-editorial-sans text-3xl sm:text-4xl lg:text-[2.75rem] text-[#292723] font-normal uppercase tracking-[0.06em] leading-tight"
              >
                CHOICES THAT MATTER
              </h2>

              {/* Introduction */}
              <p className="text-xs sm:text-sm md:text-base text-[#70452D] font-light leading-relaxed max-w-2xl pt-3">
                This menu is built on choices that matter. Even in the smallest things, like how you take your coffee. From your preferred milk to flavour &amp; sweeter choice.
              </p>
            </div>

            {/* Structured Editorial Menu Layout */}
            <div className="divide-y divide-[#DCCBB4] bg-[#FFF3DF]/40 border border-[#DCCBB4] rounded-xs mt-6 sm:mt-8 shadow-xs">
              
              {/* Category Row 1: Sweeteners to Choose From */}
              <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
                {/* Category Label on the Left */}
                <div className="lg:col-span-4 space-y-1">
                  <h3 className="font-editorial-sans text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-[#873A35]">
                    Sweeteners to Choose From
                  </h3>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#70452D]/70 block">
                    Natural &amp; unrefined sweetening
                  </span>
                </div>

                {/* Available Choices on the Right in Structured Columns */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs sm:text-sm font-editorial-sans text-[#292723]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Organic Rock Sugar</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Single Origin Jaggery</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Fennel Honey</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Organic Coconut Sugar</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Organic Raw Sugar</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Ajwain Honey</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Wild Forest Honey</span>
                  </div>
                </div>
              </div>

              {/* Category Row 2: Alternative Milk — ₹120 */}
              <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
                {/* Category Label with Price Clearly Visible on the Left */}
                <div className="lg:col-span-4 space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <h3 className="font-editorial-sans text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-[#873A35]">
                      Alternative Milk
                    </h3>
                    <span className="font-mono text-sm sm:text-base font-semibold text-[#873A35] bg-[#873A35]/10 px-2.5 py-0.5 rounded-full border border-[#873A35]/20">
                      ₹120
                    </span>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#70452D]/70 block">
                    Plant-based &amp; specialty milks
                  </span>
                </div>

                {/* Available Choices on the Right */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs sm:text-sm font-editorial-sans text-[#292723]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Oat Milk</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Almond Milk</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Pistachio Milk (housemade)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Organic Milk (locally sourced)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Lactosefree Milk</span>
                  </div>
                </div>
              </div>

              {/* Category Row 3: Flavours — ₹90 */}
              <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
                {/* Category Label with Price Clearly Visible on the Left */}
                <div className="lg:col-span-4 space-y-1">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <h3 className="font-editorial-sans text-lg sm:text-xl font-bold uppercase tracking-[0.14em] text-[#873A35]">
                      Flavours
                    </h3>
                    <span className="font-mono text-sm sm:text-base font-semibold text-[#873A35] bg-[#873A35]/10 px-2.5 py-0.5 rounded-full border border-[#873A35]/20">
                      ₹90
                    </span>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#70452D]/70 block">
                    House infusions &amp; syrups
                  </span>
                </div>

                {/* Available Choices on the Right */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs sm:text-sm font-editorial-sans text-[#292723]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Caramel</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Dulce De Leche</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Vanilla Bean</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Cinnamon</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Hazelnut</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#873A35] text-xs">✦</span>
                    <span className="font-medium">Raisin</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Brew Bar Table Experience Callout */}
            <div className="mt-8 p-6 sm:p-7 bg-[#EAE1D2]/80 border border-[#DCCBB4] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#873A35] font-semibold block">
                  Brew Bar &amp; Table Experience
                </span>
                <p className="text-xs sm:text-sm text-[#70452D] font-light leading-relaxed max-w-xl">
                  Join us at the sandstone Brew Bar for quiet mornings, vinyl listening, and manual pours.
                </p>
              </div>
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 bg-[#873A35] hover:bg-[#70452D] text-[#FFF3DF] text-xs font-semibold tracking-[0.16em] uppercase px-7 py-3 rounded-full transition-all duration-300 shadow-xs cursor-pointer shrink-0 hover:scale-[1.02] active:scale-98"
                aria-label="Reserve a table at MRDĀ café"
              >
                <span>Reserve a Table</span>
                <span className="text-[10px]" aria-hidden="true">✦</span>
              </button>
            </div>
          </section>

        </div>
      )}

      {/* ================= TAB 2: PLATED (FOOD) VIEW ================= */}
      {activeTab === 'plated' && (
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 transition-all duration-500 animate-fade-in pb-4 sm:pb-6">
          
          {/* SECTION 1: PLATED INTRO BANNER (Begins naturally below navigation) */}
          <section className="pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 border-b border-[#DCCBB4]/70">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
              
              {/* Left Terracotta Feature Card */}
              <div className="lg:col-span-5 bg-[#873A35] text-[#FFF3DF] rounded-xs p-6 sm:p-7 xl:p-8 shadow-lg relative overflow-hidden flex flex-col justify-between max-h-[500px]">
                
                {/* Card Header & Circular Rotating Stamp */}
                <div className="flex items-start justify-between mb-4 z-10">
                  <div className="space-y-0.5">
                    <h3 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.25em] uppercase text-[#FFF3DF]">
                      PLATED
                    </h3>
                    <span className="text-[11px] font-mono tracking-[0.25em] text-[#FFF3DF]/80 uppercase block">
                      FOOD
                    </span>
                  </div>

                  {/* Circular Stamp */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full animate-[spin_24s_linear_infinite]"
                    >
                      <path
                        id="circle-plated"
                        d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                        fill="none"
                      />
                      <text className="text-[8.5px] uppercase font-mono tracking-[0.14em] fill-[#FFF3DF]/90 font-medium">
                        <textPath href="#circle-plated" startOffset="0%">
                          · HONEST INGREDIENTS · SEASONAL & SLOW ·
                        </textPath>
                      </text>
                    </svg>
                    <span className="text-[#FFF3DF] text-sm font-bold absolute">✦</span>
                  </div>
                </div>

                {/* Central Seasonal Food Photograph */}
                <div className="relative my-2 w-full aspect-[4/3] max-h-[260px] overflow-hidden rounded-xs bg-[#70452D] shadow-inner group">
                  <img
                    src="/MDRA/featured/ref_plated.jpg"
                    alt="MRDĀ seasonal harvest plate"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/images/for video/food-2.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#FFF3DF]/90 uppercase">
                    <span>Farm to Table</span>
                    <span>Ahmedabad</span>
                  </div>
                </div>

                {/* Bottom Categories List */}
                <div className="pt-3 border-t border-[#FFF3DF]/20 flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-[#FFF3DF]/90">
                  <span className="hover:text-white transition-colors">DAYBREAK</span>
                  <span>·</span>
                  <span className="hover:text-white transition-colors">TAPAS</span>
                  <span>·</span>
                  <span className="hover:text-white transition-colors">KNEADED</span>
                </div>
              </div>

              {/* Right Header Area: Title & Prose Intro */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
                
                {/* Small Kicker */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#873A35] font-semibold tracking-widest">
                    02
                  </span>
                  <span className="w-12 h-[1px] bg-[#873A35]/40" />
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#70452D] font-medium">
                    HONEST &amp; SEASONAL
                  </span>
                </div>

                {/* Large Serif Title */}
                <h1 className="font-editorial-display text-4xl sm:text-5xl lg:text-6xl text-[#292723] font-medium tracking-tight">
                  Plated Food
                </h1>

                {/* Intro Narrative */}
                <p className="text-xs sm:text-sm md:text-base text-[#70452D] font-light leading-relaxed max-w-xl">
                  Seasonal produce, sourdough loaves torn by hand, and nourishing plates built with warmth and patience.
                  Food designed to comfort, sustain, and accompany meaningful conversations.
                </p>

                {/* Category Quick Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCCBB4]/60">
                  <a
                    href="#food-daybreak"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Daybreak &amp; French Toasts
                  </a>
                  <a
                    href="#food-salads"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Salads &amp; Tapas
                  </a>
                  <a
                    href="#food-kneaded"
                    className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full bg-[#DCCBB4]/50 hover:bg-[#873A35] hover:text-[#FFF3DF] text-[#70452D] transition-colors"
                  >
                    Kneaded &amp; Gathered
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 2: DAYBREAK & FRENCH TOASTS ================= */}
          <section id="food-daybreak" className="min-h-[calc(100svh-8.5rem)] flex flex-col justify-center py-6 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  DAYBREAK &amp; FRENCH TOASTS
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                SLOW MORNINGS
              </span>
            </div>

            {/* Content Grid: Listings on Left, French Toast Image on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* Menu Items List */}
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                {getItemsForCategories(['daybreak'], [
                  { name: 'Honey Nutmeg French Toast', price: '₹490', desc: 'Brioche soaked in spiced custard, wild forest honey, mascarpone cream & nutmeg.' },
                  { name: 'Kesar Keri French Toast', price: '₹530', desc: 'Brioche toast with slow-simmered Kesar mango compote and house mascarpone cream.' },
                  { name: 'Strawberry French Toast', price: '₹490', desc: 'House-made strawberry preserve, mascarpone cream, toasted pistachio.' },
                  { name: 'Milk Oats', price: '₹330', desc: 'Rolled oats in wild forest honey milk, fresh banana, berry jam, toasted seeds & coconut.' },
                  { name: 'Tadka Buttermilk Oats', price: '₹330', desc: 'Ghee-tempered buttermilk soaked oats with chia seeds, fresh coriander & pomegranate.' },
                  { name: 'Anda Bun', price: '₹360', desc: 'Soft artisanal brioche bun, egg sunny-side, aam kasundi, chilli guava butter & slaw.' },
                  { name: 'Paneer Bhurji Toast', price: '₹360', desc: 'Spiced paneer with peppers, aam kasundi butter, sourdough toast & sweet potato chips.' },
                  { name: 'Moringa Smoothie Bowl', price: '₹390', desc: 'Moringa, fresh pineapple, green apple, banana, coconut cream & tender baby spinach.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>

              {/* Right Side: French Toast Photo */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full max-w-[280px] aspect-[3/4] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/images/for video/food-3.webp"
                    alt="MRDĀ brioche French toast with mascarpone cream"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/images/for video/food-1.jpg';
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    CRUST &amp; CRUMB / CRAFTED DAILY
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SECTION 3: SALADS & TAPAS PLATES ================= */}
          <section id="food-salads" className="min-h-[calc(100svh-8.5rem)] flex flex-col justify-center py-6 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  SALADS &amp; TAPAS
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                EARTH &amp; FRESH HARVEST
              </span>
            </div>

            {/* Content Grid: Image on Left, Listings on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
              
              {/* Left Side: Fresh Salad Image */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[320px] aspect-[4/5] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/images/for video/food-2.webp"
                    alt="MRDĀ seasonal salad plate"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/MDRA/featured/ref_plated.jpg';
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    SEASONAL HARVEST / NOURISHING PLATES
                  </span>
                </div>
              </div>

              {/* Right Side: Menu Items List */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {getItemsForCategories(['salads-tapas'], [
                  { name: 'Soil & Season Salad', price: '₹430', desc: "Chef-curated seasonal vegetables, charred stone fruit, seeds, and lemon sumac dressing." },
                  { name: 'Crispy Black Rice Salad', price: '₹460', desc: 'Locally sourced crisped black rice, coconut cream dressing, roasted peanuts & sweet potato shreds.' },
                  { name: 'Leafy Burrata Bowl', price: '₹480', desc: 'Artisanal local burrata, baby romaine, cherry tomatoes, olive salsa and aged balsamic.' },
                  { name: 'Black Bean Tacos', price: '₹330', desc: 'Single-origin black beans, fresh tomato coriander salsa & fermented sour cream in warm soft corn taco.' },
                  { name: 'Enoki Mushroom Taco', price: '₹330', desc: 'Crisped enoki mushroom, house tomato chilli salsa & sour cream in artisanal corn shell.' },
                  { name: 'Cold Tofu with Peanut Chilli Oil', price: '₹330', desc: 'Silken tofu, tender cucumber ribbons, spring onion, house roasted peanut emulsion & chilli oil.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>
            </div>
          </section>

          {/* ================= SECTION 4: KNEADED & GATHERED ================= */}
          <section id="food-kneaded" className="py-8 sm:py-10 border-t border-[#DCCBB4]/80 scroll-mt-32">
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-sans text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase text-[#873A35]">
                  KNEADED &amp; GATHERED
                </h2>
                <span className="hidden sm:inline-block w-16 h-[1px] bg-[#873A35]/30" />
              </div>
              <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#70452D]/80">
                SOURDOUGH &amp; WARMTH
              </span>
            </div>

            {/* Content Grid: Listings on Left, Sourdough Image on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
              
              {/* Menu Items List */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {getItemsForCategories(['kneaded-gathered', 'sweet-ends'], [
                  { name: 'Kimchi Cheese Grilled Sandwich', price: '₹490', desc: 'House-made aged kimchi, mature cheddar & mozzarella grilled in country sourdough.' },
                  { name: 'Thecha Cheese Grilled Sandwich', price: '₹490', desc: 'Fiery roasted garlic thecha, sharp cheddar & molten mozzarella in country loaf.' },
                  { name: 'BANH MI Tofu', price: '₹530', desc: 'Silken tofu, pickled carrot & daikon ribbons, cilantro, roasted peanuts & house sauces in crusty baguette.' },
                  { name: 'BANH MI Shiitake Mushroom', price: '₹530', desc: 'Glazed shiitake mushroom, sesame miso spread, pickled herbs & crushed peanuts.' },
                  { name: 'Tadka Dahi Shokupan', price: '₹430', desc: 'Toasted Japanese shokupan, spiced tadka hung curd, scallions & crunchy fried garlic.' },
                  { name: 'Ricotta & Honey Berry Platter', price: '₹490', desc: 'Creamy house ricotta, fermented wild berry conserve, mustard honey & sourdough crisps.' },
                  { name: 'Artisanal Butter Board', price: '₹430', desc: 'Country sourdough bread with tri-butter board (herb butter, cashew miso, and cacao berry).' },
                  { name: 'Creamy Hummus and Warm Pita', price: '₹430', desc: 'Silk-smooth tahini hummus, olive chimichurri, warm fresh-baked pita & pickled chilli.' },
                ])
                  .filter((item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(renderItem)}
              </div>

              {/* Right Side: Sourdough photo */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[320px] aspect-[4/5] overflow-hidden rounded-xs bg-[#DCCBB4] shadow-md group">
                  <img
                    src="/MDRA/images/for video/food-1.jpg"
                    alt="MRDĀ grilled kimchi sourdough"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#70452D]">
                    BAKED SLOW / SERVED WARM
                  </span>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ================= SHARED FOOTER FOR MENU (POURED & PLATED) ================= */}
      <Footer
        onNavigateHome={onNavigateHome}
        onNavigateToMenu={handleTabChange}
        onNavigateToSpace={onNavigateToSpace}
        onNavigateToEvents={onNavigateToEvents}
      />

    </div>
  );
};
