'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';
import { restockProduct } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface LogEntry {
  id: string;
  productId: string;
  productName: string;
  change: number;
  type: string;
  timestamp: Date | string;
}

interface InventoryDashboardClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialLogs: LogEntry[];
}

export default function InventoryDashboardClient({ 
  initialProducts, 
  categories, 
  initialLogs 
}: Readonly<InventoryDashboardClientProps>) {
  const router = useRouter();
  const [products] = useState(initialProducts);
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate In/Out stats from logs
  const inOutStats = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= last30Days);
    
    const totalIn = recentLogs
      .filter(log => log.change > 0)
      .reduce((acc, log) => acc + log.change, 0);
    
    const totalOut = Math.abs(recentLogs
      .filter(log => log.change < 0)
      .reduce((acc, log) => acc + log.change, 0));

    const maxMovement = Math.max(totalIn, totalOut, 1);
    const inWidth = (totalIn / maxMovement) * 100;
    const outWidth = (totalOut / maxMovement) * 100;

    return { totalIn, totalOut, inWidth, outWidth };
  }, [logs]);

  // Restock form state
  const [restockData, setRestockData] = useState({
    categoryId: '',
    productId: '',
    quantity: '1'
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const stats = useMemo(() => {
    return {
      totalItems: products.reduce((acc, p) => acc + p.quantity, 0),
      lowStockCount: products.filter(p => p.quantity > 0 && p.quantity <= 5).length,
      outOfStockCount: products.filter(p => p.quantity === 0).length,
      totalValue: products.reduce((acc, p) => acc + (p.price * p.quantity), 0)
    };
  }, [products]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockData.productId || !restockData.quantity) return;

    setIsLoading(true);
    try {
      const qty = Number.parseInt(restockData.quantity);
      await restockProduct(restockData.productId, qty);
      
      setNotificationMsg(`Successfully added ${qty} units to inventory.`);
      setShowNotification(true);
      setIsRestockModalOpen(false);
      
      // Update local state or refresh
      router.refresh();
      // Reset form
      setRestockData({ categoryId: '', productId: '', quantity: '1' });
    } catch (error) {
      console.error('Restock failed:', error);
      setNotificationMsg("Failed to update inventory.");
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const productsInSelectedCategory = useMemo(() => {
    if (!restockData.categoryId) return [];
    const catName = categories.find(c => c.id === restockData.categoryId)?.name;
    return products.filter(p => p.category === catName);
  }, [restockData.categoryId, categories, products]);

  return (
    <div className="space-y-8 pb-12">
      <Notification 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Manage your stock levels and supply chain</p>
        </div>
        <button 
          onClick={() => setIsRestockModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-smooth hover:scale-105 active:scale-95"
        >
          <Icon name="PlusIcon" size={18} />
          ADD INVENTORY
        </button>
      </div>

      {/* Movement Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-success/5 to-transparent p-6 shadow-warm-sm">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-success/70">Stock In (Last 30 Days)</p>
                 <h3 className="mt-1 text-3xl font-black text-foreground">+{inOutStats.totalIn} <span className="text-sm font-medium text-muted-foreground uppercase">Units</span></h3>
              </div>
              <div className="rounded-xl bg-success/10 p-3 text-success">
                 <Icon name="ArrowTrendingUpIcon" size={28} />
              </div>
           </div>
           <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-success/10">
              <div className="h-full bg-success transition-all duration-1000" style={{ width: `${inOutStats.inWidth}%` }}></div>
           </div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-destructive/5 to-transparent p-6 shadow-warm-sm">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-destructive/70">Stock Out (Last 30 Days)</p>
                 <h3 className="mt-1 text-3xl font-black text-foreground">-{inOutStats.totalOut} <span className="text-sm font-medium text-muted-foreground uppercase">Units</span></h3>
              </div>
              <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
                 <Icon name="ArrowTrendingDownIcon" size={28} />
              </div>
           </div>
           <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-destructive/10">
              <div className="h-full bg-destructive transition-all duration-1000" style={{ width: `${inOutStats.outWidth}%` }}></div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="CubeIcon" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Stock</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.totalItems}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Icon name="ExclamationTriangleIcon" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Low Stock</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.lowStockCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <Icon name="NoSymbolIcon" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Out of Stock</p>
              <h3 className="text-2xl font-bold text-foreground">{stats.outOfStockCount}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <Icon name="CurrencyRupeeIcon" size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock Value</p>
              <h3 className="text-2xl font-bold text-foreground">₹{stats.totalValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Logic/Table area */}
      <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden">
        <div className="border-b border-border p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
            <div className="relative flex-1 max-w-md">
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Search products"
                />
            </div>
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                aria-label="Filter by category"
            >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/10 transition-smooth group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-border">
                        <AppImage src={product.image} alt={product.name} width={40} height={40} className="h-full w-full object-cover" />
                      </div>
                      <p className="text-sm font-bold text-foreground">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(() => {
                      if (product.quantity === 0) {
                        return (
                          <span className="flex items-center gap-1.5 font-bold text-destructive">
                            <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                            Out of Stock
                          </span>
                        );
                      }
                      if (product.quantity <= 5) {
                        return (
                          <span className="flex items-center gap-1.5 font-bold text-amber-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Low Stock
                          </span>
                        );
                      }
                      return (
                        <span className="flex items-center gap-1.5 font-bold text-success">
                          <div className="h-1.5 w-1.5 rounded-full bg-success" />
                          Healthy
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{product.quantity}</p>
                    <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted">
                        <div 
                            className={`h-full ${(() => {
                                if (product.quantity === 0) return 'bg-destructive';
                                if (product.quantity <= 5) return 'bg-amber-500';
                                return 'bg-success';
                            })()}`}
                            style={{ width: `${Math.min(100, (product.quantity / 50) * 100)}%` }}
                        />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => {
                            const cat = categories.find(c => c.name === product.category);
                            setRestockData({ categoryId: cat?.id || '', productId: product.id, quantity: '10' });
                            setIsRestockModalOpen(true);
                        }}
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                    >
                        RESTOCK
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-200 rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Add Inventory</h2>
                <button onClick={() => setIsRestockModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <Icon name="XMarkIcon" size={24} />
                </button>
            </div>
            
            <form onSubmit={handleRestock} className="space-y-5">
              <div>
                <label htmlFor="restock-category" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Select Category</label>
                <select 
                  id="restock-category"
                  required
                  value={restockData.categoryId}
                  onChange={(e) => setRestockData({ ...restockData, categoryId: e.target.value, productId: '' })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Choose category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="restock-product" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Select Product</label>
                <select 
                  id="restock-product"
                  required
                  disabled={!restockData.categoryId}
                  value={restockData.productId}
                  onChange={(e) => setRestockData({ ...restockData, productId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">Choose product...</option>
                  {productsInSelectedCategory.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="restock-quantity" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Quantity to Add</label>
                <input 
                  id="restock-quantity"
                  type="number"
                  min="1"
                  required
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-smooth hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'UPDATING...' : 'CONFIRM RESTOCK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
