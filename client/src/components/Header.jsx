import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

export function Header({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [q, setQ] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQ(p.get('search') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    const next = new URLSearchParams(location.search);
    if (term) next.set('search', term);
    else next.delete('search');
    const qs = next.toString();
    navigate(qs ? `/?${qs}` : '/');
  }

  return (
    <header className="yt-header">
      <div className="yt-header__left">
        <button type="button" className="yt-icon-btn" aria-label="Menu" onClick={onMenuClick}>
          <MenuIcon />
        </button>
        <Link to="/" className="yt-logo" aria-label="Home">
          <span className="yt-logo__play" />
          <span className="yt-logo__text">YouTube</span>
          <sup className="yt-logo__region">IN</sup>
        </Link>
      </div>

      <form className="yt-search" onSubmit={onSearch}>
        <input
          className="yt-search__input"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
        <button type="submit" className="yt-search__btn" aria-label="Search">
          <SearchIcon />
        </button>
        <button type="button" className="yt-search__mic" aria-label="Voice search">
          <MicIcon />
        </button>
      </form>

      <div className="yt-header__right">
        <button type="button" className="yt-icon-btn yt-hide-mobile" aria-label="Create">
          <PlusIcon />
        </button>
        {isAuthenticated ? (
          <>
            <button type="button" className="yt-icon-btn yt-hide-mobile" aria-label="Notifications">
              <BellIcon />
              <span className="yt-badge">9+</span>
            </button>
            <div
              className="yt-profile-wrap"
              ref={profileRef}
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
            >
              <button
                type="button"
                className="yt-profile-trigger"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
              >
                <img src={user?.avatar} alt="" className="yt-avatar" width={32} height={32} />
                <span className="yt-username yt-hide-mobile">{user?.username}</span>
                <span className="yt-profile-arrow">▾</span>
              </button>
              <div className={`yt-profile-menu ${profileMenuOpen ? 'yt-profile-menu--open' : ''}`}>
                <div className="yt-profile-menu__header">
                  <img src={user?.avatar} alt="" className="yt-profile-menu__avatar" width={40} height={40} />
                  <div>
                    <p className="yt-profile-menu__name">{user?.username}</p>
                    <p className="yt-profile-menu__email">{user?.email}</p>
                  </div>
                </div>
                <div className="yt-profile-menu__divider" />
                <button
                  type="button"
                  className="yt-profile-menu__item"
                  onClick={() => {
                    logout();
                    setProfileMenuOpen(false);
                    navigate('/', { replace: true });
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link to="/login" className="yt-signin">
            <UserIcon />
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
