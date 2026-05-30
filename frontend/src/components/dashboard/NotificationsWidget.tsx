'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Bell, AlertCircle, Calendar, DollarSign, Send } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Notification {
  type: 'ten_meetings' | 'monthly_report' | 'unpaid_salary';
  studentId: number;
  studentName: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();
    
    // Reload setiap 5 menit
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await dashboardApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (notification: Notification) => {
    const key = `${notification.type}-${notification.studentId}`;
    setDismissed(new Set(dismissed).add(key));
  };

  const visibleNotifications = notifications.filter((notif) => {
    const key = `${notif.type}-${notif.studentId}`;
    return !dismissed.has(key);
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi & Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-500">
            Memuat notifikasi...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Bell className="h-5 w-5" />
            Notifikasi & Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-3">
              <Bell className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-green-700 font-semibold">Semua Beres!</p>
            <p className="text-green-600 text-sm mt-1">
              Tidak ada notifikasi atau reminder saat ini
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Bell className="h-5 w-5 animate-pulse" />
          Notifikasi & Reminder
          <span className="ml-auto text-sm font-normal px-3 py-1 bg-red-500 text-white rounded-full">
            {visibleNotifications.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleNotifications.map((notif, index) => (
            <NotificationItem
              key={`${notif.type}-${notif.studentId}-${index}`}
              notification={notif}
              onDismiss={() => dismissNotification(notif)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const priorityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-orange-300 bg-orange-50',
    low: 'border-blue-300 bg-blue-50',
  };

  const priorityIcons = {
    ten_meetings: Send,
    monthly_report: Calendar,
    unpaid_salary: DollarSign,
  };

  const Icon = priorityIcons[notification.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border-2 ${priorityColors[notification.priority]} transition-all duration-200 hover:shadow-lg`}
    >
      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
        <Icon className="h-5 w-5 text-orange-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 mb-1">
          {notification.message}
        </p>
        
        {notification.type === 'ten_meetings' && notification.data?.hasWhatsapp && (
          <Link href={`/laporan/bulanan?studentId=${notification.studentId}`}>
            <Button size="sm" className="mt-2 text-xs">
              <Send className="h-3 w-3 mr-1" />
              Kirim Laporan ke Ortu
            </Button>
          </Link>
        )}
        
        {notification.type === 'monthly_report' && notification.data?.hasWhatsapp && (
          <Link href={`/laporan/bulanan?studentId=${notification.studentId}`}>
            <Button size="sm" className="mt-2 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Buat Laporan Bulanan
            </Button>
          </Link>
        )}
        
        {notification.type === 'unpaid_salary' && (
          <Link href="/gajian">
            <Button size="sm" className="mt-2 text-xs" variant="secondary">
              <DollarSign className="h-3 w-3 mr-1" />
              Lihat Detail Gaji
            </Button>
          </Link>
        )}
      </div>
      
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 hover:bg-white rounded-lg transition-colors"
        title="Dismiss"
      >
        <svg
          className="h-4 w-4 text-slate-400 hover:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )}
}
