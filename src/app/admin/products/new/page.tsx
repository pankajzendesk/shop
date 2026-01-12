'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import { createProduct, getProductCategories, createProductCategory } from '@/app/actions';

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('Product successfully listed in the catalog!');
  const [dbCategories, setDbCategories] = useState<{id: string, name: string}[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    discount: '',
    quantity: '',
    description: '',
    features: '',
    image1: '',
    image2: '',
    brand: '',
    rating: '4.5',
    reviewCount: '0',
    returnPolicy: 'NONE',
  });

  const loadCats = async () => {
    const cats = await getProductCategories();
    setDbCategories(cats);
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createProductCategory(newCategoryName);
      await loadCats();
      setFormData(prev => ({ ...prev, category: newCategoryName }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Failed to add category:', error);
      setNotificationMsg('Category already exists or failed to add.');
      setShowNotification(true);
    }
  };

  const [mediaSettings, setMediaSettings] = useState({
    image1Type: 'link' as 'link' | 'upload',
    image2Type: 'link' as 'link' | 'upload'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const features = formData.features.split('\n').filter((f) => f.trim());
      
      const images = [];
      if (formData.image1) images.push(formData.image1);
      if (formData.image2) images.push(formData.image2);

      await createProduct({
        name: formData.name,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        image: formData.image1 || '/images/products/product-1.jpg',
        images: images,
        alt: formData.name,
        description: formData.description,
        features: features,
        quantity: Number.parseInt(formData.quantity) || 0,
        discount: Number.parseInt(formData.discount) || 0,
        inStock: (Number.parseInt(formData.quantity) || 0) > 0,
        rating: Number.parseFloat(formData.rating) || 4.5,
        reviewCount: Number.parseInt(formData.reviewCount) || 0,
        brand: formData.brand || 'MyStore', 
        ageGroup: 'All Ages',
        isNew: true,
        returnPolicy: formData.returnPolicy,
      });

      setIsLoading(false);
      setNotificationMsg('Product successfully listed in the catalog!');
      setShowNotification(true);
      setFormData({
        name: '',
        category: '',
        price: '',
        discount: '',
        quantity: '',
        description: '',
        features: '',
        image1: '',
        image2: '',
        brand: '',
        rating: '4.5',
        reviewCount: '0',
        returnPolicy: 'NONE',
      });
      
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Failed to create product:', error);
      setNotificationMsg('Failed to create product. Please check your data.');
      setShowNotification(true);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMediaType = (field: 'image1' | 'image2') => {
    const typeKey = field === 'image1' ? 'image1Type' : 'image2Type';
    setMediaSettings(prev => ({
      ...prev,
      [typeKey]: prev[typeKey] === 'link' ? 'upload' : 'link'
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Notification
        message={notificationMsg}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">Add New Product</h1>
          <p className="mt-2 text-muted-foreground">Fill in the details below to list a new toy or gadget in your store.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/products')}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Icon name="ArrowLeftIcon" size={16} />
          Cancel and Return
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm space-y-4">
             <h3 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">Basic Information</h3>
             
             <div className="space-y-4">
                <div>
                   <label htmlFor="p-name" className="mb-1.5 block text-sm font-semibold text-foreground">Product Name</label>
                   <input
                      id="p-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                      placeholder="e.g. Premium Robot Kit v4"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="p-category" className="text-sm font-semibold text-foreground">Category</label>
                        {isAddingCategory ? (
                          <button 
                            type="button"
                            onClick={() => setIsAddingCategory(false)}
                            className="text-[11px] font-bold text-muted-foreground hover:underline"
                          >
                            CANCEL
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setIsAddingCategory(true)}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            + ADD NEW
                          </button>
                        )}
                      </div>
                      
                      {isAddingCategory ? (
                        <div className="flex gap-2">
                           <input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
                              placeholder="New category..."
                              autoFocus
                           />
                           <button
                              type="button"
                              onClick={handleAddCategory}
                              className="bg-primary text-primary-foreground px-3 rounded-xl text-xs font-bold"
                           >
                              ADD
                           </button>
                        </div>
                      ) : (
                        <select
                           id="p-category"
                           name="category"
                           required
                           value={formData.category}
                           onChange={handleInputChange}
                           className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                        >
                           <option value="">Select Category</option>
                           {dbCategories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                           ))}
                        </select>
                      )}
                   </div>
                   <div>
                      <label htmlFor="p-brand" className="mb-1.5 block text-sm font-semibold text-foreground">Brand Name</label>
                      <input
                         id="p-brand"
                         name="brand"
                         required
                         value={formData.brand}
                         onChange={handleInputChange}
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                         placeholder="e.g. ToyMaster"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label htmlFor="p-price" className="mb-1.5 block text-sm font-semibold text-foreground">Price (₹)</label>
                      <input
                         id="p-price"
                         name="price"
                         type="number"
                         step="0.01"
                         min="0"
                         required
                         value={formData.price}
                         onChange={handleInputChange}
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                         placeholder="0.00"
                      />
                   </div>
                   <div>
                      <label htmlFor="p-discount" className="mb-1.5 block text-sm font-semibold text-foreground">Discount (%)</label>
                      <input
                         id="p-discount"
                         name="discount"
                         type="number"
                         min="0"
                         value={formData.discount}
                         onChange={handleInputChange}
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                         placeholder="0"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label htmlFor="p-rating" className="mb-1.5 block text-sm font-semibold text-foreground">Initial Rating (0-5)</label>
                      <input
                         id="p-rating"
                         name="rating"
                         type="number"
                         step="0.1"
                         min="0"
                         max="5"
                         value={formData.rating}
                         onChange={handleInputChange}
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                         placeholder="4.5"
                      />
                   </div>
                   <div>
                      <label htmlFor="p-reviews" className="mb-1.5 block text-sm font-semibold text-foreground">Review Count</label>
                      <input
                         id="p-reviews"
                         name="reviewCount"
                         type="number"
                         min="0"
                         value={formData.reviewCount}
                         onChange={handleInputChange}
                         className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                         placeholder="0"
                      />
                   </div>
                </div>

                <div>
                   <label htmlFor="p-returnPolicy" className="mb-1.5 block text-sm font-semibold text-foreground">Return & Refund Policy</label>
                   <select
                      id="p-returnPolicy"
                      name="returnPolicy"
                      value={formData.returnPolicy}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                   >
                      <option value="NONE">NO return after delivery</option>
                      <option value="REPLACEMENT_7">7 days replacement</option>
                      <option value="RETURN_7">7 days return and refund</option>
                   </select>
                </div>

                <div>
                   <label htmlFor="p-description" className="mb-1.5 block text-sm font-semibold text-foreground">Product Details / Description</label>
                   <textarea
                      id="p-description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth resize-none"
                      placeholder="Describe the product and why customers will love it..."
                   />
                </div>

                <div>
                   <label htmlFor="p-features" className="mb-1.5 block text-sm font-semibold text-foreground">Key Features (One per line)</label>
                   <textarea
                      id="p-features"
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth resize-none"
                      placeholder="Durable ABS plastic&#10;Voice recognition&#10;App companion"
                   />
                </div>
             </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm space-y-4">
             <h3 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">Product Media</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['image1', 'image2'].map((imgKey, idx) => {
                   const typeKey = `${imgKey}Type` as keyof typeof mediaSettings;
                   const isUpload = mediaSettings[typeKey] === 'upload';
                   
                   return (
                     <div key={imgKey} className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center justify-between">
                           <label htmlFor={`p-${imgKey}`} className="block text-xs font-bold text-foreground uppercase tracking-widest">
                              {idx === 0 ? 'Main Image' : 'Secondary Image'}
                           </label>
                           <div className="flex bg-background border border-border rounded-lg p-0.5">
                              <button
                                 type="button"
                                 onClick={() => toggleMediaType(imgKey as 'image1' | 'image2')}
                                 className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${isUpload ? 'text-muted-foreground hover:text-foreground' : 'bg-primary text-primary-foreground shadow-sm'}`}
                              >
                                 LINK
                              </button>
                              <button
                                 type="button"
                                 onClick={() => toggleMediaType(imgKey as 'image1' | 'image2')}
                                 className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${isUpload ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                 UPLOAD
                              </button>
                           </div>
                        </div>

                        {isUpload ? (
                           <div className="relative group">
                              <input
                                 id={`p-${imgKey}`}
                                 type="file"
                                 accept="image/*"
                                 onChange={(e) => handleFileChange(e, imgKey as 'image1' | 'image2')}
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="h-24 rounded-xl border-2 border-dashed border-border group-hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-background/50 overflow-hidden">
                                 {formData[imgKey as keyof typeof formData] ? (
                                    <img 
                                       src={formData[imgKey as keyof typeof formData]} 
                                       alt="Preview" 
                                       className="w-full h-full object-cover"
                                    />
                                 ) : (
                                    <>
                                       <Icon name="CloudArrowUpIcon" size={24} className="text-muted-foreground mb-1" />
                                       <span className="text-[10px] text-muted-foreground font-medium text-center px-2">Click to upload image</span>
                                    </>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <input
                              id={`p-${imgKey}`}
                              name={imgKey}
                              value={formData[imgKey as keyof typeof formData]}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 transition-smooth"
                              placeholder="https://images.unsplash.com/..."
                           />
                        )}
                        
                        {(isUpload || !formData[imgKey as keyof typeof formData]) ? null : (
                           <div className="h-16 rounded-lg overflow-hidden border border-border">
                              <img 
                                 src={formData[imgKey as keyof typeof formData]} 
                                 alt="Preview" 
                                 className="w-full h-full object-cover"
                              />
                           </div>
                        )}
                     </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* Right Side: Seller Settings */}
        <div className="space-y-6">
           <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm space-y-5">
              <h3 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3">Inventory</h3>
              <div>
                 <label htmlFor="p-quantity" className="mb-1.5 block text-sm font-semibold text-foreground">Initial Stock</label>
                 <input
                    id="p-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                    placeholder="0"
                 />
              </div>
           </div>

           <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary py-4 text-center text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-smooth hover:bg-primary/90 active:scale-95 disabled:opacity-50"
           >
              {isLoading ? 'Processing...' : 'Publish Product'}
           </button>
        </div>
      </form>
    </div>
  );
}
