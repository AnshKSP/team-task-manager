import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load from local storage if needed, but in-memory is fine for now
    const saved = localStorage.getItem('sahara_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {}
    }

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    socket.on('notification', (data) => {
      // Show toast
      if (data.type === 'success') {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }

      // Add to list
      const newNotif = {
        id: Date.now().toString(),
        message: data.message,
        type: data.type,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 20); // Keep last 20
        localStorage.setItem('sahara_notifications', JSON.stringify(updated));
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('sahara_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
