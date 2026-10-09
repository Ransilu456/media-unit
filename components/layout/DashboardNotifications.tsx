'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock3,
  FileText,
  School,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { useMediaStore, type DashboardNotification } from '@/lib/store';

function getNotificationConfig(notification: DashboardNotification) {
  const title = (notification.title || '').toLowerCase();
  const msg = (notification.message || '').toLowerCase();
  const kind = notification.kind;
  const status = notification.status;

  if (
    kind === 'disqualification' ||
    status === 'disqualified' ||
    title.includes('disqualif') ||
    msg.includes('disqualif')
  ) {
    return {
      Icon: AlertTriangle,
      badgeLabel: 'Disqualified · Slot Reopened',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBoxClass: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
      unreadBg: 'bg-rose-50/70',
      dotColor: 'bg-rose-600',
    };
  }

  if (
    status === 'verified' ||
    title.includes('accepted') ||
    msg.includes('accepted') ||
    msg.includes('verified')
  ) {
    return {
      Icon: CheckCircle2,
      badgeLabel: 'Accepted',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBoxClass: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
      unreadBg: 'bg-emerald-50/70',
      dotColor: 'bg-emerald-600',
    };
  }

  if (
    status === 'winner' ||
    status === 'shortlisted' ||
    title.includes('finalist') ||
    title.includes('winner') ||
    msg.includes('winner') ||
    msg.includes('finalist')
  ) {
    return {
      Icon: Trophy,
      badgeLabel: status === 'winner' || title.includes('winner') ? 'Winner' : 'Finalist',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      iconBoxClass: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
      unreadBg: 'bg-amber-50/70',
      dotColor: 'bg-amber-600',
    };
  }

  if (
    status === 'under_review' ||
    title.includes('under review') ||
    msg.includes('under review')
  ) {
    return {
      Icon: Clock3,
      badgeLabel: 'Under Review',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      iconBoxClass: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
      unreadBg: 'bg-blue-50/70',
      dotColor: 'bg-blue-600',
    };
  }

  if (kind === 'submission' || title.includes('submission') || msg.includes('submitted')) {
    return {
      Icon: FileText,
      badgeLabel: 'Submission',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      iconBoxClass: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
      unreadBg: 'bg-sky-50/70',
      dotColor: 'bg-sky-600',
    };
  }

  if (kind === 'registration' || title.includes('registration') || msg.includes('registered')) {
    return {
      Icon: School,
      badgeLabel: 'Delegation',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      iconBoxClass: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
      unreadBg: 'bg-purple-50/70',
      dotColor: 'bg-purple-600',
    };
  }

  return {
    Icon: CheckCheck,
    badgeLabel: 'Portal Update',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    iconBoxClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    unreadBg: 'bg-amber-50/60',
    dotColor: 'bg-amber-500',
  };
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat('en', { dateStyle: 'short' }).format(timestamp);
}

export function DashboardNotifications() {
  const { notifications, markNotificationsRead, clearNotifications } = useMediaStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const hasDisqualifiedUnread = useMemo(
    () =>
      notifications.some(
        (n) =>
          !n.read &&
          (n.kind === 'disqualification' ||
            n.status === 'disqualified' ||
            n.title.toLowerCase().includes('disqualif') ||
            n.message.toLowerCase().includes('disqualif'))
      ),
    [notifications]
  );

  const toggleNotifications = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleNotifications}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
          unreadCount > 0
            ? hasDisqualifiedUnread
              ? 'border-rose-300 bg-rose-50/50 text-rose-700 hover:bg-rose-100/70'
              : 'border-amber-300 bg-amber-50/50 text-amber-700 hover:bg-amber-100/70'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-xs ${
              hasDisqualifiedUnread ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markNotificationsRead}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sub-filter tabs */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'unread'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List */}
          {displayedNotifications.length > 0 ? (
            <>
              <ul className="max-h-[26rem] divide-y divide-slate-100 overflow-y-auto">
                {displayedNotifications.map((notification) => {
                  const config = getNotificationConfig(notification);
                  const Icon = config.Icon;

                  return (
                    <li
                      key={notification.id}
                      className={`flex gap-3 px-4 py-3.5 transition-colors ${
                        notification.read ? 'bg-white hover:bg-slate-50/50' : config.unreadBg
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs ${config.iconBoxClass}`}
                      >
                        <Icon size={16} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${config.badgeClass}`}
                          >
                            {config.badgeLabel}
                          </span>
                          <time
                            className="text-[10px] text-slate-400 font-medium shrink-0"
                            title={new Intl.DateTimeFormat('en', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(notification.createdAt)}
                          >
                            {formatRelativeTime(notification.createdAt)}
                          </time>
                        </div>

                        <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                        <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-600">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.read && (
                        <span
                          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${config.dotColor}`}
                          aria-label="Unread"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2">
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-rose-700 transition-colors"
                >
                  <Trash2 size={13} />
                  Clear all
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={18} />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {filter === 'unread'
                  ? 'All notifications have been reviewed.'
                  : 'Important competition submissions and jury decisions will appear here.'}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
