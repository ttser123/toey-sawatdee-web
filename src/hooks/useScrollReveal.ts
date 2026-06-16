// src/hooks/useScrollReveal.ts
// IntersectionObserver-based scroll reveal hook.
// Toggles a CSS class when elements enter the viewport — no scroll listeners.

import { useEffect, useRef, useCallback } from 'react';

interface ScrollRevealOptions {
  /** Viewport threshold (0–1). Default 0.15 = 15% visible triggers animation */
  threshold?: number;
  /** Root margin offset. Negative pulls the trigger line inward. */
  rootMargin?: string;
  /** Only trigger once (default true) */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<T>(null);

  const setupObserver = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('scroll-revealed');
          if (once) observer.unobserve(element);
        } else if (!once) {
          element.classList.remove('scroll-revealed');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  useEffect(() => {
    return setupObserver();
  }, [setupObserver]);

  return ref;
}
