'use client';

import { useState, useEffect } from 'react';
import { userStorage } from '../lib/userStorage';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(userStorage.getCurrentUser());

  useEffect(() => {
    setUser(userStorage.getCurrentUser());
    loadNotifications();
    
    // Simular algumas notificações
    generateSampleNotifications();
  }, []);

  const loadNotifications = () => {
    const stored = localStorage.getItem('anime_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  };

  const saveNotifications = (notifs: Notification[]) => {
    localStorage.setItem('anime_notifications', JSON.stringify(notifs));
    setNotifications(notifs);
  };

  const generateSampleNotifications = () => {
    if (!user) return;

    const sampleNotifications: Notification[] = [
      {
        id: 'welcome',
        type: 'success',
        title: '🎉 Bem-vindo!',
        message: 'Sua conta foi criada com sucesso. Comece explorando nossos animes!',
        timestamp: new Date().toISOString(),
        read: false,
        action: {
          label: 'Explorar',
          href: '/trending'
        }
      },
      {
        id: 'new_episode',
        type: 'info',
        title: '📺 Novo episódio disponível!',
        message: 'Um novo episódio de Attack on Titan foi adicionado à plataforma.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        action: {
          label: 'Assistir',
          href: '/anime/16498'
        }
      },
      {
        id: 'recommendation',
        type: 'info',
        title: '🎯 Nova recomendação',
        message: 'Com base no seu histórico, recomendamos "Demon Slayer".',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];

    const existing = localStorage.getItem('anime_notifications');
    if (!existing) {
      saveNotifications(sampleNotifications);
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(notif => notif.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'ri-check-line';
      case 'info': return 'ri-information-line';
      case 'warning': return 'ri-alert-line';
      case 'error': return 'ri-error-warning-line';
      default: return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-white hover:text-red-500 cursor-pointer"
      >
        <i className="ri-notification-line text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-red-500 hover:text-red-400 text-sm cursor-pointer"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <i className="ri-notification-off-line text-4xl text-gray-500 mb-2"></i>
                <p className="text-gray-400">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${
                    !notification.read ? 'bg-gray-800/30' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                      <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium text-sm">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        {notification.action && (
                          <a
                            href={notification.action.href}
                            className="text-red-500 hover:text-red-400 text-sm font-medium cursor-pointer"
                          >
                            {notification.action.label}
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700">
            <button className="w-full text-center text-red-500 hover:text-red-400 text-sm font-medium cursor-pointer">
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}