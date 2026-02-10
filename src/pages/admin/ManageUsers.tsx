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
  UserPlus,
  Copy,
  CheckCircle,
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<AppRole>('client');
  
  // Create user form state
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('client');
  const [newPassword, setNewPassword] = useState('');
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

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
      // Delete existing role(s) then insert new one
      await supabase.from('user_roles').delete().eq('user_id', selectedUser.user_id);
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.user_id, role: editRole });

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

  const handleCreateUser = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({ title: 'Error', description: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setCreatedTempPassword(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: newEmail.trim(),
            password: newPassword || undefined,
            full_name: newFullName.trim() || undefined,
            role: newRole,
            phone: newPhone.trim() || undefined,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create user');

      if (result.temporary_password) {
        setCreatedTempPassword(result.temporary_password);
      }

      toast({ title: 'Success', description: `User ${newEmail} created successfully` });
      await fetchUsers();

      if (!result.temporary_password) {
        resetCreateForm();
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast({ title: 'Error', description: err.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setNewEmail('');
    setNewFullName('');
    setNewPhone('');
    setNewRole('client');
    setNewPassword('');
    setCreatedTempPassword(null);
    setIsCreateDialogOpen(false);
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
          <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-gold">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
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

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { if (!open) resetCreateForm(); else setIsCreateDialogOpen(true); }}>
          <DialogContent className="glass-card border-border/30 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Create New User
              </DialogTitle>
              <DialogDescription>
                Create a new user account. They will be able to log in immediately.
              </DialogDescription>
            </DialogHeader>

            {createdTempPassword ? (
              <div className="space-y-4 mt-4">
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">User created successfully!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A temporary password was generated. Share it securely with the user — it will not be shown again.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input value={createdTempPassword} readOnly className="input-luxury font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTempPassword);
                        toast({ title: 'Copied', description: 'Password copied to clipboard' });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={resetCreateForm} className="btn-gold">Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="input-luxury mt-1"
                  />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input-luxury mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+966 5XX XXX XXXX"
                    className="input-luxury mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger className="input-luxury mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      {allRoles.map((r) => (
                        <SelectItem key={r} value={r}>{roleConfig[r].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Password <span className="text-muted-foreground text-xs">(leave blank to auto-generate)</span></Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters or leave blank"
                    className="input-luxury mt-1"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetCreateForm}>Cancel</Button>
                  <Button onClick={handleCreateUser} disabled={isSubmitting} className="btn-gold">
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>) : (<><UserPlus className="w-4 h-4 mr-2" />Create User</>)}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ManageUsers;
