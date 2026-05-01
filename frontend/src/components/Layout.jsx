import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const syncTheme = () => {
      const theme = localStorage.getItem('theme');
      setIsDark(theme === 'dark');
    };
    window.addEventListener('themeChanged', syncTheme);
    return () => window.removeEventListener('themeChanged', syncTheme);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const isActive = (path) => location.pathname.startsWith(path);
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex transition-colors duration-300">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-scrim/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* SideNavBar Component */}
      <nav className={`h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/30 bg-surface flex flex-col py-8 space-y-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="px-8 mb-4">
          <span className="font-headline text-2xl font-bold text-primary">Sahara</span>
          <p className="text-xs text-on-surface-variant mt-1 font-body">Premium Management</p>
        </div>
        
        <div className="flex-1 flex flex-col space-y-2">
          <Link to="/dashboard" onClick={closeMobileMenu} className={`flex items-center px-8 py-3 hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold ${isActive('/dashboard') ? 'text-primary border-r-4 border-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}>
            <span className="material-symbols-outlined mr-4" style={{"fontVariationSettings": isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0"}}>grid_view</span>
            Dashboard
          </Link>
          <Link to="/projects" onClick={closeMobileMenu} className={`flex items-center px-8 py-3 hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold ${isActive('/projects') ? 'text-primary border-r-4 border-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}>
            <span className="material-symbols-outlined mr-4" style={{"fontVariationSettings": isActive('/projects') ? "'FILL' 1" : "'FILL' 0"}}>layers</span>
            Projects
          </Link>
          <Link to="/team" onClick={closeMobileMenu} className={`flex items-center px-8 py-3 hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold ${isActive('/team') ? 'text-primary border-r-4 border-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}>
            <span className="material-symbols-outlined mr-4" style={{"fontVariationSettings": isActive('/team') ? "'FILL' 1" : "'FILL' 0"}}>group</span>
            Team
          </Link>
          <Link to="/activity" onClick={closeMobileMenu} className={`flex items-center px-8 py-3 hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold ${isActive('/activity') ? 'text-primary border-r-4 border-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}>
            <span className="material-symbols-outlined mr-4" style={{"fontVariationSettings": isActive('/activity') ? "'FILL' 1" : "'FILL' 0"}}>history</span>
            Activity
          </Link>
          <Link to="/settings" onClick={closeMobileMenu} className={`flex items-center px-8 py-3 hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold ${isActive('/settings') ? 'text-primary border-r-4 border-primary bg-primary/10' : 'text-secondary hover:text-primary'}`}>
            <span className="material-symbols-outlined mr-4" style={{"fontVariationSettings": isActive('/settings') ? "'FILL' 1" : "'FILL' 0"}}>settings</span>
            Settings
          </Link>
          
          {/* Theme Toggle inside Sidebar */}
          <button onClick={toggleTheme} className="flex items-center px-8 py-3 text-secondary hover:text-primary hover:translate-x-1 transition-all duration-300 ease-out font-body uppercase tracking-widest text-xs font-bold mt-4">
            <span className="material-symbols-outlined mr-4">{isDark ? 'light_mode' : 'dark_mode'}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="px-8 mt-auto space-y-4">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 text-secondary hover:text-error transition-colors font-body uppercase tracking-widest text-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log Out
          </button>
          
          {user?.role === 'ADMIN' && (
            <Link to="/projects" onClick={closeMobileMenu} className="w-full bg-primary text-on-primary py-3 rounded-lg font-medium hover:bg-on-primary-fixed-variant transition-colors shadow-[0_2px_16px_rgba(58,48,42,0.04)] font-body text-sm flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 relative min-h-screen overflow-y-auto">
        {/* TopAppBar (Mobile Only) */}
        <header className="md:hidden flex justify-between items-center w-full px-8 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-40 transition-colors duration-300">
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">Sahara</span>
          <div className="flex space-x-4">
            <button onClick={toggleTheme} className="text-primary p-2 rounded-full transition-colors duration-300">
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-primary hover:bg-surface-container-highest p-2 rounded-full transition-colors duration-300">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default Layout;
