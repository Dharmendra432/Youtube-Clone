import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Sidebar.css';

const subs = [
  { name: 'Code with John', seed: 'john' },
  { name: 'Music Lounge', seed: 'music' },
  { name: 'Tech Daily', seed: 'tech' },
  { name: 'Sports Central', seed: 'sport' },
];

export function Sidebar({ open, onClose }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <aside className={`yt-sidebar ${open ? 'yt-sidebar--expanded' : 'yt-sidebar--mini'}`}>
        <nav className="yt-sidebar__nav">
          <NavLink to="/" className={navClass} end onClick={() => onClose?.()}>
            <HomeIcon />
            <span>Home</span>
          </NavLink>
          <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
            <ShortsIcon />
            <span>Shorts</span>
          </button>
          <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
            <SubIcon />
            <span>Subscriptions</span>
          </button>
        </nav>

        <div className="yt-sidebar__section">
          <div className="yt-sidebar__section-title">Subscriptions</div>
          {subs.map((s) => (
            <div key={s.name} className="yt-sidebar__item yt-sidebar__item--sub">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.seed}`}
                alt=""
                width={24}
                height={24}
                className="yt-sidebar__avatar"
              />
              <span className="yt-sidebar__label">{s.name}</span>
            </div>
          ))}
          <button type="button" className="yt-sidebar__show-more">
            Show more <ChevronDown />
          </button>
        </div>

        {isAuthenticated && (
          <div className="yt-sidebar__section">
            <Link to="/my-channel" className="yt-sidebar__section-title yt-sidebar__section-title--link">
              You <ChevronRight />
            </Link>
            <NavLink to="/my-channel" className={navClass} onClick={() => onClose?.()}>
              <ChannelIcon />
              <span>Your channel</span>
            </NavLink>
            <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
              <HistoryIcon />
              <span>History</span>
            </button>
            <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
              <PlaylistIcon />
              <span>Playlists</span>
            </button>
            <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
              <ClockIcon />
              <span>Watch later</span>
            </button>
            <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
              <LikeIcon />
              <span>Liked videos</span>
            </button>
          </div>
        )}

        <div className="yt-sidebar__section">
          <div className="yt-sidebar__section-title">Explore</div>
          <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
            <BagIcon />
            <span>Shopping</span>
          </button>
          <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
            <MusicNoteIcon />
            <span>Music</span>
          </button>
          <button type="button" className="yt-sidebar__item yt-sidebar__item--btn">
            <FilmIcon />
            <span>Movies</span>
          </button>
        </div>
      </aside>
      {open && <button type="button" className="yt-sidebar__overlay" aria-label="Close menu" onClick={onClose} />}
    </>
  );
}

function navClass({ isActive }) {
  return `yt-sidebar__item ${isActive ? 'yt-sidebar__item--active' : ''}`;
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function ShortsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 8l6 4-6 4V8zm8-4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function SubIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  );
}

function ChannelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}

function PlaylistIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4h-4V9h4V5h2v4h4v2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l2.86-6.82c.09-.23.14-.47.14-.73v-2z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
