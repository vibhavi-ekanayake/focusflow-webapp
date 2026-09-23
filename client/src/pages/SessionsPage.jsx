import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import SessionFilter from '../components/sessions/SessionFilter';
import SessionTable from '../components/sessions/SessionTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { History, Plus, RefreshCw, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [distinctSubjects, setDistinctSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchSessions = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page: pageToLoad,
          limit: 10
        };

        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (selectedSubject && selectedSubject !== 'All') params.subject = selectedSubject;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await api.get('/sessions', { params });
        if (res.data?.success) {
          setSessions(res.data.sessions || []);
          setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
          if (res.data.distinctSubjects) {
            setDistinctSubjects(res.data.distinctSubjects);
          }
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        addToast('Failed to load study sessions', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedSubject, startDate, endDate, addToast]
  );

  useEffect(() => {
    // Debounce search/filter calls slightly
    const timer = setTimeout(() => {
      fetchSessions(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchSessions]);

  const handleDeleteSession = async (sessionId) => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/sessions/${sessionId}`);
      if (res.data?.success) {
        addToast('Study session deleted', 'success');
        // Notify any active dashboards
        window.dispatchEvent(new Event('study-session-updated'));
        fetchSessions(pagination.page);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete session';
      addToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Study History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, search, and manage your completed focus blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchSessions(pagination.page)}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/timer')}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <SessionFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        subjectsList={distinctSubjects}
        onClearFilters={handleClearFilters}
      />

      {/* Sessions Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 mt-2">Loading session records...</p>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No study sessions found"
          description={
            searchQuery || selectedSubject !== 'All' || startDate || endDate
              ? 'No sessions match your active filters. Try adjusting your search criteria.'
              : 'You have not recorded any study sessions yet. Start your first session now!'
          }
          actionText={
            searchQuery || selectedSubject !== 'All' || startDate || endDate
              ? 'Clear Filters'
              : 'Start a Focus Session'
          }
          onAction={
            searchQuery || selectedSubject !== 'All' || startDate || endDate
              ? handleClearFilters
              : () => navigate('/timer')
          }
        />
      ) : (
        <SessionTable
          sessions={sessions}
          pagination={pagination}
          onPageChange={(newPage) => fetchSessions(newPage)}
          onDeleteSession={handleDeleteSession}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default SessionsPage;
