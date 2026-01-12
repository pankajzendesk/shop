'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Category {
  id: string;
  name: string;
  icon: string;
  path: string;
  description?: string;
}

interface CategoryQuickAccessProps {
  isActive?: boolean;
}

const CategoryQuickAccess = ({ isActive = false }: CategoryQuickAccessProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const categories: Category[] = [
    {
      id: 'gadgets',
      name: 'Gadgets',
      icon: 'DevicePhoneMobileIcon',
      path: '/product-catalog?category=gadgets',
      description: 'Latest tech and electronics',
    },
    {
      id: 'toys',
      name: 'Toys',
      icon: 'PuzzlePieceIcon',
      path: '/product-catalog?category=toys',
      description: 'Fun for all ages',
    },
    {
      id: 'smart-home',
      name: 'Smart Home',
      icon: 'HomeModernIcon',
      path: '/product-catalog?category=smart-home',
      description: 'Connected living devices',
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: 'RocketLaunchIcon',
      path: '/product-catalog?category=gaming',
      description: 'Consoles and accessories',
    },
    {
      id: 'educational',
      name: 'Educational',
      icon: 'AcademicCapIcon',
      path: '/product-catalog?category=educational',
      description: 'Learning through play',
    },
    {
      id: 'outdoor',
      name: 'Outdoor',
      icon: 'SunIcon',
      path: '/product-catalog?category=outdoor',
      description: 'Active play essentials',
    },
  ];

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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-smooth hover:bg-muted ${
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Browse categories"
        aria-expanded={isOpen}
      >
        <Icon name="Squares2X2Icon" size={20} />
        <span>Shop</span>
        <Icon
          name="ChevronDownIcon"
          size={16}
          className={`transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <aside
          ref={dropdownRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 top-full z-1010 mt-2 w-[480px] animate-slide-down rounded-lg bg-popover shadow-warm-lg"
          aria-label="Category navigation"
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-popover-foreground">
                Browse Categories
              </h3>
              <Link
                href="/product-catalog"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-primary transition-smooth hover:text-primary/80"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.path}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-start gap-3 rounded-lg p-3 transition-smooth hover:bg-muted"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon name={category.icon as any} size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-popover-foreground group-hover:text-primary">
                      {category.name}
                    </p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/product-catalog"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
              >
                <span>Explore All Products</span>
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default CategoryQuickAccess;
