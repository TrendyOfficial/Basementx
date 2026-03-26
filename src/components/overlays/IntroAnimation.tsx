import classNames from "classnames";
import { useEffect, useState } from "react";

import { Icon, Icons } from "@/components/Icon";

export function IntroAnimation() {
  const [show, setShow] = useState(
    () => !sessionStorage.getItem("hasSeenIntro"),
  );
  const [stage, setStage] = useState<"logo" | "curtains" | "done">("logo");

  useEffect(() => {
    if (show) {
      // Stage 1: Logo animation runs for 1.8s
      const curtainTimer = setTimeout(() => {
        setStage("curtains");
      }, 1800);

      // Stage 2: Curtains open for 1s, then unmount
      const unmountTimer = setTimeout(() => {
        setStage("done");
        setShow(false);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 2600);

      return () => {
        clearTimeout(curtainTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
      <style>
        {`
          .animate-netflix-zoom {
            animation: netflix-zoom 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          @keyframes netflix-zoom {
            0% { transform: scale(3); opacity: 0; }
            40% { opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      {/* Left Curtain */}
      <div
        className={classNames(
          "absolute top-0 left-0 bottom-0 w-1/2 bg-background-main transition-transform duration-700 ease-in-out z-10",
          stage === "curtains" || stage === "done"
            ? "-translate-x-full"
            : "translate-x-0",
        )}
      />
      {/* Right Curtain */}
      <div
        className={classNames(
          "absolute top-0 right-0 bottom-0 w-1/2 bg-background-main transition-transform duration-700 ease-in-out z-10",
          stage === "curtains" || stage === "done"
            ? "translate-x-full"
            : "translate-x-0",
        )}
      />

      {/* Logo in the center */}
      <div
        className={classNames(
          "relative z-20 flex flex-col items-center text-type-logo transition-opacity duration-300",
          stage === "logo" ? "animate-netflix-zoom opacity-100" : "opacity-0",
        )}
      >
        <div className="w-[120px] h-[120px] mb-4">
          <Icon
            icon={Icons.LOGO}
            className="text-8xl md:text-9xl drop-shadow-2xl w-full h-full"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-[0.3em] uppercase">
          Basement
        </h1>
      </div>
    </div>
  );
}
