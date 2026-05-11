/**
 * Returns an embeddable YouTube URL, or null if `raw` is not a YouTube link.
 */
export function getYouTubeEmbedUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const u = raw.trim();
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname.startsWith('/embed/')) {
        return `${url.origin}${url.pathname}`;
      }
      const v = url.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shorts = url.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function looksLikeDirectMediaUrl(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const u = raw.trim().toLowerCase();
  return /\.(mp4|webm|ogg)(\?|$)/i.test(u) || u.startsWith('blob:') || u.startsWith('data:');
}
