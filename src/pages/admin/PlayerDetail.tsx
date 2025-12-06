import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Loader2, 
  Save, 
  ArrowLeft,
  User,
  CheckSquare,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  Archive,
  ChevronRight,
  Search,
  Bell,
  Send,
  MessageSquare,
  StickyNote,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHECKLIST_PRESETS, CHECKLIST_CATEGORIES } from '@/data/checklistPresets';
import { COLLEGES_DATABASE, COLLEGE_STATUSES, CollegeData } from '@/data/collegesData';
import { format } from 'date-fns';

type PlayerStatus = 'active' | 'in_placement' | 'placed' | 'archived';
type DivisionType = 'NCAA_D1' | 'NCAA_D2' | 'NCAA_D3' | 'NAIA' | 'NJCAA';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  position: string | null;
  current_club: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  graduation_year: number | null;
  gpa: number | null;
  sat_score: number | null;
  budget_per_year: number | null;
  target_intake: string | null;
  target_divisions: DivisionType[];
  highlight_video_url: string | null;
  status: PlayerStatus;
  additional_notes: string | null;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  assigned_to_player: boolean;
  player_notes: string | null;
}

interface PlayerDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  checklist_item_id: string | null;
  created_at: string;
  uploaded_by_type: string;
}

interface CollegeTracking {
  id: string;
  college_name: string;
  division: string | null;
  state: string | null;
  coach_name: string | null;
  status: string;
  notes: string | null;
}

interface AdminNote {
  id: string;
  content: string;
  admin_id: string;
  created_at: string;
  admin_name?: string;
}

interface PlayerMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_type: string;
  created_at: string;
  read_at: string | null;
}

interface Notification {
  id: string;
  title: string;
  content: string | null;
  type: string;
  created_at: string;
  read_at: string | null;
}

interface CollegeMessage {
  id: string;
  college_tracking_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

const STATUS_FLOW: { status: PlayerStatus; label: string; color: string }[] = [
  { status: 'active', label: 'New Player', color: 'bg-blue-500' },
  { status: 'in_placement', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'placed', label: 'Placed', color: 'bg-emerald-500' },
];

export const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [colleges, setColleges] = useState<CollegeTracking[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [playerMessages, setPlayerMessages] = useState<PlayerMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<CollegeData | null>(null);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [sendingNote, setSendingNote] = useState(false);
  const [expandedCollegeId, setExpandedCollegeId] = useState<string | null>(null);
  const [collegeNotes, setCollegeNotes] = useState<Record<string, string>>({});
  const [reminderDate, setReminderDate] = useState<Record<string, string>>({});
  const [reminderMessage, setReminderMessage] = useState<Record<string, string>>({});
  const [collegeMessages, setCollegeMessages] = useState<Record<string, CollegeMessage[]>>({});
  const [newCollegeMessage, setNewCollegeMessage] = useState<Record<string, string>>({});
  const [sendingCollegeMessage, setSendingCollegeMessage] = useState<Record<string, boolean>>({});
  const [checklistDocuments, setChecklistDocuments] = useState<Record<string, PlayerDocument[]>>({});
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        toast.error('Player not found');
        navigate('/admin/players');
        return;
      }

      setProfile(profileData as Profile);

      // Fetch checklist
      const { data: checklistData } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('player_id', id)
        .order('sort_order', { ascending: true });

      if (checklistData) setChecklist(checklistData);

      // Fetch colleges
      const { data: collegesData } = await supabase
        .from('college_tracking')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: false });

      if (collegesData) setColleges(collegesData);

      // Fetch admin notes
      const { data: notesData } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: true });

      if (notesData) setAdminNotes(notesData);

      // Fetch player messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: true });

      if (messagesData) setPlayerMessages(messagesData);

      // Fetch notifications for this player (admin notifications)
      if (user) {
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('player_id', id)
          .order('created_at', { ascending: false });

        if (notificationsData) setNotifications(notificationsData);
      }

      // Fetch college messages
      const { data: collegeMsgsData } = await supabase
        .from('college_messages')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: true });

      if (collegeMsgsData) {
        const grouped: Record<string, CollegeMessage[]> = {};
        collegeMsgsData.forEach((msg: CollegeMessage) => {
          if (!grouped[msg.college_tracking_id]) {
            grouped[msg.college_tracking_id] = [];
          }
          grouped[msg.college_tracking_id].push(msg);
        });
        setCollegeMessages(grouped);
      }

      // Fetch player documents
      const { data: docsData } = await supabase
        .from('player_documents')
        .select('*')
        .eq('player_id', id)
        .not('checklist_item_id', 'is', null);

      if (docsData) {
        const docsByItem: Record<string, PlayerDocument[]> = {};
        docsData.forEach((doc) => {
          const itemId = doc.checklist_item_id;
          if (itemId) {
            if (!docsByItem[itemId]) {
              docsByItem[itemId] = [];
            }
            docsByItem[itemId].push(doc as PlayerDocument);
          }
        });
        setChecklistDocuments(docsByItem);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate, user]);

  const handleProfileChange = (field: keyof Profile, value: unknown) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        nationality: profile.nationality,
        position: profile.position,
        current_club: profile.current_club,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        graduation_year: profile.graduation_year,
        gpa: profile.gpa,
        sat_score: profile.sat_score,
        budget_per_year: profile.budget_per_year,
        target_intake: profile.target_intake,
        target_divisions: profile.target_divisions,
        highlight_video_url: profile.highlight_video_url,
        status: profile.status,
        additional_notes: profile.additional_notes,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const handleStatusChange = async (newStatus: PlayerStatus) => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setProfile({ ...profile, status: newStatus });
      toast.success(`Player moved to ${newStatus === 'active' ? 'New Player' : newStatus === 'in_placement' ? 'In Progress' : 'Placed'}`);
    }
  };

  const handleArchivePlayer = async () => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'archived' })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to archive player');
    } else {
      setProfile({ ...profile, status: 'archived' });
      toast.success('Player archived');
    }
  };

  const handleAddChecklistItem = async (title?: string) => {
    const itemTitle = title || newChecklistItem.trim();
    if (!itemTitle || !id) return;

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        player_id: id,
        title: itemTitle,
        sort_order: checklist.length,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add item');
    } else if (data) {
      setChecklist([...checklist, data]);
      setNewChecklistItem('');
      setSelectedPreset('');
      toast.success('Item added');
    }
  };

  const handlePresetSelect = (title: string) => {
    setSelectedPreset(title);
    handleAddChecklistItem(title);
  };

  const handleToggleChecklistItem = async (item: ChecklistItem) => {
    const newStatus = item.status === 'completed' ? 'not_started' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('checklist_items')
      .update({ 
        status: newStatus, 
        completed_at: completedAt,
        completed_by: newStatus === 'completed' ? user?.id : null
      })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update item');
    } else {
      setChecklist(checklist.map(c => 
        c.id === item.id 
          ? { ...c, status: newStatus, completed_at: completedAt }
          : c
      ));
      if (newStatus === 'completed') {
        toast.success('Item completed! Player will be notified.');
      }
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      setChecklist(checklist.filter(c => c.id !== itemId));
      toast.success('Item deleted');
    }
  };

  const handleAddCollege = async (college: CollegeData) => {
    if (!id) return;

    const { data, error } = await supabase
      .from('college_tracking')
      .insert({
        player_id: id,
        college_name: college.name,
        division: college.division,
        state: college.state,
        status: 'not_contacted',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add college');
    } else if (data) {
      setColleges([data, ...colleges]);
      setCollegeSearch('');
      setSelectedCollege(null);
      setShowCollegeDropdown(false);
      toast.success('College added');
    }
  };

  const handleAddCustomCollege = async () => {
    if (!collegeSearch.trim() || !id) return;

    const { data, error } = await supabase
      .from('college_tracking')
      .insert({
        player_id: id,
        college_name: collegeSearch.trim(),
        status: 'not_contacted',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add college');
    } else if (data) {
      setColleges([data, ...colleges]);
      setCollegeSearch('');
      setShowCollegeDropdown(false);
      toast.success('College added');
    }
  };

  const handleDeleteCollege = async (collegeId: string) => {
    const { error } = await supabase
      .from('college_tracking')
      .delete()
      .eq('id', collegeId);

    if (error) {
      toast.error('Failed to delete college');
    } else {
      setColleges(colleges.filter(c => c.id !== collegeId));
      toast.success('College removed');
    }
  };

  const handleSaveCollegeNotes = async (collegeId: string) => {
    const notes = collegeNotes[collegeId];
    if (notes === undefined) return;

    const { error } = await supabase
      .from('college_tracking')
      .update({ notes })
      .eq('id', collegeId);

    if (error) {
      toast.error('Failed to save notes');
    } else {
      setColleges(colleges.map(c => 
        c.id === collegeId ? { ...c, notes } : c
      ));
      toast.success('Notes saved');
    }
  };

  const handleCreateReminder = async (collegeId: string, collegeName: string) => {
    const date = reminderDate[collegeId];
    const message = reminderMessage[collegeId];
    
    if (!date || !message?.trim() || !id || !profile) {
      toast.error('Please enter both date and message');
      return;
    }

    // Create a notification for the player
    const { error } = await supabase.from('notifications').insert({
      user_id: profile.user_id,
      player_id: id,
      type: 'college_reminder',
      title: `Reminder: ${collegeName}`,
      content: message.trim(),
      link: `/athlete/colleges`,
    });

    if (error) {
      toast.error('Failed to create reminder');
    } else {
      setReminderDate(prev => ({ ...prev, [collegeId]: '' }));
      setReminderMessage(prev => ({ ...prev, [collegeId]: '' }));
      toast.success('Reminder sent to player');
    }
  };

  const handleSendCollegeMessage = async (collegeId: string) => {
    const content = newCollegeMessage[collegeId]?.trim();
    if (!content || !id || !user || !profile) return;

    setSendingCollegeMessage(prev => ({ ...prev, [collegeId]: true }));

    try {
      const { data, error } = await supabase
        .from('college_messages')
        .insert({
          college_tracking_id: collegeId,
          player_id: id,
          sender_id: user.id,
          sender_type: 'admin',
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
      setNewCollegeMessage(prev => ({ ...prev, [collegeId]: '' }));

      // Create notification for the player
      const college = colleges.find(c => c.id === collegeId);
      await supabase.from('notifications').insert({
        user_id: profile.user_id,
        player_id: id,
        type: 'college_message',
        title: `New message about ${college?.college_name}`,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        link: '/dashboard/colleges',
      });

      toast.success('Message sent to player');
    } catch (error) {
      console.error('Error sending college message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingCollegeMessage(prev => ({ ...prev, [collegeId]: false }));
    }
  };

  const filteredColleges = COLLEGES_DATABASE.filter(college =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    college.state.toLowerCase().includes(collegeSearch.toLowerCase())
  ).slice(0, 20);

  const handleSendNote = async () => {
    if (!newNote.trim() || !id || !user) return;
    setSendingNote(true);

    const { data, error } = await supabase
      .from('admin_notes')
      .insert({
        player_id: id,
        admin_id: user.id,
        content: newNote.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send note');
    } else if (data) {
      setAdminNotes([...adminNotes, data]);
      const noteContent = newNote.trim();
      setNewNote('');
      
      // Create notification for all admins about this note
      await supabase.from('notifications').insert({
        user_id: user.id,
        player_id: id,
        type: 'admin_note',
        title: 'New Admin Note',
        content: `Note added for ${profile?.first_name} ${profile?.last_name}: ${noteContent.substring(0, 50)}...`,
      });

      // Send email notification to all admins
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'admin_note',
            title: 'New Admin Note',
            content: noteContent,
            playerName: `${profile?.first_name} ${profile?.last_name}`,
            playerId: id,
          },
        });
      } catch (emailError) {
        console.log('Email notification skipped:', emailError);
      }
      
      toast.success('Note sent');
    }
    setSendingNote(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !id || !user) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        player_id: id,
        sender_id: user.id,
        sender_type: 'admin',
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
    } else if (data) {
      setPlayerMessages([...playerMessages, data]);
      
      // Create notification for the player
      if (profile?.user_id) {
        await supabase.from('notifications').insert({
          user_id: profile.user_id,
          player_id: id,
          type: 'new_message',
          title: 'New Message from Venture Sports',
          content: content.trim().substring(0, 100),
        });
      }
      
      toast.success('Message sent to player');
    }
  };

  const handleToggleAssignment = async (item: ChecklistItem) => {
    const newValue = !item.assigned_to_player;
    const { error } = await supabase
      .from('checklist_items')
      .update({ assigned_to_player: newValue })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update assignment');
    } else {
      setChecklist(checklist.map(c => 
        c.id === item.id ? { ...c, assigned_to_player: newValue } : c
      ));
      toast.success(newValue ? 'Assigned to player' : 'Unassigned from player');
    }
  };

  const handleNudgePlayer = async (item: ChecklistItem) => {
    if (!profile?.user_id || !id) return;

    const { error } = await supabase.from('notifications').insert({
      user_id: profile.user_id,
      player_id: id,
      type: 'checklist_reminder',
      title: 'Action Required',
      content: `Reminder: Please complete "${item.title}" as soon as possible.`,
      link: '/dashboard/checklist',
    });

    if (error) {
      toast.error('Failed to send reminder');
    } else {
      toast.success('Reminder sent to player');
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return null;

  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.status === profile.status);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/players')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
          <Button variant="venture" onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Status Pipeline */}
        {profile.status !== 'archived' && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Player Pipeline</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleArchivePlayer}
                className="text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Player
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {STATUS_FLOW.map((step, index) => (
                <React.Fragment key={step.status}>
                  <button
                    onClick={() => handleStatusChange(step.status)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      profile.status === step.status
                        ? `${step.color} text-white shadow-md`
                        : index < currentStatusIndex
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {step.label}
                  </button>
                  {index < STATUS_FLOW.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {profile.status === 'archived' && (
          <div className="bg-muted/50 rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">This player is archived</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleStatusChange('active')}
              >
                Restore Player
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Colleges
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">Player Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Target Intake</Label>
                  <Input
                    value={profile.target_intake || ''}
                    onChange={(e) => handleProfileChange('target_intake', e.target.value)}
                    placeholder="e.g., Fall 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget/Year ($)</Label>
                  <Input
                    type="number"
                    value={profile.budget_per_year || ''}
                    onChange={(e) => handleProfileChange('budget_per_year', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Highlight Video URL</Label>
                  <Input
                    value={profile.highlight_video_url || ''}
                    onChange={(e) => handleProfileChange('highlight_video_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">Personal & Athletic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profile.first_name}
                    onChange={(e) => handleProfileChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profile.last_name}
                    onChange={(e) => handleProfileChange('last_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={profile.position || ''}
                    onChange={(e) => handleProfileChange('position', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Club</Label>
                  <Input
                    value={profile.current_club || ''}
                    onChange={(e) => handleProfileChange('current_club', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input
                    type="number"
                    value={profile.graduation_year || ''}
                    onChange={(e) => handleProfileChange('graduation_year', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GPA</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={profile.gpa || ''}
                    onChange={(e) => handleProfileChange('gpa', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SAT Score</Label>
                  <Input
                    type="number"
                    value={profile.sat_score || ''}
                    onChange={(e) => handleProfileChange('sat_score', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>

            {/* Admin Notes Section - Now as messages */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-2">Admin Notes</h2>
              <p className="text-sm text-muted-foreground mb-4">These notes are only visible to staff members, not to the player.</p>
              
              {/* Notes Messages */}
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {adminNotes.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No admin notes yet</p>
                  </div>
                ) : (
                  adminNotes.map((note) => (
                    <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-foreground">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Send Note Input */}
              <div className="flex gap-3">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note for other admins..."
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendNote();
                    }
                  }}
                />
                <Button 
                  variant="venture" 
                  onClick={handleSendNote} 
                  disabled={sendingNote || !newNote.trim()}
                  className="self-end"
                >
                  {sendingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Add Checklist Item</h2>
              
              {/* Preset Dropdown */}
              <div className="mb-4">
                <Label className="mb-2 block">Select from presets</Label>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choose a checklist item..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-[300px]">
                    {CHECKLIST_CATEGORIES.map(category => (
                      <SelectGroup key={category}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {category}
                        </SelectLabel>
                        {CHECKLIST_PRESETS.filter(p => p.category === category).map(preset => (
                          <SelectItem 
                            key={preset.title} 
                            value={preset.title}
                            disabled={checklist.some(c => c.title === preset.title)}
                          >
                            {preset.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Item Input */}
              <div>
                <Label className="mb-2 block">Or add custom item</Label>
                <div className="flex gap-3">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Enter custom checklist item..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <Button variant="venture" onClick={() => handleAddChecklistItem()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No checklist items yet</p>
                </div>
              ) : (
                checklist.map((item) => {
                  const docs = checklistDocuments[item.id] || [];
                  const isExpanded = expandedChecklistId === item.id;
                  
                  return (
                  <div
                    key={item.id}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <div className="p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleChecklistItem(item)}
                        className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                          item.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {item.status === 'completed' && <Check className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.assigned_to_player && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              <User className="h-3 w-3" />
                              Assigned to player
                            </span>
                          )}
                          {docs.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                              <FileText className="h-3 w-3" />
                              {docs.length} file{docs.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {item.player_notes && (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                              <StickyNote className="h-3 w-3" />
                              Has notes
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant={item.assigned_to_player ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleToggleAssignment(item)}
                          title={item.assigned_to_player ? "Unassign from player" : "Assign to player"}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        {item.assigned_to_player && item.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNudgePlayer(item)}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Send reminder to player"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Nudge
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Colleges Tab */}
          <TabsContent value="colleges" className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Add College</h2>
              
              {/* College Search */}
              <div className="relative">
                <Label className="mb-2 block">Search colleges (NCAA, NAIA, NJCAA)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={collegeSearch}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value);
                      setShowCollegeDropdown(true);
                    }}
                    onFocus={() => setShowCollegeDropdown(true)}
                    placeholder="Search by college name or state..."
                    className="pl-10"
                  />
                </div>
                
                {/* Dropdown */}
                {showCollegeDropdown && collegeSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                    {filteredColleges.length > 0 ? (
                      <>
                        {filteredColleges.map((college) => (
                          <button
                            key={`${college.name}-${college.state}`}
                            onClick={() => handleAddCollege(college)}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between"
                            disabled={colleges.some(c => c.college_name === college.name)}
                          >
                            <div>
                              <p className="font-medium text-foreground">{college.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {college.division.replace('_', ' ')} • {college.state}
                              </p>
                            </div>
                            {colleges.some(c => c.college_name === college.name) && (
                              <span className="text-xs text-muted-foreground">Added</span>
                            )}
                          </button>
                        ))}
                        <div className="border-t border-border">
                          <button
                            onClick={handleAddCustomCollege}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 text-primary"
                          >
                            <Plus className="h-4 w-4" />
                            Add "{collegeSearch}" as custom college
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={handleAddCustomCollege}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Add "{collegeSearch}" as custom college
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Click outside to close */}
              {showCollegeDropdown && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowCollegeDropdown(false)}
                />
              )}
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Tracked Colleges</h2>
              
              {colleges.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No colleges tracked yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colleges.map((college) => {
                    const isExpanded = expandedCollegeId === college.id;
                    return (
                      <div
                        key={college.id}
                        className="bg-muted/30 rounded-lg overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between gap-4">
                          <button
                            onClick={() => {
                              setExpandedCollegeId(isExpanded ? null : college.id);
                              if (!isExpanded && college.notes) {
                                setCollegeNotes(prev => ({ ...prev, [college.id]: college.notes || '' }));
                              }
                            }}
                            className="flex items-center gap-2 text-left flex-1 min-w-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{college.college_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {college.division?.replace('_', ' ') || 'Division N/A'} • {college.state || 'State N/A'}
                              </p>
                            </div>
                          </button>
                          <Select
                            value={college.status || undefined}
                            onValueChange={async (value) => {
                              const newStatus = value as "not_contacted" | "contacted" | "interested" | "communication" | "offer_made" | "not_interested" | "rejected";
                              await supabase
                                .from('college_tracking')
                                .update({ status: newStatus })
                                .eq('id', college.id);
                              setColleges(colleges.map(c => 
                                c.id === college.id ? { ...c, status: newStatus } : c
                              ));
                              toast.success('Status updated');
                            }}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COLLEGE_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCollege(college.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                            {/* Notes Section */}
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2 text-sm font-medium">
                                <StickyNote className="h-4 w-4" />
                                Notes
                              </Label>
                              <Textarea
                                placeholder="Add notes about this college (meetings, coach contact info, etc.)"
                                value={collegeNotes[college.id] ?? college.notes ?? ''}
                                onChange={(e) => setCollegeNotes(prev => ({ ...prev, [college.id]: e.target.value }))}
                                className="min-h-[80px]"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveCollegeNotes(college.id)}
                                className="mt-1"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Notes
                              </Button>
                            </div>

                            {/* Reminder Section */}
                            <div className="space-y-2 pt-2 border-t border-border/50">
                              <Label className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4" />
                                Send Reminder to Player
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={reminderDate[college.id] || ''}
                                  onChange={(e) => setReminderDate(prev => ({ ...prev, [college.id]: e.target.value }))}
                                  className="w-[160px]"
                                />
                                <Input
                                  placeholder="Reminder message (e.g., Meeting with Coach Smith)"
                                  value={reminderMessage[college.id] || ''}
                                  onChange={(e) => setReminderMessage(prev => ({ ...prev, [college.id]: e.target.value }))}
                                  className="flex-1"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCreateReminder(college.id, college.college_name)}
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Send Reminder
                              </Button>
                            </div>

                            {/* College Messages Section */}
                            <div className="space-y-2 pt-2 border-t border-border/50">
                              <Label className="flex items-center gap-2 text-sm font-medium">
                                <MessageSquare className="h-4 w-4" />
                                Messages with Player about this College
                              </Label>
                              
                              <div className="bg-background rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                                {(collegeMessages[college.id] || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    No messages yet. Send a message to the player about this college.
                                  </p>
                                ) : (
                                  (collegeMessages[college.id] || []).map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                        msg.sender_type === 'admin'
                                          ? 'bg-primary/10 ml-auto'
                                          : 'bg-muted'
                                      }`}
                                    >
                                      <p className={`text-xs font-medium mb-1 ${
                                        msg.sender_type === 'admin' ? 'text-primary' : 'text-foreground'
                                      }`}>
                                        {msg.sender_type === 'admin' ? 'Admin' : 'Player'}
                                      </p>
                                      <p className="text-foreground">{msg.content}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Send a message to the player about this college..."
                                  value={newCollegeMessage[college.id] || ''}
                                  onChange={(e) => setNewCollegeMessage(prev => ({ ...prev, [college.id]: e.target.value }))}
                                  className="min-h-[40px] max-h-[80px] resize-none text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendCollegeMessage(college.id);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSendCollegeMessage(college.id)}
                                  disabled={!newCollegeMessage[college.id]?.trim() || sendingCollegeMessage[college.id]}
                                >
                                  {sendingCollegeMessage[college.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Player Messages Section */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages with Player
              </h2>
              
              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                {playerMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  playerMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.sender_type === 'admin' 
                          ? 'bg-primary/10 ml-auto' 
                          : 'bg-muted/50'
                      }`}
                    >
                      <p className="text-foreground">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span className={`font-medium ${message.sender_type === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                          {message.sender_type === 'admin' ? 'Admin' : 'Player'}
                        </span>
                        • {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Send Message Input */}
              <MessageInput onSend={handleSendMessage} />
            </div>

            {/* Notifications List */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Activity & Notifications
              </h2>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`rounded-lg p-4 border ${
                        notification.read_at 
                          ? 'bg-muted/30 border-border' 
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{notification.title}</p>
                          {notification.content && (
                            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'admin_note' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : notification.type === 'new_message'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {notification.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Helper component for message input
const MessageInput: React.FC<{ onSend: (content: string) => void }> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await onSend(message.trim());
    setMessage('');
    setSending(false);
  };

  return (
    <div className="flex gap-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Send a message to the player..."
        rows={2}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button 
        variant="venture" 
        onClick={handleSend} 
        disabled={sending || !message.trim()}
        className="self-end"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default PlayerDetail;
