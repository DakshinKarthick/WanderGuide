const PLACEHOLDER_IMAGE = '/placeholder.svg';

export function isPlaceholderImage(imageUrl: string | null | undefined) {
  return !imageUrl || imageUrl === PLACEHOLDER_IMAGE;
}

export function buildPlaceImagePath(name: string, city?: string | null, state?: string | null) {
  const params = new URLSearchParams({ name });

  if (city) {
    params.set('city', city);
  }

  if (state) {
    params.set('state', state);
  }

  return `/api/place-image?${params.toString()}`;
}

export function withPlaceImage<T extends { name: string; city?: string | null; state?: string | null; image_url?: string | null }>(item: T): T {
  if (!isPlaceholderImage(item.image_url)) {
    return item;
  }

  return {
    ...item,
    image_url: buildPlaceImagePath(item.name, item.city, item.state),
  };
}

export { PLACEHOLDER_IMAGE };
