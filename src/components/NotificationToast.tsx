/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RealtimeNotification } from '../types';
import { ShoppingBag, Star, MessageSquare, Bell, X, ShieldCheck } from 'lucide-react';

interface NotificationToastProps {
  notifications: RealtimeNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationToast({ notifications, onDismiss, onClearAll }: NotificationToastProps) {
  const getIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'order':
        return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag className="w-4 h-4" /></div>;
      case 'follow':
        return <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Star className="w-4 h-4" /></div>;
      case 'chat':
        return <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><MessageSquare className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Bell className="w-4 h-4" /></div>;
    }
  };

  const getBadgeColor = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'order': return 'bg-emerald-500';
      case 'follow': return 'bg-blue-500';
      case 'chat': return 'bg-indigo-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-zinc-50 rounded-lg text-zinc-700 relative">
            <Bell className="w-4 h-4" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </span>
          <span className="font-sans font-semibold text-zinc-900 text-sm">Notifikasi Real-time</span>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-zinc-400 hover:text-zinc-650 transition-all font-medium"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          <ShieldCheck className="w-8 h-8 text-zinc-350 mx-auto mb-2 stroke-[1.2]" />
          Belum ada notifikasi baru
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                !notif.isRead 
                  ? 'bg-blue-50/20 border-blue-100/55 shadow-sm' 
                  : 'bg-white border-zinc-100'
              }`}
            >
              {getIcon(notif.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="font-semibold text-zinc-900 text-xs truncate max-w-[130px]">{notif.title}</span>
                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-zinc-650 text-xs mt-0.5 leading-relaxed break-words">{notif.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(notif.id)}
                className="text-zinc-350 hover:text-zinc-650 p-1 rounded-lg hover:bg-zinc-50 transition-all self-start"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
