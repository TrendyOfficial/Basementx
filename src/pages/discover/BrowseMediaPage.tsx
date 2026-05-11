import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/buttons/Button";
import { Dropdown, OptionItem } from "@/components/form/Dropdown";
import { Icon, Icons } from "@/components/Icon";
import { WideContainer } from "@/components/layout/WideContainer";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaGrid } from "@/components/media/MediaGrid";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import {
  DiscoverContentType,
  MediaType,
  useDiscoverMedia,
  useDiscoverOptions,
} from "@/pages/discover/hooks/useDiscoverMedia";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import { MediaItem } from "@/utils/mediaTypes";

type SortMode = "popular" | "topRated" | "latest";

const sortOptions: { id: SortMode; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "topRated", label: "Top Rated" },
  { id: "latest", label: "Latest" },
];
const skeletonKeys = Array.from(
  { length: 18 },
  (_, index) => `skeleton-${index}`,
);

function toMediaItem(item: any, isTVShow: boolean): MediaItem {
  const releaseDate = isTVShow ? item.first_air_date : item.release_date;
  const year = releaseDate
    ? parseInt(releaseDate.split("-")[0], 10)
    : undefined;

  return {
    id: item.id.toString(),
    title: item.title || item.name || "",
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : "/placeholder.png",
    type: isTVShow ? "show" : "movie",
    year,
    release_date: releaseDate ? new Date(releaseDate) : undefined,
  };
}

export function BrowseMediaPage({ mediaType }: { mediaType: MediaType }) {
  const isTVShow = mediaType === "tv";
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [selectedProvider, setSelectedProvider] = useState<OptionItem | null>(
    null,
  );
  const [selectedGenre, setSelectedGenre] = useState<OptionItem | null>(null);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingValue, setRatingValue] = useState(0);
  const [detailsData, setDetailsData] = useState<any>();
  const detailsModal = useModal("browse-details");
  const { providers, genres } = useDiscoverOptions(mediaType);

  const contentType: DiscoverContentType = useMemo(() => {
    if (selectedProvider) return "provider";
    if (selectedGenre) return "genre";
    if (sortMode === "latest") return isTVShow ? "latesttv" : "latest";
    return sortMode;
  }, [isTVShow, selectedGenre, selectedProvider, sortMode]);

  const { media, isLoading, hasMore, sectionTitle } = useDiscoverMedia({
    contentType,
    mediaType,
    id: selectedProvider?.id || selectedGenre?.id,
    page: currentPage,
    providerName: selectedProvider?.name,
    genreName: selectedGenre?.name,
    fallbackType: isTVShow ? "onTheAir" : "nowPlaying",
    isCarouselView: false,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [contentType, selectedProvider?.id, selectedGenre?.id]);

  const filteredMedia = useMemo(() => {
    const minYear = fromYear ? Number(fromYear) : undefined;
    const maxYear = toYear ? Number(toYear) : undefined;
    const rating = ratingValue > 0 ? ratingValue : undefined;

    return media.filter((item) => {
      const date = isTVShow ? item.first_air_date : item.release_date;
      const year = date ? Number(date.split("-")[0]) : undefined;
      const itemRating = item.vote_average ?? 0;

      if (minYear && (!year || year < minYear)) return false;
      if (maxYear && (!year || year > maxYear)) return false;
      if (rating && itemRating < rating) return false;
      return true;
    });
  }, [fromYear, isTVShow, media, ratingValue, toYear]);

  const clearAllFilters = () => {
    setSelectedProvider(null);
    setSelectedGenre(null);
    setFromYear("");
    setToYear("");
    setRatingValue(0);
    setSortMode("popular");
  };

  const handleShowDetails = async (item: MediaItem) => {
    setDetailsData({
      id: Number(item.id),
      type: item.type === "movie" ? "movie" : "show",
    });
    detailsModal.show();
  };

  return (
    <SubPageLayout>
      <WideContainer ultraWide classNames="basement-browse-page">
        <div className="basement-browse-heading">
          <p className="basement-eyebrow">Basement Library</p>
          <h1>{isTVShow ? "TV Shows" : "Movies"}</h1>
          <span>{sectionTitle}</span>
        </div>

        <div className="basement-filter-rack">
            onClear={() => setSelectedProvider(null)}
            options={providers.map((provider) => ({
              id: provider.id,
              name: provider.name,
            }))}
            customButton={
              <button type="button" className="basement-filter-control">
                <span>{selectedProvider?.name || "Services"}</span>
                <Icon
                  icon={Icons.CHEVRON_DOWN}
                  className="text-xs text-dropdown-secondary"
                />
              </button>
            }
          />

          <Dropdown
            selectedItem={selectedGenre || { id: "", name: "Genres" }}
            setSelectedItem={(item) => {
              setSelectedGenre(item);
              setSelectedProvider(null);
            }}
            onClear={() => setSelectedGenre(null)}
            options={genres.map((genre) => ({
              id: genre.id.toString(),
              name: genre.name,
            }))}
            customButton={
              <button type="button" className="basement-filter-control">
                <span>{selectedGenre?.name || "Genres"}</span>
                <Icon
                  icon={Icons.CHEVRON_DOWN}
                  className="text-xs text-dropdown-secondary"
                />
              </button>
            }
          />

          <div className="basement-segmented-control">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={sortMode === option.id ? "active" : ""}
                onClick={() => {
                  setSortMode(option.id);
                  setSelectedProvider(null);
                  setSelectedGenre(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1 px-4 min-w-[120px]">
            <div className="flex justify-between items-center text-[10px] font-bold text-type-secondary uppercase tracking-widest">
              <span>Rating</span>
              <span className="text-type-link">
                {ratingValue === 0 ? "Any" : `${ratingValue}+`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={ratingValue}
              onChange={(e) => setRatingValue(parseFloat(e.target.value))}
              className="basement-rating-slider"
            />
          </div>

          <input
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value)}
            className="basement-filter-input"
            placeholder="From"
            type="number"
          />
          <input
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            className="basement-filter-input"
            placeholder="To"
            type="number"
          />

          <Button
            theme="secondary"
            className="!h-[46px] !rounded-0.7rem !px-4"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>

        <div className="basement-browse-grid">
          <MediaGrid>
            {isLoading && currentPage === 1
              ? skeletonKeys.map((key) => (
                  <div key={key} className="basement-card-skeleton" />
                ))
              : filteredMedia.map((item: any) => (
                  <MediaCard
                    key={item.id}
                    media={toMediaItem(item, isTVShow)}
                    onShowDetails={handleShowDetails}
                    linkable
                  />
                ))}
          </MediaGrid>
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              theme="purple"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </WideContainer>

      {detailsData && <DetailsModal id="browse-details" data={detailsData} />}
    </SubPageLayout>
  );
}
