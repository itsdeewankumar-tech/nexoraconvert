import React, { useRef, useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { Download, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontName: string;
  pageNum: number;
  isNew: boolean;
}

const PDFTextEditor: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingFontSize, setEditingFontSize] = useState(12);
  const [editingColor, setEditingColor] = useState('#000000');
  const [addingNewText, setAddingNewText] = useState(false);
  const [newTextPosition, setNewTextPosition] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setPdfFile(file);
      setPdfDoc(pdfDoc);
      setCurrentPage(1);
      setTotalPages(pdfDoc.getPageCount());
      setTextBoxes([]);
      setSelectedTextBox(null);

      renderPage(pdfDoc, 1, canvasRef.current);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error loading PDF. Please check the file and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (doc: PDFDocument, pageNum: number, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !doc) return;

    try {
      const pdfArrayBuffer = await doc.save();
      const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
      const page = await pdf.getPage(pageNum);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(pdfDoc, currentPage, canvasRef.current);
    }
  }, [pdfDoc, currentPage]);

  const addTextBox = () => {
    if (!editingText.trim()) return;

    const newBox: TextBox = {
      id: `text-${Date.now()}`,
      x: newTextPosition.x,
      y: newTextPosition.y,
      text: editingText,
      fontSize: editingFontSize,
      color: editingColor,
      fontName: 'Helvetica',
      pageNum: currentPage,
      isNew: true,
    };

    setTextBoxes([...textBoxes, newBox]);
    setEditingText('');
    setAddingNewText(false);
    setNewTextPosition({ x: 50, y: 50 });
  };

  const updateTextBox = (id: string) => {
    setTextBoxes(
      textBoxes.map(box =>
        box.id === id
          ? {
              ...box,
              text: editingText,
              fontSize: editingFontSize,
              color: editingColor,
            }
          : box
      )
    );
    setSelectedTextBox(null);
    setEditingText('');
  };

  const deleteTextBox = (id: string) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
    setSelectedTextBox(null);
  };

  const selectTextBox = (box: TextBox) => {
    setSelectedTextBox(box.id);
    setEditingText(box.text);
    setEditingFontSize(box.fontSize);
    setEditingColor(box.color);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const downloadPDF = (data: Uint8Array, filename: string) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const savePDF = async () => {
    if (!pdfDoc) return;

    setLoading(true);
    try {
      const updatedDoc = await PDFDocument.load(await pdfDoc.save());

      const textsByPage = textBoxes.reduce((acc, box) => {
        if (!acc[box.pageNum]) acc[box.pageNum] = [];
        acc[box.pageNum].push(box);
        return acc;
      }, {} as Record<number, TextBox[]>);

      const pages = updatedDoc.getPages();
      for (const [pageNum, texts] of Object.entries(textsByPage)) {
        const pageIndex = parseInt(pageNum) - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height } = page.getSize();

        for (const box of texts) {
          const colorRgb = hexToRgb(box.color);
          page.drawText(box.text, {
            x: box.x,
            y: height - box.y - box.fontSize,
            size: box.fontSize,
            color: rgb(colorRgb.r / 255, colorRgb.g / 255, colorRgb.b / 255),
          });
        }
      }

      const pdfBytes = await updatedDoc.save();
      downloadPDF(pdfBytes, 'edited-document.pdf');
      alert('PDF saved successfully!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">PDF Text Editor</h1>
          <p className="text-slate-600">Edit and customize text in your PDFs without changing the layout or formatting</p>
        </div>

        {!pdfFile ? (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div
              className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:bg-blue-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload your PDF</h3>
              <p className="text-slate-600 mb-4">Drop your PDF file here or click to browse</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Choose File
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Page {currentPage} of {totalPages}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-300 hover:bg-slate-400 disabled:opacity-50 text-slate-900 rounded"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-300 hover:bg-slate-400 disabled:opacity-50 text-slate-900 rounded"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 rounded overflow-auto" style={{ maxHeight: '600px' }}>
                <canvas
                  ref={canvasRef}
                  className="mx-auto"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <div className="space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setAddingNewText(true)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <Plus size={18} /> Add Text
                  </button>
                  <button
                    onClick={savePDF}
                    disabled={loading || textBoxes.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <Save size={18} /> Save PDF
                  </button>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setPdfDoc(null);
                      setTextBoxes([]);
                      setSelectedTextBox(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    <X size={18} /> Clear
                  </button>
                </div>

                <hr className="my-4" />

                {addingNewText && (
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-slate-900">Add New Text</h4>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      placeholder="Enter text..."
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Position X: {newTextPosition.x}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={newTextPosition.x}
                        onChange={(e) =>
                          setNewTextPosition({ ...newTextPosition, x: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Position Y: {newTextPosition.y}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="700"
                        value={newTextPosition.y}
                        onChange={(e) =>
                          setNewTextPosition({ ...newTextPosition, y: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Font Size: {editingFontSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={editingFontSize}
                        onChange={(e) => setEditingFontSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addTextBox}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded transition"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddingNewText(false)}
                        className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-3 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedTextBox && !addingNewText && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-slate-900">Edit Text</h4>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      placeholder="Edit text..."
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Font Size: {editingFontSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={editingFontSize}
                        onChange={(e) => setEditingFontSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-slate-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateTextBox(selectedTextBox)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded transition"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => deleteTextBox(selectedTextBox)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedTextBox(null)}
                        className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-3 rounded transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {textBoxes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Text Boxes ({textBoxes.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {textBoxes.map((box) => (
                        <div
                          key={box.id}
                          onClick={() => selectTextBox(box)}
                          className={`p-2 rounded cursor-pointer transition ${
                            selectedTextBox === box.id
                              ? 'bg-blue-200 border-2 border-blue-500'
                              : 'bg-slate-100 border border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <p className="text-sm font-medium text-slate-900 truncate">{box.text}</p>
                          <p className="text-xs text-slate-600">Page {box.pageNum}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFTextEditor;
