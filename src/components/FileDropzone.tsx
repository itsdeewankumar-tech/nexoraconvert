import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
  files?: File[];
  onRemove?: (index: number) => void;
}

export default function FileDropzone({ accept, multiple, onFiles, label = 'Click to upload or drag & drop', hint, files, onRemove }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(dropped);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all ${
          dragging ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]' : 'border-white/15 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/5'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition group-hover:scale-110">
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="mt-4 text-base font-semibold text-white">{label}</p>
        {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => { const arr = Array.from(e.target.files ?? []); if (arr.length) onFiles(arr); e.target.value = ''; }} />
      </div>

      {files && files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <FileIcon className="h-5 w-5 shrink-0 text-cyan-400" />
              <span className="flex-1 truncate text-sm text-slate-300">{f.name}</span>
              <span className="text-xs text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
              {onRemove && (
                <button onClick={() => onRemove(i)} className="rounded-lg p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
