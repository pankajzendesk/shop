import HeaderWithCart from '@/components/common/HeaderWithCart';
import PromoOffers from './components/PromoOffers';
import CategoryBar from './components/CategoryBar';
import BannerCarousel from './components/BannerCarousel';
import TopDeals from './components/TopDeals';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 0; // Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ExperienceTile {
  id: string;
  name: string;
  image: string;
  color: string;
}

// Force update to resolve schema inconsistency
async function getStoreFrontData() {
  try {
    const [banners, deals, coupons, categories, experiences, trendingData] = await Promise.all([
      prisma.banner.findMany({
        where: { active: true },
        select: { id: true, title: true, subtitle: true, image: true },
        take: 6,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.deal.findMany({
        where: { active: true },
        select: { id: true, name: true, image: true, offer: true },
        take: 12,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.findMany({
        where: { status: 'Active' },
        select: { id: true, code: true, discount: true, type: true, expiry: true, usageCount: true, status: true, bgImg: true },
        take: 6,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.navCategory.findMany({
        select: { id: true, name: true, img: true, href: true },
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.experienceTile.findMany({
        select: { id: true, name: true, image: true, color: true },
        take: 10,
        orderBy: { name: 'asc' }
      }),
      prisma.trendingProduct.findMany({
        select: {
          tag: true,
          product: { select: { id: true, name: true, image: true, price: true } }
        },
        take: 6
      }),
    ]);

    const trending = trendingData.map((t: any) => ({
      ...t.product,
      tag: t.tag
    }));

    return {
      banners,
      deals,
      coupons,
      categories,
      experiences,
      trending,
    };
  } catch (error) {
    console.error('Failed to fetch landing data:', error);
    return {
      banners: [],
      deals: [],
      coupons: [],
      categories: [],
      experiences: [],
      trending: [],
    };
  }
}

export default async function HomePage() {
  const { banners, deals, coupons, categories, experiences, trending } = await getStoreFrontData();

  return (
    <div className="min-h-screen bg-muted/20">
      <HeaderWithCart />
      
      <main className="flex-grow py-4 space-y-6">
        {/* Flipkart-style Top Portion */}
        <CategoryBar initialCategories={categories} />

        {/* Shop by Experience - Moved to top */}
        <section className="py-24 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1440px] px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-heading text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">Shop by Experience</h2>
              <p className="mt-4 text-lg text-muted-foreground">Choose your next adventure from our hand-picked collections of future-ready toys.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
              {experiences.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  href={`/product-catalog?category=${cat.name.toLowerCase().replace(' ', '-')}`}
                  className="group relative h-48 sm:h-80 overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-card transition-smooth hover:shadow-warm-2xl hover:-translate-y-2 border border-border"
                >
                  <div className="absolute inset-0 z-0">
                    <AppImage 
                      src={cat.image} 
                      alt={cat.name} 
                      fill 
                      className="object-cover opacity-60 transition-smooth group-hover:scale-110 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 z-10 flex flex-col items-center px-4">
                    <div className={`mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${cat.color} text-white shadow-xl group-hover:scale-110 transition-smooth`}>
                      <Icon name="RocketLaunchIcon" size={20} className="sm:hidden" />
                      <Icon name="RocketLaunchIcon" size={24} className="hidden sm:block" />
                    </div>
                    <span className="font-heading text-sm sm:text-xl font-bold text-white tracking-wide text-center">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Banner Carousel */}
        <div className="mx-auto max-w-[1440px] px-2 md:px-6">
          <BannerCarousel initialSlides={banners} />
        </div>

        {/* Hot Deals */}
        <TopDeals initialDeals={deals} />

        {/* Promo Offers */}
        <PromoOffers initialCoupons={coupons} />
      </main>

      <footer className="border-t border-border py-12 text-center text-sm text-muted-foreground">
        <p>© 2026 {process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'}. All rights reserved.</p>
      </footer>
    </div>
  );
}

