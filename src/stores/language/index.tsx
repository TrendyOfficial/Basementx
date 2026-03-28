import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import i18n from "@/setup/i18n";
import { useProfileStore } from "@/stores/profile";
import { getLocaleInfo } from "@/utils/language";

export interface LanguageStore {
  language: string; // Current profile language (backward compatibility)
  languages: Record<string, string>; // Keyed by profileId
  setLanguage(v: string): void;
}

function getActiveProfileId() {
  return useProfileStore.getState().activeProfileId || "main";
}

export const useLanguageStore = create(
  persist(
    immer<LanguageStore>((set) => ({
      language: navigator.language.split("-")[0],
      languages: {},
      setLanguage(v) {
        const profileId = getActiveProfileId();
        set((s) => {
          s.languages[profileId] = v;
          s.language = v;
        });
      },
    })),
    { name: "__MW::locale" },
  ),
);

// Helper hook to get the language for the current profile
export function useCurrentLanguage() {
  const profileId = useProfileStore((s) => s.activeProfileId) || "main";
  const languages = useLanguageStore((s) => s.languages);
  return languages[profileId] || navigator.language.split("-")[0];
}

export function changeAppLanguage(language: string) {
  const lang = getLocaleInfo(language);
  if (lang) i18n.changeLanguage(lang.code);
}

export function isRightToLeft(language: string) {
  const lang = getLocaleInfo(language);
  if (!lang) return false;
  return lang.isRtl;
}

export function LanguageSyncer() {
  const language = useCurrentLanguage();

  useEffect(() => {
    useLanguageStore.setState((s) => {
      s.language = language;
    });
  }, [language]);

  return null;
}

export function LanguageProvider() {
  const language = useCurrentLanguage();

  useEffect(() => {
    changeAppLanguage(language);
  }, [language]);

  const isRtl = isRightToLeft(language);

  return (
    <Helmet>
      <html dir={isRtl ? "rtl" : "ltr"} />
    </Helmet>
  );
}
