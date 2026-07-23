import * as pdfjsLib from 'pdfjs-dist';

// Set worker from CDN for Vercel compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export type RenderedPage = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pdfPage: pdfjsLib.PDFPageProxy;
};

const loadingTaskCache = new Map<string, pdfjsLib.PDFDocumentLoadingTask>();

function getLoadingTask(data: Uint8Array, key: string): pdfjsLib.PDFDocumentLoadingTask {
  const cached = loadingTaskCache.get(key);
  if (cached) return cached;
  const task = pdfjsLib.getDocument({ data });
  loadingTaskCache.set(key, task);
  return task;
}

export async function loadPdf(data: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  const key = `doc-${data.length}-${data[0]}`;
  const loadingTask = getLoadingTask(data, key);
  return loadingTask.promise;
}

export async function renderPage(
  pdfPage: pdfjsLib.PDFPageProxy,
  targetScale: number,
): Promise<RenderedPage> {
  const viewport = pdfPage.getViewport({ scale: targetScale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  await pdfPage.render({ canvasContext: ctx, viewport }).promise;

  return { canvas, width: viewport.width, height: viewport.height, pdfPage };
}

export function clearPdfCache() {
  loadingTaskCache.clear();
}
