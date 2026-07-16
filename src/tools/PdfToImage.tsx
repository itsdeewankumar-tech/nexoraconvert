import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import FileDropzone from '../components/FileDropzone';
import { stripExt } from '../lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Props {
  format: 'image/jpeg' | 'image/png';
  ext: 'jpg' | 'png';
}

export default function PdfToImage({ format, ext }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState('');
  const [singleUrl, setSingleUrl] = useState('');
  const [count, setCount] = useState(0);

  const run = async (f: File) => {
    setProcessing(true); setError(null); setProgress(0);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const blobs: Blob[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, background: '#ffffff' }).promise;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), format, 0.92));
        blobs.push(blob);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setCount(blobs.length);
      if (blobs.length === 1) { setSingleUrl(URL.createObjectURL(blobs[0])); }
      else {
        const zip = new JSZip();
        blobs.forEach((b, i) => zip.file(`${stripExt(f.name)}_page${i + 1}.${ext}`, b));
        setZipUrl(URL.createObjectURL(await zip.generateAsync({ type: 'blob' })));
      }
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to convert PDF.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setDone(false); setError(null); setProgress(0); if (zipUrl) URL.revokeObjectURL(zipUrl); if (singleUrl) URL.revokeObjectURL(singleUrl); setZipUrl(''); setSingleUrl(''); setCount(0); };

  return (
    <div>
      {!file && <FileDropzone accept="application/pdf" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload a PDF file" hint="Each page becomes an image" />}
      {file && processing && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
          <p className="mt-4 text-sm font-medium text-cyan-300">Converting... {progress}%</p>
          <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-cyan-500/10">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {done && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <p className="font-semibold text-white">{count} {count > 1 ? 'images' : 'image'} ready</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {singleUrl ? <a href={singleUrl} download={`${stripExt(file!.name)}.${ext}`} className="btn-primary">Download {ext.toUpperCase()}</a>
              : <a href={zipUrl} download={`${stripExt(file!.name)}_images.zip`} className="btn-primary">Download ZIP</a>}
            <button onClick={reset} className="btn-ghost">Convert another</button>
          </div>
        </div>
      )}
      {error && <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-sm text-rose-300">{error}<button onClick={reset} className="btn-ghost mt-3">Try again</button></div>}
    </div>
  );
}
