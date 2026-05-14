import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { mediaItemToId } from "@/backend/metadata/tmdb";
import { Icon, Icons } from "@/components/Icon";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import {
  DiscoverContentType,
  DiscoverMedia,
  MediaType,
  useDiscoverMedia,
} from "@/pages/discover/hooks/useDiscoverMedia";
import { SearchListPart } from "@/pages/parts/search/SearchListPart";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { MediaItem } from "@/utils/mediaTypes";

function toMediaItem(item: DiscoverMedia, mediaType: MediaType): MediaItem {
  const type = mediaType === "movie" ? "movie" : "show";
  const title = item.title || item.name || "Untitled";
  const date = mediaType === "movie" ? item.release_date : item.first_air_date;

  return {
    id: item.id.toString(),
    title,
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : "/placeholder.png",
    type,
    year: date ? Number(date.split("-")[0]) : undefined,
  };
}

function mediaPath(item: DiscoverMedia, mediaType: MediaType) {
  return `/media/${encodeURIComponent(mediaItemToId(toMediaItem(item, mediaType)))}`;
}

function posterUrl(item: DiscoverMedia, size = "w500") {
  return item.poster_path
    ? `https://image.tmdb.org/t/p/${size}${item.poster_path}`
    : "/placeholder.png";
}

function backdropUrl(item: DiscoverMedia) {
  if (item.backdrop_path) {
    return `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
  }
  return posterUrl(item, "w780");
}

function MobilePosterCard({
  item,
  index,
  mediaType,
  ranked,
}: {
  item: DiscoverMedia;
  index: number;
  mediaType: MediaType;
  ranked?: boolean;
}) {
  const title = item.title || item.name || "Untitled";
  const date = mediaType === "movie" ? item.release_date : item.first_air_date;
  const year = date ? date.split("-")[0] : "";

  return (
    <Link to={mediaPath(item, mediaType)} className="mobile-media-card">
      {ranked ? <span className="mobile-media-rank">{index + 1}</span> : null}
      <img src={posterUrl(item)} alt={title} loading="lazy" />
      <div className="mobile-media-card-copy">
        <h3>{title}</h3>
        <span>{year}</span>
      </div>
    </Link>
  );
}

function MobileRail({
  title,
  contentType,
  mediaType,
  ranked,
}: {
  title: string;
  contentType: DiscoverContentType;
  mediaType: MediaType;
  ranked?: boolean;
}) {
  const { media, isLoading } = useDiscoverMedia({
    contentType,
    mediaType,
    fallbackType: contentType === "top10" ? "popular" : undefined,
    isCarouselView: true,
  });

  if (!isLoading && media.length === 0) return null;

  return (
    <section className="mobile-home-rail">
      <div className="mobile-home-rail-title">
        <h2>{title}</h2>
        <Icon icon={Icons.CHEVRON_RIGHT} />
      </div>
      <div className="mobile-home-scroller">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="mobile-media-card mobile-media-card-skeleton"
              />
            ))
          : media
              .slice(0, ranked ? 10 : 14)
              .map((item, index) => (
                <MobilePosterCard
                  key={`${mediaType}-${contentType}-${item.id}`}
                  item={item}
                  index={index}
                  mediaType={mediaType}
                  ranked={ranked}
                />
              ))}
      </div>
    </section>
  );
}

function MobileHero() {
  const navigate = useNavigate();
  const { showModal } = useOverlayStack();
  const { media, isLoading } = useDiscoverMedia({
    contentType: "top10",
    mediaType: "movie",
    fallbackType: "popular",
    isCarouselView: true,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const heroItems = media.slice(0, 5);
  const active = heroItems[activeIndex] ?? heroItems[0];
  const genres = useMemo(() => ["Action", "Drama", "Crime"], []);

  if (isLoading || !active) {
    return <section className="mobile-home-hero mobile-home-hero-loading" />;
  }

  const title = active.title || active.name || "Untitled";

  return (
    <section
      className="mobile-home-hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.28) 42%, #000 92%), url(${backdropUrl(active)})`,
      }}
    >
      <div className="mobile-home-hero-content">
        <h1>{title}</h1>
        <div className="mobile-home-hero-meta">
          {genres.map((genre, index) => (
            <span key={genre}>
              {genre}
              {index < genres.length - 1 ? <b>•</b> : null}
            </span>
          ))}
          <em>{active.vote_average ? active.vote_average.toFixed(1) : "HD"}</em>
        </div>
        <div className="mobile-home-hero-actions">
          <button
            type="button"
            onClick={() =>
              showModal("details", {
                id: active.id,
                type: "movie",
              })
            }
          >
            <Icon icon={Icons.CIRCLE_QUESTION} />
            <span>More Info</span>
          </button>
          <button
            type="button"
            className="mobile-home-play"
            onClick={() => navigate(mediaPath(active, "movie"))}
          >
            <Icon icon={Icons.PLAY} />
          </button>
        </div>
        <div className="mobile-home-dots">
          {heroItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={classNames(index === activeIndex && "active")}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${item.title || item.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MobileHomePage() {
  const searchParams = useSearchQuery();
  const [search, setSearch, commitSearch] = searchParams;
  const { showModal } = useOverlayStack();
  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => {
    setDraftSearch(search);
    setSearchOpen(Boolean(search));
  }, [search]);

  return (
    <main className="mobile-home-page">
      <header className="mobile-home-header">
        <h1>{search ? "Search" : "Home"}</h1>
        <div>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Icon icon={Icons.SEARCH} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => showModal("notifications")}
          >
            <Icon icon={Icons.BELL} />
          </button>
          <Link to="/settings" aria-label="Settings">
            <Icon icon={Icons.USER} />
          </Link>
        </div>
      </header>

      {searchOpen ? (
        <form
          className="mobile-home-search"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(draftSearch);
            commitSearch(draftSearch);
          }}
        >
          <Icon icon={Icons.SEARCH} />
          <input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Search movies and series..."
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setDraftSearch("");
              setSearch("");
              commitSearch("");
              setSearchOpen(false);
            }}
          >
            <Icon icon={Icons.X} />
          </button>
        </form>
      ) : null}

      {search ? (
        <div className="mobile-search-results">
          <SearchListPart
            searchQuery={search}
            onShowDetails={(media) =>
              showModal("details", {
                id: Number(media.id),
                type: media.type === "movie" ? "movie" : "show",
              })
            }
          />
        </div>
      ) : (
        <>
          <MobileHero />
          <MobileRail
            title="Top 10 on Basement"
            contentType="top10"
            mediaType="movie"
            ranked
          />
          <MobileRail title="Movies" contentType="popular" mediaType="movie" />
          <MobileRail title="Series" contentType="popular" mediaType="tv" />
          <MobileRail
            title="Editor Picks"
            contentType="editorPicks"
            mediaType="movie"
          />
        </>
      )}
    </main>
  );
}
