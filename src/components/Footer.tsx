import { Layers, Mail, Shield, Zap, Heart } from 'lucide-react';
import { categories, toolsByCategory } from '../data/tools';
import { navigate } from '../router';

export default function Footer() {
  const go = (path: string) => navigate(path);

  return (
    <footer className="border-t border-white/10 bg-[#080d1a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button onClick={() => go('/')} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Nexora<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Convert</span>
              </span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              17 powerful free online tools to convert, compress, and perfect your files — right in your browser. No login required.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-cyan-400" /> Files stay on your device</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Instant results</span>
            </div>
          </div>

          {/* Category columns */}
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-white">{cat}</h3>
              <ul className="mt-3 space-y-2">
                {toolsByCategory(cat).map((t) => (
                  <li key={t.slug}>
                    <button onClick={() => go(`/tool/${t.slug}`)} className="text-sm text-slate-500 transition hover:text-cyan-400">
                      {t.shortName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><button onClick={() => go('/')} className="text-sm text-slate-500 transition hover:text-cyan-400">Home</button></li>
              <li><button onClick={() => go('/contact')} className="text-sm text-slate-500 transition hover:text-cyan-400">Contact Us</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} NexoraConvert. All rights reserved.</p>
          <p className="inline-flex items-center gap-1 text-xs text-slate-600">
            Made with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for a faster web
          </p>
        </div>
      </div>
    </footer>
  );
}
