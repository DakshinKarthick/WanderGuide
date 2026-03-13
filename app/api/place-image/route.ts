import { NextRequest, NextResponse } from 'next/server';
import { PLACEHOLDER_IMAGE } from '@/lib/place-image';

const SEARCH_ENDPOINT = 'https://en.wikipedia.org/w/api.php';
const COMMONS_SEARCH_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';
const SUMMARY_ENDPOINT = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const USER_AGENT = 'WanderGuide/1.0 (destination image resolver)';

interface CommonsSearchResponse {
  query?: {
    pages?: Record<string, {
      index?: number;
      imageinfo?: Array<{
        thumburl?: string;
        url?: string;
      }>;
    }>;
  };
}

async function searchWikipediaTitle(query: string) {
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set('action', 'opensearch');
  url.searchParams.set('search', query);
  url.searchParams.set('limit', '1');
  url.searchParams.set('namespace', '0');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as [string, string[]];
  return payload[1]?.[0] ?? null;
}

async function fetchWikipediaImage(title: string) {
  const response = await fetch(`${SUMMARY_ENDPOINT}/${encodeURIComponent(title)}`, {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
  };

  return payload.originalimage?.source ?? payload.thumbnail?.source ?? null;
}

async function searchCommonsImage(query: string) {
  const url = new URL(COMMONS_SEARCH_ENDPOINT);
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', query);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '1');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url');
  url.searchParams.set('iiurlwidth', '1200');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as CommonsSearchResponse;
  const pages = Object.values(payload.query?.pages ?? {}).sort((left, right) => (left.index ?? 0) - (right.index ?? 0));
  const image = pages[0]?.imageinfo?.[0];

  return image?.thumburl ?? image?.url ?? null;
}

async function resolvePlaceImageUrl(name: string, city?: string | null, state?: string | null) {
  const candidates = [
    [name, city, state, 'India'].filter(Boolean).join(' '),
    [name, city, 'India'].filter(Boolean).join(' '),
    [name, state, 'India'].filter(Boolean).join(' '),
    [name, 'India'].filter(Boolean).join(' '),
  ].filter(Boolean);

  for (const query of candidates) {
    const commonsImage = await searchCommonsImage(query);

    if (commonsImage) {
      return commonsImage;
    }

    const title = await searchWikipediaTitle(query);

    if (!title) {
      continue;
    }

    const imageUrl = await fetchWikipediaImage(title);

    if (imageUrl) {
      return imageUrl;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const name = searchParams.get('name')?.trim();
  const city = searchParams.get('city')?.trim();
  const state = searchParams.get('state')?.trim();

  if (!name) {
    return NextResponse.redirect(`${origin}${PLACEHOLDER_IMAGE}`);
  }

  try {
    const imageUrl = await resolvePlaceImageUrl(name, city, state);

    if (imageUrl) {
      return NextResponse.redirect(imageUrl, {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        },
      });
    }
  } catch {
    // Fall through to placeholder on lookup failures.
  }

  return NextResponse.redirect(`${origin}${PLACEHOLDER_IMAGE}`, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
