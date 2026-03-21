import { useCallback } from "react";

import { useOverlayStack } from "@/stores/interface/overlayStack";

export type NavigationDirection = "up" | "down" | "left" | "right";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), .tabbable';

export function useSpatialNavigation() {
  const getFocusableElements = useCallback(() => {
    const topModalId = useOverlayStack.getState().getTopModal();
    const all = Array.from(
      document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );

    let filtered = all.filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        !(el as any).disabled
      );
    });

    if (topModalId) {
      const modalElement = document.getElementById(`modal-${topModalId}`);
      if (modalElement) {
        filtered = filtered.filter((el) => modalElement.contains(el));
      }
    }

    return filtered;
  }, []);

  const navigate = useCallback(
    (direction: NavigationDirection) => {
      const activeElement = document.activeElement as HTMLElement;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      // If nothing focused or focus is lost, focus the first available element
      if (
        !activeElement ||
        activeElement === document.body ||
        !elements.includes(activeElement)
      ) {
        elements[0].focus();
        elements[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }

      const currentRect = activeElement.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };

      let bestElement: HTMLElement | null = null;
      let minScore = Infinity;

      for (const el of elements) {
        if (el === activeElement) continue;

        const elRect = el.getBoundingClientRect();
        const elCenter = {
          x: elRect.left + elRect.width / 2,
          y: elRect.top + elRect.height / 2,
        };

        const dx = elCenter.x - currentCenter.x;
        const dy = elCenter.y - currentCenter.y;

        let isCorrectDirection = false;
        switch (direction) {
          case "up":
            isCorrectDirection = dy < 0;
            break;
          case "down":
            isCorrectDirection = dy > 0;
            break;
          case "left":
            isCorrectDirection = dx < 0;
            break;
          case "right":
            isCorrectDirection = dx > 0;
            break;
          default:
            break;
        }

        if (isCorrectDirection) {
          // Weighted distance calculation
          // We prioritize elements that are aligned with the direction
          // Score = straight-line distance + (orthogonal distance * factor)
          const primaryDist =
            direction === "up" || direction === "down"
              ? Math.abs(dy)
              : Math.abs(dx);
          const secondaryDist =
            direction === "up" || direction === "down"
              ? Math.abs(dx)
              : Math.abs(dy);

          // Penalty for being off-axis
          const score = primaryDist + secondaryDist * 2;

          if (score < minScore) {
            minScore = score;
            bestElement = el;
          }
        }
      }

      if (bestElement) {
        bestElement.focus();
        bestElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [getFocusableElements],
  );

  return { navigate };
}
