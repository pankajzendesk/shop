'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { getTrafficRecords } from '@/app/actions';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrafficLog {
  id: string;
  timestamp: Date | string;
  path: string;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  ip: string;
  country: string;
  city: string;
  device: string;
  userAgent: string;
}

interface Analytics {
  topProducts: { name: string; count: number; id: string }[];
  topUsers: { email: string; count: number }[];
  trend: { date: string; count: number }[];
  trends: {
    day: { date: string; count: number }[];
    week: { date: string; count: number }[];
    month: { date: string; count: number }[];
    year: { date: string; count: number }[];
  };
  topApis: { path: string; count: number }[];
}

export default function TrafficAdminPage() {
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    registeredVisits: 0,
    guestVisits: 0
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    topProducts: [],
    topUsers: [],
    trend: [],
    trends: { day: [], week: [], month: [], year: [] },
    topApis: []
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<'all' | 'registered' | 'guests'>('all');
  const [trendRange, setTrendRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    setIsHydrated(true);
    const loadLogs = async () => {
      const data = await getTrafficRecords();
      setLogs(data.logs);
      setStats(data.stats);
      setAnalytics(data.analytics as any);
    };
    loadLogs();
  }, []);

  if (!isHydrated) return null;

  const currentTrend = analytics.trends[trendRange] || [];

  const filteredLogs = logs.filter(log => {
    if (filter === 'registered') return !!log.userId;
    if (filter === 'guests') return !log.userId;
    return true;
  });

  // Country Breakdown
  const countries = logs.reduce((acc: Record<string, number>, log) => {
    const c = log.country || 'Unknown';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Traffic Analytics</h1>
          <p className="text-muted-foreground">Deep dive into user trends and product popularity</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Visits', value: stats.totalVisits, icon: 'ChartBarIcon', color: 'bg-blue-500' },
          { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: 'FingerPrintIcon', color: 'bg-indigo-500' },
          { label: 'Logged-in Sessions', value: stats.registeredVisits, icon: 'UserGroupIcon', color: 'bg-emerald-500' },
          { label: 'Guest Sessions', value: stats.guestVisits, icon: 'UserIcon', color: 'bg-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="group rounded-2xl border border-border bg-card p-6 shadow-warm-sm transition-smooth hover:border-primary/20">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white shadow-lg shadow-current/20`}>
                <Icon name={stat.icon as any} size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold">Traffic Trend</h2>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Visitor Activity Scale</p>
              </div>
              <div className="flex bg-muted rounded-xl p-1">
                {(['day', 'week', 'month', 'year'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-smooth ${
                      trendRange === r ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentTrend}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#888'}} 
                    tickFormatter={(val) => {
                      if (trendRange === 'day') return val;
                      if (trendRange === 'year') {
                        const m = val.split('-')[1];
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        return monthNames[Number.parseInt(m) - 1];
                      }
                      return val.split('-').slice(1).join('/');
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelFormatter={(label) => {
                       if (trendRange === 'day') return `Hour: ${label}`;
                       return `Date: ${label}`;
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Most Active Users */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
           <h2 className="font-heading text-xl font-bold mb-6">Top Active Users</h2>
           <div className="space-y-4 text-left">
              {analytics.topUsers.length > 0 ? analytics.topUsers.map((user, i) => (
                <div key={user.email} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                      <p className="text-[10px] text-muted-foreground">{user.count} page views</p>
                   </div>
                   <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (user.count / (analytics.topUsers[0]?.count || 1)) * 100)}%` }} />
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center text-muted-foreground italic text-sm">No registered user data yet</div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* Top Products */}
         <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-heading text-xl font-bold mb-6">Most Visited Products</h2>
            <div className="space-y-5 text-left">
               {analytics.topProducts.map((product, i) => (
                 <div key={product.id || i} className="group flex items-center gap-4">
                    <span className="text-2xl font-black text-muted-foreground/20 group-hover:text-primary transition-smooth">0{i+1}</span>
                    <div className="flex-1 border-b border-border/50 pb-2">
                       <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                       <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{product.count} visits</span>
                          <Link href={`/admin/products`} className="text-[10px] font-bold text-primary hover:underline">STOCK DETAILS</Link>
                       </div>
                    </div>
                 </div>
               ))}
               {analytics.topProducts.length === 0 && (
                 <p className="text-center text-muted-foreground py-10 italic">No product visits recorded yet</p>
               )}
            </div>
         </div>

         {/* Detailed Logs (Real-time Stream) */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold italic">Real-time Stream</h2>
              <div className="flex bg-muted rounded-lg p-1">
                {['all', 'registered', 'guests'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter transition-smooth ${
                      filter === f ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden border-t-4 border-t-primary">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/10">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visitor Info</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impact Area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-bold text-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${log.userId ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              <Icon name={log.device === 'Mobile' ? 'DevicePhoneMobileIcon' : 'ComputerDesktopIcon'} size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground truncate max-w-[120px]">{log.userName || 'Incognito Guest'}</p>
                              <p className="text-[9px] font-mono text-muted-foreground tracking-tighter">{log.ip}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{log.country}</span>
                            <span className="text-[10px] text-muted-foreground">{log.city}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block max-w-[150px] truncate rounded-md bg-muted/50 px-2 py-0.5 text-[9px] font-mono font-bold text-primary">
                            {log.path}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
         </div>
      </div>

      {/* Breakdown Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h3 className="mb-4 font-heading text-lg font-bold">Geography Breakdown</h3>
            <div className="space-y-4">
              {topCountries.map(([country, count]) => (
                <div key={country} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-foreground">{country}</span>
                    <span className="font-black text-primary">{((count / (stats.totalVisits || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-primary" 
                      style={{ width: `${(count / (stats.totalVisits || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h3 className="mb-4 font-heading text-lg font-bold">Most Hit Endpoints</h3>
            <div className="space-y-3">
              {analytics.topApis.map((api) => (
                <div key={api.path} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold text-foreground">{api.path}</span>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{api.count} hits</span>
                </div>
              ))}
              {analytics.topApis.length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-4 italic">No API activity tracked yet</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
               <Icon name="LightBulbIcon" size={32} />
            </div>
            <div>
               <h4 className="font-bold text-foreground">Marketing Insight</h4>
               <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Your most visited product is <span className="text-primary font-bold">{analytics.topProducts[0]?.name || 'N/A'}</span>. 
                  Consider running a promotion or adding a banner for this item to increase conversions.
               </p>
            </div>
          </div>
      </div>
    </div>
  );
}
