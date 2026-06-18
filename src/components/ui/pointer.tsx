"use client"

import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type HTMLMotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"

/**
 * A custom pointer component that displays an animated cursor.
 * Add this as a child to any component to enable a custom pointer when hovering.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {HTMLMotionProps<"div">} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  ...props
}: HTMLMotionProps<"div">): React.ReactNode {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isHovering, setIsHovering] = useState<boolean>(false)

  useEffect(() => {
    // If no parent is specified via ref, we attach to body to make it truly global
    const parentElement = typeof document !== "undefined" ? document.body : null

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setIsActive(true)

      // Check if we are hovering over a clickable element
      const target = e.target as HTMLElement
      const isClickable = target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer') !== null
      setIsHovering(isClickable)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setIsActive(true)
    }

    const handleMouseLeave = () => {
      setIsActive(false)
      setIsHovering(false)
    }

    if (parentElement) {
      // Apply hide cursor globally to the whole app using a class
      document.documentElement.classList.add("global-hide-cursor")
      parentElement.classList.add("global-hide-cursor")
      
      window.addEventListener("mousemove", handleMouseMove, { capture: true })
      window.addEventListener("mouseenter", handleMouseEnter, { capture: true })
      document.addEventListener("mouseleave", handleMouseLeave, { capture: true }) // using document to catch window exit
    }

    return () => {
      if (parentElement) {
        document.documentElement.classList.remove("global-hide-cursor")
        parentElement.classList.remove("global-hide-cursor")
      }
      window.removeEventListener("mousemove", handleMouseMove, { capture: true })
      window.removeEventListener("mouseenter", handleMouseEnter, { capture: true })
      document.removeEventListener("mouseleave", handleMouseLeave, { capture: true })
    }
  }, [x, y])

  return (
    <>
      {isActive && (
        <style dangerouslySetInnerHTML={{ __html: `* { cursor: none !important; }` }} />
      )}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="pointer-events-none fixed z-[9999] transform-[translate(-50%,-50%)] flex items-center justify-center"
            style={{
              top: y,
              left: x,
              ...style,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isHovering ? 1.1 : 1, 
              opacity: 1 
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            {...props}
          >
            {children || (
              <div className="relative flex items-center justify-center pointer-events-none">
                {isHovering ? (
                  <div className="text-2xl drop-shadow-md relative -top-2">
                    👆
                  </div>
                ) : (
                  /* Main Arrow */
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 16 16"
                    height="24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "rotate-[-70deg] stroke-white transition-colors duration-200",
                      "text-[#FCD53F] fill-[#FCD53F]",
                      className
                    )}
                  >
                    <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                  </svg>
                )}

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

