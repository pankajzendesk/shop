'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SocialProvider {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const SocialLoginOptions = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const socialProviders: SocialProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: 'GlobeAltIcon',
      bgColor: 'bg-white hover:bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'UserGroupIcon',
      bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
      textColor: 'text-white',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: 'DevicePhoneMobileIcon',
      bgColor: 'bg-black hover:bg-gray-900',
      textColor: 'text-white',
    },
  ];

  const handleSocialLogin = (providerId: string) => {
    setLoadingProvider(providerId);
    setTimeout(() => {
      setLoadingProvider(null);
    }, 2000);
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">Or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {socialProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={loadingProvider !== null}
            className={`flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-medium transition-smooth disabled:cursor-not-allowed disabled:opacity-50 ${provider.bgColor} ${provider.textColor}`}
            aria-label={`Sign in with ${provider.name}`}
          >
            {loadingProvider === provider.id ? (
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
            ) : (
              <Icon name={provider.icon as any} size={20} />
            )}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default SocialLoginOptions;
