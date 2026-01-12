'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { getShipmentOrders, getShipmentHistory, getDeliveryChampions, assignOrderToDelivery, verifyHandover, verifyReturnToWarehouse } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ShipmentDashboard() {
  const { user, isInitialized, logout } = useAuth();
  const router = useRouter();
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab ] = useState<'pending' | 'history'>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [champions, setChampions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  
  const [scanQuery, setScanQuery] = useState('');
  
  // Handover + Label Printing State
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [handoverCodeInput, setHandoverCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.replace('/login?role=shipment&redirectTo=/shipment');
        return;
      }
      if (user.role !== 'shipment') {
        router.replace('/');
        return;
      }
      loadData();
    }
  }, [user, isInitialized, router, activeTab]);

  // Auto-focus scanner input
  useEffect(() => {
    if (!showHandoverModal && !showLabelModal && !loading) {
       scanInputRef.current?.focus();
    }
  }, [loading, showHandoverModal, showLabelModal]);

  const loadData = async () => {
    if (!user) return;
    try {
      if (activeTab === 'pending') {
        const [orderData, champData] = await Promise.all([
          getShipmentOrders(user.id),
          getDeliveryChampions()
        ]);
        setOrders(orderData);
        setChampions(champData);
      } else {
        const historyData = await getShipmentHistory(user.id);
        setHistoryOrders(historyData);
      }
    } catch (error: any) {
      console.error('Failed to load shipment data:', error);
      if (error.message === 'Unauthorized or account suspended') {
        setNotification({ show: true, message: 'Your account has been suspended by the Admin.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!scanQuery.trim()) return orders;
    const q = scanQuery.toLowerCase().trim();
    return orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q)
    );
  }, [orders, scanQuery]);

  const handleLogout = () => { logout(); router.push('/login'); };

  const handleAssign = async (orderId: string, deliveryId: string) => {
    if (!deliveryId) return;
    try {
      await assignOrderToDelivery(orderId, deliveryId, user?.id);
      setNotification({ show: true, message: 'Order packed and assigned to delivery person!', type: 'success' });
      setScanQuery('');
      await loadData();
    } catch (error) {
      console.error('Assignment failed:', error);
      setNotification({ show: true, message: 'Assignment failed', type: 'error' });
    }
  };

  const handleVerifyHandover = async () => {
    if (!selectedOrder || !handoverCodeInput) return;
    setIsProcessing(true);
    try {
      if (selectedOrder.status === 'Returned-With-Driver') {
        await verifyReturnToWarehouse(selectedOrder.id, handoverCodeInput, user?.id as string);
        setNotification({ show: true, message: 'Return received and product restocked!', type: 'success' });
      } else {
        await verifyHandover(selectedOrder.id, handoverCodeInput);
        setNotification({ show: true, message: 'Handover verified! Order is now Shipped.', type: 'success' });
      }
      setShowHandoverModal(false);
      setHandoverCodeInput('');
      await loadData();
    } catch (error) {
      setNotification({ show: true, message: 'Invalid 4-digit handover code', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintLabel = () => {
    setTimeout(() => { globalThis.print(); }, 500);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <Notification 
        isVisible={notification.show} 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, show: false })} 
      />

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Shipment<span className="text-primary">Hub</span></h1>
          <p className="text-slate-500 font-bold tracking-tight">Logistics, Packaging & Label Center</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-[1.5rem] border-2 border-slate-100 shadow-sm">
             <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-black uppercase tracking-widest text-slate-900">System Live</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition-all hover:bg-red-600 hover:text-white"
          >
            <Icon name="ArrowLeftOnRectangleIcon" size={18} />
            <span className="uppercase tracking-widest text-[10px]">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
         {/* Sidebar: Search & Queue Stats */}
         <div className="w-full xl:w-96 flex flex-col gap-6 print:hidden">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Scan Order Barcode</label>
               <div className="relative">
                  <Icon name="QrCodeIcon" size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
                  <input 
                     ref={scanInputRef}
                     type="text"
                     placeholder="Scan or Search..."
                     className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-slate-50 bg-slate-50 text-lg font-black text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                     value={scanQuery}
                     onChange={(e) => setScanQuery(e.target.value)}
                  />
               </div>
               <div className="mt-4 flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <Icon name="PrinterIcon" size={16} className="text-indigo-600" />
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Printer Support Active</p>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Daily Performance</p>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black">{orders.length}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">Pending</span>
                     </div>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Packed</p>
                        <p className="text-xl font-black">12</p>
                     </div>
                     <div className="bg-slate-800/50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Handover</p>
                        <p className="text-xl font-black">08</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Queue */}
         <div className="flex-1 flex flex-col gap-6 print:hidden">
            <div className="flex items-center gap-3 px-2">
               <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                  <Icon name="InboxArrowDownIcon" size={24} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Active Queue</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {filteredOrders.map((order) => (
               <div key={order.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                  <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Icon name="HashtagIcon" size={12} className="text-slate-400" />
                        <span className="font-black text-[10px] text-slate-500 uppercase tracking-widest">{order.id.slice(-8)}</span>
                     </div>
                     <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        order.status === 'Packed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                     }`}>
                        {order.status}
                     </div>
                  </div>

                  <div className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{order.customerName}</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{order.customerPhone || 'Walk-in'}</p>
                        </div>
                        <button 
                           onClick={() => { setSelectedOrder(order); setShowLabelModal(true); }}
                           className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-sm"
                        >
                           <Icon name="PrinterIcon" size={24} />
                        </button>
                     </div>

                     <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                         <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <Icon name="MapPinIcon" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Destination</span>
                         </div>
                         <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-relaxed">{order.shippingAddress}</p>
                     </div>

                     <div className="space-y-4">
                        {(order.status === 'Processing' || order.status === 'Pending') && (
                           <div className="flex flex-col gap-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Packer / Delivery</label>
                              <select 
                                 className="w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-4 text-sm font-black text-slate-900 focus:border-primary outline-none"
                                 onChange={(e) => handleAssign(order.id, e.target.value)}
                                 defaultValue=""
                              >
                                 <option value="" disabled>Select Driver...</option>
                                 {champions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                        )}

                        {order.status === 'Packed' && (
                           <button 
                              onClick={() => { setSelectedOrder(order); setShowHandoverModal(true); }}
                              className="w-full py-5 rounded-[1.5rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                           >
                              Verify Driver Pickup
                           </button>
                        )}
                        
                        {order.status === 'Returned-With-Driver' && (
                           <button 
                              onClick={() => { setSelectedOrder(order); setShowHandoverModal(true); }}
                              className="w-full py-5 rounded-[1.5rem] bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                           >
                              Receive Return Handover
                           </button>
                        )}
                     </div>
                  </div>
               </div>
               ))}
            </div>
         </div>
      </div>

      {/* Handover Modal */}
      {showHandoverModal && selectedOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden border-4 border-primary/20">
               <div className="text-center mb-10">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary mb-6">
                     <Icon name="ShieldCheckIcon" size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Safety Handover</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 px-10">Verify internal safety code with delivery driver</p>
               </div>

               <div className="space-y-8">
                  <div className="relative">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 text-center">Enter 4-Digit Code</label>
                     <input 
                        type="text"
                        maxLength={4}
                        autoFocus
                        value={handoverCodeInput}
                        onChange={(e) => setHandoverCodeInput(e.target.value)}
                        className="w-full h-24 text-center text-4xl font-black rounded-3xl border-2 border-slate-100 bg-slate-50 focus:border-primary focus:bg-white tracking-[0.5em] pl-[0.5em] transition-all outline-none"
                        placeholder="0000"
                     />
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setShowHandoverModal(false)} className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Close</button>
                     <button 
                        onClick={handleVerifyHandover}
                        disabled={isProcessing || handoverCodeInput.length < 4}
                        className="flex-[2] py-5 rounded-[1.5rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {isProcessing ? 'Verifying...' : 'Verify & Ship'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Label Printing Modal */}
      {showLabelModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl print:static print:bg-white print:p-0">
           <div className="w-full max-w-sm bg-white p-12 rounded-[3.5rem] shadow-2xl print:shadow-none print:rounded-none">
              <div className="text-center mb-10 border-b-2 border-dashed border-slate-100 pb-10">
                 <Icon name="GiftIcon" size={48} className="text-primary mx-auto mb-4" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase">Shipping Label</h2>
                 <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Gadget Toy Shop Logistics</p>
              </div>

              <div className="space-y-8 mb-10">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</span>
                    <p className="text-xl font-black text-slate-900 uppercase">{selectedOrder.customerName}</p>
                 </div>
                 
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase">{selectedOrder.shippingAddress}</p>
                 </div>

                 <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex justify-between items-center">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</span>
                       <p className="text-lg font-black text-slate-900">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <Icon name="QrCodeIcon" size={40} className="text-slate-300" />
                 </div>
              </div>

              <div className="flex gap-4 print:hidden">
                 <button onClick={handlePrintLabel} className="flex-1 py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Icon name="PrinterIcon" size={16} />
                    Print Sticker
                 </button>
                 <button onClick={() => setShowLabelModal(false)} className="flex-1 py-5 rounded-[1.5rem] bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Close</button>
              </div>

              <div className="hidden print:block text-[8px] font-black text-center text-slate-400 uppercase tracking-tighter mt-10 italic">
                 Logistics by ToyShop Internal Network • Please handle with care
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
