'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface HeaderProps {
  cartItemCount?: number;
  cartTotal?: number;
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const Header = ({
  cartItemCount = 0,
  cartTotal = 0,
  isAuthenticated = false,
  userName = '',
  userAvatar = '',
  onLogout,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(globalThis.scrollY > 10);
    };

    globalThis.addEventListener('scroll', handleScroll);
    return () => globalThis.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchTerm(''); // Reset search on navigation
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/product-catalog?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-1000 w-full bg-white transition-smooth ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex h-[64px] items-center gap-4 md:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-smooth hover:opacity-80 shrink-0"
            aria-label={`${process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'} Home`}
          >
            {process.env.NEXT_PUBLIC_SHOP_LOGO_PATH ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <AppImage
                  src={process.env.NEXT_PUBLIC_SHOP_LOGO_PATH}
                  alt="Shop Logo"
                  fill
                  className="object-contain"
                  errorFallback={
                    <div className="flex h-full w-full items-center justify-center bg-primary">
                      <Icon name="CubeIcon" size={24} className="text-white" />
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Icon name="CubeIcon" size={24} className="text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <span className="font-heading text-xl font-black text-foreground">
                {process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'}
              </span>
              <p className="text-[10px] italic text-muted-foreground -mt-1 hidden lg:block">Explore <span className="text-primary font-bold">Plus</span></p>
            </div>
          </Link>

          {/* Search Bar - Hidden on very small mobile, visible on sm and up */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl relative group">
            <input 
              type="text"
              placeholder="Search products..."
              suppressHydrationWarning
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-smooth"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
              <Icon name="MagnifyingGlassIcon" size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-6 ml-auto shrink-0">
            <Link 
              href={isAuthenticated ? "/account-dashboard" : "/login"}
              className="flex items-center gap-2 px-3 md:px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-smooth text-sm whitespace-nowrap"
            >
              <Icon name="UserIcon" size={18} />
              <span className="hidden md:inline">{isAuthenticated ? (userName?.split(' ')[0] || 'Account') : 'Login'}</span>
            </Link>

            {isAuthenticated && onLogout && (
              <button
                onClick={onLogout}
                className="hidden lg:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-error transition-smooth"
                title="Sign Out"
              >
                <Icon name="ArrowLeftOnRectangleIcon" size={20} />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            )}

            <Link
              href="/shopping-cart"
              className="group flex items-center gap-2 font-bold text-foreground hover:text-primary transition-smooth"
            >
              <div className="relative">
                <Icon name="ShoppingCartIcon" size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block">Cart</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-smooth hover:bg-muted md:hidden"
            >
              <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
            </button>
          </div>
        </div>
        
        {/* Mobile Search - Only on tiny screens */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-lg py-2 pl-4 pr-10 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Icon name="MagnifyingGlassIcon" size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[110] md:hidden">
          <button 
            type="button"
            className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm cursor-default" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <nav className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl font-black">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/product-catalog"
                className="flex items-center gap-4 p-3 rounded-xl font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all"
              >
                <Icon name="Squares2X2Icon" size={20} />
                <span>Shop Catalog</span>
              </Link>
              
              <Link
                href="/shopping-cart"
                className="flex items-center justify-between p-3 rounded-xl font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all"
              >
                <div className="flex items-center gap-4">
                  <Icon name="ShoppingCartIcon" size={20} />
                  <span>My Cart</span>
                </div>
                {cartItemCount > 0 && <span className="bg-primary text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center">{cartItemCount}</span>}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/account-dashboard" className="flex items-center gap-4 p-3 rounded-xl font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all">
                    <Icon name="UserCircleIcon" size={20} />
                    <span>My Profile</span>
                  </Link>
                  <Link href="/order-history" className="flex items-center gap-4 p-3 rounded-xl font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all">
                    <Icon name="ReceiptPercentIcon" size={20} />
                    <span>Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-3 rounded-xl font-bold text-error hover:bg-error/5 transition-all w-full text-left"
                  >
                    <Icon name="ArrowLeftOnRectangleIcon" size={20} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-4 p-3 rounded-xl font-bold text-primary bg-primary/5 mt-2">
                  <Icon name="ArrowRightOnRectangleIcon" size={20} />
                  <span>Login / Register</span>
                </Link>
              )}
              
              <Link href="/admin" className="flex items-center gap-4 p-3 rounded-xl font-bold text-foreground hover:bg-primary/5 hover:text-primary transition-all">
                <Icon name="BuildingStorefrontIcon" size={20} />
                <span>Become a Seller</span>
              </Link>
            </div>

            <div className="mt-auto border-t pt-6 text-center">
              <p className="text-xs text-muted-foreground font-medium">Need help? 24/7 Support</p>
              <button className="mt-2 text-primary text-sm font-bold">Contact Us</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
