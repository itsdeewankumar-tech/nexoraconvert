import { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage, canvasToBlob, stripExt } from '../lib/utils';

interface Props {
  outType: 'image/png' | 'image/jpeg';
  outExt: 'png' | 'jpg';
  accept: string;
}

export default function ImageConvert({ outType, outExt, accept }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const run = async (f: File) => {
    setProcessing(true); setError(null);
    try {
      const dataUrl = await fileToDataURL(f);
      const img = await loadImage(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      if (outType === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, outType, outType === 'image/jpeg' ? 0.92 : undefined);
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to convert image.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept={accept} onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload an image to convert" hint={`Converts to ${outExt.toUpperCase()}`} />}
      {file && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="truncate text-sm text-slate-300">{file.name}</span>
        </div>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'image')}.${outExt}`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel={`Download ${outExt.toUpperCase()}`} />
    </div>
  );
}
