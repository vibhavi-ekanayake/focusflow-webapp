import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { LogIn, Lock, KeyRound } from 'lucide-react';

const JoinRoomModal = ({ isOpen, onClose, onRoomJoined, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [passcode, setPasscode] = useState('');
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!code.trim()) {
      setErrorMessage('Please enter the study room code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/rooms/join', {
        code: code.trim().toUpperCase(),
        passcode: passcode.trim() || undefined
      });

      if (res.data?.success) {
        addToast(`Joined "${res.data.room.name}" successfully!`, 'success');
        onRoomJoined(res.data.room);
        onClose();
        setCode('');
        setPasscode('');
        setNeedsPasscode(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join room';
      if (err.response?.data?.requiresPasscode) {
        setNeedsPasscode(true);
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Study Room" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <Input
          label="Study Room Code"
          placeholder="e.g. STUDY-9A4F-2B1C"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErrorMessage('');
          }}
          icon={KeyRound}
          helperText="Ask your study buddy or room host for their 8-character invite code."
          required
          autoFocus
        />

        {needsPasscode && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Passcode Required</span>
            </div>
            <Input
              label="Room Passcode"
              type="password"
              placeholder="Enter the secret room passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={LogIn} isLoading={isSubmitting}>
            Join Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;
