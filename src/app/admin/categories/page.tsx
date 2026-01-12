'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Notification from '@/components/ui/Notification';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { getProductCategories, createProductCategory, deleteProductCategory } from '@/app/actions';

interface Category {
  id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsPageLoading(true);
    try {
      const data = await getProductCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      await createProductCategory(newCategoryName.trim());
      setNewCategoryName('');
      setNotificationMsg('Category added successfully!');
      setShowNotification(true);
      loadCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      setNotificationMsg('Failed to add category. It might already exist.');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteProductCategory(categoryToDelete.id);
      setNotificationMsg('Category deleted successfully!');
      setShowNotification(true);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      // Clean up the error message if it's a Prisma error or includes technical details
      const msg = error.message || 'Failed to delete category.';
      setNotificationMsg(msg.includes('associated products') ? msg : 'An error occurred while deleting the category.');
      setShowNotification(true);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Notification
        message={notificationMsg}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
      />

      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Manage Product Categories</h1>
        <p className="mt-2 text-muted-foreground">Add or remove categories that appear in the product creation and filter forms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-warm-sm">
            <h3 className="font-heading text-lg font-bold text-foreground border-b border-border pb-3 mb-4">Add Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="cat-name" className="mb-1.5 block text-sm font-semibold text-foreground">Category Name</label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-smooth"
                  placeholder="e.g. Action Figures"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-smooth flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Icon name="PlusIcon" size={18} />
                )}
                <span>Add Category</span>
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-warm-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-heading text-lg font-bold text-foreground">Existing Categories</h3>
            </div>
            
            <div className="divide-y divide-border">
              {(() => {
                if (isPageLoading) {
                  return <div className="p-8 text-center text-muted-foreground">Loading categories...</div>;
                }
                if (categories.length === 0) {
                  return <div className="p-8 text-center text-muted-foreground">No categories found. Add one to get started.</div>;
                }
                return categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-smooth">
                    <span className="font-medium text-foreground">{category.name}</span>
                    <button
                      onClick={() => setCategoryToDelete(category)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-smooth rounded-lg hover:bg-destructive/10"
                      title="Delete category"
                    >
                      <Icon name="TrashIcon" size={18} />
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
