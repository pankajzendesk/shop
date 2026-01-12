'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { cancelOrder, requestReturn } from '@/app/actions';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  returnPolicy?: string;
}

interface StatusHistory {
  id: string;
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderDetailsModalProps {
  order: {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    total: number;
    taxAmount?: number;
    shippingCost?: number;
    shippingAddress?: string;
    paymentMethod?: string;
    items?: OrderItem[];
    statusHistory?: StatusHistory[];
    returnStatus?: string;
    returnType?: string;
    deliveryOTP?: string;
    deliveryImage?: string;
  };
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: Readonly<OrderDetailsModalProps>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [returnType, setReturnType] = useState<'REFUND' | 'REPLACEMENT'>('REFUND');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCancelOrder = async () => {
    if (!reason.trim()) return;
    setIsProcessing(true);
    try {
      // @ts-ignore
      await cancelOrder(order.id, reason);
      onClose();
      globalThis.location.reload(); 
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!reason.trim()) return;
    setIsProcessing(true);
    try {
      // @ts-ignore
      await requestReturn(order.id, { reason, type: returnType });
      onClose();
      globalThis.location.reload();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  // Map admin status to user perspective
  const mapStatusToUser = (status: string) => {
    switch (status) {
      case 'Processing': return 'Preparing Order';
      case 'Packed': return 'Packed & Ready';
      case 'Shipped': return 'Handed to Delivery';
      case 'Out for Delivery': return 'Arriving Today';
      case 'Delivered': return 'Delivered';
      case 'Cancelled': return 'Cancelled';
      case 'Refunded': return 'Refunded';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Packed': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Shipped': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Out for Delivery': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Delivered': return 'text-success bg-success/10 border-success/20';
      case 'Cancelled': case 'Refunded': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <div className="relative w-full max-w-3xl bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border/50 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-foreground tracking-tight">Order #{order.orderNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                {mapStatusToUser(order.status)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Placed on {new Date(order.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-50/50">
          {/* Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">Order Items</h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-foreground truncate">{item.name}</h5>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Quantity: {item.quantity}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.returnPolicy && item.returnPolicy !== 'NONE' ? (
                        <span className="flex items-center gap-1 text-[9px] uppercase font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <Icon name="CheckCircleIcon" size={10} />
                          Eligible for Return/Refund
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] uppercase font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          <Icon name="XCircleIcon" size={10} />
                          Final Sale - No Returns
                        </span>
                      )}
                      
                      {item.returnPolicy && item.returnPolicy !== 'NONE' && (
                        <span className="text-[9px] uppercase font-bold text-amber-600 px-2 py-1">
                          Policy: {item.returnPolicy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
            {/* Shipping Info */}
            <div className="space-y-4">
               {order.status !== 'Delivered' && order.deliveryOTP && (order.paymentMethod?.toLowerCase().includes('cod') || order.paymentMethod?.toLowerCase().includes('cash')) && (
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Delivery Verification OTP</p>
                    <div className="flex justify-center gap-2">
                      {order.deliveryOTP?.split('').map((char, i) => (
                        <span key={`delivery-otp-${order.id}-${i + 1}`} className="h-10 w-8 flex items-center justify-center bg-white rounded-lg border border-primary/30 text-lg font-black text-primary shadow-sm">
                          {char}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground font-medium italic">Share this code with delivery person ONLY at arrival</p>
                  </div>
               )}
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Shipping Address</h4>
                  <p className="text-sm text-foreground leading-relaxed italic bg-muted/30 p-3 rounded-xl border border-border/50">
                    {order.shippingAddress || 'No address provided'}
                  </p>
               </div>
               <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Payment Method</h4>
                  <div className="flex items-center gap-2 text-sm text-foreground bg-white w-fit px-3 py-1.5 rounded-lg border border-border/50 font-bold">
                    <Icon name="CreditCardIcon" size={16} className="text-primary" />
                    {order.paymentMethod || 'Not specified'}
                  </div>
               </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm h-fit">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Price Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-foreground font-bold">{formatPrice(order.total -(order.taxAmount || 0) - (order.shippingCost || 0))}</span>
                </div>
                {order.taxAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">GST / Tax</span>
                    <span className="text-foreground font-bold">{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                {order.shippingCost && (
                   <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Shipping</span>
                    <span className="text-foreground font-bold">{formatPrice(order.shippingCost)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-dashed border-border flex justify-between">
                  <span className="text-base font-black text-foreground tracking-tight">Total Amount</span>
                  <span className="text-xl font-black text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1 text-center">Order Logistics Journey</h4>
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>
              <div className="space-y-6 relative">
                {[...(order.statusHistory || [])].reverse().map((history, idx) => (
                  <div key={history.id} className="flex gap-4 items-start pl-1">
                    <div className={`mt-1.5 h-7 w-7 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-10 flex items-center justify-center ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                      {idx === 0 && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>{history.status}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                          {new Date(history.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      {history.note && <p className="text-xs text-muted-foreground mt-1 italic font-medium">"{history.note}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {(order.status === 'Processing' || (order.status === 'Delivered' && !order.returnStatus)) && (
          <div className="p-6 bg-white border-t border-border flex gap-3 justify-end items-center">
            {order.status === 'Processing' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-6 py-3 text-sm font-black text-destructive hover:bg-destructive/10 rounded-2xl transition-all border-2 border-transparent hover:border-destructive/20"
              >
                Cancel Order
              </button>
            )}
            {order.status === 'Delivered' && !order.returnStatus && (
              <button
                onClick={() => setShowReturnDialog(true)}
                disabled={!order.items?.some(item => item.returnPolicy && item.returnPolicy !== 'NONE')}
                className="px-8 py-3 bg-primary text-white text-sm font-black rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
              >
                {order.items?.some(item => item.returnPolicy && item.returnPolicy !== 'NONE') 
                  ? 'Request Return / Replacement' 
                  : 'Return Policy Expired / Not Applicable'}
              </button>
            )}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelDialog && (
          <div className="absolute inset-0 z-[110] bg-white rounded-3xl p-8 flex flex-col justify-center animate-in slide-in-from-bottom-4 duration-300">
             <div className="max-w-md mx-auto w-full text-center space-y-6">
                <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto text-destructive">
                   <Icon name="ExclamationTriangleIcon" size={40} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-foreground mb-2">Cancel your order?</h3>
                   <p className="text-sm text-muted-foreground font-medium">Please let us know why you are cancelling. This action cannot be undone.</p>
                </div>
                <div className="text-left">
                  <label htmlFor="cancel-reason" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Reason for cancellation</label>
                  <textarea 
                    id="cancel-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full mt-1.5 p-4 rounded-2xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 text-sm font-medium"
                    placeholder="Enter reason here..."
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowCancelDialog(false)}
                    className="flex-1 py-4 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={handleCancelOrder}
                    disabled={!reason.trim() || isProcessing}
                    className="flex-1 py-4 bg-destructive text-white text-sm font-black rounded-2xl shadow-lg shadow-destructive/20 hover:bg-destructive/90 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* Return Dialog */}
        {showReturnDialog && (
          <div className="absolute inset-0 z-[110] bg-white rounded-3xl p-8 flex flex-col justify-center animate-in slide-in-from-bottom-4 duration-300">
             <div className="max-w-md mx-auto w-full text-center space-y-6 overflow-y-auto max-h-full py-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                   <Icon name="ArrowPathIcon" size={40} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-foreground mb-2">Return Request</h3>
                   <p className="text-sm text-muted-foreground font-medium">Select your preference and describe the issue.</p>
                </div>
                
                <div className="flex p-1 bg-muted rounded-2xl border border-border">
                  <button 
                    onClick={() => setReturnType('REFUND')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${returnType === 'REFUND' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                  >
                    REFUND
                  </button>
                  <button 
                    onClick={() => setReturnType('REPLACEMENT')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${returnType === 'REPLACEMENT' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground'}`}
                  >
                    REPLACEMENT
                  </button>
                </div>

                <div className="text-left">
                  <label htmlFor="return-reason" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Reason for request</label>
                  <textarea 
                    id="return-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full mt-1.5 p-4 rounded-2xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 text-sm font-medium"
                    placeholder="E.g. Damaged product, wrong item delivered..."
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowReturnDialog(false)}
                    className="flex-1 py-4 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRequestReturn}
                    disabled={!reason.trim() || isProcessing}
                    className="flex-1 py-4 bg-primary text-white text-sm font-black rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Processing...' : 'Submit Request'}
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
