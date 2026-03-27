import { useRef, useState } from "react";

import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { UserProfile, useProfileStore } from "@/stores/profile";

/* ─────────────────────────────── constants ─────────────────────────────── */

const generateId = () => Math.random().toString(36).substring(2, 9);

/** Preset gradient swatches — [colorA, colorB] */
const PRESET_COLORS: Array<[string, string]> = [
  ["#6366f1", "#4338ca"], // indigo
  ["#e11d48", "#9f1239"], // rose
  ["#0891b2", "#0e7490"], // cyan
  ["#16a34a", "#166534"], // green
  ["#d97706", "#92400e"], // amber
  ["#9333ea", "#6b21a8"], // purple
  ["#ec4899", "#9d174d"], // pink
  ["#0284c7", "#075985"], // sky
  ["#14b8a6", "#0f766e"], // teal
  ["#f97316", "#c2410c"], // orange
];

/** Selectable icons from the Icon component */
const SELECTABLE_ICONS: Icons[] = [
  Icons.USER,
  Icons.DRAGON,
  Icons.FILM,
  Icons.CLAPPER_BOARD,
  Icons.BOOKMARK,
  Icons.CLOCK,
  Icons.SEARCH,
  Icons.PLAY,
  Icons.WATCH_PARTY,
  Icons.WAND,
  Icons.BRUSH,
  Icons.RISING_STAR,
  Icons.COINS,
  Icons.BELL,
  Icons.GEAR,
  Icons.LOCK,
  Icons.MAIL,
  Icons.TRANSLATE,
  Icons.TACHOMETER,
  Icons.EDIT,
  Icons.THUMBS_UP,
];

// Netflix-style character avatars using DiceBear API (free, no API key needed)
// These generate illustrated portrait-style avatars
const CHARACTER_AVATARS = [
  // Using picsum for stylised character previews with consistent seeds
  {
    id: "av_warrior",
    label: "Warrior",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Warrior&backgroundColor=b6e3f4",
  },
  {
    id: "av_mage",
    label: "Mage",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Mage&backgroundColor=c0aede",
  },
  {
    id: "av_rogue",
    label: "Rogue",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Rogue&backgroundColor=ffdfbf",
  },
  {
    id: "av_paladin",
    label: "Paladin",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Paladin&backgroundColor=d1d4f9",
  },
  {
    id: "av_ranger",
    label: "Ranger",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Ranger&backgroundColor=c0aede",
  },
  {
    id: "av_bard",
    label: "Bard",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Bard&backgroundColor=ffd5dc",
  },
  {
    id: "av_druid",
    label: "Druid",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Druid&backgroundColor=b6e3f4",
  },
  {
    id: "av_monk",
    label: "Monk",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Monk&backgroundColor=ffdfbf",
  },
  {
    id: "av_samurai",
    label: "Samurai",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Samurai&backgroundColor=c0aede",
  },
  {
    id: "av_witch",
    label: "Witch",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Witch&backgroundColor=ffd5dc",
  },
  {
    id: "av_hero",
    label: "Hero",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Hero&backgroundColor=d1d4f9",
  },
  {
    id: "av_villain",
    label: "Villain",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Villain&backgroundColor=b6e3f4",
  },
  {
    id: "av_knight",
    label: "Knight",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Knight&backgroundColor=ffdfbf",
  },
  {
    id: "av_princess",
    label: "Princess",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Princess&backgroundColor=ffd5dc",
  },
  {
    id: "av_pirate",
    label: "Pirate",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Pirate&backgroundColor=c0aede",
  },
  {
    id: "av_ninja",
    label: "Ninja",
    url: "https://api.dicebear.com/8.x/adventurer/svg?seed=Ninja&backgroundColor=d1d4f9",
  },
];

/* ─────────────────────────────── types ─────────────────────────────── */

type AvatarType = "icon" | "character" | "custom";

interface EditingState {
  profileId: string | null; // null = new profile
  name: string;
  colorA: string;
  colorB: string;
  icon: Icons;
  avatarType: AvatarType;
  characterAvatarUrl: string | null;
  customImageUrl: string | null;
}

/* ─────────────────────────────── helpers ─────────────────────────────── */

/** Returns whether a stored icon string looks like a URL */
function isUrl(s: string) {
  return s.startsWith("http") || s.startsWith("data:");
}

/* ─────────────────────────────── sub-components ─────────────────────────────── */

interface AvatarDisplayProps {
  iconValue: string;
  colorA: string;
  colorB: string;
  size?: "sm" | "md" | "lg";
}

function AvatarDisplay({ iconValue, colorA, colorB, size = "md" }: AvatarDisplayProps) {
  const sizeClass = size === "sm" ? "w-16 h-16" : size === "lg" ? "w-28 h-28 md:w-32 md:h-32" : "w-20 h-20 md:w-24 md:h-24";
  const iconSize = size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl";

  if (isUrl(iconValue)) {
    return (
      <div
        className={`${sizeClass} rounded-2xl overflow-hidden flex-shrink-0`}
        style={{ boxShadow: `0 6px 24px ${colorA}55` }}
      >
        <img src={iconValue} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl flex items-center justify-center flex-shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
        boxShadow: `0 6px 24px ${colorA}55`,
      }}
    >
      <Icon icon={(iconValue as Icons) || Icons.USER} className={`text-white ${iconSize} drop-shadow-md`} />
    </div>
  );
}

/* ─────────────────────────────── Edit Panel ─────────────────────────────── */

interface EditPanelProps {
  state: EditingState;
  onChange: (patch: Partial<EditingState>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

function EditPanel({ state, onChange, onSave, onCancel, isNew }: EditPanelProps) {
  const [avatarTab, setAvatarTab] = useState<AvatarType>(state.avatarType);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onChange({ customImageUrl: url, avatarType: "custom", characterAvatarUrl: null });
    };
    reader.readAsDataURL(file);
  };

  const selectCharacter = (url: string) => {
    onChange({ characterAvatarUrl: url, avatarType: "character", customImageUrl: null });
  };

  const selectIcon = (icon: Icons) => {
    onChange({ icon, avatarType: "icon", characterAvatarUrl: null, customImageUrl: null });
  };

  const currentAvatarValue =
    state.avatarType === "character"
      ? (state.characterAvatarUrl ?? state.icon)
      : state.avatarType === "custom"
        ? (state.customImageUrl ?? state.icon)
        : state.icon;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg bg-[#121218] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <AvatarDisplay
            iconValue={currentAvatarValue}
            colorA={state.colorA}
            colorB={state.colorB}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Profile name"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            <Icon icon={Icons.X} className="text-lg" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {/* ── Gradient colors ── */}
          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Profile colour one
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map(([a]) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    const pair = PRESET_COLORS.find(([pa]) => pa === a)!;
                    onChange({ colorA: pair[0], colorB: pair[1] });
                  }}
                  className="w-8 h-8 rounded-lg border-2 transition-all duration-200 focus:outline-none hover:scale-110"
                  style={{
                    background: a,
                    borderColor: state.colorA === a ? "white" : "transparent",
                    transform: state.colorA === a ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
              {/* Custom colour picker */}
              <label className="relative w-8 h-8 rounded-lg border-2 border-white/20 overflow-hidden cursor-pointer hover:border-white/60 transition-colors flex items-center justify-center"
                title="Custom colour">
                <span className="text-white/50 text-xl leading-none select-none">+</span>
                <input
                  type="color"
                  value={state.colorA}
                  onChange={(e) => onChange({ colorA: e.target.value })}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Profile colour two
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map(([a, b]) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => onChange({ colorB: b })}
                  className="w-8 h-8 rounded-lg border-2 transition-all duration-200 focus:outline-none hover:scale-110"
                  style={{
                    background: b,
                    borderColor: state.colorB === b ? "white" : "transparent",
                    transform: state.colorB === b ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
              <label className="relative w-8 h-8 rounded-lg border-2 border-white/20 overflow-hidden cursor-pointer hover:border-white/60 transition-colors flex items-center justify-center"
                title="Custom colour">
                <span className="text-white/50 text-xl leading-none select-none">+</span>
                <input
                  type="color"
                  value={state.colorB}
                  onChange={(e) => onChange({ colorB: e.target.value })}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </section>

          {/* ── Avatar section ── */}
          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Avatar
            </p>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-3">
              {(["icon", "character", "custom"] as AvatarType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setAvatarTab(tab);
                    onChange({ avatarType: tab });
                  }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                  style={{
                    background: avatarTab === tab ? "rgba(255,255,255,0.12)" : "transparent",
                    color: avatarTab === tab ? "white" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {tab === "character" ? "Avatars" : tab === "custom" ? "Custom" : "Icons"}
                </button>
              ))}
            </div>

            {/* Icon grid */}
            {avatarTab === "icon" && (
              <div className="grid grid-cols-8 gap-1.5">
                {SELECTABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => selectIcon(ic)}
                    className="aspect-square rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none hover:bg-white/10"
                    style={{
                      background:
                        state.avatarType === "icon" && state.icon === ic
                          ? `linear-gradient(135deg, ${state.colorA}, ${state.colorB})`
                          : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icon icon={ic} className="text-white text-base" />
                  </button>
                ))}
              </div>
            )}

            {/* Character avatar grid */}
            {avatarTab === "character" && (
              <div className="grid grid-cols-4 gap-2">
                {CHARACTER_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => selectCharacter(av.url)}
                    className="flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div
                      className="w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150"
                      style={{
                        borderColor:
                          state.characterAvatarUrl === av.url && state.avatarType === "character"
                            ? "white"
                            : "transparent",
                        boxShadow:
                          state.characterAvatarUrl === av.url && state.avatarType === "character"
                            ? "0 0 0 3px rgba(255,255,255,0.2)"
                            : "none",
                      }}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        className="w-full h-full object-cover bg-white/10"
                      />
                    </div>
                    <span className="text-white/40 text-[10px] truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom upload */}
            {avatarTab === "custom" && (
              <div className="flex flex-col items-center gap-3">
                {state.customImageUrl ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden">
                    <img src={state.customImageUrl} alt="Custom" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Icon icon={Icons.USER} className="text-white/20 text-4xl" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium transition-colors"
                >
                  {state.customImageUrl ? "Change Image" : "Upload Image"}
                </button>
                <p className="text-white/30 text-xs">JPG, PNG, GIF — max 2MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomUpload}
                />
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!state.name.trim()}
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: state.name.trim()
                ? `linear-gradient(135deg, ${state.colorA}, ${state.colorB})`
                : "rgba(255,255,255,0.1)",
            }}
          >
            {isNew ? "Create Profile" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Main Component ─────────────────────────────── */

function blankEditState(override?: Partial<EditingState>): EditingState {
  const randomPair = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  return {
    profileId: null,
    name: "",
    colorA: randomPair[0],
    colorB: randomPair[1],
    icon: Icons.USER,
    avatarType: "icon",
    characterAvatarUrl: null,
    customImageUrl: null,
    ...override,
  };
}

function resolveIconValue(state: EditingState): string {
  if (state.avatarType === "character" && state.characterAvatarUrl) return state.characterAvatarUrl;
  if (state.avatarType === "custom" && state.customImageUrl) return state.customImageUrl;
  return state.icon;
}

export function ProfileSelector() {
  const account = useAuthStore((s) => s.account);
  const {
    profiles,
    activeProfileId,
    hasSelectedProfileThisSession,
    forceShowProfileSelector,
    setActiveProfile,
    addProfile,
    updateProfile,
    setForceShowProfileSelector,
    setHasSelectedProfileThisSession,
  } = useProfileStore();

  const [editState, setEditState] = useState<EditingState | null>(null);

  if (!account) return null;

  const userProfiles = profiles[account.userId] || [];

  const shouldShow =
    forceShowProfileSelector ||
    (!hasSelectedProfileThisSession && userProfiles.length >= 1);

  if (!shouldShow) return null;

  const mainProfile: UserProfile = {
    id: "main",
    name: account.nickname || "Main Account",
    icon: account.profile?.icon || Icons.USER,
    colorA: account.profile?.colorA || "#e11d48",
    colorB: account.profile?.colorB || "#be123c",
  };

  const allProfiles: UserProfile[] = [mainProfile, ...userProfiles];

  const handleSelect = (id: string) => {
    if (editState) return; // don't select while editing
    setActiveProfile(id);
  };

  const handleDismiss = () => {
    setForceShowProfileSelector(false);
    setHasSelectedProfileThisSession(true);
  };

  const handleEditClick = (e: React.MouseEvent, profile: UserProfile) => {
    e.stopPropagation();
    if (profile.id === "main") return; // can't edit main from here
    const iconVal = profile.icon;
    const isCharacter = isUrl(iconVal) && iconVal.includes("dicebear");
    const isCustom = isUrl(iconVal) && !iconVal.includes("dicebear");
    setEditState({
      profileId: profile.id,
      name: profile.name,
      colorA: profile.colorA,
      colorB: profile.colorB,
      icon: isUrl(iconVal) ? Icons.USER : (iconVal as Icons),
      avatarType: isCharacter ? "character" : isCustom ? "custom" : "icon",
      characterAvatarUrl: isCharacter ? iconVal : null,
      customImageUrl: isCustom ? iconVal : null,
    });
  };

  const handleNewProfile = () => {
    setEditState(blankEditState());
  };

  const handleSave = () => {
    if (!editState) return;
    const iconValue = resolveIconValue(editState);

    if (editState.profileId === null) {
      // New profile
      const newProfile: UserProfile = {
        id: generateId(),
        name: editState.name.trim(),
        icon: iconValue,
        colorA: editState.colorA,
        colorB: editState.colorB,
      };
      addProfile(account.userId, newProfile);
    } else {
      // Update existing
      updateProfile(account.userId, editState.profileId, {
        name: editState.name.trim(),
        icon: iconValue,
        colorA: editState.colorA,
        colorB: editState.colorB,
      });
    }
    setEditState(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

        {/* Top glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.6), transparent)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center w-full px-4">
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-1 tracking-wide">
            Who&apos;s watching?
          </h1>
          <p className="text-white/40 text-sm mb-10">
            Select your profile to continue
          </p>

          {/* Profiles grid */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-7 max-w-3xl">
            {allProfiles.map((p, i) => {
              const iconVal = p.icon;
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center group relative cursor-pointer w-24 md:w-28 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => handleSelect(p.id)}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-black z-10" />
                  )}

                  {/* Edit button (not for main) */}
                  {p.id !== "main" && (
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, p)}
                      className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-white/20 hover:border-white/60"
                      title="Edit profile"
                    >
                      <Icon icon={Icons.EDIT} className="text-white text-[10px]" />
                    </button>
                  )}

                  <AvatarDisplay
                    iconValue={iconVal}
                    colorA={p.colorA}
                    colorB={p.colorB}
                    size="md"
                  />
                  <p className="mt-3 text-white/50 group-hover:text-white font-medium text-sm truncate w-full text-center transition-colors duration-300">
                    {p.name}
                  </p>
                </div>
              );
            })}

            {/* Add Profile */}
            {allProfiles.length < 5 && (
              <button
                type="button"
                onClick={handleNewProfile}
                className="flex flex-col items-center group cursor-pointer w-24 md:w-28 transition-all duration-300 hover:scale-105 focus:outline-none"
              >
                <div className="w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border-2 border-dashed border-white/20 group-hover:border-white/50 group-hover:bg-white/5">
                  <Icon
                    icon={Icons.PLUS}
                    className="text-white/30 group-hover:text-white text-4xl md:text-5xl transition-colors duration-300"
                  />
                </div>
                <p className="mt-3 text-white/30 group-hover:text-white font-medium text-sm text-center transition-colors duration-300">
                  Add Profile
                </p>
              </button>
            )}
          </div>

          {/* Dismiss (only when manually opened) */}
          {forceShowProfileSelector && (
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-10 text-white/30 hover:text-white text-sm transition-colors duration-200 border-b border-white/20 hover:border-white/50 pb-px"
            >
              Continue as {account.nickname || "current profile"}
            </button>
          )}
        </div>
      </div>

      {/* Edit panel rendered on top */}
      {editState && (
        <div className="z-[10001]">
          <EditPanel
            state={editState}
            onChange={(patch) => setEditState((s) => (s ? { ...s, ...patch } : s))}
            onSave={handleSave}
            onCancel={() => setEditState(null)}
            isNew={editState.profileId === null}
          />
        </div>
      )}
    </>
  );
}
