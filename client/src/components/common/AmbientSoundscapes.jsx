import React, { useState, useEffect } from 'react';
import { Headphones, Volume2, VolumeX, X, Play, Square, Sparkles } from 'lucide-react';
import {
  SOUNDSCAPE_TYPES,
  startSoundscape,
  stopSoundscape,
  setSoundscapeVolume,
  getActiveSoundscape
} from '../../utils/soundscapes';

const AmbientSoundscapes = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [volume, setVolume] = useState(0.4);

  const toggleSound = (typeId) => {
    if (activeSound === typeId) {
      stopSoundscape();
      setActiveSound(null);
    } else {
      startSoundscape(typeId, volume);
      setActiveSound(typeId);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setSoundscapeVolume(val);
  };

  const handleStopAll = () => {
    stopSoundscape();
    setActiveSound(null);
  };

  return (
    <>
      {/* Floating Capsule Launcher Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full ios-glass border border-white/60 dark:border-white/10 shadow-ios hover:shadow-ios-hover active:scale-95 transition-all duration-300 ${
            activeSound
              ? 'ring-2 ring-indigo-500/50 bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-700 dark:text-slate-200'
          }`}
          aria-label="Toggle study soundscapes"
        >
          <Headphones className={`w-4 h-4 ${activeSound ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-semibold hidden sm:inline">
            {activeSound
              ? SOUNDSCAPE_TYPES.find((s) => s.id === activeSound)?.name
              : 'Soundscapes'}
          </span>
          {activeSound && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Expanded iOS Floating Glass Mixer Modal */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-20 right-5 z-50 w-80 rounded-[28px] ios-glass-card bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-white/10 shadow-2xl p-5 backdrop-blur-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ambient Soundscapes
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 mb-3">
            Procedurally synthesized ambient sound designed to drown out distractions.
          </p>

          {/* Sound options */}
          <div className="grid grid-cols-2 gap-2 my-2">
            {SOUNDSCAPE_TYPES.map((sound) => {
              const isPlaying = activeSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isPlaying
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{sound.icon}</span>
                    {isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {sound.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {sound.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                {volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Volume</span>
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {activeSound && (
            <button
              onClick={handleStopAll}
              className="w-full mt-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-rose-600" />
              <span>Stop Ambient Sound</span>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default AmbientSoundscapes;
