import { MetaOutput } from "@p-stream/providers";
import { jwtDecode } from "jwt-decode";

import { getProviders } from "@/backend/providers/providers";

let metaDataCache: MetaOutput[] | null = null;
let token: null | string = null;

export function setCachedMetadata(data: MetaOutput[]) {
  metaDataCache = data;
}

export function getCachedMetadata(): MetaOutput[] {
  return (
    metaDataCache ?? [
      ...getProviders().listSources(),
      ...getProviders().listEmbeds(),
    ]
  );
}

export function getFreshProviderMetadata(): MetaOutput[] {
  const live = [
    ...getProviders().listSources(),
    ...getProviders().listEmbeds(),
  ];
  const cached = getCachedMetadata();

  return [...live, ...cached].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.id === item.id) === index,
  );
}

export function setApiToken(newToken: string) {
  token = newToken;
}

function getTokenIfValid(): null | string {
  if (!token) return null;
  try {
    const body = jwtDecode(token);
    if (!body.exp) return `jwt|${token}`;
    if (Date.now() / 1000 < body.exp) return `jwt|${token}`;
  } catch (err) {
    // we dont care about parse errors
  }
  return null;
}

export async function getApiToken(): Promise<string | null> {
  return getTokenIfValid();
}
