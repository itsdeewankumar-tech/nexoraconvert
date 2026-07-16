import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropzone from '../components/FileDropzone';
import { stripExt } from '../lib/utils';

function parseRanges(input: string, max: number): number[][] {
  const groups: number[][] = [];
  for (const part of input.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1], 10); let b = parseInt(m[2], 10);
      if (a > b) [a, b] = [b, a];
      const arr: number[] = [];
      for (let i = a; i <= b; i++) if (i >= 1 && i <= max) arr.push(i);
      groups.push(arr);
    } else if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      if (n >= 1 && n <= max) groups.push([n]);
    }
  }
  return groups;
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<{ url: string; name: string }[]>([]);

  const onFiles = async (fs: File[]) => {
    setFile(fs[0]); setReady(false); setError(null);
    try {
      const buf = await fs[0].arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  };

  const run = async () => {
    if (!file) return;
    const groups = parseRanges(ranges, pageCount);
    if (groups.length === 0) { setError('Enter valid page ranges, e.g. 1-3, 5, 8-10.'); return; }
    setProcessing(true); setError(null);
    try {
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const out: { url: string; name: string }[] = [];
      for (let i = 0; i < groups.length; i++) {
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, groups[i].map((p) => p - 1));
        pages.forEach((p) => doc.addPage(p));
        const bytes = await doc.save();
        out.push({ url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), name: `${stripExt(file.name)}_part${i + 1}.pdf` });
      }
      setUrls(out); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to split PDF.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setRanges(''); setReady(false); setError(null); urls.forEach((u) => URL.revokeObjectURL(u.url)); setUrls([]); };

  return (
    <div>
      {!file && <FileDropzone accept="application/pdf" onFiles={onFiles} label="Upload a PDF to split" hint="One PDF file" />}
      {file && !ready && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="truncate text-sm text-slate-300">{file.name}</span>
            <span className="text-xs text-slate-500">{pageCount} pages</span>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Page ranges</label>
            <input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 5, 8-10" className="input" />
            <p className="mt-1 text-xs text-slate-500">Each range becomes a separate PDF file.</p>
          </div>
          <button onClick={run} disabled={processing} className="btn-primary w-full">Split PDF</button>
        </div>
      )}
      {ready && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="text-center font-semibold text-white">{urls.length} files ready</p>
          <ul className="mt-4 space-y-2">
            {urls.map((u, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="truncate text-sm text-slate-300">{u.name}</span>
                <a href={u.url} download={u.name} className="text-sm font-medium text-cyan-400 hover:underline">Download</a>
              </li>
            ))}
          </ul>
          <div className="mt-5 text-center"><button onClick={reset} className="btn-ghost">Split another</button></div>
        </div>
      )}
      {error && <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-sm text-rose-300">{error}</div>}
      {processing && (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
          <p className="mt-4 text-sm font-medium text-cyan-300">Splitting...</p>
        </div>
      )}
    </div>
  );
}
