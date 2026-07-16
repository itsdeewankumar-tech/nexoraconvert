import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

export default function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [tolerance, setTolerance] = useState(32);

  const run = async (f: File) => {
    setProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(f);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      const maxDim = 2000;
      let w = img.naturalWidth; let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r); }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1],[Math.floor(w/2),0],[0,Math.floor(h/2)],[w-1,Math.floor(h/2)],[Math.floor(w/2),h-1]];
      const rs: number[] = []; const gs: number[] = []; const bs: number[] = [];
      for (const [x, y] of corners) { const i = (y * w + x) * 4; rs.push(data[i]); gs.push(data[i+1]); bs.push(data[i+2]); }
      const [br, bg, bb] = [rs.reduce((a,b)=>a+b,0)/rs.length, gs.reduce((a,b)=>a+b,0)/gs.length, bs.reduce((a,b)=>a+b,0)/bs.length];
      const matches = (i: number) => { const dr=data[i]-br, dg=data[i+1]-bg, db=data[i+2]-bb; return Math.sqrt(dr*dr+dg*dg+db*db) < tolerance; };

      for (let x = 0; x < w; x++) { for (const y of [0, h-1]) { const idx = y*w+x; if (!visited[idx] && matches(idx*4)) { visited[idx]=1; data[idx*4+3]=0; queue.push(idx); } } }
      for (let y = 0; y < h; y++) { for (const x of [0, w-1]) { const idx = y*w+x; if (!visited[idx] && matches(idx*4)) { visited[idx]=1; data[idx*4+3]=0; queue.push(idx); } } }
      while (queue.length) {
        const idx = queue.pop()!; const x = idx % w; const y = (idx-x)/w;
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx<0||nx>=w||ny<0||ny>=h) continue; const nidx = ny*w+nx;
          if (visited[nidx]) continue;
          if (matches(nidx*4)) { visited[nidx]=1; data[nidx*4+3]=0; queue.push(nidx); }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to remove background.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept="image/*" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload an image" hint="We'll detect and remove the background" />}
      {file && !ready && !processing && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Edge tolerance: {tolerance}</label>
            <input type="range" min={10} max={80} value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value, 10))} className="w-full accent-cyan-500" />
            <p className="mt-1 text-xs text-slate-500">Higher removes more similar colors.</p>
          </div>
          <button onClick={() => run(file)} className="btn-primary w-full">Remove background</button>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'image')}_nobg.png`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download PNG" />
    </div>
  );
}
