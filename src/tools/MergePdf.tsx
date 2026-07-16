import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('merged.pdf');

  const run = async () => {
    if (files.length < 2) { setError('Please upload at least 2 PDF files to merge.'); return; }
    setProcessing(true); setError(null);
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const buf = await out.save();
      const blob = new Blob([buf], { type: 'application/pdf' });
      setUrl(URL.createObjectURL(blob)); setName('merged.pdf'); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to merge PDFs.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFiles([]); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      <FileDropzone accept="application/pdf" multiple files={files}
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
        label="Upload multiple PDF files" hint="Select 2 or more PDFs to combine" />
      {files.length > 0 && !ready && (
        <button onClick={run} disabled={processing} className="btn-primary mt-5 w-full">
          Merge {files.length} PDF{files.length > 1 ? 's' : ''}
        </button>
      )}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={name} resultUrl={url} onReset={reset} onDownload={() => {}} />
    </div>
  );
}
