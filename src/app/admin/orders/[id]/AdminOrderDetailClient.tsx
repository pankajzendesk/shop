'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';
import { updateOrder, updateRefundStatus, markTransactionSuccess } from '@/app/actions';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: any; // Json
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total: number;
  status: string;
  date: Date | string;
  carrier?: string | null;
  trackingNumber?: string | null;
  paymentMethod?: string | null;
  discountAmount?: number | null;
  promoCode?: string | null;
  transaction?: {
    id: string;
    status: string;
    paymentMethod: string;
    transactionId?: string | null;
    createdAt: Date | string;
  } | null;
  assignedShipment?: {
    name: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  assignedDelivery?: {
    name: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  source?: string | null;
  sourceStaff?: {
    name: string;
    lastName?: string | null;
  } | null;
  failureReason?: string | null;
  returnStatus?: string | null;
  refundPaymentMethod?: string | null;
  deliveryImage?: string | null;
}

const statusSteps = ['Processing', 'Packed', 'Shipped', 'Picked Carrier', 'In Transit', 'Out for Delivery', 'Delivered to Customer'];

export function AdminOrderDetailClient({ order: initialOrder }: { order: Order }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isUpdatingRefund, setIsUpdatingRefund] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [manualPayMethod, setManualPayMethod] = useState('Cash');

  const handleMarkPaid = async () => {
    setIsMarkingPaid(true);
    try {
      await markTransactionSuccess(order.id, manualPayMethod);
      setNotificationMsg(`Transaction marked as Success via ${manualPayMethod}`);
      setShowNotification(true);
      router.refresh();
    } catch (error) {
       console.error('Mark paid failed:', error);
       setNotificationMsg('Failed to update transaction');
       setShowNotification(true);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateOrder(order.id, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      setNotificationMsg(`Order status updated to ${newStatus}`);
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUpdateRefund = async (status: string, method: string) => {
    try {
      setIsUpdatingRefund(true);
      await updateRefundStatus(order.id, { status, method });
      setOrder({ ...order, returnStatus: status, refundPaymentMethod: method });
      setNotificationMsg(`Refund status updated to ${status}`);
      setShowNotification(true);
    } catch (error) {
      console.error('Failed to update refund:', error);
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
       globalThis.print();
    }, 500);
  };

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isFinalStatus = order.status === 'Cancelled' || order.status === 'Returned';

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const subtotal = orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8 print:p-0">
      <Notification isVisible={showNotification} message={notificationMsg} onClose={() => setShowNotification(false)} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <button onClick={() => router.back()} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeftIcon" size={16} />
            Back to Orders
          </button>
          <h1 className="font-heading text-3xl font-bold text-foreground overflow-hidden text-ellipsis">Order {order.id.substring(0, 8)}...</h1>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
           >
              <Icon name="PrinterIcon" size={18} />
              Print Packing Slip
           </button>
           <select 
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
           >
              <option value="Pending">Mark as Pending</option>
              <option value="Processing">Mark as Processing</option>
              <option value="Packed">Mark as Packed</option>
              <option value="Shipped">Mark as Shipped</option>
              <option value="Picked Carrier">Mark as Picked Carrier</option>
              <option value="In Transit">Mark as In Transit</option>
              <option value="Out for Delivery">Mark as Out for Delivery</option>
              <option value="Delivered to Customer">Mark as Delivered to Customer</option>
              <option value="Returned">Mark as Returned</option>
              <option value="Cancelled">Mark as Cancelled</option>
           </select>
        </div>
      </div>

      {!isFinalStatus && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-warm-sm print:hidden">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-0 h-1 w-full bg-muted"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
            ></div>

            {statusSteps.map((step, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-card transition-smooth ${
                  i <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground shadow-inner'
                }`}>
                  {i < currentStepIndex ? <Icon name="CheckIcon" size={20} /> : <span>{i + 1}</span>}
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${
                  i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="font-bold text-foreground">Order Items</h2>
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-border">
                {orderItems.map((item: any) => (
                  <tr key={item.id} className="group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 relative">
                           {item.image && <AppImage src={item.image} alt={item.name} fill className="object-cover" />}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{item.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-[10px] text-muted-foreground font-mono">ID: {item.id}</div>
                            {item.returnPolicy && item.returnPolicy !== 'NONE' ? (
                               <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20">
                                  <Icon name="CheckCircleIcon" size={10} />
                                  Return Eligible
                               </div>
                            ) : (
                               <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 text-[9px] font-black uppercase tracking-tighter border border-zinc-500/20">
                                  <Icon name="XCircleIcon" size={10} />
                                  Final Sale
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ₹{item.price.toLocaleString('en-IN')} x {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 bg-muted/10 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    Discount {order.promoCode && `(${order.promoCode})`}
                  </span>
                  <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t border-border">
                <span>Total Amount paid</span>
                <span className="text-lg text-primary">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(order.status === 'Returned' || order.status === 'Return-Processing' || (order as any).returnStatus === 'PENDING') && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-warm-sm">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2 text-primary">
                <Icon name="CurrencyRupeeIcon" size={20} />
                Refund Verification
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
                   <p className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">Owner Action Required</p>
                   <p className="text-sm font-medium text-orange-900">This order has been returned. Please verify the items and approve the refund payment.</p>
                </div>
                <div>
                  <label htmlFor="refundMethod" className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Refund Method</label>
                  <select 
                    id="refundMethod"
                    value={order.refundPaymentMethod || 'UPI'}
                    onChange={(e) => handleUpdateRefund(order.returnStatus || 'PENDING', e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                    <option value="Store Credit">Store Credit</option>
                  </select>
                </div>
                <div>
                  <button 
                    onClick={() => handleUpdateRefund('COMPLETED', order.refundPaymentMethod || 'UPI')}
                    disabled={isUpdatingRefund || order.returnStatus === 'COMPLETED'}
                    className={`w-full py-4 rounded-2xl text-sm font-black transition-all ${
                      order.returnStatus === 'COMPLETED'
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {order.returnStatus === 'COMPLETED' ? 'REFUND ISSUED' : 'APPROVE & RELEASE REFUND'}
                  </button>
                </div>
                {order.returnStatus === 'COMPLETED' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-bold uppercase">
                    <Icon name="CheckCircleIcon" size={16} />
                    Payment processed by Owner
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-bold text-foreground mb-4">Sale Channel</h2>
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${order.source === 'POS' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}`}>
                <Icon name={order.source === 'POS' ? 'CalculatorIcon' : 'GlobeAltIcon'} size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{order.source === 'POS' ? 'Store Walk-in' : 'Online Storefront'}</div>
                <div className="text-lg font-black text-foreground">{order.source}</div>
              </div>
            </div>
            
            {order.source === 'POS' && order.sourceStaff && (
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {order.sourceStaff.name[0]}{order.sourceStaff.lastName?.[0] || ''}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Attended By</div>
                    <div className="text-sm font-bold text-foreground">{order.sourceStaff.name} {order.sourceStaff.lastName || ''}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-bold text-foreground mb-4">Handover Trace</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${order.assignedShipment ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                   <Icon name="BoxIcon" size={16} />
                </div>
                <div>
                   <div className="text-xs font-bold text-muted-foreground uppercase">Shipment Personnel</div>
                   {order.assignedShipment ? (
                     <div className="mt-1">
                        <div className="font-bold text-foreground">{order.assignedShipment.name} {order.assignedShipment.lastName}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">{order.assignedShipment.email}</div>
                     </div>
                   ) : (
                     <div className="text-sm font-medium text-muted-foreground italic">Not yet packed</div>
                   )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${order.assignedDelivery ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                   <Icon name="TruckIcon" size={16} />
                </div>
                <div>
                   <div className="text-xs font-bold text-muted-foreground uppercase">Delivery Champion</div>
                   {order.assignedDelivery ? (
                     <div className="mt-1">
                        <div className="font-bold text-foreground">{order.assignedDelivery.name} {order.assignedDelivery.lastName}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">{order.assignedDelivery.email}</div>
                     </div>
                   ) : (
                     <div className="text-sm font-medium text-muted-foreground italic">Not yet assigned</div>
                   )}
                </div>
              </div>

              {order.failureReason && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                   <div className="flex items-center gap-2 text-red-500 mb-1">
                      <Icon name="ExclamationTriangleIcon" size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Delivery Exception</span>
                   </div>
                   <p className="text-xs text-red-600 font-medium leading-relaxed">
                      {order.failureReason}
                   </p>
                </div>
              )}

              {order.deliveryImage && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                   <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Icon name="CameraIcon" size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Delivery Photo Proof</span>
                   </div>
                   <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-black">
                      <img src={order.deliveryImage} alt="Delivery Proof" className="h-full w-full object-contain" />
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-bold text-foreground mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Name</div>
                <div className="font-medium text-foreground">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</div>
                <div className="text-sm text-primary">{order.customerEmail}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-bold text-foreground mb-4">Shipping Details</h2>
            <div className="space-y-4">
               {order.carrier && (
                 <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Carrier</div>
                    <div className="text-sm font-bold text-foreground">{order.carrier}</div>
                 </div>
               )}
               {order.trackingNumber && (
                 <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Tracking Number</div>
                    <div className="text-sm font-mono text-primary font-bold">{order.trackingNumber}</div>
                 </div>
               )}
               <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Order Date</div>
                  <div className="text-sm text-foreground">{new Date(order.date).toLocaleString('en-IN')}</div>
               </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h2 className="font-bold text-foreground mb-4">Transaction Details</h2>
            {order.transaction && order.transaction.status === 'Success' ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Status</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Success
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Payment Method</div>
                  <div className="text-sm font-medium text-foreground capitalize">{order.transaction.paymentMethod}</div>
                </div>
                {order.transaction.transactionId && (
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Transaction ID</div>
                    <div className="text-sm font-mono text-primary font-bold">{order.transaction.transactionId}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Processed At</div>
                  <div className="text-sm text-foreground">{new Date(order.transaction.createdAt).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="py-4 text-center border-b border-dashed border-border mb-4">
                  <Icon name="CreditCardIcon" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs font-bold text-warning uppercase">
                    {order.transaction?.status || 'No Transaction Linked'}
                  </p>
                  <div className="mt-1 text-xs font-bold text-foreground uppercase tracking-widest">
                    Method: {order.paymentMethod || 'COD'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manual Payment Update</div>
                  <select 
                    value={manualPayMethod}
                    onChange={(e) => setManualPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card Swipe</option>
                  </select>
                  <button 
                    onClick={handleMarkPaid}
                    disabled={isMarkingPaid}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {isMarkingPaid ? 'Updating...' : 'MARK AS PAID SUCCESS'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
