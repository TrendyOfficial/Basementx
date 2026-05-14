import { useTranslation } from "react-i18next";

import { Icon, Icons } from "@/components/Icon";

interface DiscoverNavigationProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showPlatforms: boolean;
  setShowPlatforms: (show: boolean) => void;
}

export function DiscoverNavigation({
  selectedCategory,
  onCategoryChange,
  showPlatforms,
  setShowPlatforms,
}: DiscoverNavigationProps) {
  const { t } = useTranslation();
  const tabButtonClass = (category: string) =>
    `text-xl md:text-2xl font-bold p-2 bg-transparent text-center rounded-full cursor-pointer flex items-center justify-center transition-colors duration-200 ${
      selectedCategory === category
        ? "text-type-link"
        : "text-type-secondary hover:text-type-text"
    }`;

  return (
    <div className="w-full max-w-screen-xl mx-auto pt-24 pb-4">
      <div className="flex flex-col items-center gap-3">
        <div className="grid w-full max-w-[34rem] grid-cols-3 items-center gap-2 md:gap-5">
          <button
            type="button"
            className={tabButtonClass("movies")}
            onClick={() => onCategoryChange("movies")}
          >
            {t(`discover.tabs.movies`)}
          </button>

          <button
            type="button"
            className={tabButtonClass("tvshows")}
            onClick={() => onCategoryChange("tvshows")}
          >
            {t(`discover.tabs.tvshows`)}
          </button>

          <button
            type="button"
            className={tabButtonClass("editorpicks")}
            onClick={() => onCategoryChange("editorpicks")}
          >
            {t(`discover.tabs.editorpicks`)}
          </button>
        </div>

        <button
          type="button"
          aria-expanded={showPlatforms}
          className={`discover-filter-button ${
            showPlatforms ? "discover-filter-button-open" : ""
          }`}
          onClick={() => setShowPlatforms(!showPlatforms)}
        >
          <span className="font-semibold">Filter</span>
          <Icon
            icon={Icons.CHEVRON_DOWN}
            className={`text-sm transition-transform duration-300 ${
              showPlatforms ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
