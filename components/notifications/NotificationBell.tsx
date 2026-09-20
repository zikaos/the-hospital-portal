'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { getMyNotifications, markNotificationRead } from '@/lib/api';
import { Notification } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter((item) => !item.is_read)) {
      await markNotificationRead(n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-[6px] text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F4F4F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0671B8]/30"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-[#0671B8] ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[8px] border border-[#E8E8EC] bg-white shadow-lg z-50 overflow-hidden animate-in fade-in duration-100">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8E8EC] bg-[#FAFAFA]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] text-[#0A0A0A]">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#0671B8]/12 text-[#0671B8] text-[11px] px-2 py-0.5 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[12px] text-[#0671B8] hover:underline font-medium flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E8EC]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#9C9C9C]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                    !n.is_read ? 'bg-[#FAFAFA] hover:bg-[#F4F4F6]' : 'hover:bg-[#F4F4F6]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${!n.is_read ? 'font-medium text-[#0A0A0A]' : 'text-[#6B6B6B]'}`}>
                      {n.message}
                    </p>
                    <span className="text-[11px] text-[#9C9C9C] mt-1 block">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="p-1 rounded text-[#0671B8] hover:bg-[#0671B8]/10 flex-shrink-0 transition-colors"
                      aria-label="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
