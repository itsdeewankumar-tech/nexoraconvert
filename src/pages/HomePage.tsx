import { ArrowRight, ShieldCheck, Zap, Globe, Lock, Sparkles, Star, CheckCircle2, FileText, Image as ImageIcon, ScanText } from 'lucide-react';
import Seo from '../components/Seo';
import { categories, toolsByCategory, type ToolMeta } from '../data/tools';
import { navigate } from '../router';

const catMeta: Record<string, { color: string; bg: string; ring: string; icon: typeof FileText }> = {
  'PDF Tools': { color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20', icon: FileText },
  'Image Tools': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/20', icon: ImageIcon },
  'AI Tools': { color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20', icon: ScanText },
};

const toolColors = [
  'text-orange-400 bg-orange-500/10',
  'text-cyan-400 bg-cyan-500/10',
  'text-violet-400 bg-violet-500/10',
  'text-emerald-400 bg-emerald-500/10',
  'text-rose-400 bg-rose-500/10',
  'text-amber-400 bg-amber-500/10',
  'text-blue-400 bg-blue-500/10',
  'text-pink-400 bg-pink-500/10',
];

function ToolCard({ tool, index }: { tool: ToolMeta; index: number }) {
  const Icon = tool.icon;
  const colorClass = toolColors[index % toolColors.length];
  return (
    <button onClick={() => navigate(`/tool/${tool.slug}`)} className="card-dark group flex flex-col items-start gap-4 p-5 text-left">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass} transition group-hover:scale-110`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-white">{tool.shortName}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{tool.tagline}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-cyan-400 opacity-0 transition group-hover:opacity-100">
        Open tool <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export default function HomePage() {
  return (
    <>
      <Seo
        title="NexoraConvert — Free Online PDF, Image & AI Converter Tools"
        description="17 powerful free online tools: PDF to Word, Word to PDF, merge & split PDF, image to PDF, compress image, resize image, background remover, passport photo maker, OCR, and more. No login required."
        keywords={['pdf to word converter', 'word to pdf', 'merge pdf', 'split pdf', 'image to pdf', 'compress image', 'resize image', 'background remover', 'passport photo maker', 'ocr tools', 'online converter', 'free file tools']}
        canonical="https://nexoraconvert.com/"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-cyan-400 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            17 free tools — no login required
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Convert, compress & perfect
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              your files — all in your browser
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            NexoraConvert brings together PDF, image, and AI tools in one fast, secure platform. No uploads, no waiting — just results.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate('/tool/pdf-to-word')} className="btn-primary">
              Try PDF to Word <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate('/tool/compress-image')} className="btn-ghost">
              Compress Image
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> No login required</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-cyan-400" /> Files stay private</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Instant results</span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 sm:px-6 py-8 sm:grid-cols-4">
          {[
            { value: '17', label: 'Free Tools' },
            { value: '100%', label: 'Browser-based' },
            { value: '0', label: 'Logins Needed' },
            { value: '24/7', label: 'Always Available' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center">
          <h2 className="section-title">All tools, organized</h2>
          <p className="section-sub">Pick a category and find exactly what you need.</p>
        </div>

        {categories.map((cat) => {
          const meta = catMeta[cat];
          const CatIcon = meta.icon;
          const list = toolsByCategory(cat);
          return (
            <div key={cat} className="mt-12">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  <CatIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{cat}</h3>
                <span className="text-sm text-slate-500">({list.length} tools)</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
              </div>
            </div>
          );
        })}
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="text-center">
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Three simple steps — no signup needed.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { icon: FileText, title: 'Upload your file', text: 'Drag and drop or click to browse. Your file stays in your browser.' },
            { icon: Zap, title: 'Process instantly', text: 'Our tools work right in your browser — no upload, no waiting.' },
            { icon: CheckCircle2, title: 'Download result', text: 'Get your converted, compressed, or extracted file in seconds.' },
          ].map((s, i) => (
            <div key={i} className="card-dark p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold text-white">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="section-title">Why choose NexoraConvert?</h2>
            <p className="section-sub">Built for speed, privacy, and a better web.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: 'Private by design', text: 'Files are processed in your browser and never uploaded to a server.' },
              { icon: Zap, title: 'Lightning fast', text: 'No queues, no waiting. Results appear the moment you drop a file.' },
              { icon: Globe, title: 'Works everywhere', text: 'Mobile, tablet, or desktop — any modern browser, no install.' },
              { icon: ShieldCheck, title: 'No login needed', text: 'Use every tool free without creating an account or sharing email.' },
              { icon: Star, title: '17 tools, one place', text: 'PDF, image, and AI tools unified under one clean interface.' },
              { icon: Sparkles, title: 'Always improving', text: 'New tools and features are added regularly based on your feedback.' },
            ].map((f) => (
              <div key={f.title} className="card-dark p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 p-10">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-[80px]" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Ready to convert?</h2>
            <p className="mt-2 text-slate-400">Pick a tool and get started in seconds — no signup, no cost.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => navigate('/tool/merge-pdf')} className="btn-primary">Merge PDF</button>
              <button onClick={() => navigate('/tool/background-remover')} className="btn-ghost">Remove Background</button>
              <button onClick={() => navigate('/contact')} className="btn-ghost">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
