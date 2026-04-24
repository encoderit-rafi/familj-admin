import { useEffect, useRef } from 'react';

type ObserverHook = {
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
};

export const useIntersectionObserver = ({
  onIntersect,
  threshold = 0.1,
  rootMargin = '0px',
}: ObserverHook) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [onIntersect, rootMargin, threshold]);

  const observe = (element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return observe;
};
