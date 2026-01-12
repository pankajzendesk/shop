'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  expiry: string | Date;
  usageCount: number;
  status: string;
  bgImg?: string | null;
}

interface PromoOffersProps {
  initialCoupons?: Coupon[];
}

const PromoOffers = ({ initialCoupons }: PromoOffersProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons || []);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const offerImages = [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575',
      'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48',
    ];

    if (initialCoupons && initialCoupons.length > 0) {
      setCoupons(initialCoupons.map((c: any, i: number) => ({
        ...c,
        bgImg: c.bgImg || offerImages[i % offerImages.length]
      })));
    }
  }, [initialCoupons]);

  if (!isHydrated || coupons.length === 0) return null;

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Special Rewards</span>
            <h2 className="mt-2 font-heading text-4xl font-extrabold text-foreground leading-[1.1]">Running Offers</h2>
            <p className="mt-3 text-lg text-muted-foreground">Don't miss out on these exclusive deals.</p>
          </div>
          <Link 
            href="/product-catalog" 
            className="group flex items-center gap-3 rounded-xl bg-muted px-6 py-3.5 text-sm font-bold text-foreground transition-smooth hover:bg-primary hover:text-white"
          >
            <span>Browse Collection</span>
            <Icon name="ArrowRightIcon" size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id} 
              className="group relative h-96 overflow-hidden rounded-[3rem] bg-card p-8 transition-smooth hover:shadow-warm-2xl"
            >
              {/* Catchy background image */}
              <div className="absolute inset-0 z-0">
                 {coupon.bgImg && (
                   <AppImage 
                      src={coupon.bgImg} 
                      alt="Offer Background" 
                      fill 
                      className="object-cover opacity-10 transition-smooth group-hover:scale-110 group-hover:opacity-20" 
                   />
                 )}
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                   <div className="flex items-center justify-between mb-8">
                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
                        <Icon name="TicketIcon" size={28} />
                     </div>
                     <div className="rounded-full bg-success/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-success border border-success/20">
                        Active
                     </div>
                   </div>

                   <h3 className="font-heading text-3xl font-black text-foreground group-hover:text-primary transition-smooth">
                     {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} discount`}
                   </h3>
                   <p className="mt-2 text-lg text-muted-foreground font-medium leading-relaxed">
                      Enjoy exclusive savings on the most advanced tech in our shop.
                   </p>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Promo Code</span>
                    <div className="flex items-center gap-3">
                       <span className="font-mono text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-smooth">
                          {coupon.code}
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      globalThis.navigator.clipboard.writeText(coupon.code);
                      globalThis.alert(`Code ${coupon.code} copied!`);
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 transition-smooth hover:scale-110 active:scale-95"
                    title="Copy Code"
                  >
                    <Icon name="Square2StackIcon" size={24} />
                  </button>
                </div>
              </div>
              
              {/* Decorative dash line */}
              <div className="absolute inset-x-8 bottom-24 border-t-2 border-dashed border-border group-hover:border-primary/20 transition-smooth" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoOffers;

