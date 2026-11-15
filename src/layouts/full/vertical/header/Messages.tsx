'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useNavigate } from 'react-router';
import { io } from 'socket.io-client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'src/components/ui/dropdown-menu';
import { Badge } from 'src/components/ui/badge';
import { api } from 'src/shared/api/axios';

type Notification = {
  id: number;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
};

const notificationTime = (value: string) => new Intl.DateTimeFormat('ar-EG', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Cairo',
}).format(new Date(value));

const Messages = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem('access')) { setNotifications([]); return; }
    try {
      const response = await api.get('/notifications');
      setNotifications(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch { /* Keep the header unobtrusive if the API is temporarily unavailable. */ }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const refresh = window.setInterval(() => void loadNotifications(), 30_000);
    return () => window.clearInterval(refresh);
  }, [loadNotifications]);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) return undefined;

    const socketUrl = new URL(api.defaults.baseURL || window.location.origin, window.location.origin).origin;
    const socket = io(socketUrl, {
      auth: { token },
      reconnectionAttempts: 3,
    });
    const receiveNotification = (notification: Notification) => {
      setNotifications((current) => current.some((item) => item.id === notification.id)
        ? current
        : [notification, ...current]);
    };

    socket.on('notification:new', receiveNotification);
    return () => {
      socket.off('notification:new', receiveNotification);
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const openNotification = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
      } catch { return; }
    }
    if (notification.action_url) navigate(notification.action_url);
  };

  return (
    <div className="relative group/menu px-4 sm:px-15">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className="relative" aria-label="الإشعارات">
            <span className="relative after:absolute after:-top-1/2 after:h-10 after:w-10 after:rounded-full hover:text-primary hover:after:bg-lightprimary text-foreground dark:text-muted-foreground rounded-full flex items-center justify-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:!text-primary"><Icon icon="tabler:bell-ringing" height={20} /></span>
            {unreadCount > 0 && <span className="absolute -end-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-screen rounded-sm border border-ld py-5 sm:w-[360px]" dir="rtl">
          <div className="flex items-center justify-between px-5"><h3 className="mb-0 text-lg font-semibold text-ld">الإشعارات</h3><Badge color="primary">{unreadCount} جديد</Badge></div>
          <SimpleBar className="mt-3 max-h-80">
            {notifications.length ? notifications.map((notification) => (
              <DropdownMenuItem className={`w-full cursor-pointer px-5 py-3 ${!notification.is_read ? 'bg-lightprimary/40' : 'bg-hover'}`} key={notification.id} onSelect={(event) => { event.preventDefault(); void openNotification(notification); }}>
                <div className="flex w-full gap-3 text-right"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.is_read ? 'bg-muted-foreground/30' : 'bg-primary'}`} /><div className="min-w-0 flex-1"><h5 className="mb-1 truncate text-sm font-semibold text-foreground">{notification.title}</h5><p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p><time className="mt-1 block text-[11px] text-muted-foreground" dir="ltr">{notificationTime(notification.created_at)}</time></div></div>
              </DropdownMenuItem>
            )) : <p className="px-5 py-10 text-center text-sm text-muted-foreground">لا توجد إشعارات.</p>}
          </SimpleBar>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Messages;
