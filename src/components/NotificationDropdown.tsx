import React, { useRef, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { isDropdownOpen, setDropdownOpen } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setDropdownOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDropdownOpen(!isDropdownOpen);
    }
    if (event.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 text-muted-foreground hover:text-foreground focus:text-foreground"
        onClick={() => setDropdownOpen(!isDropdownOpen)}
        onKeyDown={handleKeyDown}
        aria-label={`${t('Notifications')}, ${unreadCount} ${t('unread')}`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        tabIndex={0}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <Card className="absolute right-0 top-12 w-80 md:w-96 max-h-60 md:max-h-80 glass-dropdown glass-optimized overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/20">
            <h3 className="font-semibold glass-text-primary">
              {t('Notifications')} ({unreadCount})
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2 glass-btn-secondary"
                  aria-label={t('Mark all as read')}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {t('Mark all read')}
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs h-7 px-2 glass-btn-secondary text-destructive hover:text-destructive"
                  aria-label={t('Clear all')}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('Clear all')}
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center glass-text-muted">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('No notifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/20 dark:divide-gray-700/20">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 glass-interactive cursor-pointer transition-colors ${
                      !notification.read ? 'bg-accent/50' : ''
                    } ${getNotificationBgColor(notification.type)}`}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${notification.title}: ${notification.message}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg" role="img" aria-label={notification.type}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm glass-text-primary truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs glass-text-muted mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs glass-text-muted mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 glass-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          aria-label={t('Mark as read')}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationDropdown;