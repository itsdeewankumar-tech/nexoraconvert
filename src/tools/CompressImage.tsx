import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

type Level = 'low' | 'medium' | 'high';
const qualityMap: Record<Level, number> = { low: 0.4, medium: 0.6, high: 0.82 };

export default function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>('medium');
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);

  const run = async (f: File) => {
    setProcessing(true); setError(null); setOriginalSize(f.size);
    try {
      const dataUrl = await fileToDataURL(f);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const isPng = f.type === 'image/png';
      const blob = await canvasToBlob(canvas, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : qualityMap[level]);
      setNewSize(blob.size); setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to compress image.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };
  const savings = originalSize > 0 ? Math.max(0, Math.round((1 - newSize / originalSize) * 100)) : 0;

  return (
    <div>
      {!file && <FileDropzone accept="image/*" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload an image to compress" hint="JPG, PNG, or WebP" />}
      {file && !ready && !processing && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Quality level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Level[]).map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition ${level === l ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}>{l}</button>
              ))}
            </div>
          </div>
          <button onClick={() => run(file)} className="btn-primary w-full">Compress now</button>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'image')}_compressed.jpg`} resultUrl={url} onReset={reset} onDownload={() => {}}>
        {ready && savings > 0 && <p className="mt-2 text-sm font-medium text-emerald-400">Saved {savings}% ({(originalSize / 1024).toFixed(0)} KB → {(newSize / 1024).toFixed(0)} KB)</p>}
      </ResultPanel>
    </div>
  );
}
