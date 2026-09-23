import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Timer,
  History,
  BarChart3,
  Target,
  User,
  Settings,
  LogOut,
  Clock,
  Sun,
  Moon,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Focus Timer', path: '/timer', icon: Timer },
  { label: 'Study Rooms', path: '/rooms', icon: Users },
  { label: 'Study Sessions', path: '/sessions', icon: History },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 ios-glass border-r border-slate-200/80 dark:border-white/10 select-none z-30 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100/80 dark:border-white/5">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-ios group-hover:scale-105 active:scale-95 transition-all duration-300">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Focus<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
            <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-400 -mt-1">
              Study Hub
            </span>
          </div>
        </NavLink>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 active:scale-90 transition-all duration-200"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-ios shadow-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 uppercase text-xs shadow-inner">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Student'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'student@school.edu'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
