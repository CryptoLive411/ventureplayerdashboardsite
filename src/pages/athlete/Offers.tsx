import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Calendar, DollarSign, GraduationCap, Check, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  player_id: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  user_id: string;
}

const statusColors: Record<string, string> = {
  considering: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-700',
  committed: 'bg-venture-blue/20 text-venture-blue',
};

export const AthleteOffers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState<string | null>(null);
  const [confirmCommitOffer, setConfirmCommitOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('player_id', profileData.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOffers(data);
        }
      }
      setLoading(false);
    };

    fetchOffers();
  }, [user]);

  const handleCommit = async (offer: Offer) => {
    if (!profile) return;
    
    setCommitting(offer.id);
    
    try {
      // Update the offer status to committed
      const { error: offerError } = await supabase
        .from('offers')
        .update({ status: 'committed' })
        .eq('id', offer.id);

      if (offerError) throw offerError;

      // Update the player status to placed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'placed' })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Notify admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins) {
        const notificationPromises = admins.map(admin =>
          supabase.from('notifications').insert({
            user_id: admin.user_id,
            player_id: profile.id,
            type: 'commitment',
            title: `🎉 ${profile.first_name} ${profile.last_name} committed to ${offer.college_name}!`,
            content: `Player has accepted and committed to their offer.`,
            link: `/admin/players/${profile.id}`,
          })
        );
        await Promise.all(notificationPromises);
      }

      // Update local state
      setOffers(offers.map(o => 
        o.id === offer.id ? { ...o, status: 'committed' } : o
      ));
      
      setConfirmCommitOffer(null);
      toast.success(`Congratulations! You've committed to ${offer.college_name}!`);
    } catch (error) {
      console.error('Error committing to offer:', error);
      toast.error('Failed to commit to offer');
    } finally {
      setCommitting(null);
    }
  };

  const hasCommittedOffer = offers.some(o => o.status === 'committed');

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

        {/* Commitment Banner */}
        {hasCommittedOffer && (
          <div className="bg-gradient-to-r from-venture-blue to-venture-blue-light text-white rounded-2xl p-6 mb-8 flex items-center gap-4">
            <PartyPopper className="h-10 w-10" />
            <div>
              <h2 className="text-xl font-bold">Congratulations!</h2>
              <p className="opacity-90">
                You've committed to {offers.find(o => o.status === 'committed')?.college_name}!
              </p>
            </div>
          </div>
        )}

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
                className={`bg-card rounded-xl border p-6 animate-slide-up ${
                  offer.status === 'committed' 
                    ? 'border-venture-blue/50 ring-2 ring-venture-blue/20' 
                    : 'border-border'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      offer.status === 'committed' 
                        ? 'bg-venture-blue/20' 
                        : 'bg-venture-gold/20'
                    }`}>
                      {offer.status === 'committed' ? (
                        <Check className="h-6 w-6 text-venture-blue" />
                      ) : (
                        <Trophy className="h-6 w-6 text-amber-600" />
                      )}
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
                  <Badge className={`${statusColors[offer.status] || statusColors.considering} border-0 capitalize`}>
                    {offer.status === 'committed' ? '✓ Committed' : offer.status}
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
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-muted-foreground">{offer.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Received: {format(new Date(offer.created_at), 'MMM d, yyyy')}
                  </p>
                  
                  {offer.status === 'considering' && !hasCommittedOffer && (
                    <Button
                      variant="venture"
                      size="sm"
                      onClick={() => setConfirmCommitOffer(offer)}
                      disabled={committing === offer.id}
                    >
                      {committing === offer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Commit to this School
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmCommitOffer} onOpenChange={() => setConfirmCommitOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Commit to {confirmCommitOffer?.college_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a big decision! Once you commit, your status will be updated to "Placed" and your Venture team will be notified. 
              Make sure you've discussed this with your family and are ready to accept this offer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCommitOffer && handleCommit(confirmCommitOffer)}
              className="bg-venture-blue hover:bg-venture-blue/90"
            >
              Yes, I'm Ready to Commit!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AthleteOffers;
