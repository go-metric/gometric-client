"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Thin top-of-page loading bar for client-side navigations.
 * Starts on internal link clicks and completes when the pathname changes.
 * Drives the DOM directly so trickling never re-renders React.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const trickle = useRef<number>(undefined)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const set = (value: number) => {
      progress.current = value
      bar.style.transform = `scaleX(${value})`
    }

    const start = () => {
      window.clearInterval(trickle.current)
      bar.style.transition = "none"
      set(0)
      bar.style.opacity = "1"
      void bar.offsetWidth
      bar.style.transition = ""
      set(0.15)
      trickle.current = window.setInterval(() => {
        set(progress.current + (0.9 - progress.current) * 0.12)
      }, 250)
    }

    // Capture phase: Next's <Link> calls preventDefault before a bubbling listener would run.
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest("a")
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      start()
    }

    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.clearInterval(trickle.current)
    }
  }, [])

  useEffect(() => {
    const bar = barRef.current
    if (!bar || progress.current === 0) return

    window.clearInterval(trickle.current)
    progress.current = 0
    bar.style.transform = "scaleX(1)"
    const hide = window.setTimeout(() => {
      bar.style.opacity = "0"
    }, 200)
    return () => window.clearTimeout(hide)
  }, [pathname])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-brand opacity-0 shadow-[0_0_10px_var(--brand)] transition-[transform,opacity] duration-300 ease-out"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  )
}
