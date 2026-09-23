import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PRESETS = [
  { label: '25m', minutes: 25, title: 'Pomodoro' },
  { label: '50m', minutes: 50, title: 'Deep Work' },
  { label: '90m', minutes: 90, title: 'Extended' }
];

const TimerPresets = ({
  currentDuration,
  onSelectPreset,
  disabled = false,
  className = ''
}) => {
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('45');
  const [customError, setCustomError] = useState('');

  const currentMinutes = Math.round(currentDuration / 60);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (isNaN(val) || val < 1 || val > 180) {
      setCustomError('Please enter a duration between 1 and 180 minutes');
      return;
    }
    setCustomError('');
    onSelectPreset(val * 60);
    setCustomModalOpen(false);
  };

  const isPresetActive = (mins) => currentMinutes === mins;
  const isCustomActive = !PRESETS.some((p) => p.minutes === currentMinutes);

  return (
    <div className={`flex items-center justify-center gap-2 select-none ${className}`}>
      {PRESETS.map((p) => {
        const active = isPresetActive(p.minutes);
        return (
          <button
            key={p.minutes}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(p.minutes * 60)}
            title={p.title}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              active
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 ring-2 ring-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {p.label}
          </button>
        );
      })}

      {/* Custom Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setCustomModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          isCustomActive
            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>{isCustomActive ? `${currentMinutes}m` : 'Custom'}</span>
      </button>

      {/* Custom Duration Modal */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="Custom Timer Duration"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <Input
            label="Duration in minutes"
            type="number"
            min="1"
            max="180"
            value={customMinutes}
            onChange={(e) => {
              setCustomMinutes(e.target.value);
              setCustomError('');
            }}
            error={customError}
            helperText="Choose any duration from 1 to 180 minutes."
            autoFocus
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCustomModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Set Duration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TimerPresets;
