import classNames from "classnames";
import { t } from "i18next";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { WideContainer } from "@/components/layout/WideContainer";
import { useDiscoverStore } from "@/stores/discover";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

import { DiscoverNavigation } from "./components/DiscoverNavigation";
import type { FeaturedMedia } from "./components/FeaturedCarousel";
import { LazyMediaCarousel } from "./components/LazyMediaCarousel";
import { MediaCarousel } from "./components/MediaCarousel";
import { PersonalRecommendationsCarousel } from "./components/PersonalRecommendationsCarousel";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

const STREAMING_PLATFORMS = [
  { name: "Netflix", src: "/platforms/netflix.png", providerId: "8", key: "netflix" },
  { name: "Disney+", src: "/platforms/disney.png", providerId: "337", key: "disney" },
  { name: "Prime Video", src: "/platforms/prime.png", providerId: "9", key: "amazon" },
  { name: "Apple TV", src: "/platforms/appletv.png", providerId: "350", key: "apple" },
  { name: "Hulu", src: "/platforms/hulu.png", providerId: "15", key: "hulu" },
  { name: "Crunchyroll", src: "/platforms/crunchyroll.png", providerId: "283", key: "crunchyroll" },
  { name: "HBO Max", src: "/platforms/max.png", providerId: "384", key: "hbo" },
  { name: "Paramount", src: "/platforms/paramount.png", providerId: "531", key: "paramount" },
];

const providerMap: { [key: string]: { name: string; img: string } } = {
  netflix: { name: "Netflix", img: "/platforms/netflix.png" },
  disney: { name: "Disney+", img: "/platforms/disney.png" },
  amazon: { name: "Prime Video", img: "/platforms/prime.png" },
  apple: { name: "Apple TV", img: "/platforms/appletv.png" },
  hulu: { name: "Hulu", img: "/platforms/hulu.png" },
  crunchyroll: { name: "Crunchyroll", img: "/platforms/crunchyroll.png" },
  hbo: { name: "HBO Max", img: "/platforms/max.png" },
  paramount: { name: "Paramount+", img: "/platforms/paramount.png" },
};

export function DiscoverContent() {
  const { selectedCategory, setSelectedCategory } = useDiscoverStore();
  const navigate = useNavigate();
  const { showModal } = useOverlayStack();
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [activeProvider, setActiveProvider] = useState<{
    providerId: string;
    key: string;
    name: string;
  } | null>(null);
  const progressItems = useProgressStore((state) => state.items);

  const isMoviesTab = selectedCategory === "movies";
  const isTVShowsTab = selectedCategory === "tvshows";
  const isEditorPicksTab = selectedCategory === "editorpicks";

  const handleCategoryChange = (category: string) => {
    setActiveProvider(null);
    setSelectedCategory(category as "movies" | "tvshows" | "editorpicks");
  };

  const handleShowDetails = async (media: MediaItem | FeaturedMedia) => {
    showModal("discover-details", {
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
  };

  const clearProviderFilter = () => setActiveProvider(null);

  const movieProgressItems = Object.entries(progressItems || {}).filter(
    ([_, item]) => item.type === "movie"
  );
  const tvProgressItems = Object.entries(progressItems || {}).filter(
    ([_, item]) => item.type === "show"
  );

  const renderMoviesContent = () => {
    if (activeProvider) {
      return (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={providerMap[activeProvider.key].img}
                alt={providerMap[activeProvider.key].name}
                className="h-8 rounded-md"
              />
              <h3 className="text-lg font-semibold">
                {t("discover.providerResults", { provider: activeProvider.name })}
              </h3>
            </div>
            <Button theme="plain" onClick={clearProviderFilter}>
              {t("discover.clearFilter") || "Clear"}
            </Button>
          </div>
          <MediaCarousel
            content={{
              type: "provider",
              providerId: activeProvider.providerId,
              providerKey: activeProvider.key,
              providerName: activeProvider.name,
            }}
            isTVShow={false}
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            showProviders
            moreContent
          />
        </>
      );
    }

    const carousels = [];
    carousels.push(
      <PersonalRecommendationsCarousel
        key="movie-for-you"
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
      />
    );

    if (movieProgressItems.length > 0) {
      carousels.push(
        <LazyMediaCarousel
          key="movie-recommendations"
          content={{ type: "recommendations" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
          showRecommendations
          priority={carousels.length < 2}
        />
      );
    }

    carousels.push(
      <LazyMediaCarousel
        key="movie-top10"
        content={{ type: "top10", fallback: "popular" }}
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="movie-latest"
        content={{ type: "latest", fallback: "nowPlaying" }}
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="movie-top-rated"
        content={{ type: "topRated" }}
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="movie-providers"
        content={{ type: "provider" }}
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        showProviders
        moreContent
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="movie-genres"
        content={{ type: "genre" }}
        isTVShow={false}
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        showGenres
        moreContent
      />
    );

    return carousels;
  };

  const renderTVShowsContent = () => {
    if (activeProvider) {
      return (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={providerMap[activeProvider.key].img}
                alt={providerMap[activeProvider.key].name}
                className="h-8 rounded-md"
              />
              <h3 className="text-lg font-semibold">
                {t("discover.providerResults", { provider: activeProvider.name })}
              </h3>
            </div>
            <Button theme="plain" onClick={clearProviderFilter}>
              {t("discover.clearFilter") || "Clear"}
            </Button>
          </div>
          <MediaCarousel
            content={{
              type: "provider",
              providerId: activeProvider.providerId,
              providerKey: activeProvider.key,
              providerName: activeProvider.name,
            }}
            isTVShow
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            showProviders
            moreContent
          />
        </>
      );
    }

    const carousels = [];
    carousels.push(
      <PersonalRecommendationsCarousel
        key="tv-for-you"
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
      />
    );

    if (tvProgressItems.length > 0) {
      carousels.push(
        <LazyMediaCarousel
          key="tv-recommendations"
          content={{ type: "recommendations" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
          showRecommendations
          priority={carousels.length < 2}
        />
      );
    }

    carousels.push(
      <LazyMediaCarousel
        key="tv-on-air"
        content={{ type: "latesttv", fallback: "onTheAir" }}
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="tv-top-rated"
        content={{ type: "topRated" }}
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="tv-popular"
        content={{ type: "popular" }}
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        moreContent
        priority={carousels.length < 2}
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="tv-providers"
        content={{ type: "provider" }}
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        showProviders
        moreContent
      />
    );

    carousels.push(
      <LazyMediaCarousel
        key="tv-genres"
        content={{ type: "genre" }}
        isTVShow
        carouselRefs={carouselRefs}
        onShowDetails={handleShowDetails}
        showGenres
        moreContent
      />
    );

    return carousels;
  };

  const renderEditorPicksContent = () => {
    return (
      <>
        <LazyMediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
          priority
        />
        <LazyMediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
          priority
        />
      </>
    );
  };

  return (
    <div className="relative min-h-screen">
      <DiscoverNavigation
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        showPlatforms={showPlatforms}
        setShowPlatforms={setShowPlatforms}
      />

      <div className={`platform-filter-shell ${showPlatforms ? "open" : ""}`}>
        <div className="platform-filter-panel">
          {STREAMING_PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              type="button"
              className="platform-filter-item"
              aria-label={platform.name}
              onClick={() => setActiveProvider(platform)}
            >
              <img src={platform.src} alt="" className="platform-filter-logo" />
            </button>
          ))}
        </div>
      </div>

      <WideContainer ultraWide classNames="!px-0">
        <div style={{ display: isMoviesTab ? "block" : "none" }}>
          {renderMoviesContent()}
        </div>

        <div style={{ display: isTVShowsTab ? "block" : "none" }}>
          {renderTVShowsContent()}
        </div>

        <div style={{ display: isEditorPicksTab ? "block" : "none" }}>
          {renderEditorPicksContent()}
        </div>
      </WideContainer>

      <div
        className={classNames(
          "flex justify-center mt-8 mb-12",
          isMoviesTab ? "block" : "hidden"
        )}
      >
        <Button theme="purple" onClick={() => navigate("/discover/all")}>
          {t("discover.viewLists")}
        </Button>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

export default DiscoverContent;
