import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_type: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

export const AthleteMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;

    // Get profile first
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('player_id', profileData.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!profile) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('athlete-messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `player_id=eq.${profile.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !user) return;

    setSending(true);
    try {
      // Insert the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          player_id: profile.id,
          sender_id: user.id,
          sender_type: 'player',
          content: newMessage.trim(),
        });

      if (messageError) throw messageError;

      // Create notification for admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins) {
        const notificationPromises = admins.map(admin =>
          supabase.from('notifications').insert({
            user_id: admin.user_id,
            player_id: profile.id,
            type: 'player_message',
            title: `New message from ${profile.first_name} ${profile.last_name}`,
            content: newMessage.trim().substring(0, 100) + (newMessage.length > 100 ? '...' : ''),
            link: `/admin/players/${profile.id}`,
          })
        );
        await Promise.all(notificationPromises);
      }

      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

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
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-muted-foreground">
            Chat with your Venture Sports team
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Send a message to your Venture Sports team. They'll respond as soon as possible.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'player' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.sender_type === 'player'
                        ? 'bg-venture-blue text-white rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    }`}
                  >
                    {message.sender_type !== 'player' && (
                      <p className="text-xs font-medium text-venture-blue mb-1">
                        Venture Sports Team
                      </p>
                    )}
                    <p className={`text-sm ${
                      message.sender_type === 'player' ? 'text-white' : 'text-foreground'
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.sender_type === 'player' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-4"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteMessages;
