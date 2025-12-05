import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, User, GraduationCap, Trophy } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  position: string | null;
  current_club: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  graduation_year: number | null;
  gpa: number | null;
  gpa_scale: string | null;
  sat_score: number | null;
  act_score: number | null;
  toefl_score: number | null;
  ielts_score: number | null;
  budget_per_year: number | null;
  target_intake: string | null;
  target_divisions: string[];
  target_regions: string[];
  additional_notes: string | null;
  highlight_video_url: string | null;
}

const divisions = [
  { value: 'NCAA_D1', label: 'NCAA Division I' },
  { value: 'NCAA_D2', label: 'NCAA Division II' },
  { value: 'NCAA_D3', label: 'NCAA Division III' },
  { value: 'NAIA', label: 'NAIA' },
  { value: 'NJCAA', label: 'NJCAA' },
];

export const AthleteProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (field: keyof Profile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleDivisionToggle = (division: string) => {
    if (!profile) return;
    const current = profile.target_divisions || [];
    const updated = current.includes(division)
      ? current.filter(d => d !== division)
      : [...current, division];
    setProfile({ ...profile, target_divisions: updated });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        nationality: profile.nationality,
        date_of_birth: profile.date_of_birth,
        position: profile.position,
        current_club: profile.current_club,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        graduation_year: profile.graduation_year,
        gpa: profile.gpa,
        gpa_scale: profile.gpa_scale,
        sat_score: profile.sat_score,
        act_score: profile.act_score,
        toefl_score: profile.toefl_score,
        ielts_score: profile.ielts_score,
        budget_per_year: profile.budget_per_year,
        target_intake: profile.target_intake,
        target_divisions: profile.target_divisions,
        target_regions: profile.target_regions,
        additional_notes: profile.additional_notes,
        highlight_video_url: profile.highlight_video_url,
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setSaving(false);
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

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal and athletic information</p>
          </div>
          <Button variant="venture" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Personal Information */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-venture-blue/10 flex items-center justify-center">
              <User className="h-5 w-5 text-venture-blue" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={profile.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={profile.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                value={profile.nationality || ''}
                onChange={(e) => handleChange('nationality', e.target.value)}
                placeholder="United States"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={profile.date_of_birth || ''}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Athletic Information */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Athletic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={profile.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="e.g., Forward, Midfielder"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Club</Label>
              <Input
                value={profile.current_club || ''}
                onChange={(e) => handleChange('current_club', e.target.value)}
                placeholder="Club name"
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={profile.height_cm || ''}
                onChange={(e) => handleChange('height_cm', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="180"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={profile.weight_kg || ''}
                onChange={(e) => handleChange('weight_kg', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="75"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Highlight Video URL</Label>
              <Input
                value={profile.highlight_video_url || ''}
                onChange={(e) => handleChange('highlight_video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-card rounded-2xl border border-border p-6 mb-6 animate-fade-in stagger-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Academic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Graduation Year</Label>
              <Input
                type="number"
                value={profile.graduation_year || ''}
                onChange={(e) => handleChange('graduation_year', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="2026"
              />
            </div>
            <div className="space-y-2">
              <Label>GPA</Label>
              <Input
                type="number"
                step="0.01"
                value={profile.gpa || ''}
                onChange={(e) => handleChange('gpa', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="3.50"
              />
            </div>
            <div className="space-y-2">
              <Label>GPA Scale</Label>
              <Input
                value={profile.gpa_scale || ''}
                onChange={(e) => handleChange('gpa_scale', e.target.value)}
                placeholder="4.0"
              />
            </div>
            <div className="space-y-2">
              <Label>SAT Score</Label>
              <Input
                type="number"
                value={profile.sat_score || ''}
                onChange={(e) => handleChange('sat_score', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="1200"
              />
            </div>
            <div className="space-y-2">
              <Label>ACT Score</Label>
              <Input
                type="number"
                value={profile.act_score || ''}
                onChange={(e) => handleChange('act_score', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="28"
              />
            </div>
            <div className="space-y-2">
              <Label>TOEFL Score</Label>
              <Input
                type="number"
                value={profile.toefl_score || ''}
                onChange={(e) => handleChange('toefl_score', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="100"
              />
            </div>
          </div>
        </section>

        {/* Recruitment Preferences */}
        <section className="bg-card rounded-2xl border border-border p-6 animate-fade-in stagger-3">
          <h2 className="text-lg font-semibold text-foreground mb-6">Recruitment Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Target Intake</Label>
              <Input
                value={profile.target_intake || ''}
                onChange={(e) => handleChange('target_intake', e.target.value)}
                placeholder="e.g., Fall 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget per Year ($)</Label>
              <Input
                type="number"
                value={profile.budget_per_year || ''}
                onChange={(e) => handleChange('budget_per_year', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="25000"
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <Label>Target Divisions</Label>
            <div className="flex flex-wrap gap-2">
              {divisions.map((division) => (
                <button
                  key={division.value}
                  type="button"
                  onClick={() => handleDivisionToggle(division.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    profile.target_divisions?.includes(division.value)
                      ? 'bg-venture-blue text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {division.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={profile.additional_notes || ''}
              onChange={(e) => handleChange('additional_notes', e.target.value)}
              placeholder="Any other information you'd like to share..."
              rows={4}
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AthleteProfile;
