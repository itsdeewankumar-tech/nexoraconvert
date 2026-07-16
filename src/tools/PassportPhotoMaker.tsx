import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

interface Preset { label: string; w: number; h: number; }
const presets: Record<string, Preset> = {
  us: { label: 'US 2x2 in', w: 600, h: 600 },
  eu: { label: 'EU 35x45 mm', w: 413, h: 531 },
  india: { label: 'India 35x45 mm', w: 413, h: 531 },
};

export default function PassportPhotoMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<keyof typeof presets>('us');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const run = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const p = presets[preset];
      const dataUrl = await fileToDataURL(file);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = p.w; canvas.height = p.h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor; ctx.fillRect(0, 0, p.w, p.h);
      const srcRatio = img.naturalWidth / img.naturalHeight;
      const dstRatio = p.w / p.h;
      let dw = p.w; let dh = p.h; let dx = 0; let dy = 0;
      if (srcRatio > dstRatio) { dh = p.h; dw = p.h * srcRatio; dx = (p.w - dw) / 2; }
      else { dw = p.w; dh = p.w / srcRatio; dy = (p.h - dh) / 2; }
      ctx.drawImage(img, dx, dy, dw, dh);
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create passport photo.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept="image/*" onFiles={(fs) => setFile(fs[0])} label="Upload your photo" hint="A front-facing photo works best" />}
      {file && !ready && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Country / size</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(presets) as (keyof typeof presets)[]).map((k) => (
                <button key={k} onClick={() => setPreset(k)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${preset === k ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}>{presets[k].label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Background color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent" />
              <span className="text-sm text-slate-400">{bgColor}</span>
            </div>
          </div>
          <button onClick={run} disabled={processing} className="btn-primary w-full">Create passport photo</button>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'photo')}_passport.jpg`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download photo" />
    </div>
  );
}
