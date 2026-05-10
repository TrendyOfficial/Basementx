import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { Link, To, useLocation, useNavigate } from "react-router-dom";

import { NoUserAvatar, UserAvatar } from "@/components/Avatar";
import { IconPatch } from "@/components/buttons/IconPatch";
import { Icons } from "@/components/Icon";
import { LinksDropdown } from "@/components/LinksDropdown";
import { useNotifications } from "@/components/overlays/notificationsModal";
import { Lightbar } from "@/components/utils/Lightbar";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { BlurEllipsis } from "@/pages/layouts/SubPageLayout";
import { conf } from "@/setup/config";
import { useBannerSize } from "@/stores/banner";
import { useDiscoverStore } from "@/stores/discover";
import { usePreferencesStore } from "@/stores/preferences";

import { BrandPill } from "./BrandPill";

export interface NavigationProps {
  bg?: boolean;
  noLightbar?: boolean;
  doBackground?: boolean;
  clearBackground?: boolean;
  discoverEnabled?: boolean;
  onDiscoverToggle?: (enabled: boolean) => void;
}

export function Navigation(props: NavigationProps) {
  const bannerHeight = useBannerSize();
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn } = useAuth();
  const [scrollPosition, setScrollPosition] = useState(0);
  const { openNotifications, getUnreadCount } = useNotifications();
  const enableLowPerformanceMode = usePreferencesStore(
    (s) => s.enableLowPerformanceMode,
  );
  const setSelectedCategory = useDiscoverStore((s) => s.setSelectedCategory);

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [, setSearch, onUnFocus] = useSearchQuery();
  const inputRef = useRef<HTMLInputElement>(null);

  const isOnHomepage =
    location.pathname === "/" || location.pathname.startsWith("/browse");
  const isBrowseRoute =
    location.pathname === "/movies" || location.pathname === "/tvshows";
  const showInlineSearch =
    (isOnHomepage || isBrowseRoute) && !enableLowPerformanceMode;

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchExpanded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, setSearch]);

  const handleClick = (path: To) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleNavClick = (path: string, category?: "movies" | "tvshows") => {
    if (category) setSelectedCategory(category);
    props.onDiscoverToggle?.(true);
    handleClick(path);
  };

  const handleSearchButtonClick = () => {
    if (searchExpanded && props.discoverEnabled && inputValue.trim() === "") {
      props.onDiscoverToggle?.(false);
      setSearchExpanded(false);
      setSearch("");
      onUnFocus("");
      return;
    }
    setSearchExpanded(true);
  };

  const closeSearch = () => {
    setSearchExpanded(false);
    setInputValue("");
    setSearch("");
    onUnFocus("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") closeSearch();
    if (e.key === "Enter") onUnFocus(inputValue);
  };

  const isActivePath = (path: string) => {
    if (path === "/") {
      return (
        location.pathname === "/" || location.pathname.startsWith("/browse")
      );
    }
    return location.pathname.startsWith(path);
  };

  const getMaskLength = () => {
    const maxScroll = 300;
    const minLength = 100;
    const maxLength = 180;
    const scrollFactor = Math.min(scrollPosition, maxScroll) / maxScroll;
    return minLength + (maxLength - minLength) * (1 - scrollFactor);
  };

  return (
    <>
      {!props.noLightbar ? (
        <div
          className="absolute inset-x-0 top-0 flex h-[88px] items-center justify-center"
          style={{ top: `${bannerHeight}px` }}
        >
          <div className="absolute inset-x-0 -mt-[22%] flex items-center sm:mt-0">
            <Lightbar noParticles={enableLowPerformanceMode} />
          </div>
        </div>
      ) : null}

      <div
        className="top-content fixed z-[20] pointer-events-none left-0 right-0 top-0 min-h-[150px]"
        style={{ top: `${bannerHeight}px` }}
      >
        <div
          className={classNames(
            "fixed left-0 right-0 top-0 flex items-center",
            "transition-[background-color,backdrop-filter] duration-300 ease-in-out",
            props.doBackground
              ? props.clearBackground
                ? "backdrop-blur-md bg-transparent"
                : "bg-background-main"
              : "bg-transparent",
          )}
        >
          {props.doBackground ? (
            <div className="absolute w-full h-full inset-0 overflow-hidden">
              <BlurEllipsis positionClass="absolute" />
            </div>
          ) : null}
          <div className="opacity-0 absolute inset-0 block h-20 pointer-events-auto" />
          <div
            className={classNames(
              "transition-[background-color,backdrop-filter,opacity] duration-300 ease-in-out",
              props.bg ? "opacity-100" : "opacity-0",
              "absolute inset-0 block h-[11rem]",
              props.clearBackground
                ? "backdrop-blur-md bg-transparent"
                : "bg-background-main",
            )}
            style={{
              maskImage: `linear-gradient(
                to bottom,
                rgba(0, 0, 0, 1),
                rgba(0, 0, 0, 1) calc(100% - ${getMaskLength()}px),
                rgba(0, 0, 0, 0) 100%
              )`,
              WebkitMaskImage: `linear-gradient(
                to bottom,
                rgba(0, 0, 0, 1),
                rgba(0, 0, 0, 1) calc(100% - ${getMaskLength()}px),
                rgba(0, 0, 0, 0) 100%
              )`,
            }}
          />
        </div>
      </div>

      <div
<<<<<<< HEAD
        className="top-content fixed pointer-events-none left-0 right-0 z-[60] top-0 min-h-[150px]"
        style={{ top: `${bannerHeight}px` }}
=======
        id="mw-header"
        className="top-content fixed pointer-events-none left-0 right-0 z-[500] top-2 min-h-[150px]"
        style={{
          top: `${bannerHeight}px`,
        }}
>>>>>>> ec60421d5edcfc67ce2728e3d7524cbae8d34c4e
      >
        <div className="fixed left-0 right-0 flex items-center">
          <div className="basement-topbar relative z-[60] flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2 pointer-events-auto">
              <a
                href={conf().DISCORD_LINK}
                target="_blank"
                rel="noreferrer"
                className="basement-nav-icon text-xl text-white tabbable rounded-full"
              >
                <IconPatch
                  icon={Icons.DISCORD}
                  clickable
                  downsized
                  navigation
                />
              </a>
              <Link
                className="block tabbable rounded-full text-xs ssm:text-base"
                to="/"
                onClick={() => handleNavClick("/")}
              >
                <BrandPill clickable header />
              </Link>
            </div>

            <nav className="basement-nav-center pointer-events-auto">
              <button
                type="button"
                className={classNames(
                  "basement-nav-link",
                  isActivePath("/") && "active",
                )}
                onClick={() => handleNavClick("/")}
              >
                Home
              </button>
              <button
                type="button"
                className={classNames(
                  "basement-nav-link",
                  isActivePath("/movies") && "active",
                )}
                onClick={() => handleNavClick("/movies", "movies")}
              >
                Movies
              </button>
              <button
                type="button"
                className={classNames(
                  "basement-nav-link",
                  isActivePath("/tvshows") && "active",
                )}
                onClick={() => handleNavClick("/tvshows", "tvshows")}
              >
                TV Shows
              </button>
            </nav>

            <div className="flex items-center gap-2 pointer-events-auto">
              {!enableLowPerformanceMode && (
                <div className="flex items-center">
                  {showInlineSearch ? (
                    <div
                      className={classNames(
                        "nav-search-container flex items-center gap-2 rounded-full backdrop-blur-lg border transition-all duration-400 ease-in-out overflow-hidden",
                        searchExpanded
                          ? "nav-search-expanded border-white/20 bg-black/30 px-3"
                          : "nav-search-collapsed border-transparent bg-transparent px-0",
                      )}
                    >
                      <button
                        type="button"
                        className="text-xl text-white tabbable rounded-full flex-shrink-0 py-1"
                        onClick={handleSearchButtonClick}
                        title="Search"
                      >
                        <IconPatch
                          icon={Icons.SEARCH}
                          clickable
                          downsized
                          navigation
                        />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search..."
                        className={classNames(
                          "bg-transparent text-white placeholder-white/40 outline-none text-sm",
                          "transition-all duration-400 ease-in-out",
                          searchExpanded
                            ? "nav-search-input-expanded opacity-100"
                            : "nav-search-input-collapsed opacity-0 pointer-events-none",
                        )}
                      />
                      {searchExpanded ? (
                        <button
                          type="button"
                          className="nav-search-close"
                          onClick={closeSearch}
                          title="Close search"
                        >
                          <IconPatch
                            icon={Icons.X}
                            clickable
                            downsized
                            navigation
                          />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNavClick("/")}
                      className="basement-nav-icon text-xl text-white tabbable rounded-full cursor-pointer"
                    >
                      <IconPatch
                        icon={Icons.SEARCH}
                        clickable
                        downsized
                        navigation
                      />
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => openNotifications()}
                className="basement-nav-icon text-xl text-white tabbable rounded-full relative cursor-pointer"
              >
                <IconPatch icon={Icons.BELL} clickable downsized navigation />
                {(() => {
                  const count = getUnreadCount();
                  const shouldShow =
                    typeof count === "number" ? count > 0 : count === "99+";
                  return shouldShow ? (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {count}
                    </span>
                  ) : null;
                })()}
<<<<<<< HEAD
              </button>
              <Link
                to="/settings"
                className="basement-nav-icon text-xl text-white tabbable rounded-full cursor-pointer"
              >
                <IconPatch icon={Icons.GEAR} clickable downsized navigation />
              </Link>
              <div className="relative hidden md:block">
                <LinksDropdown>
                  {loggedIn ? <UserAvatar withName /> : <NoUserAvatar />}
                </LinksDropdown>
              </div>
=======
              </a>
            </div>
            <div className="flex items-center space-x-3 pointer-events-auto">
              <LinksDropdown>
                {loggedIn ? <UserAvatar withName onlyMain /> : <NoUserAvatar />}
              </LinksDropdown>
>>>>>>> ec60421d5edcfc67ce2728e3d7524cbae8d34c4e
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
