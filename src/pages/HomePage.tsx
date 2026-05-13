import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { WideContainer } from "@/components/layout/WideContainer";
import { useDebounce } from "@/hooks/useDebounce";
import { useRandomTranslation } from "@/hooks/useRandomTranslation";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { FeaturedCarousel } from "@/pages/discover/components/FeaturedCarousel";
import type { FeaturedMedia } from "@/pages/discover/components/FeaturedCarousel";
import DiscoverContent from "@/pages/discover/discoverContent";
import { HomeLayout } from "@/pages/layouts/HomeLayout";
import { BookmarksCarousel } from "@/pages/parts/home/BookmarksCarousel";
import { BookmarksPart } from "@/pages/parts/home/BookmarksPart";
import { HeroPart } from "@/pages/parts/home/HeroPart";
import { WatchingCarousel } from "@/pages/parts/home/WatchingCarousel";
import { WatchingPart } from "@/pages/parts/home/WatchingPart";
import { SearchListPart } from "@/pages/parts/search/SearchListPart";
import { SearchLoadingPart } from "@/pages/parts/search/SearchLoadingPart";
import { conf } from "@/setup/config";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePreferencesStore } from "@/stores/preferences";
import { MediaItem } from "@/utils/mediaTypes";

import { AdsPart } from "./parts/home/AdsPart";
import { RevivalAnnouncementModal } from "./parts/home/RevivalAnnouncementModal";
import { SupportBar } from "./parts/home/SupportBar";

function useSearch(search: string) {
  const [searching, setSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const debouncedSearch = useDebounce<string>(search, 500);
  useEffect(() => {
    setSearching(search !== "");
    setLoading(search !== "");
    if (search !== "") {
      window.scrollTo(0, 0);
    }
  }, [search]);
  useEffect(() => {
    setLoading(false);
  }, [debouncedSearch]);

  return {
    loading,
    searching,
  };
}

export function HomePage() {
  const { t } = useTranslation();
  const { t: randomT } = useRandomTranslation();
  const emptyText = randomT(`home.search.empty`);
  const [showBg, setShowBg] = useState<boolean>(false);
  const [discoverMode, setDiscoverMode] = useState(true);
  const searchParams = useSearchQuery();
  const [search] = searchParams;
  const s = useSearch(search);

  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showWatching, setShowWatching] = useState(false);
  const { showModal } = useOverlayStack();
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const enableCarouselView = usePreferencesStore(
    (state) => state.enableCarouselView,
  );
  const enableLowPerformanceMode = usePreferencesStore(
    (state) => state.enableLowPerformanceMode,
  );
  const homeSectionOrder = usePreferencesStore(
    (state) => state.homeSectionOrder,
  );

  const handleShowDetails = async (media: MediaItem | FeaturedMedia) => {
    showModal("details", {
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
  };

  const renderHomeSections = () => {
    const sections = homeSectionOrder.map((section) => {
      switch (section) {
        case "watching":
          return enableCarouselView ? (
            <WatchingCarousel
              key="watching"
              carouselRefs={carouselRefs}
              onShowDetails={handleShowDetails}
            />
          ) : (
            <WatchingPart
              key="watching"
              onItemsChange={setShowWatching}
              onShowDetails={handleShowDetails}
            />
          );
        case "bookmarks":
          return enableCarouselView ? (
            <BookmarksCarousel
              key="bookmarks"
              carouselRefs={carouselRefs}
              onShowDetails={handleShowDetails}
            />
          ) : (
            <BookmarksPart
              key="bookmarks"
              onItemsChange={setShowBookmarks}
              onShowDetails={handleShowDetails}
            />
          );
        default:
          return null;
      }
    });

    if (enableCarouselView) {
      return (
        <WideContainer ultraWide classNames="!px-3 md:!px-9">
          {sections}
        </WideContainer>
      );
    }
    return (
      <WideContainer>
        <div className="flex flex-col gap-8">{sections}</div>
      </WideContainer>
    );
  };

  const renderSearch = () => {
    if (!search) return null;

    return (
      <WideContainer ultraWide classNames="basement-search-results">
        {s.loading ? (
          <SearchLoadingPart />
        ) : (
          s.searching && (
            <SearchListPart
              searchQuery={search}
              onShowDetails={handleShowDetails}
            />
          )
        )}
      </WideContainer>
    );
  };

  const renderClassicHome = () => (
    <>
      <div className="mb-2">
        <HeroPart
          searchParams={searchParams}
          setIsSticky={setShowBg}
          showTitle
        />

        <RevivalAnnouncementModal />
        {conf().SHOW_SUPPORT_BAR ? <SupportBar /> : null}

        {conf().SHOW_AD ? <AdsPart /> : null}
      </div>

      {renderSearch()}

      {!search && renderHomeSections()}

      {!search && !(showBookmarks || showWatching) ? (
        <div className="flex flex-col translate-y-[-30px] items-center justify-center pt-20">
          <p className="text-[18.5px] pb-3">{emptyText}</p>
        </div>
      ) : null}
    </>
  );

  const renderDiscoverHome = () =>
    search ? (
      <div className="basement-search-spacer">{renderSearch()}</div>
    ) : (
      <>
        <FeaturedCarousel
          forcedCategory="movies"
          onShowDetails={handleShowDetails}
          shorter
        />

        <WideContainer ultraWide classNames="basement-discover-shell">
          {!enableLowPerformanceMode ? <DiscoverContent /> : null}
        </WideContainer>
      </>
    );

  return (
    <HomeLayout
      showBg={showBg || discoverMode}
      discoverEnabled={discoverMode}
      onDiscoverToggle={setDiscoverMode}
    >
      <Helmet>
        <style type="text/css">{`
          html, body {
            scrollbar-gutter: stable;
          }
        `}</style>
        <title>{t("global.name")}</title>
      </Helmet>

      <div className="basement-app-surface">
        {discoverMode && !enableLowPerformanceMode
          ? renderDiscoverHome()
          : renderClassicHome()}
      </div>
    </HomeLayout>
  );
}
