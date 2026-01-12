'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
}

const SocialRegistration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const socialProviders: SocialProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: 'GlobeAltIcon',
      color: 'bg-white border-2 border-border text-foreground',
      hoverColor: 'hover:bg-muted',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'UserGroupIcon',
      color: 'bg-[#1877F2] text-white',
      hoverColor: 'hover:bg-[#1877F2]/90',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: 'DevicePhoneMobileIcon',
      color: 'bg-[#000000] text-white',
      hoverColor: 'hover:bg-[#000000]/90',
    },
  ];

  const handleSocialSignup = (providerId: string) => {
    setIsProcessing(providerId);
    setTimeout(() => {
      setIsProcessing(null);
    }, 2000);
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-medium text-muted-foreground">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm font-medium text-muted-foreground">Or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSocialSignup(provider.id)}
            disabled={isProcessing !== null}
            className={`flex items-center justify-center gap-3 rounded-lg px-6 py-3 font-medium transition-smooth ${provider.color} ${provider.hoverColor} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isProcessing === provider.id ? (
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
            ) : (
              <Icon name={provider.icon as any} size={20} />
            )}
            <span>{provider.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-muted p-4">
        <div className="flex items-start gap-3">
          <Icon name="ShieldCheckIcon" size={20} className="mt-0.5 flex-shrink-0 text-primary" />
          <div className="flex-1">
            <h4 className="mb-1 font-semibold text-foreground">Your Privacy Matters</h4>
            <p className="text-sm text-muted-foreground">
              We only access your basic profile information (name and email) to create your account.
              We never post on your behalf or access your private data without permission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialRegistration;
