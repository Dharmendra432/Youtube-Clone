import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ChannelPage.css';

const CATEGORIES = ['Music', 'Gaming', 'News', 'Sports', 'Tech', 'Education'];

const SAMPLE_VIDEO =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const ALT_SAMPLE_VIDEO =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export function ChannelPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: SAMPLE_VIDEO,
    thumbnailUrl: 'https://picsum.photos/seed/upload/640/360',
    category: 'Tech',
    duration: '10:00',
  });

  const load = useCallback(async () => {
    const { data: d } = await api.get(`/api/channels/${id}`);
    setData(d);
  }, [id]);

  useEffect(() => {
    load().catch(() => setData(null));
  }, [load]);

  const isOwner = data && user && String(data.owner) === String(user.id);

  async function addVideo(e) {
    e.preventDefault();
    await api.post('/api/videos', { channelId: id, ...form });
    setForm((f) => ({
      ...f,
      title: '',
      description: '',
      duration: '10:00',
    }));
    load();
  }

  async function updateVideo(e) {
    e.preventDefault();
    if (!editing) return;
    await api.put(`/api/videos/${editing.id}`, {
      title: editing.title,
      description: editing.description,
      videoUrl: editing.videoUrl,
      thumbnailUrl: editing.thumbnailUrl,
      category: editing.category,
      duration: editing.duration,
    });
    setEditing(null);
    load();
  }

  async function deleteVideo(vid) {
    if (!window.confirm('Delete this video?')) return;
    await api.delete(`/api/videos/${vid}`);
    load();
  }

  if (!data) return <p className="yt-muted">Channel not found…</p>;

  return (
    <div className="ch-page">
      <div
        className="ch-page__banner"
        style={{ backgroundImage: `url(${data.channelBanner})` }}
        role="img"
        aria-label=""
      />
      <div className="ch-page__head">
        <h1>{data.channelName}</h1>
        <p className="ch-page__desc">{data.description}</p>
        <p className="ch-page__meta">{data.subscribers?.toLocaleString()} subscribers</p>
      </div>

      {isOwner && (
        <section className="ch-page__panel">
          <h2>Upload video</h2>
          <form className="ch-page__grid-form" onSubmit={addVideo}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              placeholder="Video URL (paste MP4 link)"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              required
            />
            <button
              type="button"
              className="ch-page__btn"
              onClick={() => setForm((f) => ({ ...f, videoUrl: SAMPLE_VIDEO }))}
              title="Fill a working dummy video URL"
            >
              Use dummy URL
            </button>
            <input
              placeholder="Thumbnail URL"
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              required
            />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              placeholder="Duration e.g. 12:34"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <button type="submit" className="ch-page__btn">
              Publish
            </button>
          </form>
          <p className="yt-muted" style={{ margin: '12px 0 0' }}>
            Dummy videos: <code style={{ userSelect: 'all' }}>{SAMPLE_VIDEO}</code> or{' '}
            <code style={{ userSelect: 'all' }}>{ALT_SAMPLE_VIDEO}</code>
          </p>
        </section>
      )}

      <h2 className="ch-page__videos-title">Videos</h2>
      <div className="ch-page__videos">
        {data.videos?.map((v) => (
          <article key={v.id} className="ch-page__card">
            <Link to={`/watch/${v.id}`}>
              <img src={v.thumbnailUrl} alt="" className="ch-page__thumb" />
            </Link>
            <div className="ch-page__card-body">
              <Link to={`/watch/${v.id}`} className="ch-page__v-title">
                {v.title}
              </Link>
              <p className="ch-page__v-meta">
                {v.views?.toLocaleString()} views · {v.category}
              </p>
              {isOwner && (
                <div className="ch-page__tools">
                  <button type="button" className="ch-page__link" onClick={() => setEditing({ ...v })}>
                    Edit
                  </button>
                  <button type="button" className="ch-page__link" onClick={() => deleteVideo(v.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <div className="ch-page__modal" role="dialog" aria-modal="true">
          <div className="ch-page__modal-inner">
            <h3>Edit video</h3>
            <form onSubmit={updateVideo} className="ch-page__grid-form">
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
              />
              <textarea
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <input
                value={editing.videoUrl}
                onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })}
                required
              />
              <input
                value={editing.thumbnailUrl}
                onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })}
                required
              />
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={editing.duration}
                onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
              />
              <div className="ch-page__modal-actions">
                <button type="submit" className="ch-page__btn">
                  Save
                </button>
                <button type="button" className="ch-page__link" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
