'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { updateUserPreferences } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';

interface Preference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

interface NotificationPreferencesProps {
  preferences?: Preference[];
}

const NotificationPreferences = ({
  preferences: initialPreferences = [],
}: NotificationPreferencesProps) => {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref))
    );
  };

  const handleSave = async () => {
    if (!user?.email) return;
    setIsSaving(true);
    try {
      const prefsObj = preferences.reduce((acc, pref) => ({
        ...acc,
        [pref.id]: pref.enabled
      }), {});
      
      await updateUserPreferences(user.email, prefsObj);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated) {
    const skeletons = Array.from({ length: 4 }, (_, i) => `notif-skeleton-${i}`);
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="space-y-4">
          {skeletons.map((id) => (
            <div key={id} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">
          Notification Preferences
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage how you receive updates and communications
        </p>
      </div>

      <div className="space-y-4">
        {preferences.map((preference) => (
          <div
            key={preference.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-smooth hover:bg-muted/50"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={preference.icon as any} size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{preference.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{preference.description}</p>
              </div>
            </div>

            <button
              onClick={() => togglePreference(preference.id)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-smooth ${
                preference.enabled ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={`Toggle ${preference.label}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-warm-sm transition-smooth ${
                  preference.enabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-50"
        >
          <Icon name={isSaving ? "ArrowPathIcon" : "CheckIcon"} size={16} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
