import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck,
  Archive,
  Trophy,
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  activePlayers: number;
  placedPlayers: number;
  archivedPlayers: number;
  totalOffers: number;
}

interface RecentPlayer {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activePlayers: 0,
    placedPlayers: 0,
    archivedPlayers: 0,
    totalOffers: 0,
  });
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch player stats
        const { data: profiles } = await supabase
          .from('profiles')
          .select('status');

        if (profiles) {
          setStats({
            activePlayers: profiles.filter(p => p.status === 'active' || p.status === 'in_placement').length,
            placedPlayers: profiles.filter(p => p.status === 'placed').length,
            archivedPlayers: profiles.filter(p => p.status === 'archived').length,
            totalOffers: 0, // Will be updated below
          });
        }

        // Fetch total offers
        const { count: offerCount } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true });

        setStats(prev => ({ ...prev, totalOffers: offerCount || 0 }));

        // Fetch recent players
        const { data: recent } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, position, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recent) {
          setRecentPlayers(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'status-active',
      in_placement: 'status-in-placement',
      placed: 'status-placed',
      archived: 'status-archived',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      in_placement: 'In Placement',
      placed: 'Placed',
      archived: 'Archived',
    };
    return (
      <span className={`status-badge ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
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
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage players and track recruitment progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Active Players',
              value: stats.activePlayers,
              icon: Users,
              href: '/admin/players',
              color: 'text-venture-blue',
              bgColor: 'bg-venture-blue/10',
            },
            {
              label: 'Placed',
              value: stats.placedPlayers,
              icon: UserCheck,
              href: '/admin/players?status=placed',
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-100',
            },
            {
              label: 'Archived',
              value: stats.archivedPlayers,
              icon: Archive,
              href: '/admin/archived',
              color: 'text-muted-foreground',
              bgColor: 'bg-muted',
            },
            {
              label: 'Total Offers',
              value: stats.totalOffers,
              icon: Trophy,
              href: '/admin/players',
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

        {/* Recent Players */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up stagger-3">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Players</h2>
              <p className="text-sm text-muted-foreground">Latest registered athletes</p>
            </div>
            <Link to="/admin/players">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentPlayers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No players yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentPlayers.map((player) => (
                <Link
                  key={player.id}
                  to={`/admin/players/${player.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-venture-blue/10 flex items-center justify-center text-venture-blue font-medium">
                      {player.first_name[0]}{player.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {player.position || 'Position not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(player.status)}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
