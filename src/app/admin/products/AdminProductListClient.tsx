'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Notification from '@/components/ui/Notification';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { updateProduct, deleteProduct, getProducts, getProductCategories } from '@/app/actions';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  inStock: boolean;
  image: string;
  images?: string[];
  image2?: string | null;
  description?: string | null;
  brand?: string | null;
  features: any;
  rating: number;
  reviewCount: number;
  returnPolicy?: string | null;
}

interface AdminProductListClientProps {
  initialProducts: Product[];
}

export function AdminProductListClient({ initialProducts }: Readonly<AdminProductListClientProps>) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbCategories, setDbCategories] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const loadCats = async () => {
      const cats = await getProductCategories();
      setDbCategories(cats);
    };
    loadCats();
  }, []);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [editMediaSettings, setEditMediaSettings] = useState({
    image1Type: 'link' as 'link' | 'upload',
    image2Type: 'link' as 'link' | 'upload'
  });

  const refreshProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const handleEdit = (product: Product) => {
    // Populate image2 from images array if it exists
    const image2 = product.image2 || (product.images && product.images.length > 1 ? product.images[1] : "");
    setEditingProduct({ 
      ...product, 
      image2,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 0,
      quantity: product.quantity ?? 0
    });
    setEditMediaSettings({ image1Type: 'link', image2Type: 'link' });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'image2') => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditMediaType = (field: 'image1' | 'image2') => {
    setEditMediaSettings(prev => {
      const typeKey = field === 'image1' ? 'image1Type' : 'image2Type';
      const currentType = prev[typeKey];
      return {
        ...prev,
        [typeKey]: currentType === 'link' ? 'upload' : 'link'
      };
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      try {
        // Prepare features as JSON or array
        const features = typeof editingProduct.features === 'string' 
          ? editingProduct.features.split('\n').filter(f => f.trim() !== '')
          : editingProduct.features;

        const images = [editingProduct.image];
        if (editingProduct.image2) images.push(editingProduct.image2);

        await updateProduct(editingProduct.id, {
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          quantity: editingProduct.quantity,
          inStock: editingProduct.inStock,
          image: editingProduct.image,
          images: images,
          description: editingProduct.description,
          brand: editingProduct.brand,
          rating: editingProduct.rating,
          reviewCount: editingProduct.reviewCount,
          features: features,
          returnPolicy: editingProduct.returnPolicy,
        });

        await refreshProducts();
        setEditingProduct(null);
        setNotificationMsg("Product updated successfully!");
        setShowNotification(true);
      } catch (error) {
        console.error('Failed to update product:', error);
        setNotificationMsg("Error updating product.");
        setShowNotification(true);
      }
    }
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
        await refreshProducts();
        setNotificationMsg("Product deleted successfully!");
        setShowNotification(true);
      } catch (error) {
        console.error('Failed to delete product:', error);
        setNotificationMsg("Error deleting product.");
        setShowNotification(true);
      } finally {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const filtered = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  return (
    <div className="space-y-8">
      <Notification 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Product Inventory</h1>
          <p className="mt-1 text-muted-foreground">Manage details, stock levels, and visibility for every item in your shop.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refreshProducts();
              setNotificationMsg("Inventory refreshed from database.");
              setShowNotification(true);
            }}
            className="p-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-smooth shadow-warm-sm"
            title="Refresh Inventory"
          >
            <Icon name="ArrowPathIcon" size={20} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-smooth hover:bg-primary/90 active:scale-95"
          >
            <Icon name="PlusIcon" size={18} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-warm-sm">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-warm-sm text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr key={product.id} className="group transition-smooth hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden relative rounded-lg border border-border bg-muted/30">
                        <AppImage src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-smooth">{product.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">ID: {product.id.substring(0, 8)}...</span>
                           {product.brand && (
                              <>
                                 <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                                 <span className="text-[10px] font-bold text-primary italic">{product.brand}</span>
                              </>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                  <td className="px-6 py-4 font-mono font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{product.quantity}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      let badgeClass = 'bg-destructive/10 text-destructive';
                      let statusText = 'Out of Stock';

                      if (product.quantity > 5) {
                        badgeClass = 'bg-success/10 text-success';
                        statusText = 'In Stock';
                      } else if (product.quantity > 0) {
                        badgeClass = 'bg-warning/10 text-warning';
                        statusText = 'Low Stock';
                      }

                      return (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {statusText}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg bg-muted text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary"
                        title="Edit Details"
                       >
                         <Icon name="PencilSquareIcon" size={18} />
                       </button>
                       <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg bg-muted text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                       >
                         <Icon name="TrashIcon" size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-8 shadow-warm-xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6 sticky top-0 bg-card z-10">
              <h2 className="font-heading text-xl font-bold text-foreground">Edit Product Details</h2>
              <button onClick={() => setEditingProduct(null)} className="text-muted-foreground hover:text-foreground">
                <Icon name="XMarkIcon" size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label htmlFor="edit-name" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Product Name</label>
                   <input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                   />
                </div>
                <div>
                   <label htmlFor="edit-category" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Category</label>
                   <select
                      id="edit-category"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                      required
                   >
                      <option value="">Select Category</option>
                      {dbCategories.map(cat => (
                         <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label htmlFor="edit-brand" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Brand</label>
                   <input
                    id="edit-brand"
                    value={editingProduct.brand || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Brand name"
                   />
                </div>
                <div>
                   <label htmlFor="edit-price" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Price (₹)</label>
                   <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: Number.parseFloat(e.target.value)})}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                   />
                </div>
                <div>
                   <label htmlFor="edit-rating" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Rating (0-5)</label>
                   <input
                    id="edit-rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingProduct.rating}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number.parseFloat(e.target.value);
                      setEditingProduct({...editingProduct, rating: Number.isNaN(val) ? 0 : val});
                    }}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                   />
                </div>
                <div>
                   <label htmlFor="edit-reviewCount" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Review Count</label>
                   <input
                    id="edit-reviewCount"
                    type="number"
                    min="0"
                    value={editingProduct.reviewCount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number.parseInt(e.target.value);
                      setEditingProduct({...editingProduct, reviewCount: Number.isNaN(val) ? 0 : val});
                    }}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                   />
                </div>
                <div>
                   <label htmlFor="edit-quantity" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Available Quantity</label>
                   <input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    value={editingProduct.quantity}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number.parseInt(e.target.value);
                      const qty = Number.isNaN(val) ? 0 : val;
                      setEditingProduct({...editingProduct, quantity: qty, inStock: qty > 0});
                    }}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    required
                   />
                </div>
                <div className="col-span-2">
                   <label htmlFor="edit-returnPolicy" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Return & Refund Policy</label>
                   <select
                      id="edit-returnPolicy"
                      value={editingProduct.returnPolicy || "NONE"}
                      onChange={(e) => setEditingProduct({...editingProduct, returnPolicy: e.target.value})}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                   >
                      <option value="NONE">NO return after delivery</option>
                      <option value="REPLACEMENT_7">7 days replacement</option>
                      <option value="RETURN_7">7 days return and refund</option>
                   </select>
                </div>
                <div className="col-span-2 space-y-3">
                   <div className="flex items-center justify-between">
                      <label htmlFor="edit-img1-input" className="block text-xs font-bold uppercase text-muted-foreground">Main Image</label>
                      <div className="flex bg-background border border-border rounded-lg p-0.5 scale-90">
                         <button
                            type="button"
                            onClick={() => toggleEditMediaType('image1')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editMediaSettings.image1Type === 'link' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                         >
                            LINK
                         </button>
                         <button
                            type="button"
                            onClick={() => toggleEditMediaType('image1')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editMediaSettings.image1Type === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                         >
                            UPLOAD
                         </button>
                      </div>
                   </div>
                   
                   {editMediaSettings.image1Type === 'upload' ? (
                      <div className="relative group">
                         <input
                            id="edit-img1-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditFileChange(e, 'image')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         <div className="h-24 rounded-xl border-2 border-dashed border-border group-hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-background/50 overflow-hidden">
                            {editingProduct.image ? (
                               <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                               <>
                                  <Icon name="CloudArrowUpIcon" size={24} className="text-muted-foreground mb-1" />
                                  <span className="text-[10px] text-muted-foreground font-medium">Click to upload image</span>
                               </>
                            )}
                         </div>
                      </div>
                   ) : (
                      <input
                        id="edit-img1-input"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        placeholder="Image URL..."
                        required
                      />
                   )}
                </div>

                <div className="col-span-2 space-y-3">
                   <div className="flex items-center justify-between">
                      <label htmlFor="edit-img2-input" className="block text-xs font-bold uppercase text-muted-foreground">Secondary Image</label>
                      <div className="flex bg-background border border-border rounded-lg p-0.5 scale-90">
                         <button
                            type="button"
                            onClick={() => toggleEditMediaType('image2')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editMediaSettings.image2Type === 'link' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                         >
                            LINK
                         </button>
                         <button
                            type="button"
                            onClick={() => toggleEditMediaType('image2')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${editMediaSettings.image2Type === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                         >
                            UPLOAD
                         </button>
                      </div>
                   </div>
                   
                   {editMediaSettings.image2Type === 'upload' ? (
                      <div className="relative group">
                         <input
                            id="edit-img2-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditFileChange(e, 'image2')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                         <div className="h-24 rounded-xl border-2 border-dashed border-border group-hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-background/50 overflow-hidden">
                            {editingProduct.image2 ? (
                               <img src={editingProduct.image2} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                               <>
                                  <Icon name="CloudArrowUpIcon" size={24} className="text-muted-foreground mb-1" />
                                  <span className="text-[10px] text-muted-foreground font-medium">Click to upload image</span>
                               </>
                            )}
                         </div>
                      </div>
                   ) : (
                      <input
                        id="edit-img2-input"
                        value={editingProduct.image2 || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, image2: e.target.value})}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                        placeholder="Image URL..."
                      />
                   )}
                </div>
                <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                   <input 
                      type="checkbox" 
                      id="inStockCheck"
                      checked={editingProduct.inStock}
                      onChange={(e) => setEditingProduct({...editingProduct, inStock: e.target.checked})}
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                   />
                   <label htmlFor="inStockCheck" className="text-sm font-medium text-foreground cursor-pointer select-none">Show as &quot;In Stock&quot; to customers</label>
                </div>
                <div className="col-span-2">
                   <label htmlFor="edit-description" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Description</label>
                   <textarea
                    id="edit-description"
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe the product..."
                   />
                </div>
                <div className="col-span-2">
                   <label htmlFor="edit-features" className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">Key Features (one per line)</label>
                   <textarea
                    id="edit-features"
                    value={Array.isArray(editingProduct.features) ? editingProduct.features.join("\n") : editingProduct.features || ""}
                    onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value})}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                   />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl border border-border px-6 py-3 text-sm font-bold text-muted-foreground transition-smooth hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-smooth hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
