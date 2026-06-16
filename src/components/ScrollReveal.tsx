// src/components/ScrollReveal.tsx
// Presentation wrapper that applies scroll-triggered CSS animations to children.
// Supports multiple animation variants and staggered delays for grid items.

'use client';

import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation variant. Default: 'fade-up' */
  variant?: RevealVariant;
  /** Stagger delay index for grid items (multiplied by 80ms). */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** HTML tag to render. Default: 'div' */
  as?: keyof React.JSX.IntrinsicElements;
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold,
}: ScrollRevealProps) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold });

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay * 80}ms`, animationDelay: `${delay * 80}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
