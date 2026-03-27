"use client";

import { useEffect } from "react";

/**
 * Hook to lock body scroll when a modal is open.
 * Prevents background scrolling and layout jump.
 * 
 * @param lock - Whether to lock the body scroll
 */
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    // Save original styles to restore them later
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.overflow = "hidden";

    // Add padding to replace scrollbar space if it exists
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Special handling for iOS Safari
    // Though overflow: hidden works in many cases, we can use a class for more complex scenarios
    document.body.classList.add("body-lock");

    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.classList.remove("body-lock");
    };
  }, [lock]);
}
