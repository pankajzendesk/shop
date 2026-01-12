'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getInventoryLogs } from '@/app/actions';

interface LogEntry {
  id: string;
  productId: string;
  productName: string;
  change: number;
  type: string;
  timestamp: Date | string;
}

export default function InventoryAuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setIsHydrated(true);
    const loadLogs = async () => {
      const data = await getInventoryLogs();
      setLogs(data as LogEntry[]);
    };
    loadLogs();
  }, []);

  if (!isHydrated) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    const t = log.type.toUpperCase();
    if (filter === 'sale') return t.includes('SALE') || t.includes('ADJUSTMENT');
    if (filter === 'restock') return t.includes('RESTOCK') || t.includes('INITIAL');
    if (filter === 'return') return t.includes('RETURN');
    return t === filter.toUpperCase();
  });

  const getReasonColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('RESTOCK') || t.includes('RETURN') || t.includes('INITIAL')) return 'text-success';
    if (t.includes('SALE') || t.includes('ADJUSTMENT')) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getReasonIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('RESTOCK') || t.includes('RETURN') || t.includes('INITIAL')) return 'ArrowTrendingUpIcon';
    if (t.includes('SALE') || t.includes('ADJUSTMENT')) return 'ArrowTrendingDownIcon';
    return 'AdjustmentsHorizontalIcon';
  };

  const formatType = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'POS_SALE') return 'Offline Sell';
    if (t === 'ONLINE_SALE_PACKED') return 'Online Sell';
    if (t === 'RESTOCK') return 'Restock';
    if (t === 'INITIAL_STOCK') return 'Initial Stock';
    return type.replaceAll('_', ' ');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Inventory Transaction Logs</h1>
          <p className="text-muted-foreground">Historical audit of all stock movements</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-warm-sm">
          {['all', 'sale', 'restock', 'return'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-smooth ${
                filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {key === 'all' ? 'All Logs' : key}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Movement</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ref ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10 transition-smooth group">
                    <td className="whitespace-nowrap px-6 py-4">
                       <p className="text-xs font-medium text-foreground">{new Date(log.timestamp).toLocaleDateString()}</p>
                       <p className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-foreground group-hover:text-primary transition-smooth">{log.productName}</p>
                       <p className="text-[10px] font-mono text-muted-foreground">ID: {log.productId}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1 font-mono font-bold text-lg ${log.change > 0 ? 'text-success' : 'text-destructive'}`}>
                          {log.change > 0 ? '+' : ''}{log.change}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${getReasonColor(log.type)}`}>
                          <Icon name={getReasonIcon(log.type) as any} size={14} />
                          {formatType(log.type)}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs text-muted-foreground font-mono">{log.id.substring(0, 8)}...</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                         <Icon name="DocumentMagnifyingGlassIcon" size={48} />
                         <p className="font-heading font-medium">No logs found for this filter</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
