'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface ShippingAddressFormProps {
  savedAddresses: Address[];
  onAddressSelect: (address: Address | null) => void;
  onNewAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
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

const ShippingAddressForm = ({
  savedAddresses,
  onAddressSelect,
  onNewAddress,
}: ShippingAddressFormProps) => {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state when savedAddresses prop changes
  useEffect(() => {
    if (savedAddresses.length > 0) {
      setShowNewAddressForm(false);
      const defaultAddr = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
      if (defaultAddr && !selectedAddressId) {
        setSelectedAddressId(defaultAddr.id);
        onAddressSelect(defaultAddr);
      }
    } else {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((addr) => addr.id === addressId);
    onAddressSelect(address || null);
    setShowNewAddressForm(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'PIN/Zip code is required';
    } else if (formData.country === 'India' && !/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid PIN code format (6 digits)';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replaceAll(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNewAddress(formData);
      setFormData({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        phone: '',
      });
      setShowNewAddressForm(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {savedAddresses.length > 0 && !showNewAddressForm && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Select Shipping Address
          </h3>
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleAddressSelect(address.id)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-smooth ${
                  selectedAddressId === address.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{address.fullName}</p>
                      {address.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                  </div>
                  {selectedAddressId === address.id && (
                    <Icon name="CheckCircleIcon" size={24} className="text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewAddressForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 px-4 py-3 font-medium text-foreground transition-smooth hover:border-primary hover:bg-primary/5"
          >
            <Icon name="PlusIcon" size={20} />
            <span>Add New Address</span>
          </button>
        </div>
      )}

      {showNewAddressForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {savedAddresses.length > 0 ? 'Add New Address' : 'Shipping Address'}
            </h3>
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNewAddressForm(false)}
                className="text-sm font-medium text-primary transition-smooth hover:text-primary/80"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-foreground">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.fullName ? 'border-error' : 'border-input'
              }`}
              placeholder="Full Name (e.g. Pankaj Kumar)"
            />
            {errors.fullName && <p className="mt-1 text-sm text-error">{errors.fullName}</p>}
          </div>

          <div>
            <label
              htmlFor="addressLine1"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Address Line 1 *
            </label>
            <input
              type="text"
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.addressLine1 ? 'border-error' : 'border-input'
              }`}
              placeholder="123 Main Street"
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-error">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="addressLine2"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              className="w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="country" className="mb-1 block text-sm font-medium text-foreground">
                Country *
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => {
                  handleInputChange('country', e.target.value);
                  handleInputChange('state', ''); // Reset state when country changes
                }}
                className="w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-foreground">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.city ? 'border-error' : 'border-input'
                }`}
                placeholder="Mumbai"
              />
              {errors.city && <p className="mt-1 text-sm text-error">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-medium text-foreground">
                State / Province *
              </label>
              {formData.country === 'India' ? (
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.state ? 'border-error' : 'border-input'
                  }`}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.state ? 'border-error' : 'border-input'
                  }`}
                  placeholder="Maharashtra"
                />
              )}
              {errors.state && <p className="mt-1 text-sm text-error">{errors.state}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-foreground">
              PIN Code *
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.zipCode ? 'border-error' : 'border-input'
              }`}
              placeholder="560001"
            />
            {errors.zipCode && <p className="mt-1 text-sm text-error">{errors.zipCode}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full rounded-lg border-2 bg-background px-4 py-3 text-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.phone ? 'border-error' : 'border-input'
              }`}
              placeholder="9876543210"
            />
            {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
          </div>
        </div>          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            <Icon name="CheckIcon" size={20} />
            <span>Save Address</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default ShippingAddressForm;
