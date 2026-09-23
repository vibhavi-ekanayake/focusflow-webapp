import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { User, Mail, Calendar, Clock, Flame, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'avatar-1', label: 'Indigo Spark', color: 'from-indigo-600 to-violet-500' },
  { id: 'avatar-2', label: 'Emerald Mint', color: 'from-emerald-500 to-teal-400' },
  { id: 'avatar-3', label: 'Amber Flame', color: 'from-amber-500 to-orange-500' },
  { id: 'avatar-4', label: 'Rose Bloom', color: 'from-rose-500 to-pink-500' },
  { id: 'avatar-5', label: 'Sky Azure', color: 'from-sky-500 to-blue-600' },
  { id: 'avatar-6', label: 'Purple Gem', color: 'from-purple-600 to-indigo-600' }
];

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [profileStats, setProfileStats] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data?.success) {
          setProfileStats(res.data.user.stats);
          setName(res.data.user.name);
          setSelectedAvatar(res.data.user.avatar || 'avatar-1');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdateNameAndAvatar = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    await updateUserProfile({
      name: name.trim(),
      avatar: selectedAvatar
    });
    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.put('/users/profile', {
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        addToast('Password changed successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPasswordError(msg);
      addToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading profile...</p>
      </div>
    );
  }

  const currentAvatarConfig = AVATAR_PRESETS.find((a) => a.id === selectedAvatar) || AVATAR_PRESETS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, avatar, credentials, and achievements.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar representation */}
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentAvatarConfig.color} flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <span className="text-xs uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Study Hours</span>
            </span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {profileStats?.totalStudyHours || 0}h
            </p>
          </div>

          <div className="text-center">
            <span className="text-xs uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Current Streak</span>
            </span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">
              {profileStats?.currentStreak || 0}d
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details & Avatar Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your display name and customize your avatar.
            </p>
          </div>

          <form onSubmit={handleUpdateNameAndAvatar} className="space-y-5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              icon={User}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Choose Avatar Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      selectedAvatar === avatar.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${avatar.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                    >
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[70px]">
                      {avatar.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={CheckCircle2}
                isLoading={isUpdatingProfile}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Security & Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Change your password to keep your account secure.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              icon={Lock}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="outline"
                size="md"
                icon={ShieldCheck}
                isLoading={isChangingPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
