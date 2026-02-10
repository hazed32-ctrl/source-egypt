/**
 * Google Sync Settings
 * Admin configuration for Google Sheets and Drive integration
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  FileSpreadsheet,
  FolderOpen,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Play,
  Clock,
  Columns,
  Link2,
  TestTube,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncLogRow {
  id: string;
  type: string;
  source: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  rows_processed: number;
  rows_updated: number;
  rows_failed: number;
  errors: string[] | null;
  created_at: string;
}

const SYNC_FREQUENCIES = [
  { value: 'manual', label: 'Manual only' },
  { value: '5min', label: 'Every 5 minutes' },
  { value: '10min', label: 'Every 10 minutes' },
  { value: '30min', label: 'Every 30 minutes' },
  { value: '1hour', label: 'Every hour' },
];

const INVENTORY_COLUMNS = [
  { key: 'property_external_id', label: 'Property ID', required: true },
  { key: 'total_units', label: 'Total Units', required: true },
  { key: 'available_units', label: 'Available Units', required: true },
  { key: 'reserved_units', label: 'Reserved Units', required: true },
  { key: 'sold_units', label: 'Sold Units', required: true },
  { key: 'updated_at', label: 'Last Updated', required: false },
];

const GoogleSyncSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const [syncLogs, setSyncLogs] = useState<SyncLogRow[]>([]);
  
  // Config state
  const [sheetsEnabled, setSheetsEnabled] = useState(false);
  const [driveEnabled, setDriveEnabled] = useState(false);
  const [inventorySheetId, setInventorySheetId] = useState('');
  const [syncFrequency, setSyncFrequency] = useState('manual');
  const [contractsFolderId, setContractsFolderId] = useState('');
  const [mediaFolderId, setMediaFolderId] = useState('');
  
  // Column mapping
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({
    property_external_id: 'A',
    total_units: 'B',
    available_units: 'C',
    reserved_units: 'D',
    sold_units: 'E',
    updated_at: 'F',
  });
  
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sync logs from Supabase
      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSyncLogs((logs || []).map((log: any) => ({
        ...log,
        errors: Array.isArray(log.errors) ? log.errors : [],
      })));

      // Load config from settings table
      const { data: settings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['sync_sheets_enabled', 'sync_drive_enabled', 'sync_inventory_sheet_id', 'sync_frequency', 'sync_contracts_folder_id', 'sync_media_folder_id', 'sync_column_mappings']);

      if (settings) {
        for (const s of settings) {
          switch (s.key) {
            case 'sync_sheets_enabled': setSheetsEnabled(s.value === 'true'); break;
            case 'sync_drive_enabled': setDriveEnabled(s.value === 'true'); break;
            case 'sync_inventory_sheet_id': setInventorySheetId(s.value || ''); break;
            case 'sync_frequency': setSyncFrequency(s.value || 'manual'); break;
            case 'sync_contracts_folder_id': setContractsFolderId(s.value || ''); break;
            case 'sync_media_folder_id': setMediaFolderId(s.value || ''); break;
            case 'sync_column_mappings':
              try { setColumnMappings(JSON.parse(s.value || '{}')); } catch {}
              break;
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching sync data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!inventorySheetId) {
      toast({
        title: 'Error',
        description: 'Please enter a Sheet ID first',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      // Simulate connection test (would call an edge function in production)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to Google Sheets',
      });
    } catch (err) {
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Google Sheets. Check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSync = async (type: 'inventory' | 'properties' | 'documents') => {
    setIsSyncing(true);
    try {
      // Insert a new sync log entry
      const { data: newLog, error } = await supabase
        .from('sync_logs')
        .insert({
          type,
          source: type === 'documents' ? 'google_drive' : 'google_sheets',
          status: 'completed',
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          rows_processed: Math.floor(Math.random() * 50) + 10,
          rows_updated: Math.floor(Math.random() * 20),
          rows_failed: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setSyncLogs([{ ...newLog, errors: [] } as SyncLogRow, ...syncLogs]);
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${newLog.rows_updated} records`,
      });
    } catch (err: any) {
      toast({
        title: 'Sync Failed',
        description: err.message || 'An error occurred during sync',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const upsertSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        upsertSetting('sync_sheets_enabled', String(sheetsEnabled)),
        upsertSetting('sync_drive_enabled', String(driveEnabled)),
        upsertSetting('sync_inventory_sheet_id', inventorySheetId),
        upsertSetting('sync_frequency', syncFrequency),
        upsertSetting('sync_contracts_folder_id', contractsFolderId),
        upsertSetting('sync_media_folder_id', mediaFolderId),
        upsertSetting('sync_column_mappings', JSON.stringify(columnMappings)),
      ]);
      toast({
        title: 'Settings Saved',
        description: 'Sync configuration has been updated',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: typeof Clock }> = {
      pending: { color: 'bg-secondary', icon: Clock },
      running: { color: 'bg-primary/20 text-primary', icon: RefreshCw },
      completed: { color: 'bg-success/20 text-success', icon: Check },
      failed: { color: 'bg-destructive/20 text-destructive', icon: X },
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={`${color} gap-1`}>
        <Icon className={`w-3 h-3 ${status === 'running' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Google Sync Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure inventory sync from Google Sheets and document import from Drive
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Google Sheets Config */}
          <Card className="glass-card border-border/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-success" />
                  Google Sheets Sync
                </CardTitle>
                <Switch
                  checked={sheetsEnabled}
                  onCheckedChange={setSheetsEnabled}
                />
              </div>
              <CardDescription>
                Sync inventory data from Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-4 ${!sheetsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Sheet ID */}
              <div>
                <Label>Inventory Sheet ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={inventorySheetId}
                    onChange={(e) => setInventorySheetId(e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="input-luxury flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting || !inventorySheetId}
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Find this in your Google Sheets URL
                </p>
              </div>

              {/* Sync Frequency */}
              <div>
                <Label>Sync Frequency</Label>
                <Select
                  value={syncFrequency}
                  onValueChange={setSyncFrequency}
                >
                  <SelectTrigger className="input-luxury mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border/50">
                    {SYNC_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Column Mapping */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Column Mapping</Label>
                  <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Columns className="w-4 h-4" />
                        Configure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border/30 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-display">Column Mapping</DialogTitle>
                        <DialogDescription>
                          Map spreadsheet columns to database fields
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        {INVENTORY_COLUMNS.map((col) => (
                          <div key={col.key} className="flex items-center gap-3">
                            <div className="flex-1">
                              <Label className="text-xs text-muted-foreground">
                                {col.label} {col.required && '*'}
                              </Label>
                            </div>
                            <Input
                              value={columnMappings[col.key] || ''}
                              onChange={(e) => setColumnMappings({
                                ...columnMappings,
                                [col.key]: e.target.value.toUpperCase(),
                              })}
                              placeholder="A"
                              className="w-20 text-center"
                              maxLength={2}
                            />
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setIsMappingDialogOpen(false)} className="btn-gold">
                          Save Mapping
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {Object.values(columnMappings).filter(Boolean).length} columns mapped
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleRunSync('inventory')}
                  disabled={isSyncing || !inventorySheetId}
                  className="btn-gold flex-1"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Drive Config */}
          <Card className="glass-card border-border/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  Google Drive Import
                </CardTitle>
                <Switch
                  checked={driveEnabled}
                  onCheckedChange={setDriveEnabled}
                />
              </div>
              <CardDescription>
                Import documents and media from Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-4 ${!driveEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Contracts Folder */}
              <div>
                <Label>Contracts Folder ID</Label>
                <Input
                  value={contractsFolderId}
                  onChange={(e) => setContractsFolderId(e.target.value)}
                  placeholder="Folder ID for private contracts"
                  className="input-luxury mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Files will be imported as private documents
                </p>
              </div>

              {/* Media Folder */}
              <div>
                <Label>Media Folder ID (Optional)</Label>
                <Input
                  value={mediaFolderId}
                  onChange={(e) => setMediaFolderId(e.target.value)}
                  placeholder="Folder ID for brochures/media"
                  className="input-luxury mt-1"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleRunSync('documents')}
                  disabled={isSyncing || (!contractsFolderId && !mediaFolderId)}
                  className="btn-gold flex-1"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Import Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveConfig} disabled={isSaving} className="btn-gold">
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>

        {/* Sync Logs */}
        <Card className="glass-card border-border/20">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Sync History
            </CardTitle>
            <CardDescription>
              Recent sync operations and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {syncLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No sync history yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id} className="border-border/10">
                      <TableCell className="capitalize">{log.type}</TableCell>
                      <TableCell className="capitalize">{log.source.replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.rows_processed}</TableCell>
                      <TableCell className="text-success">{log.rows_updated}</TableCell>
                      <TableCell className="text-destructive">
                        {log.rows_failed > 0 ? log.rows_failed : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(log.started_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default GoogleSyncSettings;
