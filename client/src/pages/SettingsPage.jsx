import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  CheckCircle2,
  Trash2,
  ShieldAlert
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUserSettings, logout } = useAuth();
  const { theme, setThemeMode } = useTheme();
  const { addToast } = useToast();

  const userSettings = user?.settings || {};

  const [defaultFocusDuration, setDefaultFocusDuration] = useState(
    userSettings.defaultFocusDuration || 25
  );
  const [defaultBreakDuration, setDefaultBreakDuration] = useState(
    userSettings.defaultBreakDuration || 5
  );
  const [soundEnabled, setSoundEnabled] = useState(
    userSettings.soundEnabled !== false
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    !!userSettings.autoStartBreaks
  );
  const [emailNotifications, setEmailNotifications] = useState(
    !!userSettings.emailNotifications
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserSettings({
      defaultFocusDuration: Number(defaultFocusDuration),
      defaultBreakDuration: Number(defaultBreakDuration),
      soundEnabled,
      autoStartBreaks,
      emailNotifications
    });
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your study workflow, timer presets, themes, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Theme Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Appearance & Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select how FocusFlow looks on your device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                <p className="text-[11px] text-slate-400">Clean & crisp</p>
              </div>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[11px] text-slate-400">Easy on the eyes</p>
              </div>
            </button>

            {/* System */}
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3 transition-all"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">System Sync</p>
                <p className="text-[11px] text-slate-400">Match device settings</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Timer Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Timer Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set default study and break session lengths.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <Input
              label="Default Focus Duration (Minutes)"
              type="number"
              min="1"
              max="180"
              value={defaultFocusDuration}
              onChange={(e) => setDefaultFocusDuration(e.target.value)}
              helperText="Common presets: 25, 45, 50, or 90 minutes."
              required
            />

            <Input
              label="Default Break Duration (Minutes)"
              type="number"
              min="1"
              max="60"
              value={defaultBreakDuration}
              onChange={(e) => setDefaultBreakDuration(e.target.value)}
              helperText="Common presets: 5, 10, or 15 minutes."
              required
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Sound notification toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Sound Notification Chime
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Play a gentle audio chime when sessions and breaks finish
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            {/* Auto start breaks toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Auto-Start Break Timer
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically trigger break countdown when a focus block concludes
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Notification Preferences */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage study reminders and email reports.
            </p>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Weekly Progress Summaries
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive email digest of your study time, subject breakdowns, and streaks
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Save Settings Action Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={CheckCircle2}
            isLoading={isSaving}
            className="px-8 shadow-md"
          >
            Save All Settings
          </Button>
        </div>
      </form>

      {/* 4. Danger Zone */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold">Account Session & Security</h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          You can securely end your authenticated session on this computer at any time.
        </p>

        <div className="pt-2 flex justify-start">
          <Button
            variant="danger"
            size="sm"
            onClick={logout}
          >
            Log Out of Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
