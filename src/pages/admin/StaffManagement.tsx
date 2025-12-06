import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Check, 
  X, 
  Loader2,
  Clock,
  Mail
} from 'lucide-react';

interface PendingRequest {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  requested_at: string;
}

export const StaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_admin_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      // Add admin role to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: request.user_id,
          role: 'admin'
        });

      if (roleError) {
        // Check if already has role
        if (roleError.message.includes('duplicate')) {
          // Role already exists, just update the request
        } else {
          throw roleError;
        }
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('pending_admin_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`${request.first_name} ${request.last_name} has been approved as staff`);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: PendingRequest) => {
    setProcessingId(request.id);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('pending_admin_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast.success(`Request from ${request.first_name} ${request.last_name} has been rejected`);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Review and approve staff account requests
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Pending Requests</h2>
              <p className="text-sm text-muted-foreground">{requests.length} awaiting review</p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending requests</p>
              <p className="text-sm text-muted-foreground mt-1">
                All staff requests have been reviewed
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request) => (
                <div key={request.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-venture-blue/10 flex items-center justify-center text-venture-blue font-semibold">
                      {request.first_name[0]}{request.last_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {request.first_name} {request.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        Requested {formatDate(request.requested_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request)}
                      disabled={processingId === request.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;
