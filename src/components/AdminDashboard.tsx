import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { adminService, AdminUser, UserFilter } from '@/lib/adminService';
import {
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Download,
    Filter,
    Mail,
    Phone,
    RefreshCw,
    Send,
    Settings,
    Shield,
    Users,
    XCircle
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AdminDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilter>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    expired: 0,
    trialing: 0,
    withPaymentProfile: 0,
    verified: 0,
  });
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    averageRevenuePerUser: 0,
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<'suspend' | 'activate' | 'send_reminder' | 'reset_payment_attempts'>('send_reminder');
  const [reminderMessage, setReminderMessage] = useState('');
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedUserForReminder, setSelectedUserForReminder] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await adminService.getAllUsers(filters);
      setUsers(allUsers);
      setFilteredUsers(allUsers);

      // Load statistics
      const stats = await adminService.getUserStatistics();
      setStatistics(stats);

      const revenue = await adminService.getRevenueStatistics();
      setRevenueStats(revenue);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!users || !searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select users to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await adminService.performBulkAction({
        userIds: selectedUsers,
        action: bulkAction,
        message: reminderMessage,
      });

      toast({
        title: 'Bulk Action Completed',
        description: `Successfully processed ${result.success} users. ${result.failed} failed.`,
      });

      setSelectedUsers([]);
      setShowBulkActions(false);
      loadUsers(); // Refresh data
    } catch (error) {
      toast({
        title: 'Bulk Action Failed',
        description: 'An error occurred while performing the bulk action.',
        variant: 'destructive',
      });
    }
  };

  const handleSendReminder = async (user: AdminUser) => {
    if (!reminderMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a reminder message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await adminService.sendReminder(user.uid, reminderMessage);
      if (success) {
        toast({
          title: 'Reminder Sent',
          description: `Reminder sent to ${user.name}`,
        });
        setShowReminderDialog(false);
        setReminderMessage('');
        setSelectedUserForReminder(null);
      } else {
        toast({
          title: 'Failed to Send Reminder',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    const accountStatus = user.paymentProfile?.accountStatus || 'unknown';
    const subscriptionStatus = user.subscription?.status || 'unknown';

    if (accountStatus === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (subscriptionStatus === 'past_due') {
      return <Badge variant="destructive">Past Due</Badge>;
    }
    if (subscriptionStatus === 'active') {
      return <Badge variant="default">Active</Badge>;
    }
    if (subscriptionStatus === 'trialing') {
      return <Badge variant="secondary">Trial</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getPlanBadge = (planId: string) => {
    const planColors: { [key: string]: string } = {
      'free': 'bg-gray-100 text-gray-800',
      'basic': 'bg-blue-100 text-blue-800',
      'pro': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-orange-100 text-orange-800',
    };
    return <Badge className={planColors[planId] || 'bg-gray-100 text-gray-800'}>{planId}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (user: AdminUser) => {
    if (!user.subscription?.currentPeriodEnd) return null;
    const now = new Date();
    const expiry = new Date(user.subscription.currentPeriodEnd);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, subscriptions, and system operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.active} active, {statistics.suspended} suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.trialing} in trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueStats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">
              ${revenueStats.averageRevenuePerUser.toFixed(2)} avg per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Subscriptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.expired}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Subscription Status</Label>
              <Select
                value={filters.subscriptionStatus || 'all'}
                onValueChange={(value) => setFilters({ ...filters, subscriptionStatus: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Account Status</Label>
              <Select
                value={filters.accountStatus || 'all'}
                onValueChange={(value) => setFilters({ ...filters, accountStatus: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select
                value={filters.planId || 'all'}
                onValueChange={(value) => setFilters({ ...filters, planId: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bulk Actions ({selectedUsers.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={bulkAction} onValueChange={(value) => setBulkAction(value as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_reminder">Send Reminder</SelectItem>
                  <SelectItem value="suspend">Suspend Accounts</SelectItem>
                  <SelectItem value="activate">Activate Accounts</SelectItem>
                  <SelectItem value="reset_payment_attempts">Reset Payment Attempts</SelectItem>
                </SelectContent>
              </Select>
              {bulkAction === 'send_reminder' && (
                <Input
                  placeholder="Reminder message..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="flex-1"
                />
              )}
              <Button onClick={handleBulkAction}>
                <Send className="h-4 w-4 mr-2" />
                Execute
              </Button>
              <Button variant="outline" onClick={() => setSelectedUsers([])}>
                <XCircle className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, subscriptions, and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.uid));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const daysUntilExpiry = getDaysUntilExpiry(user);
                  const isSelected = selectedUsers.includes(user.uid);

                  return (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.uid]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.uid));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.subscription?.planId ? getPlanBadge(user.subscription.planId) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.paymentProfile?.isVerified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                          {user.paymentProfile?.totalFailedAttempts > 0 && (
                            <div className="text-red-600 text-xs mt-1">
                              {user.paymentProfile.totalFailedAttempts} failed attempts
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.subscription?.currentPeriodEnd ? (
                          <div className="text-sm">
                            <div>{formatDate(user.subscription.currentPeriodEnd)}</div>
                            {daysUntilExpiry !== null && (
                              <div className={`text-xs ${
                                daysUntilExpiry <= 0 ? 'text-red-600' :
                                daysUntilExpiry <= 7 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {daysUntilExpiry <= 0 ? 'Expired' :
                                 daysUntilExpiry <= 7 ? `${daysUntilExpiry} days left` :
                                 `${daysUntilExpiry} days left`}
                              </div>
                            )}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUserForReminder(user);
                              setShowReminderDialog(true);
                            }}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Toggle account status
                              const newStatus = user.paymentProfile?.accountStatus === 'active' ? 'suspended' : 'active';
                              adminService.performBulkAction({
                                userIds: [user.uid],
                                action: newStatus === 'active' ? 'activate' : 'suspend',
                              }).then(() => loadUsers());
                            }}
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder message to {selectedUserForReminder?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message</Label>
              <Textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Enter your reminder message..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleSendReminder(selectedUserForReminder!)}>
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
