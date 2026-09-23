import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoomTimerWidget from '../components/rooms/RoomTimerWidget';
import RoomMembersList from '../components/rooms/RoomMembersList';
import RoomChat from '../components/rooms/RoomChat';
import JoinRoomModal from '../components/rooms/JoinRoomModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import {
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Crown,
  Share2,
  LogOut,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const RoomDetailPage = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsJoinModal, setNeedsJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const pollIntervalRef = useRef(null);

  const fetchRoomDetails = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.get(`/rooms/${code}`);
      if (res.data?.success) {
        setRoom(res.data.room);
        setIsHost(res.data.isHost);
        setNeedsJoinModal(false);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresJoin) {
        setNeedsJoinModal(true);
      } else {
        addToast(err.response?.data?.message || 'Failed to load study room', 'error');
        navigate('/rooms');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [code, addToast, navigate]);

  useEffect(() => {
    fetchRoomDetails();

    // Poll room data every 3.5 seconds to synchronize timer, statuses, and chat
    pollIntervalRef.current = setInterval(() => {
      fetchRoomDetails(true);
    }, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchRoomDetails]);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    addToast(`Room code ${room.code} copied!`, 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!room?.code) return;
    const inviteLink = `${window.location.origin}/rooms/${room.code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    addToast('Direct room link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/rooms/${code}/status`, {
        status: newStatus,
        currentSubject: room?.subject
      });
      if (res.data?.success) {
        setRoom((prev) => ({ ...prev, members: res.data.members }));
        addToast(`Your status updated to ${newStatus}`, 'info', 2000);
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleSendMessage = async (text) => {
    try {
      const res = await api.post(`/rooms/${code}/messages`, { text });
      if (res.data?.success) {
        setRoom((prev) => ({ ...prev, messages: res.data.messages }));
      }
    } catch (err) {
      addToast('Failed to send message', 'error');
    }
  };

  const handleTimerUpdated = (newTimer) => {
    setRoom((prev) => ({ ...prev, timer: newTimer }));
  };

  const handleSavePersonalSession = async (seconds) => {
    try {
      const res = await api.post('/sessions', {
        subject: room?.subject || 'Group Study',
        duration: seconds,
        startedAt: new Date(Date.now() - seconds * 1000),
        completedAt: new Date(),
        notes: `Study Room Session: ${room?.name}`
      });
      if (res.data?.success) {
        addToast(`Logged ${Math.round(seconds / 60)} minutes to your personal study history!`, 'success');
        window.dispatchEvent(new Event('study-session-updated'));
      }
    } catch (err) {
      addToast('Failed to save study session', 'error');
    }
  };

  const handleLeaveRoom = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.post(`/rooms/${code}/leave`);
      if (res.data?.success) {
        addToast('Left study room', 'info');
        navigate('/rooms');
      }
    } catch (err) {
      addToast('Failed to leave room', 'error');
    } finally {
      setIsActionLoading(false);
      setLeaveConfirmOpen(false);
    }
  };

  const handleDeleteRoom = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.delete(`/rooms/${code}`);
      if (res.data?.success) {
        addToast('Study room closed', 'info');
        navigate('/rooms');
      }
    } catch (err) {
      addToast('Failed to delete room', 'error');
    } finally {
      setIsActionLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const res = await api.post(`/rooms/${code}/regenerate-code`);
      if (res.data?.success) {
        addToast(`New code generated: ${res.data.code}`, 'success');
        navigate(`/rooms/${res.data.code}`, { replace: true });
      }
    } catch (err) {
      addToast('Failed to regenerate code', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Entering secure study room...</p>
      </div>
    );
  }

  const currentMember = room?.members?.find((m) => m.user === user?.id || m.user === user?._id);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/rooms"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 transition-colors"
            title="Back to all rooms"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {room?.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {room?.subject}
              </span>
              {room?.isPasswordProtected && (
                <span title="Passcode Protected" className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            {room?.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {room.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Invite Sharing */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click Code Copy */}
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Copy room code"
          >
            <span>{room?.code}</span>
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
          </button>

          {/* Share Link Button */}
          <Button
            variant="outline"
            size="sm"
            icon={copiedLink ? Check : Share2}
            onClick={handleCopyLink}
          >
            {copiedLink ? 'Link Copied' : 'Share Link'}
          </Button>

          {/* Host Controls */}
          {isHost ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRegenerateCode}
                title="Regenerate invite code if leaked"
                className="text-xs"
              >
                Regen Code
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Close Room
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={() => setLeaveConfirmOpen(true)}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Leave Room
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center: Synchronized Room Timer */}
        <div className="lg:col-span-7">
          <RoomTimerWidget
            roomCode={code}
            timer={room?.timer || {}}
            isHost={isHost}
            subject={room?.subject}
            onTimerUpdated={handleTimerUpdated}
            onSavePersonalSession={handleSavePersonalSession}
          />
        </div>

        {/* Right: Active Buddies & Real-Time Chat Wall */}
        <div className="lg:col-span-5 space-y-6">
          <RoomMembersList
            members={room?.members || []}
            hostId={room?.host}
            currentMemberStatus={currentMember?.status || 'idle'}
            onStatusChange={handleStatusChange}
          />

          <RoomChat
            messages={room?.messages || []}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Modal for Joining if accessed without membership */}
      <JoinRoomModal
        isOpen={needsJoinModal}
        onClose={() => navigate('/rooms')}
        initialCode={code}
        onRoomJoined={(joinedRoom) => {
          setRoom(joinedRoom);
          setNeedsJoinModal(false);
          setIsHost(joinedRoom.host === user?.id || joinedRoom.host === user?._id);
        }}
      />

      {/* Confirm Leave Dialog */}
      <ConfirmDialog
        isOpen={leaveConfirmOpen}
        onClose={() => setLeaveConfirmOpen(false)}
        onConfirm={handleLeaveRoom}
        title="Leave Study Room?"
        message="Are you sure you want to leave this study session? You can rejoin anytime using the room code."
        confirmText="Leave Room"
        isLoading={isActionLoading}
      />

      {/* Confirm Delete / Close Room Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteRoom}
        title="Close Study Room?"
        message="Are you sure you want to permanently close and delete this study room for all members?"
        confirmText="Close & Delete"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default RoomDetailPage;
