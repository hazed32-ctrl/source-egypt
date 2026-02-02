/**
 * Admin Analytics Dashboard
 * Enterprise-level analytics with traffic, funnels, and conversions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  Phone,
  MessageCircle,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  ChevronRight,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface EventStats {
  total_events: number;
  unique_sessions: number;
  page_views: number;
  leads: number;
  whatsapp_clicks: number;
  phone_clicks: number;
}

interface DeviceData {
  device_type: string;
  count: number;
}

interface TopPage {
  page_url: string;
  views: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [stats, setStats] = useState<EventStats>({
    total_events: 0,
    unique_sessions: 0,
    page_views: 0,
    leads: 0,
    whatsapp_clicks: 0,
    phone_clicks: 0,
  });
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; events: number; sessions: number }[]>([]);
  const [funnelData, setFunnelData] = useState<{ step: string; users: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      // Calculate date range
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      try {
        // Fetch all events in range
        const { data: events } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', startDate.toISOString());

        if (events) {
          // Calculate stats
          const uniqueSessions = new Set(events.map(e => e.session_id)).size;
          const pageViews = events.filter(e => e.event_name === 'page_view').length;
          const leads = events.filter(e => e.event_name === 'lead_submit').length;
          const whatsappClicks = events.filter(e => e.event_name === 'whatsapp_click').length;
          const phoneClicks = events.filter(e => e.event_name === 'phone_click').length;

          setStats({
            total_events: events.length,
            unique_sessions: uniqueSessions,
            page_views: pageViews,
            leads,
            whatsapp_clicks: whatsappClicks,
            phone_clicks: phoneClicks,
          });

          // Device breakdown
          const deviceCounts: Record<string, number> = {};
          events.forEach(e => {
            const device = e.device_type || 'unknown';
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
          });
          setDeviceData(
            Object.entries(deviceCounts).map(([device_type, count]) => ({
              device_type,
              count,
            }))
          );

          // Top pages
          const pageCounts: Record<string, number> = {};
          events
            .filter(e => e.event_name === 'page_view')
            .forEach(e => {
              const url = e.page_url || '/';
              pageCounts[url] = (pageCounts[url] || 0) + 1;
            });
          setTopPages(
            Object.entries(pageCounts)
              .map(([page_url, views]) => ({ page_url, views }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
          );

          // Daily breakdown
          const dailyCounts: Record<string, { events: number; sessions: Set<string> }> = {};
          events.forEach(e => {
            const date = new Date(e.created_at).toLocaleDateString();
            if (!dailyCounts[date]) {
              dailyCounts[date] = { events: 0, sessions: new Set() };
            }
            dailyCounts[date].events++;
            if (e.session_id) dailyCounts[date].sessions.add(e.session_id);
          });
          setDailyData(
            Object.entries(dailyCounts)
              .map(([date, data]) => ({
                date,
                events: data.events,
                sessions: data.sessions.size,
              }))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          );

          // Funnel data
          const searchUsers = new Set(
            events.filter(e => e.event_name === 'search').map(e => e.session_id)
          ).size;
          const propertyViewUsers = new Set(
            events.filter(e => e.event_name === 'view_property').map(e => e.session_id)
          ).size;
          const compareUsers = new Set(
            events.filter(e => e.event_name === 'compare_add').map(e => e.session_id)
          ).size;
          const leadUsers = new Set(
            events.filter(e => e.event_name === 'lead_submit').map(e => e.session_id)
          ).size;

          setFunnelData([
            { step: 'Search', users: searchUsers },
            { step: 'View Property', users: propertyViewUsers },
            { step: 'Compare', users: compareUsers },
            { step: 'Lead Submit', users: leadUsers },
          ]);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <PortalLayout
      title="Analytics"
      subtitle="Track traffic, user behavior, and conversions"
    >
      {/* Quick Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Link to="/admin/leads-intelligence">
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/40">
            <Users className="w-4 h-4" />
            Leads Intelligence
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 input-luxury">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total_events}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.unique_sessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.page_views}</p>
                  <p className="text-xs text-muted-foreground">Page Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.leads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.whatsapp_clicks}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-card border-border/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.phone_clicks}</p>
                  <p className="text-xs text-muted-foreground">Phone Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="space-y-6">
        <TabsList className="bg-card border border-border/20">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="text-lg">Daily Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="events"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="text-lg">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device_type, percent }) =>
                        `${device_type} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      dataKey="count"
                    >
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {deviceData.map((item, index) => (
                  <div key={item.device_type} className="flex items-center gap-2">
                    {getDeviceIcon(item.device_type)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.device_type}: {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="text-lg">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="step" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="text-lg">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div
                    key={page.page_url}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground truncate max-w-md">
                        {page.page_url}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {page.views} views
                    </span>
                  </div>
                ))}
                {topPages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No page view data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
};

export default AnalyticsDashboard;
