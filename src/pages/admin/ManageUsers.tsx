/**
 * Admin - Manage Users
 * Real Supabase data from profiles + user_roles
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Loader2,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ManagedUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
}

const roleConfig: Record<AppRole, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-primary/20 text-primary border-primary/30' },
  client: { label: 'Client', color: 'bg-secondary text-muted-foreground border-border/30' },
  sales_agent: { label: 'Sales Agent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  sales_manager: { label: 'Sales Manager', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  marketer: { label: 'Marketer', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  broker: { label: 'Broker', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

const allRoles: AppRole[] = ['admin', 'client', 'sales_agent', 'sales_manager', 'marketer', 'broker'];

const ManageUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useApiAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<AppRole>('client');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name, email, phone, avatar_url'),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const rolesMap = new Map<string, AppRole>();
      for (const r of rolesRes.data || []) {
        rolesMap.set(r.user_id, r.role as AppRole);
      }

      const merged: ManagedUser[] = (profilesRes.data || []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        avatar_url: p.avatar_url,
        role: rolesMap.get(p.user_id) || 'client',
      }));

      setUsers(merged);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (user: ManagedUser): string => {
    if (user.full_name?.trim()) return user.full_name;
    if (user.email) return user.email.split('@')[0];
    return 'Unknown User';
  };

  const getInitials = (user: ManagedUser): string => {
    const name = getDisplayName(user);
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const openEditDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    if (selectedUser.user_id === currentUser?.id) {
      toast({ title: 'Error', description: 'You cannot change your own role', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: selectedUser.user_id, role: editRole }, { onConflict: 'user_id' });

      if (error) throw error;

      setUsers(users.map((u) =>
        u.user_id === selectedUser.user_id ? { ...u, role: editRole } : u
      ));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({ title: 'Success', description: 'Role updated successfully' });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.user_id === currentUser?.id) {
      toast({ title: 'Error', description: 'You cannot delete your own account', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: roleErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);
      if (roleErr) throw roleErr;

      const { error: profileErr } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', selectedUser.user_id);
      if (profileErr) throw profileErr;

      setUsers(users.filter((u) => u.user_id !== selectedUser.user_id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({ title: 'Success', description: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      getDisplayName(user).toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query)
    );
  });

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View and manage user accounts and roles</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="input-luxury pl-12"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 border border-border/20 text-center"
          >
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No Users Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'No users in the system yet'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card p-5 border border-border/20 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-border/30">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{getDisplayName(user)}</h3>
                        <Badge className={roleConfig[user.role]?.color || 'bg-secondary text-muted-foreground border-border/30'}>
                          <Shield className="w-3 h-3 mr-1" />
                          {roleConfig[user.role]?.label || user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                        )}
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} className="text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(user)} className="text-muted-foreground hover:text-destructive" disabled={user.user_id === currentUser?.id}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser ? getDisplayName(selectedUser) : 'this user'}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Role</Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as AppRole)}>
                    <SelectTrigger className="input-luxury mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      {allRoles.map((r) => (
                        <SelectItem key={r} value={r}>{roleConfig[r].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateRole} disabled={isSubmitting} className="btn-gold">
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-card border-border/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete User
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">
                  {selectedUser ? getDisplayName(selectedUser) : 'this user'}
                </span>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>) : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PortalLayout>
  );
};

export default ManageUsers;
