import classNames from "classnames";
import { useEffect, useState } from "react";

import { Icon, Icons } from "@/components/Icon";

/*
// OLD INTRO ANIMATION PRESERVED (REMOVED FOR SANITY, SEE GIT HISTORY IF NEEDED)
// The user requested to comment it out, so I will keep a skeleton for reference.
function OldIntroAnimation() { return null; }
*/

const BRAND_NAME = "BASEMENT";

export function IntroAnimation() {
  const [show, setShow] = useState(() => !sessionStorage.getItem("hasSeenIntro"));
  const [stage, setStage] = useState<"enter" | "reveal" | "exit" | "done">("enter");

  useEffect(() => {
    if (show) {
      const revealTimer = setTimeout(() => setStage("reveal"), 100);
      const exitTimer = setTimeout(() => setStage("exit"), 2100);
      const doneTimer = setTimeout(() => {
        setStage("done");
        setShow(false);
        sessionStorage.setItem("hasSeenIntro", "true");
      }, 2900);

      return () => {
        clearTimeout(revealTimer);
        clearTimeout(exitTimer);
        clearTimeout(doneTimer);
      };
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden">
      <style>
        {`
          @keyframes ps-logo-in {
            0% { transform: scale(0.9) translateY(30px); opacity: 0; filter: blur(15px); }
            100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0px); }
          }
          @keyframes ps-logo-out {
            0% { transform: scale(1); opacity: 1; filter: blur(0px); }
            100% { transform: scale(1.05); opacity: 0; filter: blur(30px); }
          }
          @keyframes ps-text-reveal {
             0% { opacity: 0; letter-spacing: 1.2em; filter: blur(12px); }
             100% { opacity: 1; letter-spacing: 0.4em; filter: blur(0px); }
          }
          .animate-ps-in { animation: ps-logo-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          .animate-ps-out { animation: ps-logo-out 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          .animate-ps-text { animation: ps-text-reveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        `}
      </style>

      {/* Solid Theme Background */}
      <div 
        className={classNames(
          "absolute inset-0 transition-opacity duration-800 ease-in-out bg-background-main",
          stage === "exit" || stage === "done" ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Main Branding */}
      <div className={classNames(
        "relative z-20 flex flex-col items-center",
        stage === "exit" ? "animate-ps-out" : "animate-ps-in"
      )}>
        {/* Dynamic Glow */}
        <div 
          className="absolute w-72 h-72 rounded-full opacity-30 blur-[100px] pointer-events-none transition-all duration-1000"
          style={{ background: "rgb(var(--colors-type-logo))" }}
        />

        <div className="relative">
             <Icon 
               icon={Icons.LOGO} 
               className="text-9xl md:text-[10rem] text-type-logo drop-shadow-[0_0_30px_rgba(var(--colors-type-logo),0.5)]"
             />
        </div>

        <div className="mt-10 overflow-hidden">
          <h1 className="animate-ps-text text-white text-4xl md:text-6xl font-black uppercase whitespace-nowrap tracking-[0.4em]">
            {BRAND_NAME}
          </h1>
        </div>

        <div className={classNames(
          "mt-6 h-[2px] transition-all duration-1500 ease-out",
          stage === "reveal" ? "w-48 bg-gradient-to-r from-transparent via-white/40 to-transparent" : "w-0 bg-transparent"
        )} />
        
        <p className="mt-8 text-white/20 text-xs font-bold uppercase tracking-[0.8em] animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
          The Pinnacle of Streaming
        </p>
      </div>
    </div>
  );
}
