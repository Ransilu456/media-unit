'use client';

import { useState } from 'react';
import { Bell, CheckCheck, FileText, School, Trash2, X } from 'lucide-react';
import { useMediaStore, type DashboardNotification } from '@/lib/store';

function NotificationIcon({ kind }: { kind: DashboardNotification['kind'] }) {
  if (kind === 'registration') return <School size={16} />;
  if (kind === 'submission') return <FileText size={16} />;
  return <CheckCheck size={16} />;
}

export function DashboardNotifications() {
  const { notifications, markNotificationsRead, clearNotifications } = useMediaStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const toggleNotifications = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) markNotificationsRead();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleNotifications}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              <p className="text-[11px] text-slate-500">Important portal activity</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          {notifications.length > 0 ? (
            <>
              <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex gap-3 px-4 py-3 ${notification.read ? 'bg-white' : 'bg-amber-50/60'}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <NotificationIcon kind={notification.kind} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-600">
                        {notification.message}
                      </p>
                      <time
                        className="mt-1 block text-[10px] text-slate-400"
                        dateTime={new Date(notification.createdAt).toISOString()}
                      >
                        {new Intl.DateTimeFormat('en', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(notification.createdAt)}
                      </time>
                    </div>
                    {!notification.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-label="Unread" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-4 py-2">
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-rose-700"
                >
                  <Trash2 size={13} />
                  Clear notifications
                </button>
              </div>
            </>
          ) : (
            <p className="px-4 py-8 text-center text-xs text-slate-500">
              You’re all caught up. Important updates will appear here.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
