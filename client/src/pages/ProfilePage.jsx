import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserAvatar from '../components/common/UserAvatar';
import { formatDate } from '../utils/formatters';
import {
  User,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'avatar-1', label: 'Indigo Spark', color: 'from-indigo-600 to-violet-500' },
  { id: 'avatar-2', label: 'Emerald Mint', color: 'from-emerald-500 to-teal-400' },
  { id: 'avatar-3', label: 'Amber Flame', color: 'from-amber-500 to-orange-500' },
  { id: 'avatar-4', label: 'Rose Bloom', color: 'from-rose-500 to-pink-500' },
  { id: 'avatar-5', label: 'Sky Azure', color: 'from-sky-500 to-blue-600' },
  { id: 'avatar-6', label: 'Purple Gem', color: 'from-purple-600 to-indigo-600' }
];

// Helper: compress image file client-side to square 300x300 JPEG data URL
const compressImage = (file, size = 300) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [profileStats, setProfileStats] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, or WebP)', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file, 300);
      setSelectedAvatar(compressedDataUrl);
      addToast('Photo loaded! Click "Save Profile" to apply changes.', 'info');
    } catch (err) {
      console.error('Failed to process image:', err);
      addToast('Failed to process image. Please try a different photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomPhoto = () => {
    setSelectedAvatar('avatar-1');
    addToast('Reverted to default avatar theme. Click "Save Profile" to save.', 'info');
  };

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

  const isCustomPhoto =
    selectedAvatar &&
    (selectedAvatar.startsWith('data:image/') ||
      selectedAvatar.startsWith('http://') ||
      selectedAvatar.startsWith('https://'));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, custom photo, credentials, and achievements.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-[32px] ios-card shadow-ios border border-white/40 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar representation with live photo preview */}
          <div className="relative group">
            <UserAvatar avatar={selectedAvatar} name={name} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all ios-press"
              title="Upload new profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {name || user?.name}
              </h2>
              {isCustomPhoto && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Custom Photo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 justify-center sm:justify-start">
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
        <div className="p-6 sm:p-8 rounded-[32px] ios-card shadow-ios border border-white/40 dark:border-white/10 space-y-6 backdrop-blur-xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Information & Photo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your display name, upload a personal photo, or select an avatar theme.
            </p>
          </div>

          <form onSubmit={handleUpdateNameAndAvatar} className="space-y-6">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              icon={User}
              required
            />

            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Profile Photo
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={selectedAvatar} name={name} size="lg" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {isCustomPhoto ? 'Custom Photo Active' : 'Preset Avatar Active'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Recommended: Square JPG, PNG, or WebP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploadingPhoto}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    Upload Photo
                  </Button>

                  {isCustomPhoto && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomPhoto}
                      title="Remove custom photo"
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ios-press"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preset Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Or Select Preset Gradient
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {AVATAR_PRESETS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ios-press ${
                      selectedAvatar === avatar.id
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-600/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${avatar.color} flex items-center justify-center text-white text-xs font-extrabold shadow-sm`}
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
                className="shadow-md shadow-indigo-500/20"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-[32px] ios-card shadow-ios border border-white/40 dark:border-white/10 space-y-6 backdrop-blur-xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Security & Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ensure your account is using a long, secure passphrase.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Input
              type="password"
              label="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
              error={passwordError}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="outline"
                size="md"
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
