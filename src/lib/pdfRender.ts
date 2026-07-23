import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
  try {
    const key = `doc-${data.length}-${data[0]}`;
    const loadingTask = getLoadingTask(data, key);
    const pdf = await loadingTask.promise;
    
    if (!pdf) {
      throw new Error('PDF document is null or undefined');
    }
    
    return pdf;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function renderPage(
  pdfPage: pdfjsLib.PDFPageProxy,
  targetScale: number,
): Promise<RenderedPage> {
  try {
    const viewport = pdfPage.getViewport({ scale: targetScale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const renderTask = pdfPage.render({ canvasContext: ctx, viewport });
    await renderTask.promise;

    return { canvas, width: viewport.width, height: viewport.height, pdfPage };
  } catch (error) {
    console.error('Error rendering page:', error);
    throw new Error(`Failed to render page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function clearPdfCache() {
  loadingTaskCache.clear();
}
