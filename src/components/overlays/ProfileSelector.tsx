import { useState } from "react";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { UserProfile, useProfileStore } from "@/stores/profile";

const generateId = () => Math.random().toString(36).substring(2, 9);

export function ProfileSelector() {
  const account = useAuthStore((s) => s.account);
  const {
    profiles,
    hasSelectedProfileThisSession,
    setActiveProfile,
    addProfile,
  } = useProfileStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  if (!account) return null;

  const userProfiles = profiles[account.userId] || [];

  // If no extra profiles exist or already selected, don't show
  if (userProfiles.length === 0 || hasSelectedProfileThisSession) {
    return null;
  }

  // Combine the main account as the first profile
  const mainProfile = {
    id: "main",
    name: account.nickname || "Main Account",
    icon: account.profile?.icon || Icons.USER,
    colorA: account.profile?.colorA || "#e11d48", // Rose
    colorB: account.profile?.colorB || "#be123c",
  };

  const allProfiles = [mainProfile, ...userProfiles];

  const handleSelect = (id: string) => {
    setActiveProfile(id);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProfile: UserProfile = {
      id: generateId(),
      name: newName.trim(),
      icon: Icons.USER,
      colorA: "#3b82f6", // default blue
      colorB: "#2563eb",
    };
    addProfile(account.userId, newProfile);
    setIsAdding(false);
    setNewName("");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background-main flex flex-col items-center justify-center animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 transform transition-transform duration-500 scale-100">
        Who&apos;s watching?
      </h1>

      <div className="flex flex-wrap justify-center gap-6 md:gap-10 max-w-4xl px-4">
        {allProfiles.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className="flex flex-col items-center group cursor-pointer w-28 md:w-36 transition-transform duration-300 hover:scale-105"
          >
            <div
              className="w-full aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-transparent group-hover:border-white ring-0 group-hover:ring-4 ring-black/20"
              style={{
                background: `linear-gradient(135deg, ${p.colorA}, ${p.colorB})`,
              }}
            >
              <Icon
                icon={(p.icon as Icons) || Icons.USER}
                className="text-white text-5xl md:text-7xl drop-shadow-md"
              />
            </div>
            <p className="mt-4 text-type-secondary group-hover:text-white font-medium text-lg md:text-xl truncate w-full text-center transition-colors duration-300">
              {p.name}
            </p>
          </div>
        ))}

        {userProfiles.length < 4 && !isAdding && (
          <div
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center group cursor-pointer w-28 md:w-36 transition-transform duration-300 hover:scale-105"
          >
            <div className="w-full aspect-square rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-transparent bg-mediaCard-hoverBackground group-hover:bg-mediaCard-hoverShadow">
              <Icon
                icon={Icons.PLUS}
                className="text-type-secondary group-hover:text-white text-5xl md:text-7xl transition-colors duration-300"
              />
            </div>
            <p className="mt-4 text-type-secondary group-hover:text-white font-medium text-lg md:text-xl truncate w-full text-center transition-colors duration-300">
              Add Profile
            </p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="mt-12 bg-black/40 p-6 rounded-2xl w-full max-w-md animate-fade-in border border-white/10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4">Add Profile</h2>
          <form onSubmit={handleSaveNew} className="flex flex-col gap-4">
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-type-logo transition-colors"
            />
            <div className="flex gap-3 mt-2">
              <Button
                className="flex-1"
                theme="secondary"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                theme="purple"
                disabled={!newName.trim()}
                onClick={handleSaveNew}
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
