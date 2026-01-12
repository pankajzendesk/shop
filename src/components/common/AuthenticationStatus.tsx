'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-smooth hover:bg-muted ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Account menu"
          aria-expanded={isOpen}
        >
          <Icon name="UserCircleIcon" size={20} />
          <span>Account</span>
          <Icon
            name="ChevronDownIcon"
            size={16}
            className={`transition-smooth ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full z-1010 mt-2 w-56 animate-slide-down rounded-lg bg-popover shadow-warm-lg"
          >
            <div className="p-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Sign In</span>
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="UserPlusIcon" size={20} />
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-smooth hover:bg-muted ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        {userAvatar ? (
          <AppImage
            src={userAvatar}
            alt={userName || 'User avatar'}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <span className="max-w-[120px] truncate">{userName || 'Account'}</span>
        <Icon
          name="ChevronDownIcon"
          size={16}
          className={`transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-1010 mt-2 w-64 animate-slide-down rounded-lg bg-popover shadow-warm-lg"
        >
          <div className="p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
              {userAvatar ? (
                <AppImage
                  src={userAvatar}
                  alt={userName || 'User avatar'}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-popover-foreground">{userName || 'User'}</p>
                <p className="text-xs text-muted-foreground">Manage your account</p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/account-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="UserIcon" size={20} />
                <span>My Account</span>
              </Link>

              <Link
                href="/account-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="ShoppingBagIcon" size={20} />
                <span>My Orders</span>
              </Link>

              <Link
                href="/account-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="HeartIcon" size={20} />
                <span>Wishlist</span>
              </Link>

              <Link
                href="/account-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-popover-foreground transition-smooth hover:bg-muted"
              >
                <Icon name="Cog6ToothIcon" size={20} />
                <span>Settings</span>
              </Link>

              <div className="my-2 border-t border-border" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-error transition-smooth hover:bg-error/10"
              >
                <Icon name="ArrowRightOnRectangleIcon" size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationStateManager;
