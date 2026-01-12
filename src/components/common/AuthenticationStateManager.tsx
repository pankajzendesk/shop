'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface AuthenticationStateManagerProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  isActive?: boolean;
}

const AuthenticationStateManager = ({
  isAuthenticated = false,
  userName = '',
  userAvatar = '',
  isActive = false,
}: AuthenticationStateManagerProps) => {
  if (isAuthenticated) {
    return (
      <Link
        href="/account-dashboard"
        className={`flex items-center gap-3 rounded-md px-4 py-2 transition-smooth hover:bg-muted ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Go to account dashboard"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName || 'Account avatar'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <Icon name="UserCircleIcon" size={24} />
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-foreground">{userName || 'Account'}</span>
          <span className="text-xs text-muted-foreground">View dashboard</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-smooth hover:bg-muted ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon name="ArrowRightOnRectangleIcon" size={20} />
        Sign In
      </Link>
      <Link
        href="/register"
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
      >
        <Icon name="UserPlusIcon" size={20} />
        Join
      </Link>
    </div>
  );
};

export default AuthenticationStateManager;
