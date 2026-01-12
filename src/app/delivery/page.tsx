'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { getDeliveryOrders, getDeliveryHistory, verifyDeliveryHandover, verifyReturnCollection, updateOrder, markDeliveryFailed, uploadDeliveryProof, getStoreSettings } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DeliveryDashboard() {
  const { user, isInitialized, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab ] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [requirePhoto, setRequirePhoto] = useState(false);
  
  // Delivery State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // New states for circular handshake
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [deliveryImage, setDeliveryImage] = useState<string | null>(null);

  const failureReasons = [
    'User mobile unreachable',
    'Not accepted after Open box delivery',
    'Wrong address',
    'No money available at user (COD)'
  ];

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.replace('/login?role=delivery_champion&redirectTo=/delivery');
        return;
      }
      
      if (user.role !== 'delivery_champion') {
        router.replace('/');
        return;
      }
      
      loadData();
    }
  }, [user, isInitialized, router, activeTab]);

  const loadData = async () => {
    if (!user) return;
    try {
      const settings = await getStoreSettings();
      setRequirePhoto(!!settings?.requireDeliveryPhoto);

      if (activeTab === 'active') {
        const data = await getDeliveryOrders(user.id);
        setOrders(data);
      } else {
        const data = await getDeliveryHistory(user.id);
        setHistoryOrders(data);
      }
    } catch (error) {
      console.error('Failed to load delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
       const base64 = event.target?.result as string;
       try {
          const path = await uploadDeliveryProof(base64);
          setDeliveryImage(path);
          setNotification({ show: true, message: 'Image proof saved!', type: 'success' });
       } catch (error) {
          console.error('Image upload failed:', error);
          setNotification({ show: true, message: 'Failed to upload image', type: 'error' });
       }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateOrder(orderId, { status });
      setNotification({ show: true, message: `Status updated to ${status}`, type: 'success' });
      await loadData();
    } catch (error) {
       console.error('Update status failed:', error);
       setNotification({ show: true, message: 'Update failed', type: 'error' });
    }
  };

  const handleMarkFailed = async () => {
    if (!selectedOrder || !failureReason) return;
    setIsProcessing(true);
    try {
      await markDeliveryFailed(selectedOrder.id, failureReason);
      setNotification({ show: true, message: 'Order marked as failed', type: 'success' });
      setShowFailureModal(false);
      setFailureReason('');
      await loadData();
    } catch (error) {
      console.error('Mark failed delivery failed:', error);
      setNotification({ show: true, message: 'Failed to update order', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedOrder || !otpInput) return;
    setIsProcessing(true);
    try {
      // Check if it's a return collection or outbound delivery
      if (selectedOrder.status === 'Return-Processing') {
        await verifyReturnCollection(selectedOrder.id, otpInput, deliveryImage || undefined);
        setNotification({ show: true, message: 'Return collected from customer!', type: 'success' });
      } else {
        await verifyDeliveryHandover(
            selectedOrder.id, 
            otpInput, 
            { collected: paymentCollected }, 
            deliveryImage || undefined
        );
        setNotification({ show: true, message: 'Order delivered successfully!', type: 'success' });
      }
      
      setShowOTPModal(false);
      setOtpInput('');
      setPaymentCollected(false);
      setDeliveryImage(null);
      await loadData();
    } catch (error: any) {
      console.error('Verify OTP failed:', error);
      setNotification({ show: true, message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (!isInitialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <Notification 
        isVisible={notification.show} 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, show: false })} 
      />

      <DashboardHeader user={user} onLogout={handleLogout} />

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto py-8">
        {activeTab === 'active' ? (
          <ActiveOrdersList 
            orders={orders} 
            onUpdateStatus={handleUpdateStatus} 
            onOpenOTP={(order: any) => {
              setSelectedOrder(order);
              setShowOTPModal(true);
            }}
            onOpenFailure={(order: any) => {
              setSelectedOrder(order);
              setShowFailureModal(true);
            }}
            formatPrice={formatPrice}
          />
        ) : (
          <HistoryOrdersList 
            orders={historyOrders} 
            formatPrice={formatPrice} 
          />
        )}
      </main>

      {showOTPModal && selectedOrder && (
        <OTPModal 
          order={selectedOrder}
          isProcessing={isProcessing}
          requirePhoto={requirePhoto}
          deliveryImage={deliveryImage}
          paymentCollected={paymentCollected}
          setPaymentCollected={setPaymentCollected}
          otpInput={otpInput}
          setOtpInput={setOtpInput}
          onCapture={() => fileInputRef.current?.click()}
          onClose={() => {
            setShowOTPModal(false);
            setOtpInput('');
            setPaymentCollected(false);
            setDeliveryImage(null);
          }}
          onVerify={handleVerifyOTP}
          formatPrice={formatPrice}
        />
      )}

      {showFailureModal && selectedOrder && (
        <FailureModal 
          reasons={failureReasons}
          failureReason={failureReason}
          setFailureReason={setFailureReason}
          isProcessing={isProcessing}
          onClose={() => {
            setShowFailureModal(false);
            setFailureReason('');
          }}
          onSubmit={handleMarkFailed}
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
        onChange={handleImageCapture}
      />
    </div>
  );
}

function DashboardHeader({ user, onLogout }: any) {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
         <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Icon name="TruckIcon" size={32} />
         </div>
         <div>
            <h1 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">Delivery Champion</h1>
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
               {user.name} • Online
            </p>
         </div>
      </div>
      <button 
        onClick={onLogout}
        className="group flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 px-6 py-3 transition-all hover:bg-zinc-800 hover:border-zinc-700"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-zinc-500 uppercase">Status</span>
          <span className="text-xs font-bold text-rose-500 group-hover:text-rose-400">Logout</span>
        </div>
        <Icon name="PowerIcon" size={20} className="text-zinc-600 group-hover:text-rose-500" />
      </button>
    </div>
  );
}

function Tabs({ activeTab, setActiveTab }: any) {
  return (
    <div className="mb-8 flex p-1.5 rounded-3xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 max-w-sm">
      <button 
        onClick={() => setActiveTab('active')}
        className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all tracking-widest uppercase ${
          activeTab === 'active' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        Active
      </button>
      <button 
        onClick={() => setActiveTab('history')}
        className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all tracking-widest uppercase ${
          activeTab === 'history' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        History
      </button>
    </div>
  );
}

function ActiveOrdersList({ orders, onUpdateStatus, onOpenOTP, onOpenFailure, formatPrice }: any) {
  if (orders.length === 0) {
    return (
      <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-zinc-800 bg-zinc-900/50">
         <div className="mx-auto h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 mb-6">
            <Icon name="ArchiveBoxIcon" size={48} />
         </div>
         <h3 className="text-2xl font-bold text-zinc-100 mb-2">No Active Deliveries</h3>
         <p className="text-zinc-500 font-medium">Enjoy your break, champion!</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 px-2">Assigned Shipments ({orders.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.map((order: any) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onUpdateStatus={onUpdateStatus} 
            onOpenOTP={onOpenOTP} 
            onOpenFailure={onOpenFailure} 
            formatPrice={formatPrice} 
          />
        ))}
      </div>
    </>
  );
}

function OrderCard({ order, onUpdateStatus, onOpenOTP, onOpenFailure, formatPrice }: any) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-smooth hover:bg-zinc-900 hover:border-zinc-700/50">
       <div className="p-8">
          <div className="mb-6 flex items-start justify-between">
             <div>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Customer</span>
                <h3 className="text-xl font-bold text-zinc-100 leading-tight">{order.customerName}</h3>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Order ID</span>
                <p className="font-mono text-sm font-bold text-emerald-500">#{order.id.substring(0, 8).toUpperCase()}</p>
             </div>
          </div>

          <div className="mb-6 rounded-2xl bg-zinc-950/50 p-4 border border-zinc-800/50">
             <div className="flex items-start gap-3">
                <Icon name="MapPinIcon" className="text-emerald-500 shrink-0 mt-1" size={20} />
                <p className="text-sm text-zinc-300 leading-relaxed italic">{order.shippingAddress}</p>
             </div>
          </div>

          {order.assignedShipment && (
            <div className="mb-6 rounded-2xl bg-blue-500/5 p-4 border border-blue-500/10">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <Icon name="UserIcon" size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Assigned By (Shipper)</p>
                     <p className="text-xs font-bold text-zinc-200">{order.assignedShipment.name} • {order.assignedShipment.phone || 'No Phone'}</p>
                  </div>
               </div>
            </div>
          )}

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                   {(order.paymentMethod?.toLowerCase().includes('cod') || order.paymentMethod?.toLowerCase().includes('cash')) ? 'COD AMOUNT' : 'PREPAID ORDER'}
                </span>
                <span className={`text-2xl font-black font-mono ${
                   (order.paymentMethod?.toLowerCase().includes('cod') || order.paymentMethod?.toLowerCase().includes('cash')) ? 'text-zinc-100' : 'text-emerald-500'
                }`}>
                   {formatPrice(order.total)}
                </span>
             </div>

             <div className="grid grid-cols-1 gap-2 pt-4 border-t border-zinc-800">
                {(order.status === 'Handover' || order.status === 'Packed') && (
                   <div className="space-y-4">
                     <div className="text-center py-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Waiting for Handover</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase">Show this code to Shipper to pickup</p>
                     </div>
                     
                     <div className="flex justify-center gap-2">
                        {order.handoverCode?.split('').map((char: string, i: number) => (
                          <div key={`pickup-code-${order.id}-${i}`} className="h-12 w-10 bg-zinc-800 rounded-xl border-2 border-amber-500/50 flex items-center justify-center text-xl font-black text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                             {char}
                          </div>
                        ))}
                     </div>
                   </div>
                )}
                
                {order.status === 'Shipped' && (
                  <button 
                    onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                    className="w-full rounded-2xl bg-zinc-100 py-4 font-black text-zinc-900 transition-smooth hover:bg-white active:scale-95 shadow-xl"
                  >
                     START DELIVERY RUN
                  </button>
                )}

                {order.status === 'Out for Delivery' && (
                   <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => onOpenOTP(order)}
                        className="w-full rounded-2xl bg-emerald-500 py-4 font-black text-white transition-smooth hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        MARK AS DELIVERED
                      </button>
                      
                      <button 
                        onClick={() => onOpenFailure(order)}
                        className="w-full rounded-2xl bg-zinc-800/50 py-3 font-bold text-zinc-400 transition-smooth hover:bg-zinc-800 hover:text-rose-400 border border-zinc-800/50"
                      >
                        UNABLE TO DELIVER
                      </button>
                   </div>
                )}

                {order.status === 'Return-Processing' && (
                  <button 
                    onClick={() => onOpenOTP(order)}
                    className="w-full rounded-2xl bg-blue-500 py-4 font-black text-white transition-smooth hover:bg-blue-400 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                     COLLECT RETURN FROM BUYER
                  </button>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

function HistoryOrdersList({ orders, formatPrice }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 px-2">History ({orders.length} Recent)</h2>
      <div className="grid grid-cols-1 gap-4">
         {orders.map((order: any) => (
           <div key={order.id} className="group flex items-center justify-between p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-smooth">
              <div className="flex items-center gap-6">
                 <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                    order.status === 'Delivered' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                 }`}>
                    <Icon name={order.status === 'Delivered' ? 'CheckCircleIcon' : 'XCircleIcon'} size={24} />
                 </div>
                 <div>
                    <p className="font-mono text-xs font-bold text-zinc-500 uppercase">#{order.id.substring(0, 8)}</p>
                    <p className="text-sm font-bold text-zinc-100">{order.customerName}</p>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">
                      {new Date(order.updatedAt).toLocaleDateString()} • {order.items.length} Items
                    </p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-lg font-black text-zinc-100 font-mono">{formatPrice(order.total)}</p>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'Delivered' ? 'text-emerald-500' : 'text-rose-500'
                 }`}>
                    {order.status}
                 </span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

function OTPStatusMessage({ isCOD, paymentCollected, requirePhoto, deliveryImage }: any) {
  if (isCOD && !paymentCollected) {
    return (
      <p className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-tight">
        Receive Cash to Unlock OTP
      </p>
    );
  }
  
  if (requirePhoto && !deliveryImage) {
    return (
      <p className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-tight">
        Take Photo to Unlock OTP
      </p>
    );
  }

  return null;
}

function OTPModal({ 
  order, isProcessing, requirePhoto, deliveryImage, 
  paymentCollected, setPaymentCollected, otpInput, setOtpInput, 
  onCapture, onClose, onVerify, formatPrice 
}: any) {
  const isCOD = order.paymentMethod?.toLowerCase().includes('cod') || order.paymentMethod?.toLowerCase().includes('cash');
  const canSendOTP = (!isCOD || paymentCollected) && (!requirePhoto || deliveryImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl">
      <div className="w-full max-w-lg rounded-[3rem] bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
           <h2 className="text-2xl font-black text-zinc-100">Handshake Required</h2>
           <button onClick={onClose} className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white transition-smooth">
              <Icon name="XMarkIcon" size={24} />
           </button>
        </div>

        <div className="space-y-6">
           <div className={`p-6 rounded-[2rem] border-2 transition-smooth ${
              (isCOD && !paymentCollected) ? 'bg-zinc-950 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/30'
           }`}>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {isCOD ? 'Cash Collection' : 'Payment Status'}
                 </span>
                 {(!isCOD || paymentCollected) && <Icon name="CheckCircleIcon" className="text-emerald-500" size={20} />}
              </div>
              <p className="text-3xl font-black font-mono text-zinc-100">{formatPrice(order.total)}</p>
              {isCOD && !paymentCollected && (
                 <button 
                    onClick={() => setPaymentCollected(true)}
                    className="mt-4 w-full py-3 bg-amber-500 text-zinc-900 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20"
                 >
                    CONFIRM CASH RECEIVED
                 </button>
              )}
           </div>

           {requirePhoto && (
              <div className={`p-6 rounded-[2rem] border-2 transition-smooth ${
                 deliveryImage ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-zinc-950 border-blue-500/30'
              }`}>
                 <div className="flex items-center justify-between mb-4">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Proof of Delivery</span>
                       <p className="text-[10px] text-zinc-500 mt-0.5">Capture a photo of the packet/customer</p>
                    </div>
                    {deliveryImage && <Icon name="CheckCircleIcon" className="text-emerald-500" size={20} />}
                 </div>

                 {deliveryImage ? (
                    <div className="relative h-32 w-full rounded-2xl overflow-hidden group">
                       <img src={deliveryImage} alt="Delivery proof" className="h-full w-full object-cover" />
                       <button 
                          onClick={onCapture}
                          className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth"
                       >
                          <span className="font-black text-[10px] text-white uppercase bg-zinc-900/80 px-4 py-2 rounded-lg">Retake</span>
                       </button>
                    </div>
                 ) : (
                    <button 
                       onClick={onCapture}
                       className="w-full py-6 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-smooth"
                    >
                       <Icon name="CameraIcon" size={32} className="text-blue-500" />
                       <span className="text-[10px] font-black text-zinc-500 uppercase">Snap Delivery Photo</span>
                    </button>
                 ) }
              </div>
           )}

           <div className={`space-y-4 transition-smooth ${canSendOTP ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
              <div className="space-y-2">
                 <label htmlFor="otp-input" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Verify Customer OTP</label>
                 <div className="flex gap-2">
                    <input 
                       id="otp-input"
                       type="text"
                       placeholder="XXXXXX"
                       maxLength={6}
                       className="flex-1 bg-zinc-950 border-zinc-800 rounded-2xl py-5 px-6 text-center text-3xl font-black font-mono tracking-[0.5em] text-emerald-500 focus:border-emerald-500 focus:ring-0 transition-smooth"
                       value={otpInput}
                       onChange={(e) => setOtpInput(e.target.value)}
                    />
                 </div>
              </div>

              <button 
                 onClick={onVerify}
                 disabled={isProcessing || otpInput.length < 4}
                 className="w-full rounded-2xl bg-emerald-500 py-5 font-black text-zinc-900 transition-smooth hover:bg-emerald-400 disabled:opacity-50 disabled:grayscale shadow-xl shadow-emerald-500/20"
              >
                 {isProcessing ? 'SYNCHRONIZING...' : 'COMPLETE HANDSHAKE'}
              </button>
           </div>
           
           <OTPStatusMessage 
              isCOD={isCOD} 
              paymentCollected={paymentCollected} 
              requirePhoto={requirePhoto} 
              deliveryImage={deliveryImage} 
           />
        </div>
      </div>
    </div>
  );
}

function FailureModal({ reasons, failureReason, setFailureReason, isProcessing, onClose, onSubmit }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[3rem] bg-zinc-900 border border-zinc-800 p-8">
        <h2 className="text-2xl font-black text-rose-500 mb-6">Delivery Failed</h2>
        <div className="space-y-2">
           {reasons.map((reason: string) => (
             <button 
               key={reason}
               onClick={() => setFailureReason(reason)}
               className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-smooth border ${
                 failureReason === reason ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-zinc-800/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
               }`}
             >
               {reason}
             </button>
           ))}
        </div>
        
        <div className="mt-8 flex flex-col gap-3">
           <button 
              disabled={!failureReason || isProcessing}
              onClick={onSubmit}
              className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl disabled:opacity-50 disabled:grayscale transition-smooth shadow-lg shadow-rose-500/20"
           >
              CONFIRM FAILURE
           </button>
           <button 
              onClick={onClose}
              className="w-full py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl hover:text-white transition-smooth"
           >
              CANCEL
           </button>
        </div>
      </div>
    </div>
  );
}
