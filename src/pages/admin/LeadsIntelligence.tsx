/**
 * Leads Intelligence Dashboard
 * Attribution analytics and lead insights for sales teams
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Phone,
  Building2,
  Clock,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface LeadWithAttribution {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: string;
  city: string | null;
  district: string | null;
  property_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  // Attribution
  session_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  last_page_before_submit: string | null;
  lead_device_type: string | null;
  browser_language: string | null;
  last_events_summary: SessionEvent[] | null;
  // Assignment
  assigned_agent_id: string | null;
  agent_name: string | null;
  assigned_at: string | null;
}

interface SessionEvent {
  event_name: string;
  page_path: string;
  entity_id?: string;
  ts: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  qualified: { label: 'Qualified', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  won: { label: 'Won', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  lost: { label: 'Lost', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const eventLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  search_performed: { label: 'Search', icon: <Search className="w-3 h-3" /> },
  filter_applied: { label: 'Filter', icon: <Filter className="w-3 h-3" /> },
  property_viewed: { label: 'Viewed Property', icon: <Eye className="w-3 h-3" /> },
  compare_used: { label: 'Compare', icon: <MousePointerClick className="w-3 h-3" /> },
  whatsapp_click: { label: 'WhatsApp Click', icon: <MessageCircle className="w-3 h-3" /> },
  phone_click: { label: 'Phone Click', icon: <Phone className="w-3 h-3" /> },
  calculator_used: { label: 'Calculator', icon: <TrendingUp className="w-3 h-3" /> },
  lead_popup_shown: { label: 'Popup Shown', icon: <Eye className="w-3 h-3" /> },
  project_viewed: { label: 'Viewed Project', icon: <Building2 className="w-3 h-3" /> },
};

const LeadsIntelligence = () => {
  const { isAdmin, isSalesManager } = useUserRole();
  const [leads, setLeads] = useState<LeadWithAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [utmFilter, setUtmFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadWithAttribution | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      // Parse the leads data with proper type handling
      const parsedLeads = (data || []).map(lead => ({
        ...lead,
        last_events_summary: Array.isArray(lead.last_events_summary) 
          ? lead.last_events_summary as unknown as SessionEvent[]
          : [],
      })) as LeadWithAttribution[];
      setLeads(parsedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique UTM sources
  const utmSources = [...new Set(leads.map(l => l.utm_source).filter(Boolean))];
  const cities = [...new Set(leads.map(l => l.city).filter(Boolean))];

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUtm = utmFilter === 'all' || lead.utm_source === utmFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesCity = cityFilter === 'all' || lead.city === cityFilter;
    return matchesSearch && matchesUtm && matchesStatus && matchesCity;
  });

  // Stats
  const totalLeads = leads.length;
  const leadsWithUtm = leads.filter(l => l.utm_source).length;
  const mobileLeads = leads.filter(l => l.lead_device_type === 'mobile').length;
  const convertedLeads = leads.filter(l => l.status === 'won').length;

  const getDeviceIcon = (type: string | null) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <PortalLayout
      title="Leads Intelligence"
      subtitle="Attribution analytics and lead insights"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{leadsWithUtm}</p>
                <p className="text-xs text-muted-foreground">With UTM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mobileLeads}</p>
                <p className="text-xs text-muted-foreground">Mobile</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{convertedLeads}</p>
                <p className="text-xs text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/20 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-luxury"
              />
            </div>
            <Select value={utmFilter} onValueChange={setUtmFilter}>
              <SelectTrigger className="w-[160px] input-luxury">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="UTM Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {utmSources.map(src => (
                  <SelectItem key={src} value={src!}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] input-luxury">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px] input-luxury">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city!}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="glass-card border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Leads with Attribution ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leads found</div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Attribution badges */}
                      {lead.utm_source && (
                        <Badge variant="outline" className="border-accent/30 text-accent text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          {lead.utm_source}
                        </Badge>
                      )}
                      {lead.lead_device_type && (
                        <Badge variant="outline" className="border-border/50 text-xs">
                          {getDeviceIcon(lead.lead_device_type)}
                        </Badge>
                      )}
                      {lead.city && (
                        <Badge variant="outline" className="border-border/50 text-xs">
                          {lead.city}
                        </Badge>
                      )}
                      <Badge className={statusConfig[lead.status]?.color || 'bg-secondary'}>
                        {statusConfig[lead.status]?.label || lead.status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="glass-card border-border/50 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Lead Attribution Details
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-card border border-border/20">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="journey">User Journey</TabsTrigger>
                <TabsTrigger value="attribution">Attribution</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusConfig[selectedLead.status]?.color || 'bg-secondary'}>
                      {statusConfig[selectedLead.status]?.label || selectedLead.status}
                    </Badge>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                  <h4 className="font-medium text-foreground mb-3">Preferences</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="text-foreground">{selectedLead.city || '-'} / {selectedLead.district || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Type</p>
                      <p className="text-foreground">{selectedLead.property_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="text-foreground">
                        {selectedLead.budget_min && selectedLead.budget_max
                          ? `${(selectedLead.budget_min / 1000000).toFixed(1)}M - ${(selectedLead.budget_max / 1000000).toFixed(1)}M EGP`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                {(isAdmin || isSalesManager) && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <h4 className="font-medium text-foreground mb-2">Assignment</h4>
                    {selectedLead.assigned_agent_id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Assigned to:</span>
                        <Badge variant="outline">{selectedLead.agent_name || 'Agent'}</Badge>
                        {selectedLead.assigned_at && (
                          <span className="text-xs text-muted-foreground">
                            on {new Date(selectedLead.assigned_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="journey" className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                  <h4 className="font-medium text-foreground mb-4">Event Timeline</h4>
                  {selectedLead.last_events_summary && selectedLead.last_events_summary.length > 0 ? (
                    <div className="space-y-3">
                      {selectedLead.last_events_summary.map((event, idx) => {
                        const eventInfo = eventLabels[event.event_name] || { label: event.event_name, icon: <Clock className="w-3 h-3" /> };
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {eventInfo.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{eventInfo.label}</p>
                              <p className="text-xs text-muted-foreground">{event.page_path}</p>
                            </div>
                            {event.entity_id && (
                              <Link
                                to={`/properties/${event.entity_id}`}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.ts).toLocaleTimeString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No event history available (consent may not have been given)
                    </p>
                  )}
                </div>

                {/* Conversion triggers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-foreground">WhatsApp Clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                      {selectedLead.last_events_summary?.filter(e => e.event_name === 'whatsapp_click').length || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-foreground">Phone Clicks</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">
                      {selectedLead.last_events_summary?.filter(e => e.event_name === 'phone_click').length || 0}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attribution" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">UTM Source</h4>
                    <p className="font-medium text-foreground">{selectedLead.utm_source || '-'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">UTM Medium</h4>
                    <p className="font-medium text-foreground">{selectedLead.utm_medium || '-'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">UTM Campaign</h4>
                    <p className="font-medium text-foreground">{selectedLead.utm_campaign || '-'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">Device</h4>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(selectedLead.lead_device_type)}
                      <span className="font-medium text-foreground capitalize">
                        {selectedLead.lead_device_type || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                  <h4 className="text-sm text-muted-foreground mb-2">Landing Page</h4>
                  <p className="font-mono text-sm text-foreground">{selectedLead.landing_page || '-'}</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                  <h4 className="text-sm text-muted-foreground mb-2">Last Page Before Submit</h4>
                  <p className="font-mono text-sm text-foreground">{selectedLead.last_page_before_submit || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">Language</h4>
                    <Badge variant="outline">{selectedLead.browser_language?.toUpperCase() || '-'}</Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/20">
                    <h4 className="text-sm text-muted-foreground mb-2">Session ID</h4>
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {selectedLead.session_id || '-'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default LeadsIntelligence;
