import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { mediaItemToId } from "@/backend/metadata/tmdb";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Modal, ModalCard, useModal } from "@/components/overlays/Modal";
import { Heading2 } from "@/components/utils/Text";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { MediaItem } from "@/utils/mediaTypes";

export function MediaControllerMenuModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modal = useModal("media-controller-menu");
  const { modalData, hideModal } = useOverlayStack();
  const data = modalData["media-controller-menu"];
  const media = data?.media as MediaItem | undefined;

  const { bookmarks, removeBookmark, addBookmarkWithGroups } =
    useBookmarkStore();
  const isBookmarked = media ? !!bookmarks[media.id] : false;

  if (!media) return null;

  const handlePlay = () => {
    let link = `/media/${encodeURIComponent(mediaItemToId(media))}`;
    // Handle series episode linking if data available (simple version for now)
    const series = data?.series;
    if (series) {
      if (series.season === 0 && !series.episodeId) {
        link += `/${encodeURIComponent(series.seasonId)}`;
      } else {
        link += `/${encodeURIComponent(series.seasonId)}/${encodeURIComponent(
          series.episodeId,
        )}`;
      }
    }

    hideModal(modal.id);
    navigate(link);
  };

  const handleShowDetails = () => {
    hideModal(modal.id);
    // Open the actual details modal
    useOverlayStack.getState().showModal("details", {
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(media.id);
    } else {
      addBookmarkWithGroups(
        {
          type: media.type,
          title: media.title,
          tmdbId: media.id,
          releaseYear: media.year || 0,
          poster: media.poster,
        },
        [],
      );
    }
  };

  return (
    <Modal id={modal.id}>
      <ModalCard className="!max-w-[25rem]">
        <div className="flex flex-col items-center text-center">
          <div
            className="w-48 h-72 bg-cover bg-center rounded-xl mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${media.poster})` }}
          />
          <Heading2 className="!mt-0 !mb-1 text-3xl font-black tracking-tight">
            {media.title}
          </Heading2>
          <div className="flex items-center gap-3 mb-8 text-lg font-medium">
            <span className="opacity-60">{media.year}</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60 uppercase tracking-wider text-sm">
              {t(`media.types.${media.type}`)}
            </span>
            {media.rating && (
              <>
                <span className="opacity-30">•</span>
                <span className="text-yellow-500 flex items-center gap-1">
                  <Icon icon={Icons.RISING_STAR} className="text-sm" />
                  {media.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <div className="w-full flex flex-col gap-4">
            <Button
              theme="purple"
              className="w-full tabbable py-4 text-lg font-bold shadow-lg shadow-purple-900/20"
              onClick={handlePlay}
            >
              <Icon icon={Icons.PLAY} className="mr-3" />
              {t("player.play", "Play")}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                theme="secondary"
                className="w-full tabbable py-3"
                onClick={handleShowDetails}
              >
                <Icon icon={Icons.CIRCLE_EXCLAMATION} className="mr-2" />
                {t("bookmarks.folders.moreInfo", "Info")}
              </Button>

              <Button
                theme="secondary"
                className="w-full tabbable py-3"
                onClick={handleToggleBookmark}
              >
                <Icon
                  icon={isBookmarked ? Icons.CHECKMARK : Icons.BOOKMARK}
                  className={isBookmarked ? "text-type-link mr-2" : "mr-2"}
                />
                {isBookmarked
                  ? t("bookmarks.folders.remove", "Remove")
                  : t("bookmarks.folders.add", "Bookmark")}
              </Button>
            </div>

            <Button
              theme="secondary"
              className="w-full tabbable mt-4 opacity-50 hover:opacity-100 transition-opacity"
              onClick={modal.hide}
            >
              {t("actions.cancel", "Close")}
            </Button>
          </div>
        </div>
      </ModalCard>
    </Modal>
  );
}
