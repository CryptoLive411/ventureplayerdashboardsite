import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Loader2, Bell, GraduationCap, CheckSquare, MessageSquare, Check, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  content: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
  link: string | null;
}

export const AthleteNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('athlete-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notification.id);

      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      ));
    }

    // Navigate based on type
    if (notification.link) {
      navigate(notification.link);
    } else {
      switch (notification.type) {
        case 'college_reminder':
        case 'college_message':
          navigate('/dashboard/colleges');
          break;
        case 'checklist_reminder':
          navigate('/dashboard/checklist');
          break;
        case 'new_message':
        case 'message':
          navigate('/dashboard/messages');
          break;
        case 'offer':
          navigate('/dashboard/offers');
          break;
        default:
          break;
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);

    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'college_reminder':
      case 'college_message':
        return <GraduationCap className="h-5 w-5 text-venture-blue" />;
      case 'checklist_reminder':
        return <CheckSquare className="h-5 w-5 text-emerald-600" />;
      case 'new_message':
      case 'message':
        return <MessageSquare className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-venture-blue" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on your recruitment progress
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <div className="bg-venture-blue/10 text-venture-blue rounded-xl p-4 mb-6 flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <span className="font-medium">
              You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              You'll receive notifications about your recruitment progress here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`bg-card rounded-xl border p-5 animate-slide-up cursor-pointer transition-all hover:shadow-md ${
                  notification.read_at 
                    ? 'border-border' 
                    : 'border-venture-blue/30 bg-venture-blue/5'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-medium ${
                          notification.read_at ? 'text-foreground' : 'text-foreground font-semibold'
                        }`}>
                          {notification.title}
                        </h3>
                        {notification.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.content}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read_at && (
                          <span className="h-2 w-2 rounded-full bg-venture-blue flex-shrink-0" />
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteNotifications;
