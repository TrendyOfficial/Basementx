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

export function DiscoverContent() {
  const { selectedCategory, setSelectedCategory } = useDiscoverStore();
  const [detailsData, setDetailsData] = useState<any>();
  const navigate = useNavigate();
  const detailsModal = useModal("discover-details");
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const progressItems = useProgressStore((state) => state.items);

  const isMoviesTab = selectedCategory === "movies";
  const isTVShowsTab = selectedCategory === "tvshows";
  const isEditorPicksTab = selectedCategory === "editorpicks";

  const handleCategoryChange = (category: string) => {
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
    ([_, item]) => item.type === "movie",
  );
  const tvProgressItems = Object.entries(progressItems || {}).filter(
    ([_, item]) => item.type === "show",
  );

  const renderMoviesContent = () => {
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
      />

      {/* Streaming Platforms Row */}
      <div className="flex justify-center items-center gap-8 mt-8 mb-6 flex-wrap">
        <img
          src="/platforms/netflix.png"
          alt="Netflix"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/disney.png"
          alt="Disney+"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/prime.png"
          alt="Prime Video"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/appletv.png"
          alt="Apple TV"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/hulu.png"
          alt="Hulu"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/crunchyroll.png"
          alt="Crunchyroll"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/max.png"
          alt="HBO Max"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
        <img
          src="/platforms/paramount.png"
          alt="Paramount"
          className="h-10 transition-transform hover:scale-110 cursor-pointer"
        />
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
          isMoviesTab ? "block" : "hidden",
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
