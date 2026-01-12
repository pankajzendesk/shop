'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';
import { createOrder, getProductStock, cancelOrder } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface POSItem extends Product {
  saleQuantity: number;
  customPrice?: number;
}

export function ShopkeeperDashboardClient({ initialProducts, stats }: { readonly initialProducts: any[], readonly stats: any }) {
  const router = useRouter();
  const { user, logout, isAuthenticated, isInitialized: authInitialized } = useAuth();
  const [products] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => (p as any).category).filter(Boolean))];
    return cats;
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (p as any).category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.customPrice || item.price) * item.saleQuantity, 0);
  const tax = subtotal * 0.18; // GST 18%
  const total = subtotal + tax;

  if (isMounted && authInitialized && (!isAuthenticated || (user?.role !== 'shopkeeper' && user?.role !== 'admin'))) {
    return <POSAccessDenied isAuthenticated={isAuthenticated} router={router} />;
  }

  // Show loading state while checking auth
  if (isMounted && !authInitialized) {
    return <POSLoadingView />;
  }

  const addToCart = async (product: Product) => {
    // Check stock from Postgres for real-time accuracy
    const currentStock = await getProductStock(product.id);
    const existing = cart.find(item => item.id === product.id);
    const cartQty = existing ? existing.saleQuantity : 0;

    if (currentStock <= cartQty) {
      setNotificationMsg(`Insufficient stock for ${product.name}. Available: ${currentStock}`);
      setShowNotification(true);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, saleQuantity: item.saleQuantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, saleQuantity: 1 }]);
    }
    setSearch('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    
    // Check stock for incrementing
    const existing = cart.find(item => item.id === id);
    if (existing && qty > existing.saleQuantity) {
      const currentStock = await getProductStock(id);
      if (currentStock < qty) {
        setNotificationMsg(`Cannot increase quantity. Only ${currentStock} in stock.`);
        setShowNotification(true);
        return;
      }
    }
    
    setCart(cart.map(item => item.id === id ? { ...item, saleQuantity: qty } : item));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const orderData = {
        source: 'POS',
        sourceStaffId: user?.id,
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        customerEmail: customer.email,
        total: total,
        taxAmount: tax,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.customPrice || item.price,
          quantity: item.saleQuantity,
          image: item.image
        })),
        paymentMethod: paymentMethod
      };

      const result = await createOrder(orderData);
      setLastOrder(result);
      // We don't clear the cart until the user clicks "DONE" 
      // This allows them to go back and edit if needed
      setNotificationMsg('Sale completed successfully!');
      setShowNotification(true);
      setShowReceipt(true);
    } catch (error) {
      console.error('POS Sale fail:', error);
      setNotificationMsg('Failed to process sale.');
      setShowNotification(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
        globalThis.print();
    }, 500);
  };

  const finalizeTransaction = () => {
    setCart([]);
    setCustomer({ name: '', phone: '', email: '' });
    setLastOrder(null);
    setShowReceipt(false);
    setShowNotification(false);
    setNotificationMsg('');
  };

  const handleBackToEdit = async () => {
    if (lastOrder) {
      try {
        // Void the created order so it doesn't count as a double sale/inventory deduction
        await cancelOrder(lastOrder.id, 'POS Back to Edit');
      } catch (e) {
        console.error('Failed to void order:', e);
      }
    }
    setShowReceipt(false);
    setLastOrder(null);
    setShowNotification(false);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden relative">
      <Notification isVisible={showNotification} message={notificationMsg} onClose={() => setShowNotification(false)} />

      {/* Floating Cart Button for Mobile */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center lg:hidden"
      >
        <div className="relative">
          <Icon name="ShoppingCartIcon" size={28} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-2 border-white text-[10px] font-black flex items-center justify-center text-white">
              {cart.length}
            </span>
          )}
        </div>
      </button>

      {/* Main Content: Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 print:hidden">
        <POSHeader 
          user={user} 
          search={search} 
          setSearch={setSearch} 
          stats={stats} 
          isMounted={isMounted} 
          isAuthenticated={isAuthenticated} 
          logout={logout} 
          router={router} 
        />

        <POSCategoryBar 
          categories={categories} 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />

        <POSProductGrid 
          filteredProducts={filteredProducts} 
          addToCart={addToCart} 
          setSearch={setSearch} 
          setSelectedCategory={setSelectedCategory} 
        />
      </div>

      <POSCartSidebar 
        isCartOpen={isCartOpen} 
        setIsCartOpen={setIsCartOpen} 
        cart={cart} 
        setCart={setCart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        customer={customer} 
        setCustomer={setCustomer} 
        paymentMethod={paymentMethod} 
        setPaymentMethod={setPaymentMethod} 
        subtotal={subtotal} 
        tax={tax} 
        total={total} 
        handleCheckout={handleCheckout} 
        isProcessing={isProcessing} 
      />

      {showReceipt && lastOrder && (
        <POSReceiptOverlay 
          lastOrder={lastOrder} 
          isMounted={isMounted} 
          handleBackToEdit={handleBackToEdit} 
          handlePrint={handlePrint} 
          finalizeTransaction={finalizeTransaction} 
        />
      )}
    </div>
  );
}

// --- Sub-components to reduce Cognitive Complexity ---

function POSLoadingView() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}

function POSAccessDenied({ isAuthenticated, router }: any) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FB]">
      <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
        <Icon name="LockClosedIcon" size={48} className="text-zinc-300" />
      </div>
      <h1 className="text-2xl font-black text-zinc-900 mb-2">Access Denied</h1>
      <p className="text-zinc-400 font-bold text-sm mb-8 uppercase tracking-widest text-center px-6">
        {isAuthenticated ? 'You do not have permission to access the Counter Terminal' : 'Please log in to use the Counter Terminal'}
      </p>
      <button 
        onClick={() => router.push(isAuthenticated ? '/' : '/login?role=shopkeeper')}
        className="px-12 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
      >
        {isAuthenticated ? 'GO HOME' : 'GO TO LOGIN'}
      </button>
    </div>
  );
}

function POSHeader({ user, search, setSearch, stats, isMounted, isAuthenticated, logout, router }: any) {
  return (
    <header className="h-20 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white relative overflow-hidden hidden sm:flex">
          {process.env.NEXT_PUBLIC_SHOP_LOGO_PATH ? (
            <AppImage 
              src={process.env.NEXT_PUBLIC_SHOP_LOGO_PATH} 
              alt="Shop Logo" 
              fill 
              className="object-contain p-1"
            />
          ) : (
            <Icon name="GiftIcon" size={24} />
          )}
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight">{process.env.NEXT_PUBLIC_SHOP_NAME ? process.env.NEXT_PUBLIC_SHOP_NAME.split(' ')[0] : 'Counter'} Terminal</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user?.name || 'Staff'}</p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-2 md:mx-8 relative" suppressHydrationWarning>
        <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text"
          placeholder="Search..."
          className="w-full bg-zinc-100 border-transparent rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-xs md:text-sm font-bold focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          suppressHydrationWarning
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
         <div className="text-right mr-4" suppressHydrationWarning>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Register Total</p>
            <p className="text-lg font-black text-zinc-900">₹{stats?.posRevenue?.toLocaleString('en-IN') || 0}</p>
         </div>
         {isMounted && (
           isAuthenticated ? (
             <button 
                onClick={() => {
                    logout();
                    router.push('/');
                }} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 transition-all font-bold text-[10px] uppercase tracking-widest"
             >
                <Icon name="ArrowLeftOnRectangleIcon" size={18} />
                Logout
             </button>
           ) : (
             <button 
                onClick={() => router.push('/login')} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-[10px] uppercase tracking-widest"
             >
                <Icon name="UserIcon" size={18} />
                Login
             </button>
           )
         )}
      </div>
    </header>
  );
}

function POSCategoryBar({ categories, selectedCategory, setSelectedCategory }: any) {
  return (
    <div className="bg-white px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
       {categories.map((cat: string) => (
         <button
           key={cat}
           onClick={() => setSelectedCategory(cat)}
           className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
             selectedCategory === cat 
             ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
             : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'
           }`}
         >
           {cat}
         </button>
       ))}
    </div>
  );
}

function POSProductGrid({ filteredProducts, addToCart, setSearch, setSelectedCategory }: any) {
  return (
    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 content-start">
       {filteredProducts.map((p: any) => {
         const isOutOfStock = p.quantity <= 0;
         return (
           <button 
             key={p.id}
             onClick={() => !isOutOfStock && addToCart(p)}
             disabled={isOutOfStock}
             className={`group relative flex flex-col bg-white rounded-3xl p-4 shadow-sm border border-transparent hover:border-primary/30 hover:shadow-xl transition-all text-left overflow-hidden ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
           >
             <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <Icon name="PlusIcon" size={16} />
                </div>
             </div>
             <div className="h-32 w-full rounded-2xl bg-zinc-50 relative overflow-hidden mb-4">
                <AppImage src={p.image} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                {isOutOfStock ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                     <span className="text-white text-[10px] font-black uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full">Sold Out</span>
                  </div>
                ) : p.quantity < 5 && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Low Stock: {p.quantity}
                  </div>
                )}
             </div>
             <h3 className="font-bold text-zinc-900 text-sm mb-1 line-clamp-2">{p.name}</h3>
             <p className="text-lg font-black text-primary mt-auto">₹{p.price.toLocaleString('en-IN')}</p>
           </button>
         );
       })}
       {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <Icon name="CubeIcon" size={64} className="mx-auto text-zinc-200 mb-4" />
             <h2 className="text-xl font-bold text-zinc-400">No products found in this section</h2>
             <button onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="mt-4 text-primary font-bold">Clear filters</button>
          </div>
       )}
    </div>
  );
}

function POSCartSidebar({ 
  isCartOpen, setIsCartOpen, cart, setCart, updateQuantity, removeFromCart, 
  customer, setCustomer, paymentMethod, setPaymentMethod, 
  subtotal, tax, total, handleCheckout, isProcessing 
}: any) {
  return (
    <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-zinc-200 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 lg:w-[450px] print:hidden ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
       <div className="lg:hidden p-4 border-b border-zinc-100 flex items-center gap-2">
          <button 
             onClick={() => setIsCartOpen(false)}
             className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center"
          >
             <Icon name="ArrowRightIcon" size={20} />
          </button>
          <span className="font-black text-xs uppercase tracking-widest">Back to Products</span>
       </div>
       
       <div className="p-4 md:p-8 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
             Current Sale
             {cart.length > 0 && <span className="h-6 w-6 rounded-full bg-zinc-100 text-zinc-600 text-[10px] flex items-center justify-center border border-zinc-200">{cart.length}</span>}
          </h2>
          {cart.length > 0 && (
            <button 
              onClick={() => setCart([])}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Icon name="TrashIcon" size={14} />
              Clear
            </button>
          )}
       </div>

       <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.map((item: any) => (
            <div key={item.id} className="group flex items-center gap-4 bg-[#F8F9FB] p-3 rounded-2xl border border-transparent hover:border-zinc-200 transition-all">
               <div className="h-14 w-14 rounded-xl bg-white relative overflow-hidden shrink-0 border border-zinc-100">
                  <AppImage src={item.image} alt={item.name} fill className="object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-zinc-900 text-xs truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <button onClick={() => updateQuantity(item.id, item.saleQuantity - 1)} className="h-6 w-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <Icon name="MinusIcon" size={10} />
                     </button>
                     <span className="text-xs font-black text-zinc-900 w-4 text-center">{item.saleQuantity}</span>
                     <button onClick={() => updateQuantity(item.id, item.saleQuantity + 1)} className="h-6 w-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <Icon name="PlusIcon" size={10} />
                     </button>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-black text-zinc-900">₹{((item.customPrice ?? item.price) * item.saleQuantity).toLocaleString('en-IN')}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-bold text-red-500 hover:underline">Remove</button>
               </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
               <div className="h-20 w-20 rounded-full border-4 border-dashed border-zinc-400 mb-4 flex items-center justify-center">
                  <Icon name="ShoppingCartIcon" size={32} />
               </div>
               <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Cart is empty</p>
            </div>
          )}
       </div>

       <div className="p-4 md:p-8 bg-zinc-50 border-t border-zinc-200 space-y-4 md:space-y-6">
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 relative" suppressHydrationWarning>
                   <Icon name="UserIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input 
                      type="text" 
                      placeholder="Customer Name"
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold"
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      suppressHydrationWarning
                   />
                </div>
                <div className="flex-1 relative" suppressHydrationWarning>
                   <Icon name="PhoneIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input 
                      type="text" 
                      placeholder="Phone Number"
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold"
                      value={customer.phone}
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                      suppressHydrationWarning
                   />
                </div>
             </div>

             <div className="relative">
                <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Payment Method</span>
                <div className="grid grid-cols-4 gap-2">
                   {['Cash', 'Card', 'UPI', 'Online'].map((method) => (
                      <button
                         key={method}
                         onClick={() => setPaymentMethod(method)}
                         className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${
                            paymentMethod === method 
                            ? 'bg-zinc-900 text-white border-zinc-900' 
                            : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200'
                         }`}
                      >
                         {method}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-3 pt-4">
             <div className="flex justify-between items-center text-zinc-500 font-bold text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between items-center text-zinc-500 font-bold text-sm">
                <span>Tax (GST 18%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
             </div>
             <div className="flex justify-between items-center text-zinc-900 font-black text-2xl pt-2">
                <span>Payable</span>
                <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
             </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-zinc-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isProcessing ? 'Processing...' : 'COMPLETE TRANSACTION'}
          </button>
       </div>
    </aside>
  );
}

function POSReceiptOverlay({ lastOrder, isMounted, handleBackToEdit, handlePrint, finalizeTransaction }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/80 backdrop-blur-md p-4 print:p-0 print:bg-white print:relative print:z-0">
      <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none relative">
        <button 
          onClick={handleBackToEdit}
          className="absolute top-8 left-8 h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-all print:hidden"
          title="Go Back"
        >
          <Icon name="ArrowLeftIcon" size={20} />
        </button>

        <div className="text-center mb-8">
           <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-zinc-100 mb-4">
              <Icon name="GiftIcon" size={32} className="text-zinc-600" />
           </div>
           <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Toy Shop Invoice</h2>
           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Direct Counter Sale</p>
        </div>

        <div className="space-y-6 border-y-2 border-dashed border-zinc-100 py-8 mb-8">
            <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                <span>Invoice: {lastOrder.id.substring(0,8).toUpperCase()}</span>
                <span>{isMounted ? new Date().toLocaleDateString() : ''}</span>
            </div>

            <div className="space-y-4">
                {lastOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start">
                       <div className="pr-4">
                          <div className="text-xs font-black text-zinc-900 leading-tight">{item.name}</div>
                          <div className="text-[10px] font-bold text-zinc-400">{item.quantity} x ₹{item.price.toLocaleString('en-IN')}</div>
                       </div>
                       <div className="text-sm font-black text-zinc-900">₹{(item.quantity * item.price).toLocaleString('en-IN')}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-2 pt-6">
               <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>Amount</span>
                  <span>₹{(lastOrder.total - lastOrder.taxAmount).toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>GST (18%)</span>
                  <span>₹{lastOrder.taxAmount.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between text-2xl font-black text-zinc-900 pt-4 border-t border-zinc-50">
                  <span>Total</span>
                  <span>₹{lastOrder.total.toLocaleString('en-IN')}</span>
               </div>
            </div>
        </div>

        <div className="space-y-1 mb-10">
           <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer</div>
           <div className="text-sm font-black text-zinc-900">{lastOrder.customerName}</div>
           {lastOrder.customerPhone && <div className="text-xs font-bold text-zinc-500">{lastOrder.customerPhone}</div>}
           <div className="mt-2 text-[10px] font-black px-2 py-1 bg-zinc-100 rounded inline-block uppercase text-zinc-600">Paid via {lastOrder.paymentMethod}</div>
        </div>

        <div className="flex gap-4 print:hidden">
           <button 
             onClick={() => {
               handlePrint();
               finalizeTransaction();
             }}
             className="flex-[2] rounded-2xl bg-primary py-4 text-[10px] font-black text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
           >
             <Icon name="PrinterIcon" size={16} />
             PRINT BILL & DONE
           </button>
           <button 
             onClick={finalizeTransaction}
             className="flex-1 rounded-2xl bg-zinc-900 py-4 text-[10px] font-black text-white transition-all hover:bg-zinc-800"
           >
             DONE
           </button>
        </div>
      </div>
    </div>
  );
}
