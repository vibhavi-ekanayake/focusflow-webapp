import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import DynamicIsland from '../common/DynamicIsland';
import AmbientSoundscapes from '../common/AmbientSoundscapes';
import Confetti from '../common/Confetti';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Floating Dynamic Island for active background sessions */}
      <DynamicIsland />

      {/* Global celebratory confetti canvas */}
      <Confetti />

      {/* Floating Ambient Soundscapes mixer widget */}
      <AmbientSoundscapes />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header & Bottom Dock */}
      <MobileNav />

      {/* Main Page Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
