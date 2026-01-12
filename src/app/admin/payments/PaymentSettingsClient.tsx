'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { updatePaymentMethod, createPaymentMethod, deletePaymentMethod } from '@/app/actions';

interface PaymentMethod {
  id: string;
  name: string;
  identifier: string;
  icon: string | null;
  isActive: boolean;
  description: string | null;
}

interface PaymentSettingsClientProps {
  initialMethods: PaymentMethod[];
}

export function PaymentSettingsClient({ initialMethods }: Readonly<PaymentSettingsClientProps>) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: '',
    identifier: '',
    description: '',
    icon: 'CreditCardIcon',
    isActive: true
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updatePaymentMethod(id, { isActive: !currentStatus });
      setMethods(methods.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
      setNotificationMsg(`Payment method ${currentStatus ? 'disabled' : 'enabled'}`);
      setShowNotification(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    setMethodToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;
    try {
      await deletePaymentMethod(methodToDelete);
      setMethods(methods.filter(m => m.id !== methodToDelete));
      setNotificationMsg('Payment method deleted');
      setShowNotification(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setMethodToDelete(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createPaymentMethod(newMethod);
      setMethods([...methods, created as any]);
      setIsAdding(false);
      setNewMethod({ name: '', identifier: '', description: '', icon: 'CreditCardIcon', isActive: true });
      setNotificationMsg('New payment method added');
      setShowNotification(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Notification 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="mt-1 text-muted-foreground">Manage payment options available during checkout.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-smooth hover:bg-primary/90 shadow-warm-md"
        >
          <Icon name="PlusIcon" size={20} />
          Add New Method
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {methods.map((method) => (
          <div 
            key={method.id} 
            className={`rounded-2xl border bg-card p-6 shadow-warm-sm transition-all duration-300 ${
              method.isActive ? 'border-border' : 'border-dashed border-muted grayscale opacity-70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  method.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon name={(method.icon as any) || 'CreditCardIcon'} size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {method.name}
                    {!method.isActive && <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold">Hidden</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <p className="mt-1 text-[10px] font-mono text-muted-foreground">ID: {method.identifier}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(method.id, method.isActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    method.isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    method.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
                <button 
                  onClick={() => handleDelete(method.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error transition-smooth"
                >
                  <Icon name="TrashIcon" size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-warm-xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h2 className="font-heading text-xl font-bold text-foreground">Add Payment Method</h2>
              <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
               <div>
                  <label htmlFor="method-name" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Method Name</label>
                  <input 
                    id="method-name"
                    required
                    value={newMethod.name}
                    onChange={e => setNewMethod({...newMethod, name: e.target.value})}
                    placeholder="e.g. PayPal"
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
               </div>
               <div>
                  <label htmlFor="method-identifier" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Identifier (Unique Keyword)</label>
                  <input 
                    id="method-identifier"
                    required
                    value={newMethod.identifier}
                    onChange={e => setNewMethod({...newMethod, identifier: e.target.value})}
                    placeholder="e.g. paypal"
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
               </div>
               <div>
                  <label htmlFor="method-description" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Description</label>
                  <textarea 
                    id="method-description"
                    value={newMethod.description}
                    onChange={e => setNewMethod({...newMethod, description: e.target.value})}
                    placeholder="Displayed during checkout..."
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
               </div>
               <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-foreground hover:bg-muted transition-smooth"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-smooth shadow-warm-md"
                  >
                    Add Method
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
