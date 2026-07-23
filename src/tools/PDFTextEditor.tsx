import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Layers,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  ChevronLeft,
} from 'lucide-react';
import PdfEditor from '@/components/PdfEditor';

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(() => {
    const pending = (window as unknown as Record<string, File>)._nexoraPendingFile;
    if (pending instanceof File) {
      delete (window as unknown as Record<string, File>)._nexoraPendingFile;
      return pending;
    }
    return null;
  });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    setFile(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  useEffect(() => {
    const prev = document.title;
    document.title = 'PDF Editor — NexoraConvert';
    return () => { document.title = prev; };
  }, []);

  if (file) {
    return (
      <div className="h-screen w-screen bg-[#0a0f1e]">
        <PdfEditor file={file} onClose={() => setFile(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <header className="border-b border-white/[0.06] backdrop-blur-xl bg-[#0a0f1e]/90 px-5 h-14 flex items-center justify-between">
        <a href="#/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shadow-md shadow-[#00d4ff]/20">
            <Layers size={17} className="text-white" />
          </div>
          <span className="font-bold text-[16px] tracking-tight">
            <span className="text-white">Nexora</span>
            <span className="text-[#00d4ff]">Convert</span>
          </span>
        </a>
        <a href="#/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={15} /> Back to home
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#00d4ff]/[0.06] blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative w-full max-w-2xl flex flex-col items-center gap-8 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-semibold mb-5">
              PDF Editor
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Edit your PDF without
              <br />
              <span className="bg-gradient-to-r from-[#00d4ff] to-[#7b8cff] bg-clip-text text-transparent">
                changing the layout
              </span>
            </h1>
            <p className="mt-3 text-slate-400 text-base max-w-md mx-auto leading-relaxed">
              Upload a PDF to start editing. Add text anywhere, style it, then download the updated file.
            </p>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-all duration-200 ${
              dragging
                ? 'border-[#00d4ff] bg-[#00d4ff]/[0.08] scale-[1.01]'
                : 'border-white/[0.12] bg-white/[0.03] hover:border-[#00d4ff]/50 hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shadow-xl shadow-[#00d4ff]/25 animate-floaty animate-glow">
                <UploadCloud size={28} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Drop your PDF here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse — stays 100% in your browser</p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00d4ff] hover:bg-[#00bbe6] text-[#0a0f1e] font-bold text-sm transition-colors shadow-lg shadow-[#00d4ff]/30"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Choose PDF File <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />

          <div className="flex items-center justify-center gap-6 text-xs flex-wrap">
            {([
              [ShieldCheck, 'No login required'],
              [Lock, 'File never uploaded'],
              [Zap, 'Instant editing'],
            ] as const).map(([Icon, text]) => (
              <span key={text} className="flex items-center gap-1.5 text-slate-400">
                <Icon size={13} className="text-[#00d4ff]" /> {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
