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
      }, 2000);

      // Stage 2: Curtains open for 1s, then unmount
      const unmountTimer = setTimeout(() => {
        setStage("done");
        setShow(false);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 2900);

      return () => {
        clearTimeout(curtainTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden">
      <style>
        {`
          @keyframes basement-zoom {
            0%   { transform: scale(2.5); opacity: 0; filter: blur(12px); }
            30%  { opacity: 1; filter: blur(0px); }
            100% { transform: scale(1); opacity: 1; filter: blur(0px); }
          }
          @keyframes basement-glow-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50%       { opacity: 0.75; transform: scale(1.08); }
          }
          @keyframes basement-letter-rise {
            0%   { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes basement-tagline-fade {
            0%   { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-basement-zoom {
            animation: basement-zoom 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-basement-glow {
            animation: basement-glow-pulse 1.6s ease-in-out infinite;
          }
          .animate-letter-rise {
            animation: basement-letter-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          .animate-tagline-fade {
            animation: basement-tagline-fade 0.6s ease-in forwards;
            animation-delay: 1.2s;
            opacity: 0;
          }
        `}
      </style>

      {/* Left Curtain */}
      <div
        className={classNames(
          "absolute top-0 left-0 bottom-0 w-1/2 transition-transform duration-700 ease-in-out z-10",
          stage === "curtains" || stage === "done"
            ? "-translate-x-full"
            : "translate-x-0",
        )}
        style={{
          background:
            "linear-gradient(to right, #0a0a0f 80%, #12121a)",
        }}
      />
      {/* Right Curtain */}
      <div
        className={classNames(
          "absolute top-0 right-0 bottom-0 w-1/2 transition-transform duration-700 ease-in-out z-10",
          stage === "curtains" || stage === "done"
            ? "translate-x-full"
            : "translate-x-0",
        )}
        style={{
          background:
            "linear-gradient(to left, #0a0a0f 80%, #12121a)",
        }}
      />

      {/* Logo + text */}
      <div
        className={classNames(
          "relative z-20 flex flex-col items-center transition-opacity duration-400",
          stage === "logo" ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Glow backdrop */}
        <div
          className="absolute rounded-full animate-basement-glow pointer-events-none"
          style={{
            width: "260px",
            height: "260px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />

        {/* Logo icon */}
        <div className="animate-basement-zoom relative">
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))",
              boxShadow:
                "0 0 60px rgba(139,92,246,0.4), inset 0 0 30px rgba(255,255,255,0.04)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            <Icon
              icon={Icons.LOGO}
              className="text-7xl md:text-8xl drop-shadow-2xl text-type-logo"
            />
          </div>
        </div>

        {/* Brand name — letters rise in one by one */}
        <div className="flex mt-6 gap-[3px]">
          {"BASEMENT".split("").map((letter, i) => (
            <span
              key={i}
              className="animate-letter-rise text-3xl md:text-5xl font-bold tracking-[0.18em] text-white"
              style={{ animationDelay: `${0.3 + i * 0.06}s` }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className="animate-tagline-fade text-type-secondary text-xs md:text-sm tracking-[0.35em] uppercase mt-2"
        >
          Stream Together
        </p>
      </div>
    </div>
  );
}
