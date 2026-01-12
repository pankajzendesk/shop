'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface WelcomePanelProps {
  userName: string;
  userEmail: string;
  userPhone?: string;
  userGender?: string;
  userAvatar?: string;
  memberSince: string;
  totalOrders: number;
}

const WelcomePanel = ({
  userName,
  userEmail,
  userPhone,
  userGender,
  userAvatar,
  memberSince,
  totalOrders,
}: WelcomePanelProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="mb-2 h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-6 shadow-warm-lg">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {userAvatar ? (
            <AppImage
              src={userAvatar}
              alt={`Profile picture of ${userName}`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-warm-md"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-2xl font-bold text-primary shadow-warm-md">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Welcome back, {userName}!
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-white/90">
              <span className="flex items-center gap-1"><Icon name="EnvelopeIcon" size={14} /> {userEmail}</span>
              {userPhone && <span className="flex items-center gap-1"><Icon name="PhoneIcon" size={14} /> {userPhone}</span>}
              {userGender && <span className="flex items-center gap-1"><Icon name="UserIcon" size={14} /> {userGender}</span>}
            </div>
            <p className="mt-1 text-xs text-white/80 italic">Member since {memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Icon name="ShoppingBagIcon" size={20} className="text-white" />
              <p className="text-xs font-medium text-white/90">Total Orders</p>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-white">{totalOrders}</p>
          </div>

          <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
             <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={20} className="text-white" />
                <p className="text-xs font-medium text-white/90">Account Status</p>
             </div>
             <p className="mt-2 font-mono text-2xl font-bold text-white uppercase tracking-wider">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
