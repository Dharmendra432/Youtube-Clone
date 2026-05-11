import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { VideoCard } from '../components/VideoCard.jsx';
import './Home.css';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All', 'Music', 'Gaming', 'News', 'Sports', 'Tech', 'Education']);
  const [loading, setLoading] = useState(true);
  const chipsRef = useRef(null);

  const activeCategory = useMemo(() => categoryParam, [categoryParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/videos', {
        params: {
          search: search || undefined,
          category: activeCategory === 'All' ? undefined : activeCategory,
        },
      });
      setVideos(data);
    } catch (e) {
      console.error(e);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get('/api/meta/categories')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) setCategories(data);
      })
      .catch(() => {});
  }, []);

  function setCategory(cat) {
    const next = new URLSearchParams(searchParams);
    if (cat === 'All') next.delete('category');
    else next.set('category', cat);
    setSearchParams(next);
  }

  function scrollChips(dir) {
    const el = chipsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  }

  return (
    <div className="yt-home">
      <div className="yt-chips-row">
        <div className="yt-chips" ref={chipsRef}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`yt-chip ${activeCategory === c ? 'yt-chip--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button type="button" className="yt-chips__arrow" aria-label="Scroll categories" onClick={() => scrollChips(1)}>
          ›
        </button>
      </div>

      {loading ? (
        <p className="yt-muted">Loading…</p>
      ) : (
        <div className="yt-grid">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && <p className="yt-muted">No videos found.</p>}
    </div>
  );
}
