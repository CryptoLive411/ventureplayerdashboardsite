import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, GraduationCap, MapPin, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CollegeTracking {
  id: string;
  college_name: string;
  division: string | null;
  state: string | null;
  city: string | null;
  coach_name: string | null;
  coach_email: string | null;
  coach_phone: string | null;
  status: string;
  last_action_date: string | null;
  notes: string | null;
}

interface CollegeMessage {
  id: string;
  college_tracking_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  not_contacted: 'bg-muted text-muted-foreground',
  contacted: 'bg-blue-100 text-blue-700',
  interested: 'bg-emerald-100 text-emerald-700',
  communication: 'bg-amber-100 text-amber-700',
  offer_made: 'bg-purple-100 text-purple-700',
  not_interested: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  not_contacted: 'Not Contacted',
  contacted: 'Contacted',
  interested: 'Interested',
  communication: 'In Communication',
  offer_made: 'Offer Made',
  not_interested: 'Not Interested',
  rejected: 'Rejected',
};

export const AthleteColleges: React.FC = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<CollegeTracking[]>([]);
  const [collegeMessages, setCollegeMessages] = useState<Record<string, CollegeMessage[]>>({});
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCollegeId, setExpandedCollegeId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchColleges = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        
        const { data, error } = await supabase
          .from('college_tracking')
          .select('*')
          .eq('player_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setColleges(data);
          
          // Fetch messages for all colleges
          const { data: messages } = await supabase
            .from('college_messages')
            .select('*')
            .eq('player_id', profile.id)
            .order('created_at', { ascending: true });
          
          if (messages) {
            const grouped: Record<string, CollegeMessage[]> = {};
            messages.forEach(msg => {
              if (!grouped[msg.college_tracking_id]) {
                grouped[msg.college_tracking_id] = [];
              }
              grouped[msg.college_tracking_id].push(msg);
            });
            setCollegeMessages(grouped);
          }
        }
      }
      setLoading(false);
    };

    fetchColleges();
  }, [user]);

  const handleSendMessage = useCallback(async (collegeId: string) => {
    const content = newMessage[collegeId]?.trim();
    if (!content || !profileId || !user) return;

    setSending(prev => ({ ...prev, [collegeId]: true }));

    try {
      const { data, error } = await supabase
        .from('college_messages')
        .insert({
          college_tracking_id: collegeId,
          player_id: profileId,
          sender_id: user.id,
          sender_type: 'player',
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCollegeMessages(prev => ({
        ...prev,
        [collegeId]: [...(prev[collegeId] || []), data],
      }));
      setNewMessage(prev => ({ ...prev, [collegeId]: '' }));

      // Notify admins
      const college = colleges.find(c => c.id === collegeId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', profileId)
        .single();

      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && profile) {
        await Promise.all(admins.map(admin =>
          supabase.from('notifications').insert({
            user_id: admin.user_id,
            player_id: profileId,
            type: 'college_message',
            title: `${profile.first_name} replied about ${college?.college_name}`,
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            link: `/admin/players/${profileId}`,
          })
        ));
      }

      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(prev => ({ ...prev, [collegeId]: false }));
    }
  }, [newMessage, profileId, user, colleges]);

  const handleMessageChange = useCallback((collegeId: string, value: string) => {
    setNewMessage(prev => ({ ...prev, [collegeId]: value }));
  }, []);

  const handleToggleExpand = useCallback((collegeId: string) => {
    setExpandedCollegeId(prev => prev === collegeId ? null : collegeId);
  }, []);

  // Group colleges by status
  const interestedColleges = colleges.filter(c => ['interested', 'communication', 'offer_made'].includes(c.status));
  const contactedColleges = colleges.filter(c => c.status === 'contacted');
  const otherColleges = colleges.filter(c => !['interested', 'communication', 'offer_made', 'contacted'].includes(c.status));

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
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">College Tracking</h1>
          <p className="text-muted-foreground">See which colleges we've reached out to and their interest level</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Colleges', value: colleges.length },
            { label: 'Contacted', value: contactedColleges.length + interestedColleges.length },
            { label: 'Interested', value: interestedColleges.length },
            { label: 'With Offers', value: colleges.filter(c => c.status === 'offer_made').length },
          ].map((stat) => (
            <div key={stat.label} className="stat-card text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {colleges.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No colleges tracked yet</h3>
            <p className="text-muted-foreground">
              Your Venture team will add colleges as your recruitment progresses.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Interested/Active Section */}
            {interestedColleges.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active Interest ({interestedColleges.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {interestedColleges.map((college, index) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                      index={index}
                      isExpanded={expandedCollegeId === college.id}
                      messages={collegeMessages[college.id] || []}
                      messageCount={collegeMessages[college.id]?.length || 0}
                      newMessage={newMessage[college.id] || ''}
                      sending={sending[college.id] || false}
                      onToggleExpand={handleToggleExpand}
                      onMessageChange={handleMessageChange}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Contacted Section */}
            {contactedColleges.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Recently Contacted ({contactedColleges.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {contactedColleges.map((college, index) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                      index={index}
                      isExpanded={expandedCollegeId === college.id}
                      messages={collegeMessages[college.id] || []}
                      messageCount={collegeMessages[college.id]?.length || 0}
                      newMessage={newMessage[college.id] || ''}
                      sending={sending[college.id] || false}
                      onToggleExpand={handleToggleExpand}
                      onMessageChange={handleMessageChange}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Section */}
            {otherColleges.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Other ({otherColleges.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {otherColleges.map((college, index) => (
                    <CollegeCard
                      key={college.id}
                      college={college}
                      index={index}
                      isExpanded={expandedCollegeId === college.id}
                      messages={collegeMessages[college.id] || []}
                      messageCount={collegeMessages[college.id]?.length || 0}
                      newMessage={newMessage[college.id] || ''}
                      sending={sending[college.id] || false}
                      onToggleExpand={handleToggleExpand}
                      onMessageChange={handleMessageChange}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Extracted CollegeCard component to prevent re-renders
interface CollegeCardProps {
  college: CollegeTracking;
  index: number;
  isExpanded: boolean;
  messages: CollegeMessage[];
  messageCount: number;
  newMessage: string;
  sending: boolean;
  onToggleExpand: (collegeId: string) => void;
  onMessageChange: (collegeId: string, value: string) => void;
  onSendMessage: (collegeId: string) => void;
}

const CollegeCard: React.FC<CollegeCardProps> = React.memo(({
  college,
  index,
  isExpanded,
  messages,
  messageCount,
  newMessage,
  sending,
  onToggleExpand,
  onMessageChange,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isExpanded, messages.length]);

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-venture-blue/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-venture-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{college.college_name}</h3>
              {(college.city || college.state) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[college.city, college.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${statusColors[college.status]} border-0`}>
            {statusLabels[college.status]}
          </Badge>
        </div>

        {college.division && (
          <p className="text-sm text-muted-foreground mb-3">
            {college.division.replace('_', ' ')}
          </p>
        )}

        {college.coach_name && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-foreground mb-1">{college.coach_name}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {college.coach_email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {college.coach_email}
                </span>
              )}
              {college.coach_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {college.coach_phone}
                </span>
              )}
            </div>
          </div>
        )}

        {college.notes && (
          <p className="text-sm text-muted-foreground mb-3">{college.notes}</p>
        )}

        {college.last_action_date && (
          <p className="text-xs text-muted-foreground mb-3">
            Last action: {format(new Date(college.last_action_date), 'MMM d, yyyy')}
          </p>
        )}

        {/* Messages Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => onToggleExpand(college.id)}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages {messageCount > 0 && `(${messageCount})`}
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Messages Section */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Send a message about this school</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    message.sender_type === 'player'
                      ? 'bg-venture-blue text-white ml-auto rounded-br-sm'
                      : 'bg-card border border-border rounded-bl-sm'
                  }`}
                >
                  {message.sender_type !== 'player' && (
                    <p className="text-xs font-medium text-venture-blue mb-1">Venture Sports</p>
                  )}
                  <p className={`text-sm ${message.sender_type === 'player' ? 'text-white' : 'text-foreground'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${
                    message.sender_type === 'player' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => onMessageChange(college.id, e.target.value)}
              placeholder="Type your message..."
              className="min-h-[40px] max-h-24 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(college.id);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => onSendMessage(college.id)}
              disabled={!newMessage.trim() || sending}
              className="px-3"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

CollegeCard.displayName = 'CollegeCard';

export default AthleteColleges;
