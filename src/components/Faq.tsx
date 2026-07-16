import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem { q: string; a: string; }

export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
      <div className="mt-6 space-y-3">
        {items.map((f, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="font-semibold text-white">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden"><p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">{f.a}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
