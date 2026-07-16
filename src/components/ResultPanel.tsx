import { Download, RefreshCw } from 'lucide-react';

interface ResultPanelProps {
  ready: boolean;
  processing: boolean;
  error?: string | null;
  resultName: string;
  resultUrl?: string;
  onReset: () => void;
  onDownload: () => void;
  downloadLabel?: string;
  children?: React.ReactNode;
}

export default function ResultPanel({ ready, processing, error, resultName, resultUrl, onReset, onDownload, downloadLabel = 'Download', children }: ResultPanelProps) {
  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
        <p className="font-semibold text-rose-400">Something went wrong</p>
        <p className="mt-1 text-sm text-rose-300/80">{error}</p>
        <button onClick={onReset} className="btn-ghost mt-4">Try again</button>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />
        <p className="mt-4 text-sm font-medium text-cyan-300">Processing your file...</p>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <Download className="h-6 w-6" />
        </div>
        <p className="mt-3 font-semibold text-white">{resultName}</p>
        <p className="mt-1 text-sm text-slate-400">Your file is ready.</p>
        {children}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a href={resultUrl} download={resultName} onClick={onDownload} className="btn-primary"><Download className="h-4 w-4" /> {downloadLabel}</a>
          <button onClick={onReset} className="btn-ghost"><RefreshCw className="h-4 w-4" /> Convert another</button>
        </div>
      </div>
    );
  }

  return null;
}
