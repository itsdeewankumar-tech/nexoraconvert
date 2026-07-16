import { useState } from 'react';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { stripExt, loadImage } from '../lib/utils';

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const run = async (f: File) => {
    setProcessing(true); setError(null);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;padding:48px;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#000;background:#fff;';
      container.innerHTML = html;
      document.body.appendChild(container);
      await new Promise((r) => setTimeout(r, 100));
      const images = Array.from(container.querySelectorAll('img'));
      for (const img of images) { try { await loadImage(img.src); } catch { img.remove(); } }
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const maxWidth = pageWidth - margin * 2;
      const blocks = Array.from(container.children) as HTMLElement[];
      let y = margin;
      for (const block of blocks) {
        const text = block.textContent ?? '';
        if (!text.trim()) { y += 10; continue; }
        const isHeading = /^(H1|H2|H3|H4)$/.test(block.tagName);
        const fontSize = isHeading ? 18 : 12;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isHeading ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        for (const line of lines) { if (y > pageHeight - margin) { pdf.addPage(); y = margin; } pdf.text(line, margin, y); y += fontSize * 1.5; }
        y += 6;
      }
      document.body.removeChild(container);
      const blob = pdf.output('blob');
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to convert Word to PDF.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept=".doc,.docx" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload a Word document" hint=".doc or .docx files" />}
      {file && <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="truncate text-sm text-slate-300">{file.name}</span></div>}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'document')}.pdf`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download PDF" />
    </div>
  );
}
