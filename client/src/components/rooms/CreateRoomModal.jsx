import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Users, Lock, Shield, Sparkles } from 'lucide-react';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'History',
  'Economics',
  'Psychology',
  'Language Study'
];

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [description, setDescription] = useState('');
  const [requirePasscode, setRequirePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Room name is required', 'error');
      return;
    }

    if (!subject.trim()) {
      addToast('Subject is required', 'error');
      return;
    }

    if (requirePasscode && (!passcode || passcode.trim().length < 4)) {
      addToast('Passcode must be at least 4 characters long', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/rooms', {
        name: name.trim(),
        subject: subject.trim(),
        description: description.trim(),
        passcode: requirePasscode ? passcode.trim() : undefined,
        maxParticipants: parseInt(maxParticipants, 10) || 20
      });

      if (res.data?.success) {
        addToast(`Study room "${res.data.room.name}" created!`, 'success');
        onRoomCreated(res.data.room);
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setPasscode('');
        setRequirePasscode(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create study room';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Study Room" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Room Name"
          placeholder="e.g. Calculus & Linear Algebra Cram"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Mathematics"
            className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            list="create-room-subjects"
            required
          />
          <datalist id="create-room-subjects">
            {COMMON_SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description / Study Goal (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group focusing on? (e.g. Problem set 4, practice finals)"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Security & Access Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">High Security Controls</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer select-none">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Require Passcode to Join
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Only friends who have both the room code and passcode can enter
              </p>
            </div>
            <input
              type="checkbox"
              checked={requirePasscode}
              onChange={(e) => setRequirePasscode(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          {requirePasscode && (
            <div className="pt-2 animate-fadeIn">
              <Input
                label="Room Passcode"
                type="password"
                placeholder="Set 4+ character secret passcode"
                icon={Lock}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                helperText="Passcode will be encrypted using bcrypt on the server."
                required={requirePasscode}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Max Participants: 20 students</span>
          <span className="text-[11px] text-slate-400">Crypto-generated room code</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={Users} isLoading={isSubmitting}>
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;
