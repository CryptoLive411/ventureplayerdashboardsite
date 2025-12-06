import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Loader2
} from 'lucide-react';

interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string | null;
  status: string;
  graduation_year: number | null;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('status', 'archived')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Filter players by search query
  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const email = player.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Categorize players
  const newPlayers = filteredPlayers.filter(p => p.status === 'active');
  const inProgressPlayers = filteredPlayers.filter(p => p.status === 'in_placement');
  const placedPlayers = filteredPlayers.filter(p => p.status === 'placed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'in_placement': return 'bg-amber-500';
      case 'placed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const PlayerCard = ({ player }: { player: PlayerProfile }) => (
    <Link
      to={`/admin/players/${player.id}`}
      className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-venture-blue/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-venture-blue/10 flex items-center justify-center text-venture-blue font-semibold">
          {player.first_name[0]}{player.last_name[0]}
        </div>
        <div>
          <p className="font-semibold text-foreground group-hover:text-venture-blue transition-colors">
            {player.first_name} {player.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {player.position || 'No position'} {player.graduation_year && `• Class of ${player.graduation_year}`}
          </p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-venture-blue transition-colors" />
    </Link>
  );

  const CategorySection = ({ 
    title, 
    icon: Icon, 
    players, 
    emptyMessage,
    iconBg,
    iconColor 
  }: { 
    title: string; 
    icon: React.ElementType; 
    players: PlayerProfile[];
    emptyMessage: string;
    iconBg: string;
    iconColor: string;
  }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{players.length} player{players.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
        ) : (
          players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))
        )}
      </div>
    </div>
  );

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
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Player Profiles
            </h1>
            <p className="text-muted-foreground mt-1">
              {players.length} total players in the system
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">New Players</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">{newPlayers.length}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{inProgressPlayers.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Placed</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{placedPlayers.length}</p>
          </div>
        </div>

        {/* Player Categories */}
        <div className="grid lg:grid-cols-3 gap-6">
          <CategorySection
            title="New Players"
            icon={UserPlus}
            players={newPlayers}
            emptyMessage="No new players"
            iconBg="bg-blue-100 dark:bg-blue-500/20"
            iconColor="text-blue-600"
          />
          <CategorySection
            title="In Progress"
            icon={Clock}
            players={inProgressPlayers}
            emptyMessage="No players in progress"
            iconBg="bg-amber-100 dark:bg-amber-500/20"
            iconColor="text-amber-600"
          />
          <CategorySection
            title="Placed"
            icon={CheckCircle}
            players={placedPlayers}
            emptyMessage="No placed players yet"
            iconBg="bg-emerald-100 dark:bg-emerald-500/20"
            iconColor="text-emerald-600"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
