import { useEffect, useRef, useState } from 'react';
import { Menu, X, ChevronDown, Layers, Mail, Search } from 'lucide-react';
import { tools, categories, toolsByCategory, type ToolMeta } from '../data/tools';
import { navigate } from '../router';

const catColors: Record<string, string> = {
  'PDF Tools': 'text-orange-400',
  'Image Tools': 'text-cyan-400',
  'AI Tools': 'text-violet-400',
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (path: string) => { navigate(path); setMobileOpen(false); setOpenCat(null); setQuery(''); };

  const results: ToolMeta[] = query
    ? tools.filter((t) => (t.name + ' ' + t.keywords.join(' ')).toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'border-white/10 bg-[#080d1a]/90 backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => go('/')} className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Nexora<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Convert</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <button onClick={() => go('/')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">Home</button>

            {categories.map((cat) => (
              <div key={cat} className="relative"
                onMouseEnter={() => { if (closeTimer.current) window.clearTimeout(closeTimer.current); setOpenCat(cat); }}
                onMouseLeave={() => { closeTimer.current = window.setTimeout(() => setOpenCat(null), 150); }}
              >
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                  {cat}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openCat === cat ? 'rotate-180' : ''}`} />
                </button>
                {openCat === cat && (
                  <div className="absolute left-0 top-full pt-2 w-60 animate-fade-in">
                    <div className="rounded-2xl border border-white/10 bg-[#0d1426] p-2 shadow-2xl shadow-black/50">
                      <p className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${catColors[cat]}`}>{cat}</p>
                      {toolsByCategory(cat).map((t) => (
                        <button key={t.slug} onClick={() => go(`/tool/${t.slug}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 ${catColors[cat]}`}>
                            <t.icon className="h-3.5 w-3.5" />
                          </span>
                          {t.shortName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => go('/contact')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
              <Mail className="h-4 w-4" /> Contact Us
            </button>
          </nav>

          {/* Search */}
          <div className="hidden md:block relative w-52">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-300 outline-none placeholder:text-slate-500 transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20" />
            {results.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-72 rounded-2xl border border-white/10 bg-[#0d1426] p-2 shadow-2xl animate-fade-in">
                {results.map((t) => (
                  <button key={t.slug} onClick={() => go(`/tool/${t.slug}`)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                    <t.icon className="h-4 w-4 shrink-0 text-cyan-400" />
                    {t.shortName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => go('/contact')} className="hidden lg:inline-flex btn-primary !py-2 !px-5 text-xs font-bold">Get Started</button>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
            aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0d1426] animate-slide-up">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <button onClick={() => go('/')} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white">Home</button>
            {categories.map((cat) => (
              <div key={cat} className="py-1">
                <p className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${catColors[cat]}`}>{cat}</p>
                {toolsByCategory(cat).map((t) => (
                  <button key={t.slug} onClick={() => go(`/tool/${t.slug}`)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    <t.icon className="h-4 w-4 text-slate-400" /> {t.shortName}
                  </button>
                ))}
              </div>
            ))}
            <button onClick={() => go('/contact')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5">
              <Mail className="h-4 w-4" /> Contact Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
