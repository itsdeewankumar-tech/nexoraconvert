import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

export default function AiImageEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [brightness, setBrightness] = useState(110);
  const [contrast, setContrast] = useState(115);
  const [saturation, setSaturation] = useState(120);
  const [sharpness, setSharpness] = useState(50);

  const run = async (f: File) => {
    setProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(f);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);
      if (sharpness > 0) {
        ctx.filter = 'none';
        const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dst = ctx.createImageData(canvas.width, canvas.height);
        const w = canvas.width; const h = canvas.height;
        const amount = sharpness / 100;
        const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0; let k = 0;
              for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) { const idx = ((y+dy)*w+(x+dx))*4+c; sum += src.data[idx] * kernel[k++]; } }
              dst.data[(y*w+x)*4+c] = Math.min(255, Math.max(0, sum));
            }
            dst.data[(y*w+x)*4+3] = src.data[(y*w+x)*4+3];
          }
        }
        ctx.putImageData(dst, 0, 0);
      }
      const isPng = f.type === 'image/png';
      const blob = await canvasToBlob(canvas, isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.92);
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to enhance image.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept="image/*" onFiles={(fs) => setFile(fs[0])} label="Upload an image to enhance" hint="We'll boost brightness, contrast & sharpness" />}
      {file && !ready && (
        <div className="space-y-5">
          {[
            { label: 'Brightness', value: brightness, set: setBrightness, min: 50, max: 200 },
            { label: 'Contrast', value: contrast, set: setContrast, min: 50, max: 200 },
            { label: 'Saturation', value: saturation, set: setSaturation, min: 0, max: 200 },
            { label: 'Sharpness', value: sharpness, set: setSharpness, min: 0, max: 100 },
          ].map((s) => (
            <div key={s.label}>
              <label className="mb-1.5 flex justify-between text-sm font-medium text-slate-300"><span>{s.label}</span><span className="text-slate-500">{s.value}%</span></label>
              <input type="range" min={s.min} max={s.max} value={s.value} onChange={(e) => s.set(parseInt(e.target.value, 10))} className="w-full accent-cyan-500" />
            </div>
          ))}
          <button onClick={() => run(file)} disabled={processing} className="btn-primary w-full">Enhance image</button>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'image')}_enhanced.jpg`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download enhanced" />
    </div>
  );
}
