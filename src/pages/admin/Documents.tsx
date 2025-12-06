import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Loader2, 
  FileText, 
  Download, 
  Trash2, 
  Upload,
  Search,
  User,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlayerDocument {
  id: string;
  player_id: string;
  checklist_item_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string;
  uploaded_by_type: string;
  created_at: string;
  player?: {
    first_name: string;
    last_name: string;
  };
  checklist_item?: {
    title: string;
  } | null;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
}

export const AdminDocuments: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PlayerDocument[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [selectedUploadPlayer, setSelectedUploadPlayer] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
    fetchPlayers();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('player_documents')
      .select(`
        *,
        player:profiles!player_id(first_name, last_name),
        checklist_item:checklist_items!checklist_item_id(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .neq('status', 'archived')
      .order('first_name');
    
    if (data) setPlayers(data);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedUploadPlayer || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${selectedUploadPlayer}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('player-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata
      const { error: dbError } = await supabase
        .from('player_documents')
        .insert({
          player_id: selectedUploadPlayer,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          uploaded_by_type: 'admin',
        });

      if (dbError) throw dbError;

      toast.success('File uploaded successfully');
      fetchDocuments();
      setSelectedUploadPlayer('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDownload = async (doc: PlayerDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('player-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (doc: PlayerDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('player-documents')
        .remove([doc.file_path]);

      // Delete metadata
      const { error } = await supabase
        .from('player_documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      setDocuments(documents.filter(d => d.id !== doc.id));
      toast.success('Document deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${doc.player?.first_name} ${doc.player?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlayer = selectedPlayer === 'all' || doc.player_id === selectedPlayer;
    return matchesSearch && matchesPlayer;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">View and manage all player documents</p>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedUploadPlayer} onValueChange={setSelectedUploadPlayer}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={!selectedUploadPlayer || uploading}
                className="cursor-pointer"
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10"
              />
            </div>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Players</SelectItem>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No documents</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedPlayer !== 'all' 
                  ? 'No documents match your filters'
                  : 'Documents uploaded by players or admins will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.player?.first_name} {doc.player?.last_name}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          doc.uploaded_by_type === 'admin' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {doc.uploaded_by_type === 'admin' ? 'Admin' : 'Player'}
                        </span>
                      </div>
                      {doc.checklist_item && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Task: {doc.checklist_item.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default AdminDocuments;
