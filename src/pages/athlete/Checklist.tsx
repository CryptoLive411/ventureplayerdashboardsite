import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Loader2, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, StickyNote, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  assigned_to_player: boolean | null;
  player_notes: string | null;
  player_files: string[] | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

export const AthleteChecklist: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [playerNotes, setPlayerNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [completingTask, setCompletingTask] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!user) return;

      // First get the profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        
        const { data, error } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('player_id', profileData.id)
          .order('sort_order', { ascending: true });

        if (!error && data) {
          setItems(data);
          // Initialize player notes
          const notes: Record<string, string> = {};
          data.forEach(item => {
            notes[item.id] = item.player_notes || '';
          });
          setPlayerNotes(notes);
        }
      }
      setLoading(false);
    };

    fetchChecklist();
  }, [user]);

  const handleSaveNotes = async (itemId: string) => {
    if (!profile) return;
    
    setSavingNotes(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({ player_notes: playerNotes[itemId] })
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, player_notes: playerNotes[itemId] } : item
      ));
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCompleteTask = async (item: ChecklistItem) => {
    if (!profile || !item.assigned_to_player) return;

    setCompletingTask(prev => ({ ...prev, [item.id]: true }));

    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', item.id);

      if (error) throw error;

      // Notify all admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins) {
        const notificationPromises = admins.map(admin =>
          supabase.from('notifications').insert({
            user_id: admin.user_id,
            player_id: profile.id,
            type: 'task_completed',
            title: `${profile.first_name} ${profile.last_name} completed a task`,
            content: `Task: ${item.title}`,
            link: `/admin/players/${profile.id}`,
          })
        );
        await Promise.all(notificationPromises);
      }

      // Update local state
      setItems(items.map(i => 
        i.id === item.id 
          ? { ...i, status: 'completed', completed_at: new Date().toISOString() } 
          : i
      ));
      toast.success('Task marked as complete!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setCompletingTask(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-venture-success" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-venture-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const completedCount = items.filter(i => i.status === 'completed').length;
  const progressPercentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Checklist</h1>
          <p className="text-muted-foreground">Track your recruitment progress</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {completedCount} of {items.length}
              </p>
              <p className="text-sm text-muted-foreground">Tasks completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-venture-blue">
                {Math.round(progressPercentage)}%
              </p>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-venture-blue to-venture-blue-light transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        {items.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No checklist items yet</h3>
            <p className="text-muted-foreground">
              Your Venture team will add checklist items as your recruitment progresses.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const isExpanded = expandedItemId === item.id;
              const canComplete = item.assigned_to_player && item.status !== 'completed';
              
              return (
                <div
                  key={item.id}
                  className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`font-medium ${
                              item.status === 'completed' 
                                ? 'text-muted-foreground line-through' 
                                : 'text-foreground'
                            }`}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                              item.status === 'completed'
                                ? 'bg-venture-success/10 text-emerald-700'
                                : item.status === 'in_progress'
                                ? 'bg-venture-warning/10 text-amber-700'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {item.completed_at && (
                            <p className="text-xs text-muted-foreground">
                              Completed on {format(new Date(item.completed_at), 'MMM d, yyyy')}
                            </p>
                          )}
                          {item.due_date && item.status !== 'completed' && (
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                            </p>
                          )}
                          {item.assigned_to_player && (
                            <Badge variant="outline" className="text-xs border-venture-blue/30 text-venture-blue bg-venture-blue/10">
                              Assigned to You
                            </Badge>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-2 mt-3">
                          {canComplete && (
                            <Button
                              size="sm"
                              variant="venture"
                              onClick={() => handleCompleteTask(item)}
                              disabled={completingTask[item.id]}
                            >
                              {completingTask[item.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              Mark Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          >
                            <StickyNote className="h-4 w-4 mr-2" />
                            {item.player_notes ? 'View Notes' : 'Add Notes'}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Notes Section */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-border bg-muted/30">
                      <div className="pt-4">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Your Notes
                        </label>
                        <Textarea
                          placeholder="Add notes, questions, or updates about this task..."
                          value={playerNotes[item.id] || ''}
                          onChange={(e) => setPlayerNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="min-h-[100px] resize-none"
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleSaveNotes(item.id)}
                          disabled={savingNotes[item.id]}
                        >
                          {savingNotes[item.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteChecklist;
