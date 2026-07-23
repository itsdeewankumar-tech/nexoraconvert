import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Type,
  MousePointer2,
  Download,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ZoomIn,
  ZoomOut,
  X,
  Layers,
} from 'lucide-react';
import type { Annotation } from '@/types';
import { loadPdf, renderPage, clearPdfCache } from '@/lib/pdfRender';
import { exportPdf } from '@/lib/pdfExport';

type Props = {
  file: File;
  onClose: () => void;
};

const FONT_COLORS = ['#ffffff', '#0f172a', '#00d4ff', '#ff4d6d', '#ffd60a', '#34d399', '#a78bfa'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function PdfEditor({ file, onClose }: Props) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1.4);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text'>('select');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pageCanvas, setPageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const selected = useMemo(
    () => annotations.find((a) => a.id === selectedId) ?? null,
    [annotations, selectedId],
  );

  // Load PDF bytes on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const pdf = await loadPdf(bytes.slice());
        if (!mounted) return;
        setPdfBytes(bytes);
        setNumPages(pdf.numPages);
        setCurrentPage(0);
        setLoading(false);
      } catch (e) {
        console.error('PDF Loading Error:', e);
        if (mounted) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error occurred';
          setError(`Could not open this PDF. ${errorMsg}`);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
      clearPdfCache();
    };
  }, [file]);

  // Render current page when page or scale changes
  useEffect(() => {
    if (!pdfBytes || numPages === 0) return;
    let cancelled = false;
    (async () => {
      try {
        setRendering(true);
        setError(null);
        const pdf = await loadPdf(pdfBytes.slice());
        const page = await pdf.getPage(currentPage + 1);
        if (cancelled) return;
        const { canvas, width, height } = await renderPage(page, scale);
        if (cancelled) return;
        setPageCanvas(canvas);
        setPageSize({ width, height });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Failed to render this page.');
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfBytes, numPages, currentPage, scale]);

  const addTextAnnotation = useCallback(
    (x: number, y: number) => {
      const ann: Annotation = {
        id: uid(),
        pageIndex: currentPage,
        x,
        y,
        text: 'Type here...',
        fontSize: 18,
        color: '#0f172a',
        bold: false,
        italic: false,
        underline: false,
        rotation: 0,
        align: 'left',
        deleted: false,
        createdAt: Date.now(),
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedId(ann.id);
      setTool('select');
    },
    [currentPage],
  );

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== 'text') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 12;
    addTextAnnotation(Math.max(0, x), Math.max(0, y));
  };

  const startDrag = (e: React.MouseEvent, ann: Annotation) => {
    e.stopPropagation();
    setSelectedId(ann.id);
    dragRef.current = { id: ann.id, startX: e.clientX, startY: e.clientY, origX: ann.x, origY: ann.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      setAnnotations((prev) =>
        prev.map((a) => (a.id === d.id ? { ...a, x: d.origX + dx, y: d.origY + dy } : a)),
      );
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const updateSelected = (patch: Partial<Annotation>) => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.map((a) => (a.id === selectedId ? { ...a, ...patch } : a)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  };

  const handleExport = async () => {
    if (!pdfBytes) return;
    setExporting(true);
    setError(null);
    try {
      const exportAnns = annotations.map((a) => ({
        ...a,
        x: a.x / scale,
        y: a.y / scale,
        fontSize: a.fontSize / scale,
      }));
      const baseName = file.name.replace(/\.pdf$/i, '') || 'document';
      await exportPdf(pdfBytes.slice(), exportAnns, `${baseName}-edited.pdf`);
    } catch (e) {
      console.error(e);
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const pageAnnotations = annotations.filter((a) => a.pageIndex === currentPage);
  const canPrev = currentPage > 0;
  const canNext = currentPage < numPages - 1;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e] text-white">
      {/* Top toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#0d1526] border-b border-white/[0.07] flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors shrink-0"
          >
            <X size={16} /> Exit
          </button>
          <div className="w-px h-6 bg-white/10 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={15} className="text-[#00d4ff] shrink-0" />
            <span className="text-sm font-semibold text-white truncate max-w-[200px]" title={file.name}>
              {file.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={<MousePointer2 size={15} />} label="Select" />
          <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={<Type size={15} />} label="Add Text" />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#0a0f1e] bg-[#00d4ff] hover:bg-[#00bbdf] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#00d4ff]/25"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Download
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      {selected && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1a2e] border-b border-white/[0.07] flex-wrap animate-fade-in-up">
          <select
            value={selected.fontSize}
            onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
            className="px-2.5 py-1.5 text-sm rounded-md bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s} className="bg-[#0f1a2e]">{s}px</option>
            ))}
          </select>

          <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-md p-0.5">
            <FormatButton active={selected.bold} onClick={() => updateSelected({ bold: !selected.bold })} icon={<Bold size={14} />} />
            <FormatButton active={selected.italic} onClick={() => updateSelected({ italic: !selected.italic })} icon={<Italic size={14} />} />
            <FormatButton active={selected.underline} onClick={() => updateSelected({ underline: !selected.underline })} icon={<Underline size={14} />} />
          </div>

          <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-md p-0.5">
            <FormatButton active={selected.align === 'left'} onClick={() => updateSelected({ align: 'left' })} icon={<AlignLeft size={14} />} />
            <FormatButton active={selected.align === 'center'} onClick={() => updateSelected({ align: 'center' })} icon={<AlignCenter size={14} />} />
            <FormatButton active={selected.align === 'right'} onClick={() => updateSelected({ align: 'right' })} icon={<AlignRight size={14} />} />
          </div>

          <button
            onClick={() => updateSelected({ rotation: (selected.rotation + 90) % 360 })}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-md transition-colors"
            title="Rotate 90°"
          >
            <RotateCw size={14} /> {selected.rotation}°
          </button>

          <div className="flex items-center gap-1.5">
            {FONT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateSelected({ color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  selected.color === c ? 'border-[#00d4ff] scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateSelected({ color: e.target.value })}
              className="w-6 h-6 rounded-full cursor-pointer border-2 border-white/20 bg-transparent"
              title="Custom color"
            />
          </div>

          <div className="w-px h-6 bg-white/10" />
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#ff4d6d] hover:bg-[#ff4d6d]/10 rounded-md transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Page area */}
      <div
        className="flex-1 overflow-auto flex flex-col items-center py-8 px-4 bg-[#0a0f1e]"
        onClick={() => tool !== 'text' && setSelectedId(null)}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400 mt-20">
            <Loader2 size={32} className="animate-spin text-[#00d4ff]" />
            <p className="text-sm">Opening PDF...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-20 max-w-md text-center">
            <p className="text-sm text-[#ff4d6d] bg-[#ff4d6d]/10 border border-[#ff4d6d]/20 rounded-lg px-4 py-3">{error}</p>
          </div>
        )}

        {!loading && !error && pageCanvas && (
          <div
            className="relative shadow-2xl rounded-sm bg-white"
            style={{ width: pageSize.width, height: pageSize.height, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <canvas
              ref={(node) => {
                if (node && pageCanvas) {
                  const ctx = node.getContext('2d');
                  if (ctx) {
                    node.width = pageCanvas.width;
                    node.height = pageCanvas.height;
                    ctx.drawImage(pageCanvas, 0, 0);
                  }
                }
              }}
              className="block rounded-sm"
              style={{ width: pageSize.width, height: pageSize.height }}
            />
            <div
              ref={pageContainerRef}
              className={`absolute inset-0 ${tool === 'text' ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={handlePageClick}
            >
              {pageAnnotations.map((ann) => (
                <TextAnnotation
                  key={ann.id}
                  ann={ann}
                  selected={ann.id === selectedId}
                  onSelect={() => setSelectedId(ann.id)}
                  onDragStart={(e) => startDrag(e, ann)}
                  onChange={(patch) =>
                    setAnnotations((prev) => prev.map((a) => (a.id === ann.id ? { ...a, ...patch } : a)))
                  }
                  scale={scale}
                />
              ))}
              {rendering && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-slate-700" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1526] border-t border-white/[0.07] flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => canPrev && setCurrentPage((p) => p - 1)}
            disabled={!canPrev}
            className="p-2 text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-white px-2 tabular-nums">
            {currentPage + 1} / {numPages || 1}
          </span>
          <button
            onClick={() => canNext && setCurrentPage((p) => p + 1)}
            disabled={!canNext}
            className="p-2 text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}
            className="p-1.5 text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-md transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium text-slate-300 tabular-nums w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}
            className="p-1.5 text-slate-300 hover:bg-white/[0.06] hover:text-white rounded-md transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-[#00d4ff]/[0.12] text-[#00d4ff]'
          : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function FormatButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-[#00d4ff] text-[#0a0f1e]' : 'text-slate-300 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function TextAnnotation({
  ann,
  selected,
  onSelect,
  onDragStart,
  onChange,
}: {
  ann: Annotation;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onChange: (patch: Partial<Annotation>) => void;
  scale: number;
}) {
  const [editing, setEditing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.select();
    }
  }, [editing]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: ann.x,
    top: ann.y,
    fontSize: ann.fontSize,
    color: ann.color,
    fontWeight: ann.bold ? 700 : 400,
    fontStyle: ann.italic ? 'italic' : 'normal',
    textDecoration: ann.underline ? 'underline' : 'none',
    textAlign: ann.align,
    transform: `rotate(${ann.rotation}deg)`,
    transformOrigin: 'top left',
    lineHeight: 1.2,
    fontFamily: 'Inter, Helvetica, Arial, sans-serif',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minWidth: 40,
    padding: '2px 4px',
  };

  if (editing) {
    return (
      <textarea
        ref={taRef}
        value={ann.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onBlur={() => setEditing(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={style}
        className="outline-none resize-none bg-white/70 border border-[#00d4ff] rounded-sm shadow-sm"
        rows={Math.max(1, ann.text.split('\n').length)}
      />
    );
  }

  return (
    <div
      style={style}
      onMouseDown={onDragStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className={`cursor-move select-none ${selected ? 'ring-2 ring-[#00d4ff] ring-offset-1' : 'hover:ring-1 hover:ring-[#00d4ff]/40'}`}
    >
      {ann.text || ' '}
    </div>
  );
}
