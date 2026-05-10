import classNames from "classnames";
import { t } from "i18next";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { WideContainer } from "@/components/layout/WideContainer";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import { useDiscoverStore } from "@/stores/discover";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

import { DiscoverNavigation } from "./components/DiscoverNavigation";
import type { FeaturedMedia } from "./components/FeaturedCarousel";
import { LazyTabContent } from "./components/LazyTabContent";
import { MediaCarousel } from "./components/MediaCarousel";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

const STREAMING_PLATFORMS = [
  { name: "Netflix", src: "/platforms/netflix.png" },
  { name: "Disney+", src: "/platforms/disney.png" },
  { name: "Prime Video", src: "/platforms/prime.png" },
  { name: "Apple TV", src: "/platforms/appletv.png" },
  { name: "Hulu", src: "/platforms/hulu.png" },
  { name: "Crunchyroll", src: "/platforms/crunchyroll.png" },
  { name: "HBO Max", src: "/platforms/max.png" },
  { name: "Paramount", src: "/platforms/paramount.png" },
];

export function DiscoverContent() {
  const { selectedCategory, setSelectedCategory } = useDiscoverStore();
  const [detailsData, setDetailsData] = useState<any>();
  const navigate = useNavigate();
  const detailsModal = useModal("discover-details");
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showPlatforms, setShowPlatforms] = useState(false);
  const progressItems = useProgressStore((state) => state.items);

  const isMoviesTab = selectedCategory === "movies";
  const isTVShowsTab = selectedCategory === "tvshows";
  const isEditorPicksTab = selectedCategory === "editorpicks";

  const handleCategoryChange = (category: string) => {
    setActiveProvider(null);
    setSelectedCategory(category as "movies" | "tvshows" | "editorpicks");
  };

  const handleShowDetails = async (media: MediaItem | FeaturedMedia) => {
    setDetailsData({
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
    detailsModal.show();
  };

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
    // fallback: default content
    return (
      <>
        {movieProgressItems.length > 0 && (
          <MediaCarousel
            content={{ type: "recommendations" }}
            isTVShow={false}
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            moreContent
            showRecommendations
          />
        )}
        <MediaCarousel
          content={{ type: "latest", fallback: "nowPlaying" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "latest4k", fallback: "popular" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "topRated" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "provider" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showProviders
          moreContent
        />
        <MediaCarousel
          content={{ type: "genre" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showGenres
          moreContent
        />
      </>
    );
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
    return (
      <>
        {tvProgressItems.length > 0 && (
          <MediaCarousel
            content={{ type: "recommendations" }}
            isTVShow
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            moreContent
            showRecommendations
          />
        )}
        <MediaCarousel
          content={{ type: "latesttv", fallback: "onTheAir" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "topRated" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "popular" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "provider" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showProviders
          moreContent
        />
        <MediaCarousel
          content={{ type: "genre" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showGenres
          moreContent
        />
      </>
    );
  };

  const renderEditorPicksContent = () => {
    return (
      <>
        <MediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
      </>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Navigation Tabs */}
      <DiscoverNavigation
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        showPlatforms={showPlatforms}
        setShowPlatforms={setShowPlatforms}
      />

      {/* Streaming Platforms Row (Expandable) */}
      <div className={`platform-filter-shell ${showPlatforms ? "open" : ""}`}>
        <div className="platform-filter-panel">
          {STREAMING_PLATFORMS.map((platform) => (
            <button
              key={platform.name}
              type="button"
              className="platform-filter-item"
              aria-label={platform.name}
            >
              <img src={platform.src} alt="" className="platform-filter-logo" />
            </button>
          ))}
        </div>
      </div>

      <WideContainer ultraWide classNames="!px-0">
        <LazyTabContent isActive={isMoviesTab}>
          {renderMoviesContent()}
        </LazyTabContent>

        <LazyTabContent isActive={isTVShowsTab}>
          {renderTVShowsContent()}
        </LazyTabContent>

        <LazyTabContent isActive={isEditorPicksTab}>
          {renderEditorPicksContent()}
        </LazyTabContent>
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

      {detailsData && <DetailsModal id="discover-details" data={detailsData} />}
    </div>
  );
}

export default DiscoverContent;
