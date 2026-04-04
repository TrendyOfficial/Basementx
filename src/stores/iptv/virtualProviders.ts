import { get, getMediaPoster } from "@/backend/metadata/tmdb";

import type { IptvChannel, IptvPlaylist } from "./index";

export const VIRTUAL_PLAYLIST_ID = "virtual-tmdb-arabic-mode";

// Helper to convert TMDB result to IptvChannel
const tmdbToIptvChannel = (
  item: any,
  categoryName: string,
  mediaType: "movie" | "show",
): IptvChannel => ({
  name: item.title || item.name,
  url: "virtual", // Placeholder
  logo: getMediaPoster(item.poster_path) || "",
  category: categoryName,
  tmdbId: item.id.toString(),
  mediaType,
});

async function fetchMovies(
  category: string,
  params: any,
): Promise<IptvChannel[]> {
  try {
    const data = await get<{ results: any[] }>("/discover/movie", {
      ...params,
      include_adult: false,
      include_video: false,
      page: 1,
    });
    return data.results.map((item) =>
      tmdbToIptvChannel(item, category, "movie"),
    );
  } catch (error) {
    console.error(`Failed to fetch virtual category ${category}:`, error);
    return [];
  }
}

async function fetchShows(
  category: string,
  params: any,
): Promise<IptvChannel[]> {
  try {
    const data = await get<{ results: any[] }>("/discover/tv", {
      ...params,
      include_adult: false,
      page: 1,
    });
    return data.results.map((item) =>
      tmdbToIptvChannel(item, category, "show"),
    );
  } catch (error) {
    console.error(`Failed to fetch virtual category ${category}:`, error);
    return [];
  }
}

export async function generateArabicVODPlaylist(): Promise<IptvPlaylist> {
  const currentYear = new Date().getFullYear();
  const allChannels: IptvChannel[] = [];

  // 1. New Arabic Movies (Latest)
  const newArabic = await fetchMovies("New Arabic Movies - أفلام عربي حديثه", {
    with_original_language: "ar",
    sort_by: "primary_release_date.desc",
    "primary_release_date.lte": new Date().toISOString().split("T")[0],
  });
  allChannels.push(...newArabic);

  // 2. Arabic Movies (Popular)
  const arabic = await fetchMovies("Arabic Movies - أفلام عربي", {
    with_original_language: "ar",
    sort_by: "popularity.desc",
  });
  allChannels.push(...arabic);

  // 3. Arabic Zaman Movies (Classic)
  const arabicZaman = await fetchMovies(
    "Arabic Zaman Movies - أفلام عربي زمان",
    {
      with_original_language: "ar",
      "primary_release_date.lte": "1997-12-31",
      sort_by: "popularity.desc",
    },
  );
  allChannels.push(...arabicZaman);

  // 4. Egyptian Movies (By Year)
  for (let year = currentYear + 1; year >= 2018; year--) {
    const egy = await fetchMovies(`Egyptian Movies ${year} - أفلام مصري`, {
      with_original_language: "ar",
      with_origin_country: "EG",
      primary_release_year: year,
      sort_by: "popularity.desc",
    });
    allChannels.push(...egy);
  }

  // 5. English Movies (By Year)
  for (let year = currentYear + 1; year >= 2015; year--) {
    const eng = await fetchMovies(`English Movies ${year} - أفلام أجنبي`, {
      with_original_language: "en",
      primary_release_year: year,
      sort_by: "popularity.desc",
    });
    allChannels.push(...eng);
  }

  // Grouping older English & Egyptian
  const oldEng = await fetchMovies(`English Movies Old - أفلام أجنبي زمان`, {
    with_original_language: "en",
    "primary_release_date.lte": "2014-12-31",
    sort_by: "popularity.desc",
  });
  allChannels.push(...oldEng);

  const oldEgy = await fetchMovies(`Egyptian Movies Old - أفلام مصري زمان`, {
    with_original_language: "ar",
    with_origin_country: "EG",
    "primary_release_date.lte": "2017-12-31",
    sort_by: "popularity.desc",
  });
  allChannels.push(...oldEgy);

  // 6. German Movies
  const german = await fetchMovies("Germany Movies - أفلام ألماني", {
    with_original_language: "de",
    sort_by: "popularity.desc",
  });
  allChannels.push(...german);

  // 7. TV Shows / Series (Netflix Mock & Arabic Series)
  const arabicSeries = await fetchShows("Arabic Series - مسلسلات عربي", {
    with_original_language: "ar",
    sort_by: "popularity.desc",
  });
  allChannels.push(...arabicSeries);

  const netflixSeries = await fetchShows("Netflix Series - مسلسلات أجنبي", {
    with_networks: "213", // Netflix Network ID on TMDB
    sort_by: "popularity.desc",
  });
  allChannels.push(...netflixSeries);

  // 8. Mocking Live TV feeds (News)
  const mockLiveTv: IptvChannel[] = [
    {
      name: "Al Jazeera Arabic live stream",
      url: "https://live-hls-web-aja.getmedia.net/AJA/index.m3u8",
      category: "Arabic News - أخبار عربية",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Al_Jazeera_English_logo.svg/1200px-Al_Jazeera_English_logo.svg.png",
    },
    {
      name: "AlHadath News",
      url: "https://alhadath.vedge.infomaniak.com/livecast/alhadath/manifest.m3u8",
      category: "Arabic News - أخبار عربية",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Al-Hadath-Logo.png",
    },
    {
      name: "Sky News Arabia",
      url: "https://skynewsarabia.akamaized.net/hls/live/2012891/skynewsarabia/master.m3u8",
      category: "Arabic News - أخبار عربية",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sky_News_Arabia_Logo.png",
    },
  ];
  allChannels.push(...mockLiveTv);

  return {
    id: VIRTUAL_PLAYLIST_ID,
    name: "Arabic TV Mode (Basement VOD)",
    type: "tmdb-vod",
    channels: allChannels,
    lastUpdated: Date.now(),
  };
}
