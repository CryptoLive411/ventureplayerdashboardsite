import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Loader2, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('college_tracking')
          .select('*')
          .eq('player_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setColleges(data);
        }
      }
      setLoading(false);
    };

    fetchColleges();
  }, [user]);

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

  const CollegeCard = ({ college, index }: { college: CollegeTracking; index: number }) => (
    <div
      className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
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
        <p className="text-xs text-muted-foreground">
          Last action: {format(new Date(college.last_action_date), 'MMM d, yyyy')}
        </p>
      )}
    </div>
  );

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
          ].map((stat, i) => (
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
                    <CollegeCard key={college.id} college={college} index={index} />
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
                    <CollegeCard key={college.id} college={college} index={index} />
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
                    <CollegeCard key={college.id} college={college} index={index} />
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

export default AthleteColleges;
