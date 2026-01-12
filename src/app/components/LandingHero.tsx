'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

const LandingHero = () => {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-[10%] top-[40%] h-96 w-96 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-24">
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
              <Icon name="StarIcon" size={14} />
              <span>New Year Sale - Up to 40% Off</span>
            </div>
            <h1 className="mb-6 font-heading text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
              Future of Play, <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Right Here.
              </span>
            </h1>
            <p className="mb-10 max-w-lg text-lg text-muted-foreground md:text-xl">
              Discover the most advanced gadgets, educational robots, and interactive toys that inspire wonder and creativity for all ages.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/product-catalog"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-smooth hover:bg-primary/90 hover:scale-105"
              >
                <span>Shop All Gadgets</span>
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                href="/product-catalog?category=educational"
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-white px-8 py-4 text-base font-bold text-foreground transition-smooth hover:border-primary/20 hover:bg-muted"
              >
                <span>Educational Kits</span>
              </Link>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="relative h-[400px] w-full max-w-[500px] overflow-hidden rounded-[2rem] shadow-warm-2xl md:h-[500px]">
              <AppImage
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1"
                alt="Futuristic glowing toy on a modern desk"
                fill
                className="object-cover transition-smooth hover:scale-110"
              />
            </div>
            
            {/* Floating stats cards */}
            <div className="absolute -bottom-6 -left-6 animate-bounce-slow rounded-2xl bg-white p-4 shadow-warm-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <Icon name="CheckCircleIcon" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Certified Safe</p>
                  <p className="text-sm font-black text-foreground">100% Quality Check</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 top-10 animate-float rounded-2xl bg-white p-4 shadow-warm-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon name="TruckIcon" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Fast Shipping</p>
                  <p className="text-sm font-black text-foreground">Next Day Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
