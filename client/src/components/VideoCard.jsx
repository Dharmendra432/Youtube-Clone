import { Link } from 'react-router-dom';
import './VideoCard.css';

function formatViews(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function timeAgo(date) {
  const d = new Date(date);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} days ago`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo} months ago`;
  return `${Math.floor(mo / 12)} years ago`;
}

export function VideoCard({ video }) {
  console.log(video);
  const ch = video.channelName || video.channel?.channelName || 'Channel';
  const avatar =
    video.uploader?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ch)}`;

  return (
    <article className="yt-card">
      <Link to={`/watch/${video.id}`} className="yt-card__thumb-wrap">
        <img src={video.thumbnailUrl} alt="" className="yt-card__thumb" loading="lazy" />
        {video.isLive ? (
          <span className="yt-card__badge yt-card__badge--live">LIVE</span>
        ) : (
          <span className="yt-card__duration">{video.duration}</span>
        )}
      </Link>
      <div className="yt-card__meta">
        <img src={avatar} alt="" className="yt-card__avatar" width={36} height={36} />
        <div className="yt-card__text">
          <Link to={`/watch/${video.id}`} className="yt-card__title">
            {video.title}
          </Link>
          <div className="yt-card__sub">
            {video.channel?.id ? (
              <Link to={`/channel/${video.channel.id}`} className="yt-card__channel-link">
                {ch}
              </Link>
            ) : (
              ch
            )}
            <span className="yt-card__check" title="Verified" aria-hidden>
              ✓
            </span>
          </div>
          <div className="yt-card__stats">
            {video.isLive ? (
              <span>{video.liveWatchers ?? 0} watching</span>
            ) : (
              <>
                {formatViews(video.views)} · {timeAgo(video.uploadDate)}
              </>
            )}
          </div>
        </div>
        <button type="button" className="yt-card__menu" aria-label="More">
          ⋮
        </button>
      </div>
    </article>
  );
}
