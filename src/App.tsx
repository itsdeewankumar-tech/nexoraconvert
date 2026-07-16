import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import ToolPage from './components/ToolPage';
import { useRouter, navigate } from './router';
import { toolMap } from './data/tools';
import { FileQuestion } from 'lucide-react';

import MergePdf from './tools/MergePdf';
import SplitPdf from './tools/SplitPdf';
import PdfToImage from './tools/PdfToImage';
import PdfToWord from './tools/PdfToWord';
import WordToPdf from './tools/WordToPdf';
import ImageToPdf from './tools/ImageToPdf';
import CompressImage from './tools/CompressImage';
import ResizeImage from './tools/ResizeImage';
import BackgroundRemover from './tools/BackgroundRemover';
import PassportPhotoMaker from './tools/PassportPhotoMaker';
import ImageConvert from './tools/ImageConvert';
import ImageToText from './tools/ImageToText';
import PdfToText from './tools/PdfToText';
import AiImageEnhancer from './tools/AiImageEnhancer';

function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6">Back to home</button>
    </div>
  );
}

function renderTool(slug: string) {
  switch (slug) {
    case 'pdf-to-word': return <PdfToWord />;
    case 'word-to-pdf': return <WordToPdf />;
    case 'merge-pdf': return <MergePdf />;
    case 'split-pdf': return <SplitPdf />;
    case 'pdf-to-jpg': return <PdfToImage format="image/jpeg" ext="jpg" />;
    case 'pdf-to-png': return <PdfToImage format="image/png" ext="png" />;
    case 'image-to-pdf': return <ImageToPdf />;
    case 'compress-image': return <CompressImage />;
    case 'resize-image': return <ResizeImage />;
    case 'background-remover': return <BackgroundRemover />;
    case 'passport-photo-maker': return <PassportPhotoMaker />;
    case 'jpg-to-png': return <ImageConvert outType="image/png" outExt="png" accept="image/jpeg" />;
    case 'png-to-jpg': return <ImageConvert outType="image/jpeg" outExt="jpg" accept="image/png" />;
    case 'webp-to-jpg': return <ImageConvert outType="image/jpeg" outExt="jpg" accept="image/webp" />;
    case 'image-to-text': return <ImageToText />;
    case 'pdf-to-text': return <PdfToText />;
    case 'ai-image-enhancer': return <AiImageEnhancer />;
    default: return null;
  }
}

export default function App() {
  const route = useRouter();

  let content: React.ReactNode;
  if (route.name === 'home') {
    content = <HomePage />;
  } else if (route.name === 'contact') {
    content = <ContactPage />;
  } else if (route.name === 'tool') {
    const tool = toolMap[route.slug];
    content = tool ? <ToolPage tool={tool}>{renderTool(route.slug)}</ToolPage> : <NotFound />;
  } else {
    content = <NotFound />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}
