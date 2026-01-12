'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { getStoreSettings, updateStoreSettings } from '@/app/actions';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [settings, setSettings] = useState({
    taxEnabled: false,
    taxPercentage: 0,
    taxName: 'GST',
    requireDeliveryPhoto: false
  });

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getStoreSettings();
        setSettings({
          taxEnabled: data.taxEnabled,
          taxPercentage: data.taxPercentage,
          taxName: data.taxName,
          requireDeliveryPhoto: data.requireDeliveryPhoto || false
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        showNotify('Failed to load store settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettings(settings);
      showNotify('Settings updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showNotify('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Notification
        message={notification.message}
        isVisible={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        type={notification.type}
      />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Store Settings</h1>
          <p className="text-muted-foreground">Manage global store configurations and tax policies</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-smooth hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
          ) : (
            <Icon name="CheckIcon" size={20} />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="ReceiptPercentIcon" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Tax & GST Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure how taxes are applied during checkout</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
              <div className="space-y-0.5">
                <label htmlFor="tax-enabled" className="text-base font-semibold text-foreground">Enable Tax/GST</label>
                <p className="text-sm text-muted-foreground">When enabled, tax will be added to the order total during checkout</p>
              </div>
              <button
                id="tax-enabled"
                onClick={() => setSettings({ ...settings, taxEnabled: !settings.taxEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.taxEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.taxEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.taxEnabled && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="tax-name" className="text-sm font-medium text-foreground">Tax Label Name</label>
                  <input
                    id="tax-name"
                    type="text"
                    value={settings.taxName}
                    onChange={(e) => setSettings({ ...settings, taxName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. GST, VAT, Service Tax"
                  />
                  <p className="text-xs text-muted-foreground text-right italic">Display name shown to customers</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tax-percentage" className="text-sm font-medium text-foreground">Tax Percentage (%)</label>
                  <div className="relative">
                    <input
                      id="tax-percentage"
                      type="number"
                      value={settings.taxPercentage}
                      onChange={(e) => setSettings({ ...settings, taxPercentage: Number.parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon name="CameraIcon" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Delivery Policy Controls</h2>
              <p className="text-sm text-muted-foreground">Manage security and verification requirements for deliveries</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <label htmlFor="delivery-photo" className="text-base font-semibold text-foreground">Require Delivery Photo Proof</label>
                  <p className="text-sm text-muted-foreground">When enabled, delivery champions MUST upload a photo of the package at the customer's door to complete delivery</p>
                </div>
                <button
                  id="delivery-photo"
                  onClick={() => setSettings({ ...settings, requireDeliveryPhoto: !settings.requireDeliveryPhoto })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.requireDeliveryPhoto ? 'bg-indigo-600' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.requireDeliveryPhoto ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
