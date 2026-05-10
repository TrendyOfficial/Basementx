import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

import { useIptvStore } from "@/stores/iptv";
import { Icon, Icons } from "@/components/Icon";
import { useSpatialNavigation } from "@/hooks/useSpatialNavigation";

export function IptvSettings() {
  const navigate = useNavigate();
  const { arabicMode, setArabicMode, parentalPin, setParentalPin, theme, setTheme } = useIptvStore();
  
  const [pinPrompt, setPinPrompt] = useState(false);
  const [tempPin, setTempPin] = useState("");
  const [pinError, setPinError] = useState("");

  const { navigate: navigateSpatial } = useSpatialNavigation();

  // Handle D-pad navigation globally for setting page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
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
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateSpatial]);

  const toggleArabicMode = () => {
    setArabicMode(!arabicMode);
  };

  const handlePinSubmit = () => {
    if (tempPin.length === 4) {
      setParentalPin(tempPin);
      setPinPrompt(false);
      setTempPin("");
      setPinError("");
    } else {
      setPinError("PIN must be 4 digits");
    }
  };

  const clearPin = () => {
    setParentalPin(null);
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      <Helmet>
        <title>IPTV Settings - Basement</title>
      </Helmet>

      {/* Background Graphic */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto px-12 py-16">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-16">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 focus:ring-4 focus:ring-white transition-all outline-none"
          >
            <Icon icon={Icons.ARROW_LEFT} className="text-2xl" />
          </button>
          <h1 className="text-4xl font-black tracking-tight">TV Settings</h1>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto space-y-6">
          
          {/* Arabic TV Mode */}
          <button
            type="button"
            onClick={toggleArabicMode}
            className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 focus:ring-4 focus:ring-white transition-all outline-none group text-left"
          >
            <div>
              <div className="text-xl font-bold mb-2 group-focus:text-purple-400 group-hover:text-purple-400 transition-colors">
                Arabic TV Mode
              </div>
              <div className="text-white/50">
                Overrides your playlist with Basement&apos;s dynamic Arabic
                categorizations (Movies, Series, News).
              </div>
            </div>
            <div className={classNames(
              "w-16 h-8 rounded-full flex items-center p-1 transition-colors",
              arabicMode ? "bg-purple-600" : "bg-white/20"
            )}>
              <div className={classNames(
                "w-6 h-6 rounded-full bg-white transition-transform",
                arabicMode ? "translate-x-8" : "translate-x-0"
              )} />
            </div>
          </button>

          {/* Parental Control */}
          <div className="flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xl font-bold mb-2">Parental Control Lock</div>
                  <div className="text-white/50">Set a 4-digit PIN to restrict specific content.</div>
                </div>
                {parentalPin ? (
                  <button
                    type="button"
                    onClick={clearPin}
                    className="px-6 py-3 rounded-lg bg-red-600/20 text-red-500 font-bold hover:bg-red-600/40 focus:ring-4 focus:ring-white transition-all outline-none"
                  >
                    Remove PIN
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPinPrompt(!pinPrompt)}
                    className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 focus:ring-4 focus:ring-white transition-all outline-none font-bold"
                  >
                    Set PIN
                  </button>
                )}
             </div>

             {pinPrompt && (
               <div className="flex gap-4 items-center bg-black/40 p-4 rounded-xl mt-4">
                 <input
                   type="password"
                   maxLength={4}
                   value={tempPin}
                   onChange={(e) => setTempPin(e.target.value.replace(/[^0-9]/g, ''))}
                   placeholder="0000"
                   className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center text-xl tracking-widest outline-none focus:ring-2 focus:ring-purple-500 w-32"
                 />
                 <button
                   type="button"
                   onClick={handlePinSubmit}
                   className="px-6 py-2 rounded-lg bg-purple-600 font-bold hover:bg-purple-500 focus:ring-4 focus:ring-white outline-none"
                 >
                   Save
                 </button>
                 {pinError && (
                   <span className="text-red-500 text-sm">{pinError}</span>
                 )}
               </div>
              )}
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 focus:ring-4 focus:ring-white transition-all outline-none text-left"
          >
            <div>
              <div className="text-xl font-bold mb-2">App Theme Engine</div>
              <div className="text-white/50">
                Currently using Basement default. More themes coming soon via
                Provider Sync.
              </div>
            </div>
            <Icon icon={Icons.BRUSH} className="text-3xl text-white/30" />
          </button>

        </div>
      </div>
    </div>
  );
}
