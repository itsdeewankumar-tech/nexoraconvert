import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { fileToDataURL, loadImage } from '../lib/utils';

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const run = async () => {
    if (files.length === 0) return;
    setProcessing(true); setError(null);
    try {
      const doc = await PDFDocument.create();
      for (const f of files) {
        const dataUrl = await fileToDataURL(f);
        const img = await loadImage(dataUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const isJpg = f.type === 'image/jpeg' || f.type === 'image/jpg';
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), isJpg ? 'image/jpeg' : 'image/png'));
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const embedded = isJpg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        const page = doc.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create PDF from images.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFiles([]); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      <FileDropzone accept="image/*" multiple files={files}
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
        label="Upload images" hint="JPG, PNG, WebP — combined into one PDF" />
      {files.length > 0 && !ready && (
        <button onClick={run} disabled={processing} className="btn-primary mt-5 w-full">
          Create PDF from {files.length} image{files.length > 1 ? 's' : ''}
        </button>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName="images.pdf" resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download PDF" />
    </div>
  );
}
