import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import FileDropzone from '../components/FileDropzone';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { stripExt } from '../lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (f: File) => {
    setProcessing(true); setError(null); setProgress(0); setText('');
    try {
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let allText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines: string[] = [];
        let currentY: number | null = null;
        let currentLine = '';
        for (const item of content.items as any[]) {
          const str = item.str ?? '';
          const y = item.transform?.[5] ?? 0;
          if (currentY !== null && Math.abs(y - currentY) > 2) { if (currentLine.trim()) lines.push(currentLine.trim()); currentLine = ''; }
          currentLine += str;
          if (item.hasEOL) { if (currentLine.trim()) lines.push(currentLine.trim()); currentLine = ''; }
          currentY = y;
        }
        if (currentLine.trim()) lines.push(currentLine.trim());
        allText += lines.join('\n') + '\n\n';
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setText(allText.trim() || 'No selectable text found. This may be a scanned PDF — try the Image to Text tool.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to extract text from PDF.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setText(''); setError(null); setProgress(0); };
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${stripExt(file?.name ?? 'text')}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      {!file && !text && <FileDropzone accept="application/pdf" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload a PDF file" hint="We'll extract all selectable text" />}
      {processing && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
          <p className="mt-4 text-sm font-medium text-cyan-300">Extracting text... {progress}%</p>
          <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-cyan-500/10">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-sm text-rose-300">{error}<button onClick={reset} className="btn-ghost mt-3">Try again</button></div>}
      {text && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Extracted text</h3>
            <div className="flex gap-2">
              <button onClick={copy} className="btn-ghost !py-2 !px-3 text-xs"><Copy className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy'}</button>
              <button onClick={download} className="btn-ghost !py-2 !px-3 text-xs"><Download className="h-3.5 w-3.5" /> .txt</button>
              <button onClick={reset} className="btn-ghost !py-2 !px-3 text-xs"><RefreshCw className="h-3.5 w-3.5" /> New</button>
            </div>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="input resize-y font-mono text-sm" />
        </div>
      )}
    </div>
  );
}
