import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  User, 
  CheckSquare, 
  GraduationCap, 
  Trophy,
  ArrowRight,
  Calendar,
  Target,
  Loader2
} from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  target_intake: string | null;
  target_divisions: string[];
  position: string | null;
}

interface DashboardStats {
  checklistTotal: number;
  checklistCompleted: number;
  collegesContacted: number;
  offersReceived: number;
}

export const AthleteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    checklistTotal: 0,
    checklistCompleted: 0,
    collegesContacted: 0,
    offersReceived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);

          // Fetch checklist stats
          const { data: checklistData } = await supabase
            .from('checklist_items')
            .select('status')
            .eq('player_id', profileData.id);

          // Fetch college stats
          const { data: collegeData } = await supabase
            .from('college_tracking')
            .select('status')
            .eq('player_id', profileData.id);

          // Fetch offers
          const { data: offersData } = await supabase
            .from('offers')
            .select('id')
            .eq('player_id', profileData.id);

          setStats({
            checklistTotal: checklistData?.length || 0,
            checklistCompleted: checklistData?.filter(c => c.status === 'completed').length || 0,
            collegesContacted: collegeData?.filter(c => c.status !== 'not_contacted').length || 0,
            offersReceived: offersData?.length || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Active',
      in_placement: 'In Placement',
      placed: 'Placed',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      active: 'status-active',
      in_placement: 'status-in-placement',
      placed: 'status-placed',
      archived: 'status-archived',
    };
    return classes[status] || 'status-active';
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
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.first_name || 'Athlete'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your recruitment journey.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <span className={`status-badge ${getStatusClass(profile?.status || 'active')}`}>
                  {getStatusLabel(profile?.status || 'active')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile?.position && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {profile.position}
                  </span>
                )}
                {profile?.target_intake && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {profile.target_intake}
                  </span>
                )}
                {profile?.target_divisions && profile.target_divisions.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    {profile.target_divisions.map(d => d.replace('_', ' ')).join(', ')}
                  </span>
                )}
              </div>
            </div>
            <Link to="/dashboard/profile">
              <Button variant="outline" size="sm">
                Edit Profile
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Checklist Progress',
              value: `${stats.checklistCompleted}/${stats.checklistTotal}`,
              icon: CheckSquare,
              href: '/dashboard/checklist',
              color: 'text-venture-blue',
              bgColor: 'bg-venture-blue/10',
            },
            {
              label: 'Colleges Contacted',
              value: stats.collegesContacted.toString(),
              icon: GraduationCap,
              href: '/dashboard/colleges',
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-100',
            },
            {
              label: 'Offers Received',
              value: stats.offersReceived.toString(),
              icon: Trophy,
              href: '/dashboard/offers',
              color: 'text-amber-600',
              bgColor: 'bg-amber-100',
            },
          ].map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="stat-card hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border p-6 animate-slide-up stagger-3">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <User className="h-5 w-5 mr-3 text-venture-blue" />
                <div className="text-left">
                  <p className="font-medium">Update Profile</p>
                  <p className="text-xs text-muted-foreground">Edit your info</p>
                </div>
              </Button>
            </Link>
            <Link to="/dashboard/checklist">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <CheckSquare className="h-5 w-5 mr-3 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium">View Checklist</p>
                  <p className="text-xs text-muted-foreground">Track your progress</p>
                </div>
              </Button>
            </Link>
            <Link to="/dashboard/colleges">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <GraduationCap className="h-5 w-5 mr-3 text-amber-600" />
                <div className="text-left">
                  <p className="font-medium">View Colleges</p>
                  <p className="text-xs text-muted-foreground">See recruitment status</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteDashboard;
