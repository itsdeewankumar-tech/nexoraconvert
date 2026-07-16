import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [ratio, setRatio] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const onFiles = async (fs: File[]) => {
    setFile(fs[0]); setReady(false); setError(null);
    const dataUrl = await fileToDataURL(fs[0]);
    const img = await loadImage(dataUrl);
    setWidth(img.naturalWidth); setHeight(img.naturalHeight); setRatio(img.naturalWidth / img.naturalHeight);
  };
  const onWidth = (w: number) => { setWidth(w); if (lock && w > 0) setHeight(Math.round(w / ratio)); };
  const onHeight = (h: number) => { setHeight(h); if (lock && h > 0) setWidth(Math.round(h * ratio)); };

  const run = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const isPng = file.type === 'image/png';
      const blob = await canvasToBlob(canvas, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.9);
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to resize image.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept="image/*" onFiles={onFiles} label="Upload an image to resize" hint="JPG, PNG, or WebP" />}
      {file && !ready && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="truncate text-sm text-slate-300">{file.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Width (px)</label>
              <input type="number" value={width || ''} onChange={(e) => onWidth(parseInt(e.target.value, 10) || 0)} className="input" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Height (px)</label>
              <input type="number" value={height || ''} onChange={(e) => onHeight(parseInt(e.target.value, 10) || 0)} className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="rounded border-white/20 bg-white/5" /> Lock aspect ratio
          </label>
          <button onClick={run} disabled={processing} className="btn-primary w-full">Resize image</button>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'image')}_${width}x${height}.png`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download resized" />
    </div>
  );
}
