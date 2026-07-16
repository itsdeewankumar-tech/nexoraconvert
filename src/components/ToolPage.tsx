import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Seo from './Seo';
import Faq from './Faq';
import { type ToolMeta, tools } from '../data/tools';
import { navigate } from '../router';

interface ToolPageProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export default function ToolPage({ tool, children }: ToolPageProps) {
  const Icon = tool.icon;
  const related = tools.filter((t) => t.slug !== tool.slug && t.category === tool.category).slice(0, 4);

  return (
    <>
      <Seo
        title={`${tool.name} — Free Online Tool | NexoraConvert`}
        description={tool.description}
        keywords={tool.keywords}
        canonical={`https://nexoraconvert.com/#/tool/${tool.slug}`}
        faqs={tool.faqs}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{tool.name}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
            {tool.tagline}. {tool.description.split('.')[0]}.
          </p>
        </div>
      </section>

      {/* Tool body */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-8">
          {children}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <h2 className="text-center text-2xl font-bold text-white">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {tool.steps.map((step, i) => (
            <div key={i} className="card-dark p-6 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400">{i + 1}</div>
              <p className="mt-3 text-sm font-medium text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-bold text-white">About the {tool.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{tool.description}</p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2 text-sm text-slate-400"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> 100% free with no login or signup required</li>
          <li className="flex items-start gap-2 text-sm text-slate-400"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Files are processed in your browser — nothing is uploaded to a server</li>
          <li className="flex items-start gap-2 text-sm text-slate-400"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Works on mobile, tablet, and desktop with no app install</li>
          <li className="flex items-start gap-2 text-sm text-slate-400"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> Fast, secure, and optimized for the best user experience</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Faq items={tool.faqs} />
      </section>

      {/* Related tools */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-bold text-white">Related {tool.category}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((t) => {
            const RIcon = t.icon;
            return (
              <button key={t.slug} onClick={() => navigate(`/tool/${t.slug}`)} className="card-dark group flex flex-col items-start gap-3 p-5 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 transition group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white">
                  <RIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{t.shortName}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{t.tagline}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-cyan-400">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
