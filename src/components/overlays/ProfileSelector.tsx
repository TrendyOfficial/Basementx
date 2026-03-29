import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

import {
  getMediaCredits,
  getPersonProfileImage,
} from "@/backend/metadata/tmdb";
import { TMDBContentTypes } from "@/backend/metadata/types/tmdb";
import { Icon, Icons } from "@/components/Icon";
import { UserIcon, UserIcons } from "@/components/UserIcon";
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
  ["#71717a", "#3f3f46"],
];

const SELECTABLE_ICONS: UserIcons[] = [
  UserIcons.CAT,
  UserIcons.WEED,
  UserIcons.USER_GROUP,
  UserIcons.COUCH,
  UserIcons.MOBILE,
  UserIcons.TICKET,
  UserIcons.SATURN,
  UserIcons.HEADPHONES,
  UserIcons.TV,
  UserIcons.GHOST,
  UserIcons.COFFEE,
  UserIcons.FIRE,
  UserIcons.MEGAPHONE,
  UserIcons.DRAGON,
  UserIcons.RISING_STAR,
  UserIcons.CLOUD_ARROW_UP,
  UserIcons.WAND,
  UserIcons.CLAPPER_BOARD,
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
  icon: UserIcons;
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
    icon: UserIcons.USER_GROUP,
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
  isActive?: boolean;
}

function AvatarDisplay({
  iconValue,
  colorA,
  colorB,
  size = "md",
  isActive,
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

  const containerClass = classNames(
    sizeClass,
    "rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-300",
    {
      "ring-4 ring-white ring-offset-4 ring-offset-background-main": isActive,
    },
  );

  if (isUrl(iconValue)) {
    return (
      <div className={containerClass}>
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
      className={classNames(
        containerClass,
        "flex items-center justify-center bg-gradient-to-br",
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${colorA}, ${colorB})`,
      }}
    >
      <UserIcon
        icon={(iconValue as UserIcons) || UserIcons.USER_GROUP}
        className={classNames("text-white drop-shadow-md", iconSize)}
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
    Array.from(
      { length: 6 },
      () => `${category.id}-${Math.random().toString(36).substring(2, 9)}`,
    ),
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
    <div className="mb-5 px-6">
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
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-2xl bg-background-main border border-utils-divider rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-6 p-8 border-b border-utils-divider">
          <AvatarDisplay
            iconValue={currentAvatar}
            colorA={state.colorA}
            colorB={state.colorB}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-2">
              {isNew ? "Create Profile" : "Edit Profile"}
            </h2>
            <input
              type="text"
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Profile name"
              maxLength={20}
              className="w-full bg-white/5 border border-utils-divider rounded-xl px-4 py-2.5 text-white text-lg placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-colors flex-shrink-0"
          >
            <Icon icon={Icons.X} className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 p-2 space-y-8">
          {/* ── Appearance ── */}
          {state.avatarTab === "icon" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <section>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                  Primary Color
                </p>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(([colorA]) => (
                    <button
                      key={colorA}
                      type="button"
                      onClick={() => onChange({ colorA })}
                      className={classNames(
                        "w-10 h-10 rounded-xl border-2 transition-all duration-200",
                        state.colorA === colorA
                          ? "border-white"
                          : "border-transparent",
                      )}
                      style={{ background: colorA }}
                    />
                  ))}
                  <label className="w-10 h-10 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
                    <Icon icon={Icons.PLUS} className="text-white/40" />
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
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                  Secondary Color
                </p>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(([, colorB]) => (
                    <button
                      key={colorB}
                      type="button"
                      onClick={() => onChange({ colorB })}
                      className={classNames(
                        "w-10 h-10 rounded-xl border-2 transition-all duration-200",
                        state.colorB === colorB
                          ? "border-white"
                          : "border-transparent",
                      )}
                      style={{ background: colorB }}
                    />
                  ))}
                  <label className="w-10 h-10 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
                    <Icon icon={Icons.PLUS} className="text-white/40" />
                    <input
                      type="color"
                      value={state.colorB}
                      onChange={(e) => onChange({ colorB: e.target.value })}
                      className="absolute opacity-0 w-0 h-0"
                    />
                  </label>
                </div>
              </section>
            </div>
          )}

          {/* ── Avatar Tabs ── */}
          <section>
            <div className="px-6 mb-6">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                Choose Avatar
              </p>
              <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                {(["icon", "character", "custom"] as AvatarTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onChange({ avatarTab: tab })}
                    className={classNames(
                      "flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                      state.avatarTab === tab
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/40 hover:text-white/60",
                    )}
                  >
                    {tab === "character"
                      ? "Characters"
                      : tab === "custom"
                        ? "Custom"
                        : "Icons"}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons grid */}
            {state.avatarTab === "icon" && (
              <div className="grid grid-cols-5 ssm:grid-cols-7 gap-3 px-6">
                {SELECTABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() =>
                      onChange({
                        icon: ic,
                        imageUrl: null,
                        avatarTab: "icon",
                      })
                    }
                    className={classNames(
                      "aspect-square rounded-2xl flex items-center justify-center transition-all border-2",
                      state.avatarTab === "icon" && state.icon === ic
                        ? "border-white bg-white/10"
                        : "border-transparent bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <UserIcon icon={ic} className="text-white text-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Netflix-style category rows */}
            {state.avatarTab === "character" && (
              <div className="space-y-4">
                {AVATAR_CATEGORIES.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    selectedUrl={state.imageUrl}
                    onSelect={(url) =>
                      onChange({ imageUrl: url, avatarTab: "character" })
                    }
                  />
                ))}
              </div>
            )}

            {/* Custom upload */}
            {state.avatarTab === "custom" && (
              <div className="flex flex-col items-center py-8 gap-4 px-6 bg-white/5 mx-6 rounded-3xl border border-dashed border-white/10">
                <AvatarDisplay
                  iconValue={state.imageUrl || ""}
                  colorA={state.colorA}
                  colorB={state.colorB}
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
                >
                  {state.imageUrl ? "Replace Image" : "Upload Image"}
                </button>
                <p className="text-white/20 text-xs font-bold tracking-widest uppercase">
                  JPG, PNG
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="p-8 border-t border-utils-divider flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!state.name.trim()}
            onClick={onSave}
            className={classNames(
              "flex-[2] py-3 rounded-2xl text-black font-bold transition-all disabled:opacity-50",
              state.name.trim()
                ? "bg-white hover:scale-[1.02] active:scale-[0.98]"
                : "bg-white/10 text-white/20",
            )}
          >
            {isNew ? "Create Profile" : "Save Settings"}
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
      icon: hasUrl ? UserIcons.USER_GROUP : (iconVal as UserIcons),
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
      <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background-main overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full px-4 animate-in fade-in zoom-in duration-500">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            Who&apos;s watching?
          </h1>
          <p className="text-white/20 text-lg font-bold uppercase tracking-widest mb-16">
            P-Stream Lives on
          </p>

          {/* Profiles Grid */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-5xl">
            {allProfiles.map((p, i) => (
              <div
                key={p.id}
                className="flex flex-col items-center group relative cursor-pointer w-28 md:w-36"
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => handleSelect(p.id)}
              >
                <div className="relative mb-6">
                  <AvatarDisplay
                    iconValue={p.icon}
                    colorA={p.colorA}
                    colorB={p.colorB}
                    size="lg"
                    isActive={p.id === activeProfileId}
                  />
                  {p.id === "main" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-[10px] font-black text-black rounded-lg shadow-xl tracking-tighter z-20">
                      MAIN
                    </div>
                  )}
                  {p.id !== "main" && (
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, p)}
                      className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-xl scale-75 group-hover:scale-100"
                    >
                      <Icon icon={Icons.EDIT} className="text-base" />
                    </button>
                  )}
                </div>
                <p
                  className={classNames(
                    "text-lg font-bold transition-all duration-300 truncate w-full text-center px-2",
                    p.id === activeProfileId
                      ? "text-white"
                      : "text-white/30 group-hover:text-white/60",
                  )}
                >
                  {p.name}
                </p>
              </div>
            ))}

            {/* Add Profile Button */}
            {allProfiles.length < 5 && (
              <button
                type="button"
                onClick={() => setEditState(blankEdit())}
                className="flex flex-col items-center group cursor-pointer w-28 md:w-36 focus:outline-none"
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl flex items-center justify-center transition-all duration-300 bg-white/5 border-2 border-dashed border-white/10 group-hover:border-white/20 group-hover:bg-white/10 group-hover:scale-105 active:scale-95 mb-6">
                  <Icon
                    icon={Icons.PLUS}
                    className="text-white/20 group-hover:text-white/40 text-4xl transition-all"
                  />
                </div>
                <p className="text-lg font-bold text-white/20 group-hover:text-white/40 transition-colors">
                  Add Profile
                </p>
              </button>
            )}
          </div>
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
