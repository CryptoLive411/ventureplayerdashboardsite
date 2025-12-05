import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search,
  Loader2,
  Eye
} from 'lucide-react';

type PlayerStatus = 'active' | 'in_placement' | 'placed' | 'archived';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string | null;
  graduation_year: number | null;
  target_divisions: string[];
  status: PlayerStatus;
  target_intake: string | null;
}

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'in_placement', label: 'In Placement' },
  { value: 'placed', label: 'Placed' },
];

export const PlayersList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');

  useEffect(() => {
    const fetchPlayers = async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as PlayerStatus);
      } else {
        // Don't show archived players in the main list
        query = query.neq('status', 'archived');
      }

      const { data, error } = await query;

      if (!error && data) {
        setPlayers(data as Player[]);
      }
      setLoading(false);
    };

    fetchPlayers();
  }, [statusFilter]);

  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const email = player.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const getStatusBadge = (status: PlayerStatus) => {
    const styles: Record<PlayerStatus, string> = {
      active: 'status-active',
      in_placement: 'status-in-placement',
      placed: 'status-placed',
      archived: 'status-archived',
    };
    const labels: Record<PlayerStatus, string> = {
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
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(210,100%,50%)]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Active Players</h1>
          <p className="text-muted-foreground">Manage and track all athlete profiles</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Players Table */}
        {filteredPlayers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'No players match the selected filter'}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Player</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Position</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Grad Year</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Target</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPlayers.map((player, index) => (
                    <tr 
                      key={player.id} 
                      className="hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[hsl(210,100%,50%)]/10 flex items-center justify-center text-[hsl(210,100%,50%)] font-medium flex-shrink-0">
                            {player.first_name[0]}{player.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {player.first_name} {player.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {player.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-foreground">
                          {player.position || '—'}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-foreground">
                          {player.graduation_year || '—'}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-foreground">
                          {player.target_intake || '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(player.status)}
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/admin/players/${player.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlayersList;
