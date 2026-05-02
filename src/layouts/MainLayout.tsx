import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Users, StickyNote, Settings, Menu, X, Moon, Sun } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const navItems = [
    { path: '/', label: 'Accueil', icon: <Home size={24} /> },
    { path: '/carte', label: 'Carte & Addition', icon: <ClipboardList size={24} /> },
    { path: '/clients', label: 'Clients', icon: <Users size={24} /> },
    { path: '/notes', label: 'Nouvelles Notes', icon: <StickyNote size={24} /> },
    { path: '/settings', label: 'Paramètres', icon: <Settings size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-rose-poudre dark:bg-slate-950 flex-col md:flex-row overflow-hidden transition-colors duration-300">
      {/* Sidebar - Desktop only */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-vert-foret dark:bg-slate-900 text-rose-poudre transition-all duration-300 ease-in-out hidden md:flex flex-col h-full`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && <span className="font-serif text-xl font-bold">Le Pescalune</span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-vert-olive dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 mt-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-vert-olive dark:bg-slate-800 text-white' 
                        : 'hover:bg-vert-sauge/20 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="min-w-[24px]">{item.icon}</span>
                    {isSidebarOpen && <span className="ml-4">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle Desktop */}
        <div className="p-4 border-t border-vert-olive/30 dark:border-slate-800">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center w-full p-3 rounded-lg hover:bg-vert-olive/30 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-300" />}
            {isSidebarOpen && <span className="ml-4">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
          </button>
        </div>
      </aside>

      {/* Bottom Nav - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-vert-foret dark:bg-slate-900 text-rose-poudre z-50 border-t border-vert-olive dark:border-slate-800">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="flex-1">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center h-full transition-colors ${
                    isActive ? 'text-white' : 'text-rose-poudre/60'
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                  <span className="text-[10px] mt-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex flex-col items-center justify-center w-full h-full text-rose-poudre/60"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-300" />}
              <span className="text-[10px] mt-1">Thème</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
