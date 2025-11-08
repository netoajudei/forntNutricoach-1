import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// --- Context and Provider ---

interface RouterContextType {
  pathname: string;
  push: (path: string) => void;
  replace: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const Router: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState(window.location.hash.substring(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setPathname(window.location.hash.substring(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // On initial load, if hash is empty, set it to '/'
  useEffect(() => {
    if (window.location.hash === '') {
        window.location.hash = '/';
    }
  }, []);


  const push = useCallback((path: string) => {
    window.location.hash = path;
  }, []);
  
  const replace = useCallback((path: string) => {
      const newUrl = `${window.location.pathname}${window.location.search}#${path}`;
      window.location.replace(newUrl);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, push, replace }}>
      {children}
    </RouterContext.Provider>
  );
};

// --- Hooks ---

export const usePathname = (): string => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('usePathname must be used within a Router');
  }
  return context.pathname;
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return {
    push: context.push,
    replace: context.replace,
  };
};

// --- Link Component ---

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, ...props }) => {
  const { push } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (props.onClick) {
        props.onClick(e);
    }
    push(href);
  };

  return (
    <a href={`#${href}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
