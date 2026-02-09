/**
 * Admin - Edit User Page
 * Real Supabase data from profiles + user_roles
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Loader2,
  Save,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleLabels: Record<AppRole, string> = {
  admin: 'Admin',
  client: 'Client',
  sales_agent: 'Sales Agent',
  sales_manager: 'Sales Manager',
  marketer: 'Marketer',
  broker: 'Broker',
};

const allRoles: AppRole[] = ['admin', 'client', 'sales_agent', 'sales_manager', 'marketer', 'broker'];

interface EditableUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: AppRole;
}

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useApiAuth();
  
  const [userData, setUserData] = useState<EditableUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    role: 'client' as AppRole,
  });

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  const fetchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, email, phone').eq('user_id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId).single(),
      ]);

      if (profileRes.error || !profileRes.data) {
        toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
        navigate('/admin/users');
        return;
      }

      const role = (roleRes.data?.role as AppRole) || 'client';
      const user: EditableUser = {
        user_id: profileRes.data.user_id,
        full_name: profileRes.data.full_name,
        email: profileRes.data.email,
        phone: profileRes.data.phone,
        role,
      };

      setUserData(user);
      setFormData({
        fullName: user.full_name || '',
        phone: user.phone || '',
        role: user.role,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      toast({ title: 'Error', description: 'Failed to load user', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !id) return;

    const isSelf = id === currentUser?.id;
    if (isSelf && formData.role !== userData.role) {
      toast({ title: 'Error', description: 'You cannot change your own role', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: formData.fullName, phone: formData.phone || null })
        .eq('user_id', id);
      if (profileErr) throw profileErr;

      if (formData.role !== userData.role) {
        // Delete existing role(s) then insert new one
        await supabase.from('user_roles').delete().eq('user_id', id);
        const { error: roleErr } = await supabase
          .from('user_roles')
          .insert({ user_id: id, role: formData.role });
        if (roleErr) throw roleErr;
      }

      toast({ title: 'Success', description: 'User updated successfully' });
      navigate('/admin/users');
    } catch (err) {
      console.error('Error updating user:', err);
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <PortalLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  if (!userData) {
    return (
      <PortalLayout role="admin">
        <div className="text-center py-20">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </PortalLayout>
    );
  }

  const isSelf = id === currentUser?.id;

  return (
    <PortalLayout role="admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Edit User</h1>
            <p className="text-muted-foreground mt-1">Update user information and permissions</p>
          </div>
        </div>

        {isSelf && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <AlertDescription className="text-warning">
              You are editing your own account. Some changes are restricted.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                User Information
              </CardTitle>
              <CardDescription>Update the user's profile and role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-border/30">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {getInitials(formData.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <Label className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />Full Name</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter full name" className="input-luxury mt-1" />
              </div>

              <div>
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />Email</Label>
                <Input type="email" value={userData.email || ''} disabled className="input-luxury mt-1 opacity-50" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>

              <div>
                <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" className="input-luxury mt-1" />
              </div>

              <div>
                <Label className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as AppRole })} disabled={isSelf}>
                  <SelectTrigger className="input-luxury mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-card border-border/50">
                    {allRoles.map((r) => (
                      <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSelf && <p className="text-xs text-muted-foreground mt-1">You cannot change your own role</p>}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/users')} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="btn-gold flex-1">
                  {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PortalLayout>
  );
};

export default EditUser;
