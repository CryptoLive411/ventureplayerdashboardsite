import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Search, 
  MessageSquare, 
  StickyNote, 
  Filter,
  Loader2,
  CheckCircle,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface NotificationWithPlayer {
  id: string;
  title: string;
  content: string | null;
  type: string;
  created_at: string;
  read_at: string | null;
  player_id: string | null;
  user_id: string;
  player_name?: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      // Get all notifications (admin can see all)
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        return;
      }

      // Get player names for notifications that have player_id
      const playerIds = [...new Set(notificationsData?.filter(n => n.player_id).map(n => n.player_id))];
      
      let playerMap: Record<string, string> = {};
      if (playerIds.length > 0) {
        const { data: playersData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', playerIds);
        
        if (playersData) {
          playerMap = playersData.reduce((acc, p) => {
            acc[p.id] = `${p.first_name} ${p.last_name}`;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const enrichedNotifications = notificationsData?.map(n => ({
        ...n,
        player_name: n.player_id ? playerMap[n.player_id] : undefined
      })) || [];

      setNotifications(enrichedNotifications);
      setLoading(false);
    };

    fetchNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          const newNotification = payload.new as NotificationWithPlayer;
          
          // Get player name if exists
          if (newNotification.player_id) {
            const { data: playerData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', newNotification.player_id)
              .maybeSingle();
            
            if (playerData) {
              newNotification.player_name = `${playerData.first_name} ${playerData.last_name}`;
            }
          }
          
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    }
  };

  const handleViewPlayer = (playerId: string | null) => {
    if (playerId) {
      navigate(`/admin/players/${playerId}`);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.player_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin_note':
        return <StickyNote className="h-4 w-4" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin_note':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'new_message':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-sm px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on player messages and admin notes
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="admin_note">Admin Notes</SelectItem>
                  <SelectItem value="new_message">Player Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' 
                  ? 'No notifications match your filters'
                  : 'You\'ll see notifications here when admins leave notes or players send messages'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card rounded-xl border p-4 transition-colors ${
                  notification.read_at
                    ? 'border-border bg-card/50'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-foreground">{notification.title}</h3>
                        {notification.player_name && (
                          <button
                            onClick={() => handleViewPlayer(notification.player_id)}
                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <User className="h-3 w-3" />
                            {notification.player_name}
                          </button>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {notification.content && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {notification.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      <div className="flex items-center gap-2">
                        {notification.player_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPlayer(notification.player_id)}
                          >
                            View Player
                          </Button>
                        )}
                        {!notification.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
