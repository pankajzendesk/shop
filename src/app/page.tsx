import HeaderWithCart from '@/components/common/HeaderWithCart';
import PromoOffers from './components/PromoOffers';
import CategoryBar from './components/CategoryBar';
import BannerCarousel from './components/BannerCarousel';
import TopDeals from './components/TopDeals';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import prisma from '@/lib/prisma';

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
    const [products, banners, deals, coupons, categories, experiences, trendingData] = await Promise.all([
      prisma.product.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.banner.findMany({ where: { active: true } }),
      prisma.deal.findMany({ where: { active: true } }),
      prisma.coupon.findMany({ where: { status: 'Active' } }),
      prisma.navCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.experienceTile.findMany(),
      prisma.trendingProduct.findMany({ include: { product: true } }),
    ]);

    const trending = trendingData.map((t: any) => ({
      ...t.product,
      tag: t.tag
    }));

    return {
      products,
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
      products: [],
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
        
        <div className="mx-auto max-w-[1440px] px-2 md:px-6">
          <BannerCarousel initialSlides={banners} />
        </div>

        <TopDeals initialDeals={deals} />

        <PromoOffers initialCoupons={coupons} />

        {/* Featured Categories with Catchy Images */}
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

        {/* Trending Now Section */}
        <section className="py-24">
           <div className="mx-auto max-w-[1440px] px-6">
              <div className="flex items-end justify-between mb-12">
                 <div>
                    <h2 className="font-heading text-4xl font-extrabold text-foreground">Trending Now</h2>
                    <p className="mt-2 text-muted-foreground">These gadgets are flying off the shelves!</p>
                 </div>
                 <Link href="/product-catalog" className="hidden sm:flex items-center gap-2 font-bold text-primary hover:underline underline-offset-4">
                    <span>View All Products</span>
                    <Icon name="ArrowRightIcon" size={18} />
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                 {trending.map((product: any) => (
                    <Link key={product.id} href={`/product-catalog`} className="group flex flex-col overflow-hidden rounded-[2rem] border border-border bg-white transition-smooth hover:shadow-warm-xl">
                       <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-muted">
                          <AppImage src={product.image} alt={product.name} fill className="object-cover transition-smooth group-hover:scale-105" />
                          <div className="absolute left-4 top-4">
                             <span className="rounded-full bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-foreground shadow-sm">
                                {product.tag}
                             </span>
                          </div>
                       </div>
                       <div className="p-6">
                          <div className="flex items-center justify-between">
                             <h3 className="font-heading text-xl font-bold text-foreground">{product.name}</h3>
                             <p className="font-mono text-lg font-black text-primary">₹{product.price}</p>
                          </div>
                          <button className="mt-6 w-full rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground transition-smooth hover:bg-secondary/90">
                             Quick Shop
                          </button>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* Feature Highlights */}
        <section className="bg-muted py-24">
          <div className="mx-auto max-w-[1440px] px-6">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Icon name="ShieldCheckIcon" size={32} />
                </div>
                <h3 className="mb-3 font-heading text-xl font-bold">1-Year Warranty</h3>
                <p className="text-muted-foreground">We stand behind the quality of every gadget we sell. Full protection guaranteed.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Icon name="ArrowPathIcon" size={32} />
                </div>
                <h3 className="mb-3 font-heading text-xl font-bold">30-Day Returns</h3>
                <p className="text-muted-foreground">Not satisfy with your purchase? No worries, return it within 30 days for a full refund.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Icon name="ChatBubbleLeftRightIcon" size={32} />
                </div>
                <h3 className="mb-3 font-heading text-xl font-bold">24/7 Expert Support</h3>
                <p className="text-muted-foreground">Our team of experts is dedicated to helping you find the right toys for your needs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-[3rem] bg-gradient-to-br from-primary via-primary to-secondary p-12 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="mb-4 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to explore?</h2>
                <p className="mb-8 text-base sm:text-lg opacity-90 font-medium">Join 50,000+ happy customers and get early access to our latest gadget drops.</p>
                <div className="mx-auto flex flex-col sm:flex-row max-w-md gap-3" suppressHydrationWarning>
                   <input 
                      type="email" 
                      placeholder="Enter your email" 
                      suppressHydrationWarning
                      className="flex-1 rounded-xl border-0 bg-white/20 px-6 py-4 font-medium text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50 w-full"
                   />
                   <button className="rounded-xl bg-white px-8 py-4 font-bold text-primary transition-smooth hover:bg-opacity-90 w-full sm:w-auto whitespace-nowrap">
                      Join Now
                   </button>
                </div>
              </div>
              {/* Decorative circle */}
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl shadow-white/5" />
              <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl shadow-white/5" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 text-center text-sm text-muted-foreground">
        <p>© 2026 {process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'}. All rights reserved.</p>
      </footer>
    </div>
  );
}

