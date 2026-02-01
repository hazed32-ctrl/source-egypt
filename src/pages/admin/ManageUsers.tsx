/**
 * Admin - Manage Users
 * Full CRUD for users with proper name display
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Save,
  X,
  UserPlus,
  Check,
  AlertTriangle,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { User, UserRole, mockUsersApi } from '@/lib/api';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'agent', 'sales_agent', 'client']),
});

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  admin: { label: 'Admin', color: 'bg-primary/20 text-primary border-primary/30' },
  agent: { label: 'Agent', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  sales_agent: { label: 'Sales Agent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  client: { label: 'Client', color: 'bg-secondary text-muted-foreground border-border/30' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-success/20 text-success border-success/30' },
  inactive: { label: 'Inactive', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning border-warning/30' },
};

const ManageUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useApiAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'client' as UserRole,
    status: 'active' as 'active' | 'inactive' | 'pending',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await mockUsersApi.list();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = (user: User): string => {
    if (user.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    // Fallback to email prefix
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Unknown User';
  };

  const getInitials = (user: User): string => {
    const name = getDisplayName(user);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      phone: '',
      role: 'client',
      status: 'active',
    });
    setFormErrors({});
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    setFormErrors({});
    
    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await mockUsersApi.create({
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role,
      });
      
      setUsers([newUser, ...users]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'User created successfully. They will receive an invitation email.',
      });
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setFormErrors({});
    
    // Prevent admin from disabling themselves
    if (selectedUser.id === currentUser?.id && formData.status === 'inactive') {
      toast({
        title: 'Error',
        description: 'You cannot disable your own account',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await mockUsersApi.update(selectedUser.id, {
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role,
        status: formData.status,
      });
      
      setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    // Prevent admin from deleting themselves
    if (selectedUser.id === currentUser?.id) {
      toast({
        title: 'Error',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mockUsersApi.delete(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
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
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage user accounts for clients, agents, and admins
          </p>
        </div>

        {/* Actions Bar */}
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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold gap-2" onClick={resetForm}>
                <UserPlus className="w-5 h-5" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/30 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the platform. They will receive an invitation email.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="input-luxury mt-1"
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-destructive mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="input-luxury mt-1"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="input-luxury mt-1"
                  />
                </div>

                <div>
                  <Label>Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="input-luxury mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="sales_agent">Sales Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} disabled={isSubmitting} className="btn-gold">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
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
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Users Found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Create your first user to get started'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card p-5 border border-border/20 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-border/30">
                      <AvatarImage src={user.avatarUrl} alt={getDisplayName(user)} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">
                          {getDisplayName(user)}
                        </h3>
                        <Badge className={roleConfig[user.role].color}>
                          <Shield className="w-3 h-3 mr-1" />
                          {roleConfig[user.role].label}
                        </Badge>
                        <Badge className={statusConfig[user.status].color}>
                          {user.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                          {statusConfig[user.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(user)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openDeleteDialog(user)}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={user.id === currentUser?.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-border/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="input-luxury mt-1"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input-luxury mt-1 opacity-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="input-luxury mt-1"
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="input-luxury mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="sales_agent">Sales Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive' | 'pending') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="input-luxury mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isSubmitting} className="btn-gold">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
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
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PortalLayout>
  );
};

export default ManageUsers;
