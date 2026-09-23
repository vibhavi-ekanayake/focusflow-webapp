import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const SessionFilter = ({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  subjectsList = [],
  onClearFilters
}) => {
  const hasActiveFilters = !!searchQuery || (selectedSubject && selectedSubject !== 'All') || !!startDate || !!endDate;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search input */}
        <div>
          <Input
            icon={Search}
            placeholder="Search notes or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Subject selector */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              <option value="All">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              title="From date"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              title="To date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Active filters applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-rose-500"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionFilter;
