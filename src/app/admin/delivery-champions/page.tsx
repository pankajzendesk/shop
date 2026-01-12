'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { getDeliveryChampions, createDeliveryChampion } from '@/app/actions';

export default function DeliverySquadPage() {
  const [champions, setChampions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChampion, setNewChampion] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadChampions();
  }, []);

  const loadChampions = async () => {
    try {
      const data = await getDeliveryChampions();
      setChampions(data);
    } catch (error) {
      console.error('Failed to load champions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createDeliveryChampion(newChampion);
      setNotification({ show: true, message: 'Delivery Champion added successfully!', type: 'success' });
      setShowAddModal(false);
      setNewChampion({ name: '', email: '', phone: '' });
      loadChampions();
    } catch (error) {
      console.error('Error adding delivery champion:', error);
      setNotification({ show: true, message: 'Failed to add. Email might be in use.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Notification 
        isVisible={notification.show} 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ ...notification, show: false })} 
      />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Delivery Squad</h1>
          <p className="text-muted-foreground">Manage your Delivery Champions and their accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-smooth hover:scale-105"
        >
          <Icon name="PlusIcon" size={20} />
          Add Champion
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {champions.map((champ) => (
            <div key={champ.id} className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm transition-smooth hover:shadow-warm-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name="UserIcon" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{champ.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Delivery Champion</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="EnvelopeIcon" size={16} />
                  <span>{champ.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="PhoneIcon" size={16} />
                  <span>{champ.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          ))}
          {champions.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                 <Icon name="UserGroupIcon" size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Delivery Champions Found</h3>
              <p className="text-muted-foreground">Create your first account to start assigning orders.</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Add New Champion</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="champ-name" className="block text-sm font-bold text-muted-foreground mb-1 uppercase">Full Name</label>
                <input
                  id="champ-name"
                  type="text"
                  required
                  value={newChampion.name}
                  onChange={(e) => setNewChampion({ ...newChampion, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="champ-email" className="block text-sm font-bold text-muted-foreground mb-1 uppercase">Email Address</label>
                <input
                  id="champ-email"
                  type="email"
                  required
                  value={newChampion.email}
                  onChange={(e) => setNewChampion({ ...newChampion, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="champ-phone" className="block text-sm font-bold text-muted-foreground mb-1 uppercase">Phone Number</label>
                <input
                  id="champ-phone"
                  type="tel"
                  required
                  value={newChampion.phone}
                  onChange={(e) => setNewChampion({ ...newChampion, phone: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-border py-3 font-bold text-foreground transition-smooth hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-smooth hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Champion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
