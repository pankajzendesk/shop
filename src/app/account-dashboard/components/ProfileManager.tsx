'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { updateUserProfile } from '@/app/actions';
import { useAuth } from '@/app/providers/AuthProvider';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  avatar?: string;
}

interface ProfileManagementProps {
  initialData?: ProfileData;
}

const ProfileManagement = ({ initialData = { firstName: '', lastName: '', email: '', phone: '', gender: '' } }: ProfileManagementProps) => {
  const { login } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const updatedUser = await updateUserProfile(formData.email, {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          gender: formData.gender,
        });

        // Update local auth state
        login({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || undefined,
          gender: updatedUser.gender || undefined,
          avatar: updatedUser.avatar || undefined,
        } as any);

        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setErrors({});
    setIsEditing(false);
  };

  if (!isHydrated) {
    const skeletons = Array.from({ length: 4 }, (_, i) => `profile-skeleton-${i}`);
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm-md">
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="space-y-4">
          {skeletons.map((id) => (
            <div key={id} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-card-foreground">
          Profile Information
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            <Icon name="PencilIcon" size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6">
          {formData.avatar ? (
            <AppImage
              src={formData.avatar}
              alt={`Profile picture of ${formData.firstName} ${formData.lastName}`}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {formData.firstName.charAt(0).toUpperCase()}
            </div>
          )}
          {isEditing && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-medium text-foreground transition-smooth hover:bg-muted"
            >
              <Icon name="PhotoIcon" size={16} />
              <span>Change Photo</span>
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-card-foreground"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
              className={`w-full rounded-lg border px-4 py-3 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.firstName ? 'border-error' : 'border-input'
              } ${isEditing ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-error">{errors.firstName}</p>}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-card-foreground"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
              className={`w-full rounded-lg border px-4 py-3 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.lastName ? 'border-error' : 'border-input'
              } ${isEditing ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-error">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-card-foreground">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className={`w-full rounded-lg border px-4 py-3 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.email ? 'border-error' : 'border-input'
              } ${isEditing ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-card-foreground">
              Mobile Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className={`w-full rounded-lg border px-4 py-3 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.phone ? 'border-error' : 'border-input'
              } ${isEditing ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}
            />
            {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-card-foreground">
              Gender
            </label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map((option) => (
                <label key={option} className={`flex flex-1 items-center justify-center rounded-lg border py-3 text-sm font-medium transition-smooth ${
                  formData.gender === option 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-input text-muted-foreground'
                } ${isEditing ? 'cursor-pointer hover:bg-muted' : 'bg-muted opacity-80 cursor-default'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => isEditing && setFormData({ ...formData, gender: e.target.value })}
                    className="hidden"
                    disabled={!isEditing}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.gender && <p className="mt-1 text-sm text-error">{errors.gender}</p>}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-50"
            >
              <Icon name={isSubmitting ? 'ArrowPathIcon' : 'CheckIcon'} size={16} className={isSubmitting ? 'animate-spin' : ''} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-smooth hover:bg-muted disabled:opacity-50"
            >
              <Icon name="XMarkIcon" size={16} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileManagement;
