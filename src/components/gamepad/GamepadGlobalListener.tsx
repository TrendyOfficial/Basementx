import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGamepadPolling } from "@/hooks/useGamepad";
import { useSpatialNavigation } from "@/hooks/useSpatialNavigation";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePreferencesStore } from "@/stores/preferences";

export function GamepadGlobalListener() {
  const { navigate: navigateSpatial } = useSpatialNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hideModal, getTopModal } = useOverlayStack();

  const enableGamepadControls = usePreferencesStore(
    (s: any) => s.enableGamepadControls,
  );

  const gamepadInputMode = usePreferencesStore((s: any) => s.gamepadInputMode);

  const handleAction = useCallback(
    (action: string) => {
      if (gamepadInputMode === "kbm") return;

      // Add gamepad-active class to body to show custom focus outlines
      document.body.classList.add("gamepad-active");
      usePreferencesStore.getState().setGamepadActive(true);

      // Don't intercept if we're in the player (it has its own listener)
      if (location.pathname.startsWith("/media/")) return;

      switch (action) {
        case "navigate-up":
          navigateSpatial("up");
          break;
        case "navigate-down":
          navigateSpatial("down");
          break;
        case "navigate-left":
          navigateSpatial("left");
          break;
        case "navigate-right":
          navigateSpatial("right");
          break;
        case "confirm":
          (document.activeElement as HTMLElement)?.click();
          break;
        case "back": {
          const topModal = getTopModal();
          if (topModal) {
            hideModal(topModal);
          } else {
            window.history.back();
          }
          break;
        }
        case "go-home": {
          window.scrollTo(0, 0);
          navigate("/");
          break;
        }
        default:
          break;
      }
    },
    [
      navigateSpatial,
      location.pathname,
      gamepadInputMode,
      hideModal,
      getTopModal,
      navigate,
    ],
  );

  useGamepadPolling({
    onAction: handleAction,
    enabled: enableGamepadControls,
  });

  // Remove gamepad-active class on mouse move (optional, but nice for hybrid use)
  useEffect(() => {
    const handleMouseMove = () => {
      document.body.classList.remove("gamepad-active");
      if (usePreferencesStore.getState().isGamepadActive) {
        usePreferencesStore.getState().setGamepadActive(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Emulate TV Remote D-Pad using PC Keyboard Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const navKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Enter",
        "Escape",
        "Backspace",
      ];

      if (navKeys.includes(e.key)) {
        // Mark as gamepad/TV active to show focus rings
        document.body.classList.add("gamepad-active");
        if (!usePreferencesStore.getState().isGamepadActive) {
          usePreferencesStore.getState().setGamepadActive(true);
        }

        // Don't intercept if we're in the player (it has its own listener)
        if (window.location.pathname.startsWith("/media/")) return;

        // Prevent the browser from scrolling the page or moving focus to browser chrome
        e.preventDefault();

        switch (e.key) {
          case "ArrowUp":
            navigateSpatial("up");
            break;
          case "ArrowDown":
            navigateSpatial("down");
            break;
          case "ArrowLeft":
            navigateSpatial("left");
            break;
          case "ArrowRight":
            navigateSpatial("right");
            break;
          case "Enter":
            (document.activeElement as HTMLElement)?.click();
            break;
          case "Escape":
          case "Backspace":
            {
              const topModal = useOverlayStack.getState().getTopModal();
              if (topModal) {
                useOverlayStack.getState().hideModal(topModal);
              } else {
                window.history.back();
              }
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [navigateSpatial]);

  return null;
}
