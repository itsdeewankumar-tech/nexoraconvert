import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'tool'; slug: string }
  | { name: 'contact' }
  | { name: 'notfound' };

function parse(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash || '/';
  if (path === '/' || path === '') return { name: 'home' };
  if (path === '/contact') return { name: 'contact' };
  const m = path.match(/^\/tool\/([a-z0-9-]+)/);
  if (m) return { name: 'tool', slug: m[1] };
  return { name: 'notfound' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onChange = () => {
      setRoute(parse());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = path;
}
