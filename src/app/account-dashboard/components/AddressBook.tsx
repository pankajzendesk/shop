'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { addAddress, deleteAddress } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';

interface Address {
  id: string;
  isDefault: boolean;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

interface AddressBookProps {
  addresses?: Address[];
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const countries = ["India", "United Arab Emirates", "Singapore", "United States", "United Kingdom", "Australia", "Canada"];

const AddressBook = ({ addresses: initialAddresses = [] }: AddressBookProps) => {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    setIsHydrated(true);
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      const newAddress = await addAddress(user.email, {
        ...formData,
        isDefault: formData.isDefault || addresses.length === 0,
      });
      setAddresses([...addresses, newAddress as Address]);
      setIsAddingNew(false);
      setFormData({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        phone: '',
        isDefault: false,
      });
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  if (!isHydrated) {
    const skeletons = Array.from({ length: 2 }, (_, i) => `address-skeleton-${i}`);
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {skeletons.map((id) => (
            <div key={id} className="h-48 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">Address Book</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
        >
          <Icon name="PlusIcon" size={16} />
          <span>Add Address</span>
        </button>
      </div>

      {isAddingNew && (
        <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 transition-smooth">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Add New Address</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
              <input
                id="fullName"
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                placeholder="Pankaj Kumar"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-muted-foreground mb-1">Address Line 1</label>
              <input
                id="addressLine1"
                required
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                placeholder="123 Street Name"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="addressLine2" className="block text-sm font-medium text-muted-foreground mb-1">Address Line 2 (Optional)</label>
              <input
                id="addressLine2"
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
                <select
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, state: '' })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-muted-foreground mb-1">State</label>
                {formData.country === 'India' ? (
                  <select
                    id="state"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="state"
                    required
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                    placeholder="State/Province"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-muted-foreground mb-1">City</label>
                <input
                  id="city"
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground mb-1">PIN Code</label>
                <input
                  id="zipCode"
                  required
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                  placeholder="560001"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
              <input
                id="phone"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-smooth"
                placeholder="9876543210"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-foreground">
                Set as default address
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 mt-4">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary py-3 font-bold text-primary-foreground shadow-lg transition-smooth hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="flex-1 rounded-lg border border-border py-3 font-bold text-foreground transition-smooth hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !isAddingNew ? (
        <div className="py-12 text-center">
          <Icon name="MapPinIcon" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-card-foreground">No addresses saved</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your shipping and billing addresses for faster checkout
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="relative rounded-lg border border-border p-4 transition-smooth hover:shadow-warm-sm"
            >
              {address.isDefault && (
                <span className="absolute right-4 top-4 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  Default
                </span>
              )}

              <div className="mb-3 flex items-center gap-2">
                <Icon
                  name="MapPinIcon"
                  size={20}
                  className="text-primary"
                />
                <span className="font-medium text-card-foreground">
                  Shipping Address
                </span>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-card-foreground">{address.fullName}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                <p className="flex items-center gap-1.5">
                  <Icon name="PhoneIcon" size={14} />
                  {address.phone}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-error px-3 py-2 text-sm font-medium text-error transition-smooth hover:bg-error/10"
                >
                  <Icon name="TrashIcon" size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;
