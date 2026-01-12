'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';
import { updateProductStock } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface InventoryDashboardClientProps {
  initialProducts: Product[];
  stats: any;
}

export function InventoryDashboardClient({ initialProducts, stats }: Readonly<InventoryDashboardClientProps>) {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.replace('/login?role=inventory_manager&redirectTo=/inventory');
        return;
      }
      if (user.role !== 'inventory_manager' && user.role !== 'admin') {
        router.replace('/');
        return;
      }
    }
  }, [user, isInitialized, router]);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');

  // Sync products when server returns fresh data (e.g. after router.refresh)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Quick Scan (Restock) Modal
  const [showScannerMode, setShowScannerMode] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState<number>(1);
  const [updateMode, setUpdateMode] = useState<'ADD' | 'SET'>('ADD');

  // Auto-focus main search or scanner input
  useEffect(() => {
    if (showScannerMode) {
      setUpdateMode('ADD');
    } else {
      searchInputRef.current?.focus();
    }
  }, [showScannerMode]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  // Barcode Logic: If search matches exactly, show restock popup
  useEffect(() => {
    const searchTrimmed = search.trim().toLowerCase();
    if (!searchTrimmed) return;

    const exactMatch = products.find(p => p.id.toLowerCase() === searchTrimmed);
    if (exactMatch) {
      setScannedProduct(exactMatch);
      setShowScannerMode(true);
      setSearch('');
      setAddQty(1);
      setUpdateMode('ADD');
    }
  }, [search]);

  const handleUpdateStock = async () => {
    if (!scannedProduct) return;
    setIsUpdating(true);
    
    // Logic: if ADD mode, newTotal = current + addQty. If SET mode, newTotal = addQty (the value entered)
    const newTotal = updateMode === 'ADD' ? scannedProduct.quantity + addQty : addQty;

    try {
      await updateProductStock(scannedProduct.id, newTotal);
      setProducts(products.map(p => p.id === scannedProduct.id ? { ...p, quantity: newTotal } : p));
      
      const msg = updateMode === 'ADD' 
        ? `Added ${addQty} to ${scannedProduct.name}`
        : `Correction: ${scannedProduct.name} set to ${addQty}`;
      
      setNotificationMsg(msg);
      setShowNotification(true);
      setShowScannerMode(false);
      setScannedProduct(null);
      router.refresh();
    } catch (error) {
      console.error('Update stock failed:', error);
      setNotificationMsg('Update failed');
      setShowNotification(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-10 font-sans">
      <Notification isVisible={showNotification} message={notificationMsg} onClose={() => setShowNotification(false)} />

      <div className="max-w-7xl mx-auto">
         <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Icon name="CubeIcon" size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Inventory Management</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.name || 'Authorized Staff'}</p>
               </div>
            </div>
            <button 
               onClick={() => {
                  logout();
                  router.push('/login?role=inventory_manager');
               }}
               className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
               <Icon name="ArrowLeftOnRectangleIcon" size={18} />
               Sign Out
            </button>
         </header>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Stock Items</p>
               <h3 className="text-3xl font-black text-slate-900">{stats.totalProducts}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Low Stock</p>
               <h3 className="text-3xl font-black text-orange-500">{stats.lowStockCount}</h3>
            </div>
            <div className="bg-emerald-500 p-6 rounded-[2.5rem] border border-emerald-600 text-white">
               <p className="text-[10px] font-black uppercase text-emerald-100 tracking-widest mb-1">Avg Price</p>
               <h3 className="text-3xl font-black">₹{Math.round(stats.avgPrice || 0)}</h3>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 text-white">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Inventory Value</p>
               <h3 className="text-xl font-black">₹{stats.totalValue?.toLocaleString('en-IN')}</h3>
            </div>
         </div>

         {/* Barcode Search Header */}
         <div className="bg-white rounded-[3.5rem] p-12 border border-slate-200 mb-10 overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                     <Icon name="QrCodeIcon" size={40} />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Barcode Restock</h1>
                     <p className="text-slate-500 font-bold tracking-tight">Scan a product barcode to increase inventory instanty</p>
                  </div>
               </div>

               <div className="flex-1 max-w-xl relative">
                  <Icon name="MagnifyingGlassIcon" size={32} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                     ref={searchInputRef}
                     type="text"
                     placeholder="Scan Barcode or Search Toy SKU..."
                     className="w-full pl-20 pr-6 py-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50 text-3xl font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-100 transition-all outline-none uppercase placeholder:normal-case shadow-inner"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Scanner Ready</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Product Table */}
         <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Master Inventory List</h3>
               <span className="text-xs font-bold text-slate-400">{filteredProducts.length} Items Listed</span>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50">
                        <th className="px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-400">Inventory SKU</th>
                        <th className="px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-400">Product Detail</th>
                        <th className="px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-400 text-center">In Stock</th>
                        <th className="px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-400 text-right">Quick Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors group">
                           <td className="px-10 py-6">
                              <code className="text-base font-black px-4 py-1.5 bg-slate-100 rounded-lg text-slate-600 uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">{p.id}</code>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="h-16 w-16 rounded-2xl bg-slate-100 relative overflow-hidden shrink-0">
                                    <AppImage src={p.image} alt={p.name} fill className="object-cover" />
                                 </div>
                                 <div>
                                    <div className="font-black text-slate-900 uppercase text-lg leading-tight">{p.name}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.category}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6 text-center">
                              <span className={`inline-flex h-12 w-20 items-center justify-center rounded-xl font-black text-xl ${p.quantity < 10 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-900'}`}>{p.quantity}</span>
                           </td>
                           <td className="px-10 py-6 text-right">
                              <button 
                                 onClick={() => { setScannedProduct(p); setShowScannerMode(true); }}
                                 className="px-8 py-3.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
                              >
                                 Update Stock
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Dynamic Restock Overlay (Scanner Mode) */}
      {showScannerMode && scannedProduct && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl my-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-indigo-500/20">
               <div className="p-8 md:p-12 border-b border-slate-100 bg-indigo-50/50 flex items-center gap-8">
                  <div className="h-32 w-32 rounded-[2.5rem] bg-white border-2 border-slate-200 p-2 relative overflow-hidden shadow-sm shrink-0">
                     <AppImage src={scannedProduct.image} alt={scannedProduct.name} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full border border-indigo-100">IDENTIFIED PRODUCT</span>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-[1.1] mt-3 break-words">{scannedProduct.name}</h2>
                     <p className="text-slate-500 font-bold text-lg uppercase mt-4">Current: <span className="text-slate-900">{scannedProduct.quantity} Units</span></p>
                  </div>
               </div>

               <div className="p-8 md:p-14 space-y-12">
                  <div className="flex p-1 bg-slate-100 rounded-2xl">
                     <button 
                        onClick={() => { setUpdateMode('ADD'); setAddQty(1); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${updateMode === 'ADD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Restock (Add)
                     </button>
                     <button 
                        onClick={() => { setUpdateMode('SET'); setAddQty(scannedProduct.quantity); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${updateMode === 'SET' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Correct Balance (Set)
                     </button>
                  </div>

                  <div>
                     <label htmlFor="updateQty" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-1 text-center md:text-left">
                        {updateMode === 'ADD' ? 'Quantity To Add' : 'Actual Stock in Hand'}
                     </label>
                     <div className="flex items-center gap-6">
                        <button 
                           onClick={() => setAddQty(prev => Math.max(0, prev - 1))}
                           className="h-20 w-20 rounded-[1.5rem] bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90"
                        >
                           <Icon name="MinusIcon" size={32} />
                        </button>
                        <input 
                           id="updateQty"
                           type="number"
                           autoFocus
                           className="flex-1 h-20 text-center text-4xl font-black bg-slate-50 rounded-[1.5rem] border-4 border-indigo-50 focus:border-indigo-500 outline-none shadow-inner"
                           value={addQty}
                           onChange={(e) => setAddQty(Number.parseInt(e.target.value) || 0)}
                        />
                        <button 
                           onClick={() => setAddQty(prev => prev + 1)}
                           className="h-20 w-20 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90"
                        >
                           <Icon name="PlusIcon" size={32} />
                        </button>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-lg font-black text-slate-400 uppercase tracking-widest text-center md:text-left">New Total Level</span>
                        <div className="flex items-center gap-4">
                           <span className="text-xl font-black text-slate-300">→</span>
                           <span className={`text-4xl font-black ${updateMode === 'ADD' ? 'text-indigo-600' : 'text-orange-600'}`}>
                              {updateMode === 'ADD' ? scannedProduct.quantity + addQty : addQty} Units
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                     <button 
                        onClick={() => { setShowScannerMode(false); setScannedProduct(null); }}
                        className="order-2 md:order-1 flex-1 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-100 transition-all hover:bg-slate-200"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={handleUpdateStock}
                        disabled={isUpdating}
                        className="order-1 md:order-2 flex-[2] py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white bg-indigo-600 shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-4 hover:bg-indigo-700"
                     >
                        {isUpdating ? 'UPDATING...' : (
                           <>
                              <Icon name="CheckCircleIcon" size={32} />
                              CONFIRM RESTOCK
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
