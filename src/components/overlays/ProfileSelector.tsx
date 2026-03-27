import { useEffect, useRef, useState } from "react";

import {
  getMediaCredits,
  getPersonProfileImage,
} from "@/backend/metadata/tmdb";
import { TMDBContentTypes } from "@/backend/metadata/types/tmdb";
import { Icon, Icons } from "@/components/Icon";
import { useAuthStore } from "@/stores/auth";
import { UserProfile, useProfileStore } from "@/stores/profile";

/* ─────────────── constants ─────────────── */

const generateId = () => Math.random().toString(36).substring(2, 9);

const PRESET_COLORS: Array<[string, string]> = [
  ["#6366f1", "#4338ca"],
  ["#e11d48", "#9f1239"],
  ["#0891b2", "#0e7490"],
  ["#16a34a", "#166534"],
  ["#d97706", "#92400e"],
  ["#9333ea", "#6b21a8"],
  ["#ec4899", "#9d174d"],
  ["#0284c7", "#075985"],
  ["#14b8a6", "#0f766e"],
  ["#f97316", "#c2410c"],
];

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

/** Popular shows/movies with TMDB IDs — Netflix-style avatar categories */
interface AvatarCategory {
  id: string;
  title: string;
  tmdbId: string;
  type: TMDBContentTypes;
}

const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: "stranger_things",
    title: "Stranger Things",
    tmdbId: "66732",
    type: TMDBContentTypes.TV,
  },
  {
    id: "breaking_bad",
    title: "Breaking Bad",
    tmdbId: "1396",
    type: TMDBContentTypes.TV,
  },
  {
    id: "game_of_thrones",
    title: "Game of Thrones",
    tmdbId: "1399",
    type: TMDBContentTypes.TV,
  },
  {
    id: "the_witcher",
    title: "The Witcher",
    tmdbId: "71912",
    type: TMDBContentTypes.TV,
  },
  {
    id: "wednesday",
    title: "Wednesday",
    tmdbId: "119051",
    type: TMDBContentTypes.TV,
  },
  {
    id: "squid_game",
    title: "Squid Game",
    tmdbId: "93405",
    type: TMDBContentTypes.TV,
  },
  {
    id: "the_last_of_us",
    title: "The Last of Us",
    tmdbId: "100088",
    type: TMDBContentTypes.TV,
  },
  {
    id: "cobra_kai",
    title: "Cobra Kai",
    tmdbId: "77169",
    type: TMDBContentTypes.TV,
  },
  {
    id: "the_crown",
    title: "The Crown",
    tmdbId: "63949",
    type: TMDBContentTypes.TV,
  },
  {
    id: "money_heist",
    title: "Money Heist",
    tmdbId: "71446",
    type: TMDBContentTypes.TV,
  },
  { id: "dark", title: "Dark", tmdbId: "70523", type: TMDBContentTypes.TV },
  {
    id: "peaky_blinders",
    title: "Peaky Blinders",
    tmdbId: "60574",
    type: TMDBContentTypes.TV,
  },
];

/* ─────────────── types ─────────────── */

type AvatarTab = "icon" | "character" | "custom";

interface EditingState {
  profileId: string | null;
  name: string;
  colorA: string;
  colorB: string;
  icon: Icons;
  avatarTab: AvatarTab;
  imageUrl: string | null; // set when character or custom is chosen
}

interface CastMember {
  id: number;
  name: string;
  profileUrl: string;
}

/* ─────────────── helpers ─────────────── */

function isUrl(s: string) {
  return s.startsWith("http") || s.startsWith("data:");
}

function blankEdit(override?: Partial<EditingState>): EditingState {
  const pair = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  return {
    profileId: null,
    name: "",
    colorA: pair[0],
    colorB: pair[1],
    icon: Icons.USER,
    avatarTab: "icon",
    imageUrl: null,
    ...override,
  };
}

function resolveAvatar(state: EditingState): string {
  if (state.imageUrl) return state.imageUrl;
  return state.icon;
}

/* ─────────────── AvatarDisplay ─────────────── */

interface AvatarDisplayProps {
  iconValue: string;
  colorA: string;
  colorB: string;
  size?: "sm" | "md" | "lg";
}

function AvatarDisplay({
  iconValue,
  colorA,
  colorB,
  size = "md",
}: AvatarDisplayProps) {
  const sizeClass =
    size === "sm"
      ? "w-16 h-16"
      : size === "lg"
        ? "w-28 h-28 md:w-32 md:h-32"
        : "w-20 h-20 md:w-24 md:h-24";
  const iconSize =
    size === "sm"
      ? "text-2xl"
      : size === "lg"
        ? "text-5xl md:text-6xl"
        : "text-3xl md:text-4xl";

  if (isUrl(iconValue)) {
    return (
      <div
        className={`${sizeClass} rounded-2xl overflow-hidden flex-shrink-0`}
        style={{ boxShadow: `0 6px 24px ${colorA}55` }}
      >
        <img
          src={iconValue}
          alt="avatar"
          className="w-full h-full object-cover"
        />
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
      <Icon
        icon={(iconValue as Icons) || Icons.USER}
        className={`text-white ${iconSize} drop-shadow-md`}
      />
    </div>
  );
}

/* ─────────────── CategoryRow (lazy-loaded) ─────────────── */

interface CategoryRowProps {
  category: AvatarCategory;
  selectedUrl: string | null;
  onSelect: (url: string) => void;
}

function CategoryRow({ category, selectedUrl, onSelect }: CategoryRowProps) {
  const [cast, setCast] = useState<CastMember[] | null>(null);
  const [error, setError] = useState(false);
  // Create stable keys for skeleton items
  const [skeletonKeys] = useState(() => 
    Array.from({ length: 6 }, () => `${category.id}-${Math.random().toString(36).substring(2, 9)}`)
  );

  useEffect(() => {
    let cancelled = false;
    getMediaCredits(category.tmdbId, category.type)
      .then((credits) => {
        if (cancelled) return;
        const members: CastMember[] = credits.cast
          .filter((c) => c.profile_path)
          .slice(0, 10)
          .map((c) => ({
            id: c.id,
            name: c.name,
            profileUrl: getPersonProfileImage(c.profile_path ?? null) ?? "",
          }))
          .filter((m) => m.profileUrl);
        setCast(members);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [category.tmdbId, category.type]);

  if (error || (cast !== null && cast.length === 0)) return null;

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-white mb-2">{category.title}</h3>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {cast === null
          ? skeletonKeys.map((key) => (
              <div
                key={key}
                className="w-16 h-16 rounded-xl flex-shrink-0 bg-white/5 animate-pulse"
              />
            ))
          : cast.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member.profileUrl)}
                title={member.name}
                className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none hover:scale-105"
                style={{
                  borderColor:
                    selectedUrl === member.profileUrl ? "white" : "transparent",
                  boxShadow:
                    selectedUrl === member.profileUrl
                      ? "0 0 0 2px rgba(255,255,255,0.3)"
                      : "none",
                }}
              >
                <img
                  src={member.profileUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
      </div>
    </div>
  );
}

/* ─────────────── EditPanel ─────────────── */

interface EditPanelProps {
  state: EditingState;
  onChange: (patch: Partial<EditingState>) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

function EditPanel({
  state,
  onChange,
  onSave,
  onCancel,
  isNew,
}: EditPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ imageUrl: ev.target?.result as string, avatarTab: "custom" });
    };
    reader.readAsDataURL(file);
  };

  const currentAvatar = resolveAvatar(state);

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg bg-[#121218] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <AvatarDisplay
            iconValue={currentAvatar}
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

        <div className="px-6 pb-2 max-h-[68vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 space-y-5">
          {/* ── Colour one ── */}
          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Profile colour one
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map(([colorA, colorB]) => (
                <button
                  key={colorA}
                  type="button"
                  onClick={() => onChange({ colorA, colorB })}
                  className="w-8 h-8 rounded-lg border-2 transition-all duration-200 focus:outline-none hover:scale-110"
                  style={{
                    background: colorA,
                    borderColor:
                      state.colorA === colorA ? "white" : "transparent",
                    transform:
                      state.colorA === colorA ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
              <label
                className="relative w-8 h-8 rounded-lg border-2 border-white/20 overflow-hidden cursor-pointer hover:border-white/60 transition-colors flex items-center justify-center"
                title="Custom colour"
              >
                <span className="text-white/50 text-xl leading-none select-none">
                  +
                </span>
                <input
                  type="color"
                  value={state.colorA}
                  onChange={(e) => onChange({ colorA: e.target.value })}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </section>

          {/* ── Colour two ── */}
          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Profile colour two
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map(([, colorB]) => (
                <button
                  key={colorB}
                  type="button"
                  onClick={() => onChange({ colorB })}
                  className="w-8 h-8 rounded-lg border-2 transition-all duration-200 focus:outline-none hover:scale-110"
                  style={{
                    background: colorB,
                    borderColor:
                      state.colorB === colorB ? "white" : "transparent",
                    transform:
                      state.colorB === colorB ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
              <label
                className="relative w-8 h-8 rounded-lg border-2 border-white/20 overflow-hidden cursor-pointer hover:border-white/60 transition-colors flex items-center justify-center"
                title="Custom colour"
              >
                <span className="text-white/50 text-xl leading-none select-none">
                  +
                </span>
                <input
                  type="color"
                  value={state.colorB}
                  onChange={(e) => onChange({ colorB: e.target.value })}
                  className="absolute opacity-0 w-0 h-0"
                />
              </label>
            </div>
          </section>

          {/* ── Avatar ── */}
          <section>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              Avatar
            </p>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
              {(["icon", "character", "custom"] as AvatarTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onChange({ avatarTab: tab })}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                  style={{
                    background:
                      state.avatarTab === tab
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
                    color:
                      state.avatarTab === tab
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {tab === "character"
                    ? "Characters"
                    : tab === "custom"
                      ? "Custom"
                      : "Icons"}
                </button>
              ))}
            </div>

            {/* Icons grid */}
            {state.avatarTab === "icon" && (
              <div className="grid grid-cols-8 gap-1.5">
                {SELECTABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() =>
                      onChange({ icon: ic, imageUrl: null, avatarTab: "icon" })
                    }
                    className="aspect-square rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none hover:bg-white/10"
                    style={{
                      background:
                        state.avatarTab === "icon" && state.icon === ic
                          ? `linear-gradient(135deg, ${state.colorA}, ${state.colorB})`
                          : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icon icon={ic} className="text-white text-base" />
                  </button>
                ))}
              </div>
            )}

            {/* Netflix-style category rows */}
            {state.avatarTab === "character" && (
              <div>
                {AVATAR_CATEGORIES.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    selectedUrl={state.imageUrl}
                    onSelect={(url) =>
                      onChange({
                        imageUrl: url,
                        avatarTab: "character",
                      })
                    }
                  />
                ))}
              </div>
            )}

            {/* Custom upload */}
            {state.avatarTab === "custom" && (
              <div className="flex flex-col items-center gap-3">
                {state.imageUrl ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden">
                    <img
                      src={state.imageUrl}
                      alt="Custom"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Icon
                      icon={Icons.USER}
                      className="text-white/20 text-4xl"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium transition-colors"
                >
                  {state.imageUrl ? "Change Image" : "Upload Image"}
                </button>
                <p className="text-white/30 text-xs">JPG, PNG, GIF</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 flex gap-3 border-t border-white/5">
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

/* ─────────────── Main ProfileSelector ─────────────── */

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
    if (editState) return;
    setActiveProfile(id);
  };

  const handleDismiss = () => {
    setForceShowProfileSelector(false);
    setHasSelectedProfileThisSession(true);
  };

  const handleEditClick = (e: React.MouseEvent, profile: UserProfile) => {
    e.stopPropagation();
    if (profile.id === "main") return;
    const iconVal = profile.icon;
    const hasUrl = isUrl(iconVal);
    setEditState({
      profileId: profile.id,
      name: profile.name,
      colorA: profile.colorA,
      colorB: profile.colorB,
      icon: hasUrl ? Icons.USER : (iconVal as Icons),
      avatarTab: hasUrl ? "character" : "icon",
      imageUrl: hasUrl ? iconVal : null,
    });
  };

  const handleSave = () => {
    if (!editState) return;
    const iconValue = resolveAvatar(editState);
    const data = {
      name: editState.name.trim(),
      icon: iconValue,
      colorA: editState.colorA,
      colorB: editState.colorB,
    };

    if (editState.profileId === null) {
      addProfile(account.userId, { id: generateId(), ...data });
    } else {
      updateProfile(account.userId, editState.profileId, data);
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
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-1 tracking-wide">
            Who&apos;s watching?
          </h1>
          <p className="text-white/40 text-sm mb-10">
            Select your profile to continue
          </p>

          {/* Profiles */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-7 max-w-3xl">
            {allProfiles.map((p, i) => (
              <div
                key={p.id}
                className="flex flex-col items-center group relative cursor-pointer w-24 md:w-28 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => handleSelect(p.id)}
              >
                {p.id === activeProfileId && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-black z-10" />
                )}
                {p.id !== "main" && (
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(e, p)}
                    className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-white/20 hover:border-white/60"
                    title="Edit profile"
                  >
                    <Icon
                      icon={Icons.EDIT}
                      className="text-white text-[10px]"
                    />
                  </button>
                )}
                <AvatarDisplay
                  iconValue={p.icon}
                  colorA={p.colorA}
                  colorB={p.colorB}
                  size="md"
                />
                <p className="mt-3 text-white/50 group-hover:text-white font-medium text-sm truncate w-full text-center transition-colors duration-300">
                  {p.name}
                </p>
              </div>
            ))}

            {/* Add Profile */}
            {allProfiles.length < 5 && (
              <button
                type="button"
                onClick={() => setEditState(blankEdit())}
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

      {editState && (
        <EditPanel
          state={editState}
          onChange={(patch) =>
            setEditState((s) => (s ? { ...s, ...patch } : s))
          }
          onSave={handleSave}
          onCancel={() => setEditState(null)}
          isNew={editState.profileId === null}
        />
      )}
    </>
  );
}
