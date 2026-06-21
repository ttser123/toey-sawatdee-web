// src/components/ScrollReveal.tsx
// Presentation wrapper that applies scroll-triggered animations to children using motion.

'use client';

import React from 'react';
import { motion } from 'motion/react';

type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-in';

const motionElements = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
};

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation variant. Default: 'fade-up' */
  variant?: RevealVariant;
  /** Stagger delay index for grid items (multiplied by 80ms). */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** HTML tag to render. Default: 'div' */
  as?: keyof typeof motionElements;
  /** IntersectionObserver threshold (0-1) */
  threshold?: number;
}

const variants = {
  hidden: (variant: RevealVariant) => {
    switch (variant) {
      case 'fade-up':
        return { opacity: 0, y: 28 };
      case 'fade-down':
        return { opacity: 0, y: -28 };
      case 'fade-left':
        return { opacity: 0, x: -28 };
      case 'fade-right':
        return { opacity: 0, x: 28 };
      case 'scale-in':
        return { opacity: 0, scale: 0.92 };
      case 'fade-in':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: 28 };
    }
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
};

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold,
}: ScrollRevealProps) {
  const MotionComponent = motionElements[Tag] || motion.div;

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold ?? 0.1 }}
      custom={variant}
      variants={variants}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: delay * 0.08,
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

