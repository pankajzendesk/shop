'use client';

import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

interface NavCategory {
  id: string;
  name: string;
  img: string;
  href: string;
}

interface CategoryBarProps {
  initialCategories?: NavCategory[];
}

const CategoryBar = ({ initialCategories }: CategoryBarProps) => {
  const categories = initialCategories || [];

  return (
    <div className="bg-white shadow-warm-sm border-b border-border py-4 mb-2">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:gap-12">
          {categories.map((cat) => (
            <Link 
              key={cat.id || cat.name} 
              href={cat.href}
              className="group flex flex-col items-center gap-2 min-w-[80px]"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-transparent transition-smooth group-hover:border-primary group-hover:scale-105 bg-muted">
                <AppImage 
                  src={cat.img} 
                  alt={cat.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-smooth whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
