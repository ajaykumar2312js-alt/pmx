import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectNotifications, selectUnreadCount, markAsRead, markAllAsRead, fetchNotifications } from '../../../redux/slices/notificationSlice';
import { Bell, Check, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleNotificationClick = (id: string, relatedItemId?: string, relatedItemType?: string) => {
    dispatch(markAsRead(id));
    setIsOpen(false);
    
    if (relatedItemId && relatedItemType) {
      if (relatedItemType === 'stories') navigate(`/projects/active/stories/${relatedItemId}`);
      if (relatedItemType === 'tasks') navigate(`/projects/active/tasks/${relatedItemId}`);
      if (relatedItemType === 'bugs') navigate(`/projects/active/bugs/${relatedItemId}`);
      if (relatedItemType === 'epics') navigate(`/projects/active/epics/${relatedItemId}`);
    }
  };

  const formatTime = (isoStr: string) => {
    const date = new Date(isoStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={handleToggle}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '0.5rem', 
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#de350b',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '50%',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          width: '350px',
          backgroundColor: 'var(--color-bg-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem', 
            borderBottom: '1px solid var(--color-border)' 
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--color-primary)', 
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Check size={14} /> Mark all as read
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>You're all caught up!</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map(notif => (
                  <li 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.relatedItemId, notif.relatedItemType)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(0, 82, 204, 0.04)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ marginTop: '0.25rem', color: notif.read ? 'transparent' : '#0052cc' }}>
                      <Circle size={10} fill="currentColor" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: notif.read ? 400 : 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {notif.message}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
