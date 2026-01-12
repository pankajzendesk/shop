'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  getBanners, getDeals, getNavCategories, getProducts,
  createBanner, deleteBanner as deleteBannerAction, 
  createDeal, deleteDeal as deleteDealAction,
  createNavCategory, deleteNavCategory as deleteNavCategoryAction,
  getExperienceTiles, createExperienceTile, deleteExperienceTile,
  getTrendingProducts, createTrendingProduct, deleteTrendingProduct
} from '@/app/actions';


interface Banner {
  id: string;
  title: string;
  subtitle: string;
  img: string;
  active: boolean;
}

interface Deal {
  id: string;
  name: string;
  price: string;
  img: string;
  offer: string;
}

interface NavCategory {
  id: string;
  name: string;
  img: string;
  href: string;
}

interface ExperienceTile {
  id: string;
  name: string;
  img: string;
  color: string;
}

export default function AdminPromotionsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [experienceTiles, setExperienceTiles] = useState<ExperienceTile[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  // Delete Confirmation State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'banner' | 'deal' | 'nav' | 'exp' | 'trending' | null;
    id: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    title: '',
    message: ''
  });

  const openDeleteModal = (type: any, id: string, title: string, message: string) => {
    setDeleteDialog({ isOpen: true, type, id, title, message });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteDialog;
    if (!id) return;
    try {
      if (type === 'banner') await deleteBannerAction(id);
      else if (type === 'deal') await deleteDealAction(id);
      else if (type === 'nav') await deleteNavCategoryAction(id);
      else if (type === 'exp') await deleteExperienceTile(id);
      else if (type === 'trending') {
        const t = await getTrendingProducts();
        const record = (t as any[]).find(item => item.productId === id);
        if (record) await deleteTrendingProduct(record.id);
      }
      
      loadData();
      setNotificationMsg(`${type?.charAt(0).toUpperCase()}${type?.slice(1)} removed successfully`);
      setShowNotification(true);
    } catch (e) {
      console.error(e);
      setNotificationMsg('Failed to remove item');
      setShowNotification(true);
    } finally {
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    img: ''
  });

  const [bannerMediaType, setBannerMediaType] = useState<'link' | 'upload'>('link');

  const [newNavCat, setNewNavCat] = useState({
    name: '',
    img: '',
    href: '/product-catalog'
  });

  const [newExpTile, setNewExpTile] = useState({
    name: '',
    img: '',
    color: 'bg-primary'
  });

  const [dealForm, setDealForm] = useState({
    productId: '',
    offerLabel: ''
  });

  const [trendingForm, setTrendingForm] = useState({
    productId: '',
    tag: 'Fast Seller'
  });

  const loadData = async () => {
    const [b, d, n, p, e, t] = await Promise.all([
      getBanners(),
      getDeals(),
      getNavCategories(),
      getProducts(),
      getExperienceTiles(),
      getTrendingProducts()
    ]);

    setBanners(b as Banner[]);
    setDeals(d as Deal[]);
    setNavCategories(n as NavCategory[]);
    setAllProducts(p as any[]);
    setExperienceTiles(e as ExperienceTile[]);
    setTrendingProducts(t.map((item: any) => ({ ...item.product, tag: item.tag })));
  };

  useEffect(() => {
    setIsHydrated(true);
    loadData();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.img) return;
    await createBanner({
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      image: newBanner.img,
      active: true
    });
    setNewBanner({ title: '', subtitle: '', img: '' });
    setBannerMediaType('link');
    loadData();
    setNotificationMsg('Banner published!');
    setShowNotification(true);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner(prev => ({ ...prev, img: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteBanner = (id: string) => {
    openDeleteModal('banner', id, 'Delete Banner', 'Are you sure you want to remove this landing page banner?');
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = allProducts.find(p => p.id === dealForm.productId);
    if (!product) return;
    await createDeal({
      name: product.name,
      price: `₹${product.price}`,
      image: product.image,
      offer: dealForm.offerLabel,
      active: true
    });
    setDealForm({ productId: '', offerLabel: '' });
    loadData();
    setNotificationMsg('Deal added');
    setShowNotification(true);
  };

  const deleteDeal = (id: string) => {
    openDeleteModal('deal', id, 'Delete Deal', 'Are you sure you want to remove this featured deal?');
  };

  const handleCreateNavCat = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNavCategory({
      name: newNavCat.name,
      img: newNavCat.img,
      href: newNavCat.href,
      displayOrder: navCategories.length
    });
    setNewNavCat({ name: '', img: '', href: '/product-catalog' });
    loadData();
    setNotificationMsg('Category updated!');
    setShowNotification(true);
  };

  const deleteNavCat = (id: string) => {
    openDeleteModal('nav', id, 'Delete Category', 'Are you sure you want to delete this navigation category?');
  };

  const handleCreateExpTile = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExperienceTile({
      name: newExpTile.name,
      image: newExpTile.img,
      color: newExpTile.color
    });
    setNewExpTile({ name: '', img: '', color: 'bg-primary' });
    loadData();
    setNotificationMsg('New experience experience tile added!');
    setShowNotification(true);
  };

  const deleteExpTile = (id: string) => {
    openDeleteModal('exp', id, 'Delete Tile', 'Are you sure you want to delete this experience tile?');
  };

  const handleAddTrending = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = allProducts.find(p => p.id === trendingForm.productId);
    if (!product) return;
    await createTrendingProduct({
      productId: product.id,
      tag: trendingForm.tag
    });
    setTrendingForm({ productId: '', tag: 'Fast Seller' });
    loadData();
    setNotificationMsg('Product added to trending!');
    setShowNotification(true);
  };

  const deleteTrending = (id: string) => {
    openDeleteModal('trending', id, 'Remove Trending', 'Are you sure you want to remove this product from trending?');
  };

  if (!isHydrated) return null;

  return (
    <div className="space-y-12">
      <Notification 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-foreground">Marketing & Promotions</h1>
        <p className="text-muted-foreground">Control landing page advertisements and featured sections.</p>
      </div>

      <section>
        <div className="mb-6 flex items-center gap-2">
            <Icon name="PhotoIcon" className="text-indigo-600" size={24} />
            <h2 className="font-heading text-xl font-bold">Landing Page Banners (Ads)</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-fit">
                <h3 className="mb-6 font-heading text-lg font-bold text-foreground">Add New Banner</h3>
                <form onSubmit={handleCreateBanner} className="space-y-4">
                    <div>
                        <label htmlFor="banner-title" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Banner Title</label>
                        <input 
                            id="banner-title"
                            required
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                            placeholder="e.g. Summer Gaming Fest"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="banner-subtitle" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Subtitle</label>
                        <input 
                            id="banner-subtitle"
                            required
                            value={newBanner.subtitle}
                            onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                            placeholder="e.g. Up to 40% off on all consoles"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="banner-image-input" className="block text-xs font-bold uppercase text-muted-foreground">Banner Image</label>
                            <div className="flex bg-background border border-border rounded-lg p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setBannerMediaType('link')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${bannerMediaType === 'link' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    LINK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBannerMediaType('upload')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${bannerMediaType === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    UPLOAD
                                </button>
                            </div>
                        </div>
                        
                        {bannerMediaType === 'upload' ? (
                            <div className="relative group">
                                <input
                                    id="banner-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="h-24 rounded-xl border-2 border-dashed border-border group-hover:border-indigo-600/50 transition-colors flex flex-col items-center justify-center bg-background/50 overflow-hidden">
                                    {newBanner.img ? (
                                        <img src={newBanner.img} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Icon name="CloudArrowUpIcon" size={24} className="text-muted-foreground mb-1" />
                                            <span className="text-[10px] text-muted-foreground font-medium">Click to upload banner</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <input 
                                id="banner-image-input"
                                required
                                value={newBanner.img}
                                onChange={(e) => setNewBanner({...newBanner, img: e.target.value})}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        )}

                        {bannerMediaType === 'link' && newBanner.img && (
                            <div className="h-16 rounded-lg overflow-hidden border border-border">
                                <img src={newBanner.img} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-4 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-smooth">
                        Publish Banner
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                    <div key={banner.id} className="relative group rounded-2xl border border-border bg-card overflow-hidden shadow-warm-sm">
                        <div className="h-32 w-full relative">
                            <img src={banner.img} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                                <h4 className="text-white text-sm font-bold truncate">{banner.title}</h4>
                                <p className="text-white/80 text-[10px] truncate">{banner.subtitle}</p>
                            </div>
                        </div>
                        <div className="p-3 flex items-center justify-between bg-white">
                            <span className="text-xs font-bold text-success flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live
                            </span>
                            <button 
                                onClick={() => deleteBanner(banner.id)}
                                className="p-1 px-2 text-[10px] font-bold text-error bg-error/5 rounded-md hover:bg-error hover:text-white transition-smooth"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <div className="mb-6 flex items-center gap-2">
            <Icon name="StarIcon" className="text-amber-500" size={24} />
            <h2 className="font-heading text-xl font-bold">Top Deals on Tech (Landing Page)</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-fit">
                <h3 className="mb-6 font-heading text-lg font-bold text-foreground">Add Product to Deals</h3>
                <form onSubmit={handleAddDeal} className="space-y-4">
                    <div>
                        <label htmlFor="deal-product" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Select Product</label>
                        <select 
                            id="deal-product"
                            required
                            value={dealForm.productId}
                            onChange={(e) => setDealForm({...dealForm, productId: e.target.value})}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">-- Choose a Product --</option>
                            {allProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="deal-label" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Offer Label</label>
                        <input 
                            id="deal-label"
                            required
                            value={dealForm.offerLabel}
                            onChange={(e) => setDealForm({...dealForm, offerLabel: e.target.value})}
                            placeholder="e.g. Min 20% Off"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button className="w-full mt-4 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-smooth">
                        Add to Homepage Deals
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {deals.map((deal) => (
                    <div key={deal.id} className="relative group rounded-2xl border border-border bg-card p-4 shadow-warm-sm flex flex-col items-center text-center">
                        <div className="h-20 w-20 relative mb-2">
                            <img src={deal.img} alt="" className="h-full w-full object-contain" />
                        </div>
                        <h4 className="text-xs font-bold truncate w-full">{deal.name}</h4>
                        <p className="text-success font-black text-[10px] mt-1">{deal.offer}</p>
                        <button 
                            onClick={() => deleteDeal(deal.id)}
                            className="mt-3 text-[10px] font-bold text-error hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <div className="mb-6 flex items-center gap-2">
            <Icon name="QueueListIcon" className="text-blue-500" size={24} />
            <h2 className="font-heading text-xl font-bold">Top Category Bar Management</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-fit">
                <h3 className="mb-6 font-heading text-lg font-bold text-foreground">Add Nav Category</h3>
                <form onSubmit={handleCreateNavCat} className="space-y-4">
                    <div>
                        <label htmlFor="nav-name" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Category Name</label>
                        <input 
                            id="nav-name"
                            required
                            value={newNavCat.name}
                            onChange={(e) => setNewNavCat({...newNavCat, name: e.target.value})}
                            placeholder="e.g. Smart Home"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="nav-img" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Image URL (Circle Icon)</label>
                        <input 
                            id="nav-img"
                            required
                            value={newNavCat.img}
                            onChange={(e) => setNewNavCat({...newNavCat, img: e.target.value})}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="nav-href" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Nav Link (Href)</label>
                        <input 
                            id="nav-href"
                            required
                            value={newNavCat.href}
                            onChange={(e) => setNewNavCat({...newNavCat, href: e.target.value})}
                            placeholder="/product-catalog?category=smart-home"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button className="w-full mt-4 rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-smooth">
                        Update Category Bar
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-3 sm:grid-cols-5 gap-4">
                {navCategories.map((cat) => (
                    <div key={cat.id} className="relative group rounded-2xl border border-border bg-card p-4 shadow-warm-sm flex flex-col items-center text-center">
                        <img src={cat.img} alt="" className="h-12 w-12 rounded-full object-cover mb-2" />
                        <h4 className="text-[10px] font-bold truncate w-full">{cat.name}</h4>
                        <button 
                            onClick={() => deleteNavCat(cat.id)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-error text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <div className="mb-6 flex items-center gap-2">
            <Icon name="SquaresPlusIcon" className="text-purple-600" size={24} />
            <h2 className="font-heading text-xl font-bold">Shop by Experience Tiles</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-fit">
                <h3 className="mb-6 font-heading text-lg font-bold text-foreground">Add Experience Tile</h3>
                <form onSubmit={handleCreateExpTile} className="space-y-4">
                    <div>
                        <label htmlFor="exp-name" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Tile Name</label>
                        <input 
                            id="exp-name"
                            required
                            value={newExpTile.name}
                            onChange={(e) => setNewExpTile({...newExpTile, name: e.target.value})}
                            placeholder="e.g. Pro Gaming"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-img" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Background Image URL</label>
                        <input 
                            id="exp-img"
                            required
                            value={newExpTile.img}
                            onChange={(e) => setNewExpTile({...newExpTile, img: e.target.value})}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-color" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Overlay Color</label>
                        <select 
                            id="exp-color"
                            value={newExpTile.color}
                            onChange={(e) => setNewExpTile({...newExpTile, color: e.target.value})}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="bg-primary">Blue (Default)</option>
                            <option value="bg-indigo-600">Indigo</option>
                            <option value="bg-amber-500">Amber</option>
                            <option value="bg-rose-500">Rose</option>
                            <option value="bg-emerald-600">Emerald</option>
                        </select>
                    </div>
                    <button className="w-full mt-4 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-smooth">
                        Add Tile
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {experienceTiles.map((tile) => (
                    <div key={tile.id} className="relative group rounded-2xl overflow-hidden aspect-[4/3] shadow-warm-sm border border-border">
                        <img src={tile.img} alt="" className="h-full w-full object-cover" />
                        <div className={`absolute inset-0 ${tile.color}/40 flex items-center justify-center p-4`}>
                            <h4 className="text-white font-bold text-center text-sm">{tile.name}</h4>
                        </div>
                        <button 
                            onClick={() => deleteExpTile(tile.id)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-error text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section className="border-t border-border pt-12">
        <div className="mb-6 flex items-center gap-2">
            <Icon name="FireIcon" className="text-orange-600" size={24} />
            <h2 className="font-heading text-xl font-bold">Trending Products Management</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm h-fit">
                <h3 className="mb-6 font-heading text-lg font-bold text-foreground">Feature Trending Item</h3>
                <form onSubmit={handleAddTrending} className="space-y-4">
                    <div>
                        <label htmlFor="trend-product" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Select Product</label>
                        <select 
                            id="trend-product"
                            required
                            value={trendingForm.productId}
                            onChange={(e) => setTrendingForm({...trendingForm, productId: e.target.value})}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">-- Choose a Product --</option>
                            {allProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="trend-tag" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Status Tag</label>
                        <input 
                            id="trend-tag"
                            required
                            value={trendingForm.tag}
                            onChange={(e) => setTrendingForm({...trendingForm, tag: e.target.value})}
                            placeholder="e.g. Best Seller"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <button className="w-full mt-4 rounded-xl bg-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-smooth">
                        Add to Trending
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {trendingProducts.map((product) => (
                    <div key={product.id} className="relative group rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
                        <img src={product.image} alt="" className="h-20 w-full object-contain mb-2" />
                        <h4 className="text-[10px] font-bold truncate">{product.name}</h4>
                        <span className="text-[9px] font-black text-primary uppercase">{product.tag}</span>
                        <button 
                            onClick={() => deleteTrending(product.id)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-error text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={deleteDialog.isOpen}
        onCancel={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.title}
        message={deleteDialog.message}
        type="danger"
        confirmText="Remove Promotion"
      />
    </div>
  );
}
