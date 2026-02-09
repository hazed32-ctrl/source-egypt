/**
 * Admin - Manage Inventory
 * CRUD for inventory records (admin-only) — reads from real Supabase inventory table
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, RefreshCw, Edit2, Save, X, TrendingUp, TrendingDown } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InventoryRow {
  id: string;
  property_id: string;
  total_units: number;
  available_units: number;
  reserved_units: number;
  sold_units: number;
  sync_source: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  propertyTitle?: string;
}

const ManageInventory = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryRow>>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch inventory and join with properties for title
      const { data: invData, error: invErr } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (invErr) throw invErr;

      // Fetch property titles
      const propertyIds = (invData || []).map((i) => i.property_id);
      let propertyMap = new Map<string, string>();

      if (propertyIds.length > 0) {
        const { data: props } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);

        (props || []).forEach((p) => propertyMap.set(p.id, p.title));
      }

      setInventory(
        (invData || []).map((row) => ({
          ...row,
          propertyTitle: propertyMap.get(row.property_id) || 'Unknown Property',
        }))
      );
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: InventoryRow) => {
    setEditingId(item.id);
    setEditData({
      available_units: item.available_units,
      reserved_units: item.reserved_units,
      sold_units: item.sold_units,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          available_units: editData.available_units,
          reserved_units: editData.reserved_units,
          sold_units: editData.sold_units,
        })
        .eq('id', id);

      if (error) throw error;

      setInventory(
        inventory.map((i) =>
          i.id === id
            ? {
                ...i,
                available_units: editData.available_units ?? i.available_units,
                reserved_units: editData.reserved_units ?? i.reserved_units,
                sold_units: editData.sold_units ?? i.sold_units,
              }
            : i
        )
      );
      setEditingId(null);
      setEditData({});
      toast({
        title: 'Success',
        description: 'Inventory updated successfully',
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory',
        variant: 'destructive',
      });
    }
  };

  const getOccupancyRate = (item: InventoryRow) => {
    if (item.total_units === 0) return 0;
    return Math.round(((item.sold_units + item.reserved_units) / item.total_units) * 100);
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage property unit availability and stock levels
            </p>
          </div>
          <Button onClick={fetchInventory} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {inventory.reduce((sum, i) => sum + i.total_units, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {inventory.reduce((sum, i) => sum + i.available_units, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {inventory.reduce((sum, i) => sum + i.reserved_units, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {inventory.reduce((sum, i) => sum + i.sold_units, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Inventory Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory records found. Add inventory records via the database.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Reserved</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-center">Occupancy</TableHead>
                    <TableHead>Sync Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.propertyTitle}</TableCell>
                      <TableCell className="text-center">{item.total_units}</TableCell>
                      <TableCell className="text-center">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editData.available_units}
                            onChange={(e) =>
                              setEditData({ ...editData, available_units: parseInt(e.target.value) })
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          item.available_units
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editData.reserved_units}
                            onChange={(e) =>
                              setEditData({ ...editData, reserved_units: parseInt(e.target.value) })
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          item.reserved_units
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editData.sold_units}
                            onChange={(e) =>
                              setEditData({ ...editData, sold_units: parseInt(e.target.value) })
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          item.sold_units
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            getOccupancyRate(item) > 80
                              ? 'border-destructive/50 text-destructive'
                              : getOccupancyRate(item) > 50
                              ? 'border-warning/50 text-warning'
                              : 'border-success/50 text-success'
                          }
                        >
                          {getOccupancyRate(item)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border/50">
                          {item.sync_source || 'manual'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === item.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => saveEdit(item.id)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
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

export default ManageInventory;
