import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Calendar, DollarSign, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

interface Offer {
  id: string;
  college_name: string;
  scholarship_amount: number | null;
  scholarship_percentage: number | null;
  offer_type: string | null;
  deadline: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  considering: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
};

export const AthleteOffers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('player_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOffers(data);
        }
      }
      setLoading(false);
    };

    fetchOffers();
  }, [user]);

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
          <h1 className="text-2xl font-bold text-foreground mb-2">My Offers</h1>
          <p className="text-muted-foreground">View and track scholarship offers from colleges</p>
        </div>

        {offers.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offers yet</h3>
            <p className="text-muted-foreground">
              When colleges make you offers, they'll appear here. Keep working on your profile and stay in touch with your Venture team!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="bg-card rounded-xl border border-border p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-venture-gold/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{offer.college_name}</h3>
                      {offer.offer_type && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {offer.offer_type} Scholarship
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${statusColors[offer.status]} border-0 capitalize`}>
                    {offer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {offer.scholarship_amount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        ${offer.scholarship_amount.toLocaleString()}/year
                      </span>
                    </div>
                  )}
                  {offer.scholarship_percentage && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {offer.scholarship_percentage}% Coverage
                      </span>
                    </div>
                  )}
                  {offer.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        Deadline: {format(new Date(offer.deadline), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                {offer.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">{offer.notes}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Received: {format(new Date(offer.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteOffers;
