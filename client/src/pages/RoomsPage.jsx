import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import JoinRoomModal from '../components/rooms/JoinRoomModal';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Lock,
  Crown,
  BookOpen,
  ArrowRight,
  Shield,
  Search
} from 'lucide-react';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/rooms/my-rooms');
      if (res.data?.success) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to load study rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Room code ${code} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    navigate(`/rooms/${newRoom.code}`);
  };

  const handleRoomJoined = (joinedRoom) => {
    setRooms((prev) => {
      const exists = prev.some((r) => r.code === joinedRoom.code);
      return exists ? prev : [joinedRoom, ...prev];
    });
    navigate(`/rooms/${joinedRoom.code}`);
  };

  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Study Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Study live with classmates, synchronize focus timers, and track study streaks together.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={LogIn}
            onClick={() => setJoinModalOpen(true)}
          >
            Join with Code
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Study Room
          </Button>
        </div>
      </div>

      {/* Security Banner Notice */}
      <div className="p-4 rounded-[22px] ios-card border border-indigo-200/50 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-start gap-3 backdrop-blur-xl">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-sm">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
            Encrypted & Secure Spaces
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            All rooms use 8-character cryptographic invite codes and optional bcrypt-hashed passcodes. Only verified members can view timers, student activity, and chat messages.
          </p>
        </div>
      </div>

      {/* Search Input */}
      {rooms.length > 0 && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search study rooms by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>
      )}

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 mt-2">Loading your study rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No matching study rooms' : 'No Study Rooms Yet'}
          description={
            searchQuery
              ? 'Try searching with a different room name or code.'
              : 'Create a private study room to study with friends, or join an existing session using an invite code.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Create Your First Room'}
          onAction={searchQuery ? () => setSearchQuery('') : () => setCreateModalOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isHost = room.host === user?.id || room.host === user?._id;
            const membersCount = room.members?.length || 1;

            return (
              <div
                key={room._id}
                onClick={() => navigate(`/rooms/${room.code}`)}
                className="p-6 rounded-[28px] ios-card shadow-ios hover:shadow-ios-hover hover:-translate-y-1 transition-all duration-300 ease-spring flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {room.subject}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {room.isPasswordProtected && (
                        <span
                          title="Passcode Protected"
                          className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isHost && (
                        <span
                          title="You are Host"
                          className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {room.name}
                  </h3>

                  {room.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Invite Code with 1-Click Copy */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(room.code, e)}
                      title="Copy room invite code"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <span>{room.code}</span>
                      {copiedCode === room.code ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{membersCount}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-1 text-indigo-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <JoinRoomModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onRoomJoined={handleRoomJoined}
      />
    </div>
  );
};

export default RoomsPage;
