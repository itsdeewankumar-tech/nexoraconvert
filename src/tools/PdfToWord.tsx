import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import FileDropzone from '../components/FileDropzone';
import ResultPanel from '../components/ResultPanel';
import { stripExt } from '../lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const run = async (f: File) => {
    setProcessing(true); setError(null);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const paragraphs: Paragraph[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const lines: string[] = [];
        let currentY: number | null = null;
        let currentLine = '';
        for (const item of content.items as any[]) {
          const str = item.str ?? '';
          const y = item.transform?.[5] ?? 0;
          if (currentY !== null && Math.abs(y - currentY) > 2) { if (currentLine.trim()) lines.push(currentLine.trim()); currentLine = ''; }
          currentLine += str;
          if (item.hasEOL) { if (currentLine.trim()) lines.push(currentLine.trim()); currentLine = ''; }
          currentY = y;
        }
        if (currentLine.trim()) lines.push(currentLine.trim());
        for (const line of lines) {
          const isHeading = line.length < 80 && /^[A-Z0-9][\w\s\-:,.()&]{3,}$/.test(line);
          paragraphs.push(new Paragraph({ heading: isHeading ? HeadingLevel.HEADING_2 : undefined, children: [new TextRun({ text: line })] }));
        }
        if (i < pdf.numPages) paragraphs.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }));
      }
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      setUrl(URL.createObjectURL(blob)); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to convert PDF to Word.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { setFile(null); setReady(false); setError(null); if (url) URL.revokeObjectURL(url); setUrl(''); };

  return (
    <div>
      {!file && <FileDropzone accept="application/pdf" onFiles={(fs) => { setFile(fs[0]); run(fs[0]); }} label="Upload a PDF file" hint="We'll convert it to editable .docx" />}
      {file && <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="truncate text-sm text-slate-300">{file.name}</span></div>}
      <ResultPanel ready={ready} processing={processing} error={error} resultName={`${stripExt(file?.name ?? 'document')}.docx`} resultUrl={url} onReset={reset} onDownload={() => {}} downloadLabel="Download Word" />
    </div>
  );
}
