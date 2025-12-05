import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Loader2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
}

export const AthleteChecklist: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!user) return;

      // First get the profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('player_id', profile.id)
          .order('sort_order', { ascending: true });

        if (!error && data) {
          setItems(data);
        }
      }
      setLoading(false);
    };

    fetchChecklist();
  }, [user]);

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
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-card rounded-xl border border-border p-5 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
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
                    {item.completed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed on {format(new Date(item.completed_at), 'MMM d, yyyy')}
                      </p>
                    )}
                    {item.due_date && item.status !== 'completed' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
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

export default AthleteChecklist;
