import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getYouTubeEmbedUrl, looksLikeDirectMediaUrl } from '../utils/videoUrl.js';
import './Watch.css';

const FALLBACK_MP4 =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export function Watch() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [err, setErr] = useState('');
  const [playErr, setPlayErr] = useState('');

  const loadVideo = useCallback(async () => {
    const { data } = await api.get(`/api/videos/${id}`);
    setVideo(data);
  }, [id]);

  const loadComments = useCallback(async () => {
    const { data } = await api.get(`/api/videos/${id}/comments`);
    setComments(data);
  }, [id]);

  useEffect(() => {
    setPlayErr('');
    loadVideo().catch(() => setVideo(null));
  }, [loadVideo]);

  useEffect(() => {
    loadComments().catch(() => setComments([]));
  }, [loadComments]);

  async function sendReaction(type) {
    if (!isAuthenticated) {
      setErr('Sign in to like or dislike.');
      return;
    }
    setErr('');
    const { data } = await api.post(`/api/videos/${id}/reaction`, { type });
    setVideo(data);
  }

  async function addComment(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setErr('Sign in to comment.');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    setErr('');
    try {
      await api.post(`/api/videos/${id}/comments`, { text: trimmed });
      setText('');
      await loadComments();
    } catch (err) {
      setErr(err.response?.data?.message || 'Unable to post comment.');
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      await api.put(`/api/videos/${id}/comments/${editId}`, { text: trimmed });
      setEditId(null);
      setEditText('');
      await loadComments();
    } catch (err) {
      setErr(err.response?.data?.message || 'Unable to edit comment.');
    }
  }

  async function removeComment(cid) {
    try {
      await api.delete(`/api/videos/${id}/comments/${cid}`);
      await loadComments();
    } catch (err) {
      setErr(err.response?.data?.message || 'Unable to delete comment.');
    }
  }

  if (!video) {
    return <p className="watch-muted">Video not found or loading…</p>;
  }

  const ch = video.channel;
  const ytEmbed = getYouTubeEmbedUrl(video.videoUrl);
  const hasUrl = Boolean(video.videoUrl && String(video.videoUrl).trim());
  const warnFormat =
    hasUrl && !ytEmbed && !looksLikeDirectMediaUrl(video.videoUrl);

  return (
    <div className="watch">
      <div className="watch__player">
        {!hasUrl ? (
          <div className="watch__play-msg">No video URL is set for this item.</div>
        ) : ytEmbed ? (
          <iframe
            key={ytEmbed}
            className="watch__iframe"
            title={video.title}
            src={ytEmbed}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <video
              key={video.id}
              className="watch__video"
              controls
              playsInline
              preload="metadata"
              poster={video.thumbnailUrl}
              src={video.videoUrl}
              onError={() =>
                setPlayErr(
                  'This URL could not be played in the browser. Use a direct link to an .mp4 / .webm file (not a YouTube watch page), or paste a YouTube link to use the embedded player.'
                )
              }
            />
            {playErr && (
              <div className="watch__play-msg watch__play-msg--error">
                <p>{playErr}</p>
                <p className="watch__play-hint">
                  Try a sample MP4:{' '}
                  <a href={FALLBACK_MP4} target="_blank" rel="noreferrer">
                    open sample
                  </a>
                  {' · '}
                  <button
                    type="button"
                    className="watch__link"
                    onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Open saved URL
                  </button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {warnFormat && (
        <p className="watch__format-warn">
          This does not look like a direct video file URL. The HTML5 player needs a direct .mp4/.webm link, or use a
          YouTube link for embed playback.
        </p>
      )}
      <h1 className="watch__title">{video.title}</h1>
      <div className="watch__bar">
        <div className="watch__channel">
          {ch && (
            <Link to={`/channel/${ch.id}`} className="watch__channel-link">
              <strong>{ch.channelName}</strong>
            </Link>
          )}
          <span className="watch__subs">{ch?.subscribers?.toLocaleString?.() ?? 0} subscribers</span>
        </div>
        <div className="watch__actions">
          <button
            type="button"
            className={`watch__pill ${video.userLiked ? 'watch__pill--on' : ''}`}
            onClick={() => sendReaction(video.userLiked ? 'none' : 'like')}
          >
            👍 {video.likes}
          </button>
          <button
            type="button"
            className={`watch__pill ${video.userDisliked ? 'watch__pill--on' : ''}`}
            onClick={() => sendReaction(video.userDisliked ? 'none' : 'dislike')}
          >
            👎 {video.dislikes}
          </button>
        </div>
      </div>
      {err && <div className="watch__err">{err}</div>}
      <div className="watch__desc">
        <p>{video.views?.toLocaleString()} views</p>
        <p>{video.description}</p>
      </div>

      <section className="watch__comments">
        <h2>{comments.length} Comments</h2>
        {isAuthenticated && (
          <form className="watch__comment-form" onSubmit={addComment}>
            <img src={user?.avatar} alt="" className="watch__c-avatar" width={40} height={40} />
            <div className="watch__c-input-wrap">
              <input
                className="watch__c-input"
                placeholder="Add a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" className="watch__c-submit" disabled={!text.trim()}>
                Comment
              </button>
            </div>
          </form>
        )}
        <ul className="watch__comment-list">
          {comments.map((c) => (
            <li key={c.id} className="watch__comment">
              <img src={c.avatar} alt="" width={40} height={40} className="watch__c-avatar" />
              <div>
                <div className="watch__c-head">
                  <strong>{c.username}</strong>
                  <span className="watch__c-date">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                {editId === c.id ? (
                  <form onSubmit={saveEdit} className="watch__c-edit">
                    <input value={editText} onChange={(e) => setEditText(e.target.value)} className="watch__c-input" />
                    <button type="submit" className="watch__c-submit">
                      Save
                    </button>
                    <button type="button" className="watch__link" onClick={() => setEditId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <p className="watch__c-text">{c.text}</p>
                )}
                {isAuthenticated && String(user?.id) === String(c.userId) && editId !== c.id && (
                  <div className="watch__c-tools">
                    <button
                      type="button"
                      className="watch__link"
                      onClick={() => {
                        setEditId(c.id);
                        setEditText(c.text);
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="watch__link" onClick={() => removeComment(c.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
