'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const defaultDeals = [
  { id: '1', name: 'Gaming Headsets', price: '69.99', img: 'https://img.rocket.new/generatedImages/rocket_gen_img_188c2f735-1763301793323.png', offer: 'From ₹499' },
  { id: '2', name: 'Smart Robots', price: '149.99', img: 'https://img.rocket.new/generatedImages/rocket_gen_img_1586eba5f-1764915354370.png', offer: 'Min 20% Off' },
  { id: '3', name: 'RC Drones', price: '199.99', img: 'https://images.unsplash.com/photo-1683085209849-9d9948bfe8fe', offer: 'Best Selling' },
  { id: '4', name: 'Action Cameras', price: '129.99', img: 'https://images.unsplash.com/photo-1725111858010-9b8c2c94d015', offer: 'Explore Now' },
  { id: '5', name: 'Smart Bulbs', price: '29.99', img: 'https://images.unsplash.com/photo-1633942793943-277d0073fdb1', offer: 'Special Price' },
  { id: '6', name: 'STEM Kits', price: '59.99', img: 'https://images.unsplash.com/photo-1611095973763-4140195a24c9', offer: 'Hot Deal' },
];

interface TopDealsProps {
  initialDeals?: any[];
}

const TopDeals = ({ initialDeals }: TopDealsProps) => {
  const [deals, setDeals] = useState(initialDeals || []);

  useEffect(() => {
    if (initialDeals && initialDeals.length > 0) {
      setDeals(initialDeals);
    }
  }, [initialDeals]);

  if (deals.length === 0) return null;

  return (
    <section className="bg-white mx-auto max-w-[1440px] mb-6 shadow-sm border border-border">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border">
         <h2 className="text-xl md:text-2xl font-black text-foreground">Top Deals on Tech</h2>
         <Link href="/product-catalog" className="bg-primary text-white h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center hover:scale-110 transition-smooth">
            <Icon name="ChevronRightIcon" size={24} />
         </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 p-4 md:p-6 scrollbar-hide">
         {deals.map((deal: any) => (
           <Link 
            key={deal.id} 
            href={`/product-catalog?query=${deal.name}`}
            className="flex-shrink-0 w-[140px] md:w-[200px] flex flex-col items-center group"
           >
              <div className="relative h-[120px] w-full md:h-[180px] mb-3 transition-smooth group-hover:scale-105">
                 <AppImage 
                  src={deal.image || deal.img} 
                  alt={deal.name} 
                  fill 
                  className="object-contain"
                 />
              </div>
              <p className="text-sm font-bold text-foreground text-center line-clamp-1">{deal.name}</p>
              <p className="text-sm font-black text-success mt-1">{deal.offer}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Shop Now!</p>
           </Link>
         ))}
      </div>
    </section>
  );
};

export default TopDeals;
