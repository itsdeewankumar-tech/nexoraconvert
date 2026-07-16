import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  faqs?: { q: string; a: string }[];
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: unknown) {
  let el = document.head.querySelector<HTMLScriptElement>(`script[data-seo="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function Seo({ title, description, keywords, canonical, faqs }: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    if (keywords?.length) setMeta('keywords', keywords.join(', '));
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (canonical) setLink('canonical', canonical);

    if (faqs?.length) {
      setJsonLd('faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    } else {
      const el = document.head.querySelector('script[data-seo="faq"]');
      if (el) el.remove();
    }
  }, [title, description, keywords, canonical, faqs]);

  return null;
}
