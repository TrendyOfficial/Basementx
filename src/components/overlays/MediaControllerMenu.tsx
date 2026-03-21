import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { mediaItemToId } from "@/backend/metadata/tmdb";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Modal, ModalCard, useModal } from "@/components/overlays/Modal";
import { Heading2, Paragraph } from "@/components/utils/Text";
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
            className="w-32 h-48 bg-cover bg-center rounded-lg mb-6 shadow-2xl border border-white/10"
            style={{ backgroundImage: `url(${media.poster})` }}
          />
          <Heading2 className="!mt-0 !mb-2">{media.title}</Heading2>
          <Paragraph className="opacity-60 mb-8 lowercase first-letter:uppercase">
            {media.year} • {t(`media.types.${media.type}`)}
          </Paragraph>

          <div className="w-full flex flex-col gap-3">
            <Button
              theme="purple"
              className="w-full tabbable"
              onClick={handlePlay}
            >
              <Icon icon={Icons.PLAY} className="mr-2" />
              {t("player.metadata.play")}
            </Button>

            <Button
              theme="secondary"
              className="w-full tabbable"
              onClick={handleShowDetails}
            >
              <Icon icon={Icons.CIRCLE_EXCLAMATION} className="mr-2" />
              {t("bookmarks.folders.moreInfo")}
            </Button>

            <Button
              theme="secondary"
              className="w-full tabbable"
              onClick={handleToggleBookmark}
            >
              <Icon
                icon={isBookmarked ? Icons.CHECKMARK : Icons.BOOKMARK}
                className={isBookmarked ? "text-type-link mr-2" : "mr-2"}
              />
              {isBookmarked
                ? t("bookmarks.folders.remove")
                : t("bookmarks.folders.add")}
            </Button>

            <Button
              theme="secondary"
              className="w-full tabbable mt-2"
              onClick={modal.hide}
            >
              {t("onboarding.defaultConfirm.cancel")}
            </Button>
          </div>
        </div>
      </ModalCard>
    </Modal>
  );
}
