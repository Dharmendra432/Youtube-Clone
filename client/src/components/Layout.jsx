import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import './Layout.css';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="app-shell">
      <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="app-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className={`main-area ${sidebarOpen ? 'main-area--with-sidebar' : 'main-area--sidebar-narrow'}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
