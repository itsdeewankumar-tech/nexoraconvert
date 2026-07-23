import { FileText, FileType2, Combine, Scissors, Image as ImageIcon, FileImage, Minimize2, Maximize2, Eraser, ScanText, Camera, Repeat, Sparkles, Edit2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolCategory = 'PDF Tools' | 'Image Tools' | 'AI Tools';

export interface ToolMeta {
  slug: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  icon: LucideIcon;
  tagline: string;
  description: string;
  accept: string;
  multiple?: boolean;
  keywords: string[];
  faqs: { q: string; a: string }[];
  steps: string[];
}

export const tools: ToolMeta[] = [
  {
    slug: 'pdf-text-editor',
    name: 'PDF Text Editor',
    shortName: 'PDF Text Editor',
    category: 'PDF Tools',
    icon: Edit2,
    tagline: 'Edit PDF text without changing layout',
    description:
      'Add, edit, or delete text in your PDF files while preserving the original layout and formatting. Perfect for adding signatures, annotations, or modifying specific text content without affecting the document structure.',
    accept: 'application/pdf',
    keywords: ['pdf editor', 'edit pdf text', 'pdf text editor', 'modify pdf', 'edit pdf without changing layout', 'preserve pdf formatting'],
    faqs: [
      { q: 'Does editing change the PDF layout?', a: 'No. Our editor preserves the original PDF structure and layout while allowing you to add or modify text.' },
      { q: 'Can I edit multiple pages?', a: 'Yes, navigate between pages and edit text on any page freely.' },
      { q: 'Can I customize the text appearance?', a: 'Yes, adjust font size, color, and position for each text element.' },
      { q: 'Is my PDF file safe?', a: 'All processing happens in your browser. Your files never leave your device.' },
    ],
    steps: ['Upload your PDF file', 'Navigate and add/edit text', 'Download your modified PDF'],
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word Converter',
    shortName: 'PDF to Word',
    category: 'PDF Tools',
    icon: FileText,
    tagline: 'Convert PDF documents into editable Word files',
    description:
      'Convert your PDF documents into fully editable Microsoft Word (.docx) files with high fidelity. Text, images, and formatting are preserved so you can keep editing right where the PDF left off.',
    accept: 'application/pdf',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to word converter', 'editable word from pdf'],
    faqs: [
      { q: 'Is the PDF to Word converter free?', a: 'Yes. NexoraConvert lets you convert PDF to Word online for free with no login required.' },
      { q: 'Will my formatting be preserved?', a: 'We preserve text, images, headings, and basic layout. Complex tables may need minor cleanup in Word.' },
      { q: 'What is the maximum file size?', a: 'Up to 50 MB per file for free conversion.' },
      { q: 'Are my files safe?', a: 'All processing happens in your browser. Your files never leave your device.' },
    ],
    steps: ['Upload your PDF file', 'We extract text and structure', 'Download your editable .docx file'],
  },
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF Converter',
    shortName: 'Word to PDF',
    category: 'PDF Tools',
    icon: FileType2,
    tagline: 'Turn Word documents into shareable PDFs',
    description:
      'Convert Microsoft Word (.docx, .doc) documents into polished, universally compatible PDF files. Perfect for sharing resumes, reports, and contracts that look the same on every device.',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'word to pdf converter', 'doc to pdf'],
    faqs: [
      { q: 'Does it keep hyperlinks?', a: 'Yes, hyperlinks and bookmarks are preserved in the output PDF.' },
      { q: 'Can I convert multiple Word files?', a: 'Upload one file at a time on the free tier for best results.' },
      { q: 'Is it really free?', a: 'Yes, no signup or payment required for basic conversion.' },
    ],
    steps: ['Upload your Word document', 'Render to PDF layout', 'Download your PDF file'],
  },
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortName: 'Merge PDF',
    category: 'PDF Tools',
    icon: Combine,
    tagline: 'Combine multiple PDFs into one document',
    description:
      'Combine two or more PDF files into a single document in the order you choose. Reorder pages, merge reports, and organize your PDFs without installing any software.',
    accept: 'application/pdf',
    multiple: true,
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger', 'merge pdf files'],
    faqs: [
      { q: 'How many PDFs can I merge?', a: 'You can merge up to 20 PDF files at once on the free tier.' },
      { q: 'Can I reorder the files?', a: 'Yes, drag and drop to reorder before merging.' },
      { q: 'Is there a file size limit?', a: 'Each file can be up to 50 MB.' },
    ],
    steps: ['Upload multiple PDF files', 'Drag to reorder', 'Download the merged PDF'],
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    shortName: 'Split PDF',
    category: 'PDF Tools',
    icon: Scissors,
    tagline: 'Extract pages or divide a PDF into parts',
    description:
      'Split a large PDF into smaller files or extract specific page ranges. Ideal for sharing only the pages you need from long reports, statements, or ebooks.',
    accept: 'application/pdf',
    keywords: ['split pdf', 'divide pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages'],
    faqs: [
      { q: 'Can I split by page ranges?', a: 'Yes, enter custom ranges like 1-3, 5, 8-10.' },
      { q: 'Does splitting reduce quality?', a: 'No. Pages are extracted without re-encoding, so quality is preserved.' },
      { q: 'How many splits can I make?', a: 'Unlimited splits per session, free.' },
    ],
    steps: ['Upload your PDF', 'Choose page ranges', 'Download split PDF files'],
  },
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    shortName: 'PDF to JPG',
    category: 'PDF Tools',
    icon: FileImage,
    tagline: 'Convert PDF pages into JPG images',
    description:
      'Turn each page of a PDF into a high-quality JPG image. Great for thumbnails, presentations, and sharing single pages from a document online.',
    accept: 'application/pdf',
    keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpg', 'pdf to jpeg', 'pdf pages to images'],
    faqs: [
      { q: 'Will every page become a separate image?', a: 'Yes, each PDF page is exported as an individual JPG.' },
      { q: 'What resolution do I get?', a: 'Images render at 150 DPI by default for crisp display.' },
      { q: 'Can I convert to PNG instead?', a: 'Use our PDF to PNG tool for lossless image output.' },
    ],
    steps: ['Upload your PDF', 'Render each page', 'Download JPG images'],
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG Converter',
    shortName: 'PDF to PNG',
    category: 'PDF Tools',
    icon: FileImage,
    tagline: 'Convert PDF pages into lossless PNG images',
    description:
      'Export PDF pages as PNG images with lossless quality and transparency support. Perfect for design work, screenshots, and archival.',
    accept: 'application/pdf',
    keywords: ['pdf to png', 'pdf to png converter', 'convert pdf to png', 'pdf pages to png'],
    faqs: [
      { q: 'Why choose PNG over JPG?', a: 'PNG is lossless and supports transparency — better for text and graphics.' },
      { q: 'Is it free?', a: 'Yes, convert PDF to PNG free with no login.' },
    ],
    steps: ['Upload your PDF', 'Render pages to PNG', 'Download your images'],
  },
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF Converter',
    shortName: 'Image to PDF',
    category: 'Image Tools',
    icon: ImageIcon,
    tagline: 'Combine images into a single PDF',
    description:
      'Convert JPG, PNG, and other images into a single PDF document. Reorder your images, then build a clean PDF gallery in seconds.',
    accept: 'image/*',
    multiple: true,
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert images to pdf', 'picture to pdf'],
    faqs: [
      { q: 'Which image formats are supported?', a: 'JPG, PNG, WebP, and GIF images can all be converted to PDF.' },
      { q: 'Can I combine multiple images?', a: 'Yes, upload multiple images and they are combined in the order you arrange them.' },
      { q: 'Is there a limit?', a: 'Up to 50 images per merge on the free tier.' },
    ],
    steps: ['Upload your images', 'Reorder as needed', 'Download the PDF'],
  },
  {
    slug: 'compress-image',
    name: 'Compress Image',
    shortName: 'Compress Image',
    category: 'Image Tools',
    icon: Minimize2,
    tagline: 'Reduce image file size without losing quality',
    description:
      'Shrink JPG, PNG, and WebP image file sizes up to 80% while keeping them looking great. Perfect for faster websites and email attachments.',
    accept: 'image/*',
    keywords: ['compress image', 'image compressor', 'reduce image size', 'optimize image', 'compress jpg', 'compress png'],
    faqs: [
      { q: 'How much can I compress?', a: 'Most images shrink 50-80% with no visible quality loss.' },
      { q: 'Can I choose the quality level?', a: 'Yes, pick from Low, Medium, or High quality.' },
      { q: 'Which formats are supported?', a: 'JPG, PNG, and WebP compression are supported.' },
    ],
    steps: ['Upload your image', 'Choose quality level', 'Download compressed image'],
  },
  {
    slug: 'resize-image',
    name: 'Resize Image',
    shortName: 'Resize Image',
    category: 'Image Tools',
    icon: Maximize2,
    tagline: 'Resize images to exact dimensions',
    description:
      'Resize images to exact pixel dimensions or scale by percentage. Maintain aspect ratio or crop to fit — ideal for avatars, banners, and social posts.',
    accept: 'image/*',
    keywords: ['resize image', 'image resizer', 'scale image', 'change image size', 'resize photo'],
    faqs: [
      { q: 'Can I keep aspect ratio?', a: 'Yes, enable "Lock aspect ratio" and only one dimension needs to change.' },
      { q: 'What formats work?', a: 'JPG, PNG, and WebP images are supported.' },
      { q: 'Is there a max dimension?', a: 'Up to 8000px on the longest side.' },
    ],
    steps: ['Upload your image', 'Set width and height', 'Download resized image'],
  },
  {
    slug: 'background-remover',
    name: 'Background Remover',
    shortName: 'Background Remover',
    category: 'Image Tools',
    icon: Eraser,
    tagline: 'Remove image backgrounds instantly',
    description:
      'Automatically remove the background from any photo and get a transparent PNG. Perfect for product photos, profile pictures, and design assets.',
    accept: 'image/*',
    keywords: ['background remover', 'remove background', 'transparent background', 'bg remover', 'remove bg'],
    faqs: [
      { q: 'Does it work on hair and fur?', a: 'Our edge detection handles fine details like hair reasonably well for a browser tool.' },
      { q: 'What output do I get?', a: 'A transparent PNG ready to drop into any design.' },
      { q: 'Is it free?', a: 'Yes, remove backgrounds free with no signup.' },
    ],
    steps: ['Upload your image', 'We detect the subject', 'Download transparent PNG'],
  },
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    shortName: 'Passport Photo',
    category: 'Image Tools',
    icon: Camera,
    tagline: 'Create compliant passport photos at home',
    description:
      'Create passport, visa, and ID photos that meet official size requirements. Crop, align, and export print-ready 2x2 inch or 35x45mm photos in seconds.',
    accept: 'image/*',
    keywords: ['passport photo maker', 'passport photo', 'id photo', 'visa photo', 'passport size photo'],
    faqs: [
      { q: 'Which sizes are supported?', a: 'US 2x2 inch, UK/EU 35x45mm, and India 35x45mm presets are included.' },
      { q: 'Can I change the background?', a: 'Yes, switch to white or light blue background for compliance.' },
      { q: 'Is it accepted by authorities?', a: 'We follow official size guidelines, but always check your local authority requirements.' },
    ],
    steps: ['Upload your photo', 'Choose a country size preset', 'Download print-ready photo'],
  },
  {
    slug: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    shortName: 'JPG to PNG',
    category: 'Image Tools',
    icon: Repeat,
    tagline: 'Convert JPG images to lossless PNG',
    description:
      'Convert JPG photos into PNG format with lossless quality and transparency support. Ideal for logos, icons, and graphics that need a clean background.',
    accept: 'image/jpeg',
    keywords: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'jpeg to png converter'],
    faqs: [
      { q: 'Does conversion add transparency?', a: 'PNG supports transparency, but a flat JPG stays opaque unless you also remove the background.' },
      { q: 'Is quality lost?', a: 'No — converting to PNG is lossless.' },
    ],
    steps: ['Upload your JPG', 'Convert to PNG', 'Download your file'],
  },
  {
    slug: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    shortName: 'PNG to JPG',
    category: 'Image Tools',
    icon: Repeat,
    tagline: 'Convert PNG images to smaller JPG files',
    description:
      'Convert PNG images into JPG format to reduce file size. Great for photos and web images where transparency is not required.',
    accept: 'image/png',
    keywords: ['png to jpg', 'convert png to jpg', 'png to jpeg', 'png to jpg converter'],
    faqs: [
      { q: 'What happens to transparency?', a: 'Transparent areas are filled with a white background by default.' },
      { q: 'Will the file be smaller?', a: 'Yes — JPG compression typically shrinks PNG photos significantly.' },
    ],
    steps: ['Upload your PNG', 'Convert to JPG', 'Download your file'],
  },
  {
    slug: 'webp-to-jpg',
    name: 'WebP to JPG Converter',
    shortName: 'WebP to JPG',
    category: 'Image Tools',
    icon: Repeat,
    tagline: 'Convert WebP images to JPG format',
    description:
      'Convert modern WebP images into widely compatible JPG files. Perfect when an app or platform does not accept WebP uploads.',
    accept: 'image/webp',
    keywords: ['webp to jpg', 'convert webp to jpg', 'webp to jpeg', 'webp converter'],
    faqs: [
      { q: 'Why convert WebP to JPG?', a: 'Some older apps and websites still do not accept WebP — JPG works everywhere.' },
      { q: 'Is there quality loss?', a: 'Minimal — JPG uses lossy compression, but photos stay visually identical.' },
    ],
    steps: ['Upload your WebP', 'Convert to JPG', 'Download your file'],
  },
  {
    slug: 'image-to-text',
    name: 'OCR — Image to Text',
    shortName: 'Image to Text',
    category: 'AI Tools',
    icon: ScanText,
    tagline: 'Extract text from images with OCR',
    description:
      'Use optical character recognition to extract editable text from screenshots, scanned documents, and photos. Copy the result or download as a .txt file.',
    accept: 'image/*',
    keywords: ['ocr', 'image to text', 'extract text from image', 'text recognition', 'scan image to text'],
    faqs: [
      { q: 'Which languages are supported?', a: 'English is supported out of the box; the engine recognizes Latin-script text reliably.' },
      { q: 'Does it work on handwriting?', a: 'Printed text works best. Handwriting is recognized with lower accuracy.' },
      { q: 'Is it free?', a: 'Yes, OCR is free with no login required.' },
    ],
    steps: ['Upload your image', 'OCR extracts the text', 'Copy or download the result'],
  },
  {
    slug: 'pdf-to-text',
    name: 'OCR — PDF to Text',
    shortName: 'PDF to Text',
    category: 'AI Tools',
    icon: ScanText,
    tagline: 'Extract text from scanned PDFs',
    description:
      'Run OCR on scanned PDFs to turn them into searchable, editable text. Ideal for old documents, invoices, and forms that were never digitized.',
    accept: 'application/pdf',
    keywords: ['pdf to text', 'ocr pdf', 'extract text from pdf', 'scanned pdf to text', 'pdf text extractor'],
    faqs: [
      { q: 'Does it work on native PDFs?', a: 'Yes — for PDFs that already have text, extraction is instant; for scanned PDFs we run OCR.' },
      { q: 'Is it free?', a: 'Yes, PDF to text extraction is free with no login.' },
    ],
    steps: ['Upload your PDF', 'Extract text with OCR', 'Copy or download the text'],
  },
  {
    slug: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    shortName: 'AI Enhancer',
    category: 'AI Tools',
    icon: Sparkles,
    tagline: 'Sharpen and enhance image quality with AI',
    description:
      'Automatically enhance brightness, contrast, and sharpness to make dull photos look vibrant. A one-click AI pass that brings out detail and color.',
    accept: 'image/*',
    keywords: ['ai image enhancer', 'enhance image', 'image quality enhancer', 'sharpen image', 'ai photo enhancer'],
    faqs: [
      { q: 'What does the enhancer do?', a: 'It adjusts brightness, contrast, saturation, and sharpness to improve overall image quality.' },
      { q: 'Is it free?', a: 'Yes, the AI image enhancer is free to use.' },
    ],
    steps: ['Upload your image', 'AI enhances the photo', 'Download enhanced image'],
  },
];

export const toolMap: Record<string, ToolMeta> = Object.fromEntries(tools.map((t) => [t.slug, t]));

export const categories: ToolCategory[] = ['PDF Tools', 'Image Tools', 'AI Tools'];

export function toolsByCategory(cat: ToolCategory): ToolMeta[] {
  return tools.filter((t) => t.category === cat);
}
