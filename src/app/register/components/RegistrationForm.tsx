'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/app/providers/AuthProvider';
import { useCart } from '@/app/providers/CartProvider';
import { registerUser } from '@/app/actions';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  subscribeNewsletter: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const RegistrationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const { state: cartState } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    subscribeNewsletter: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user) {
      const redirectTo = searchParams.get('redirectTo') || (cartState.items.length > 0 ? '/checkout' : '/');
      router.replace(redirectTo);
    }
  }, [user, isHydrated, cartState.items.length, router, searchParams]);

  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-error' },
      { score: 2, label: 'Weak', color: 'bg-warning' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-success' },
      { score: 5, label: 'Strong', color: 'bg-primary' },
    ];

    setPasswordStrength(strengths[score]);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone) && phone.replaceAll(/\D/g, '').length >= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await registerUser({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        password: formData.password,
        avatar: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
      });

      // Login the user in the client state
      login({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || undefined,
        gender: newUser.gender || undefined,
        avatar: newUser.avatar || undefined,
      } as any);
      
      setIsSubmitting(false);
      
      // Redirect logic based on cart and search params
      let redirectTo = searchParams.get('redirectTo');
      
      if (!redirectTo) {
        // If no specific redirect, go to checkout if products in cart, else home
        redirectTo = cartState.items.length > 0 ? '/checkout' : '/';
      }

      router.push(redirectTo);
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Handle Prisma unique constraint violation
      if (err.message?.includes('Unique constraint failed on the fields: (`email`)')) {
        setErrors({ email: 'An account with this email already exists' });
      } else if (err.message?.includes('Unique constraint failed on the fields: (`phone`)')) {
        setErrors({ phone: 'This mobile number is already registered' });
      } else {
        globalThis.alert("Registration failed. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const calculateProgress = (): number => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.password,
      formData.confirmPassword,
      formData.acceptTerms,
    ];
    const completed = fields.filter((field) => {
      if (typeof field === 'boolean') return field;
      return field && field.trim() !== '';
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-2xl rounded-xl bg-card p-8 shadow-warm-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            Create Your Account
          </h1>
          <p className="text-muted-foreground">Join {process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'} for exclusive deals</p>
        </div>
        <div className="space-y-6">
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="w-full max-w-2xl rounded-xl bg-card p-8 shadow-warm-lg">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
          Create Your Account
        </h1>
        <p className="text-muted-foreground">
          Join {process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop'} for exclusive deals and personalized shopping
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Profile Completion</span>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-foreground">
              First Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="UserIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full rounded-lg border bg-background py-3 pl-12 pr-4 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                  errors.firstName
                    ? 'border-error focus:ring-error'
                    : 'border-input focus:ring-primary'
                }`}
                placeholder="Enter first name"
              />
            </div>
            {errors.firstName && <p className="mt-1 text-sm text-error">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-foreground">
              Last Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Icon name="UserIcon" size={20} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full rounded-lg border bg-background py-3 pl-12 pr-4 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                  errors.lastName
                    ? 'border-error focus:ring-error'
                    : 'border-input focus:ring-primary'
                }`}
                placeholder="Enter last name"
              />
            </div>
            {errors.lastName && <p className="mt-1 text-sm text-error">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            Email Address <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="EnvelopeIcon" size={20} className="text-muted-foreground" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full rounded-lg border bg-background py-3 pl-12 pr-4 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                errors.email ? 'border-error focus:ring-error' : 'border-input focus:ring-primary'
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
            Mobile Number <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="PhoneIcon" size={20} className="text-muted-foreground" />
            </div>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full rounded-lg border bg-background py-3 pl-12 pr-4 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-error focus:ring-error' : 'border-input focus:ring-primary'
              }`}
              placeholder="10-digit mobile number"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Required for order verification and delivery updates
          </p>
        </div>

        <div>
          <label htmlFor="gender" className="mb-2 block text-sm font-medium text-foreground">
            Gender <span className="text-error">*</span>
          </label>
          <div className="flex gap-4">
            {['Male', 'Female', 'Other'].map((option) => (
              <label key={option} className="flex flex-1 items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={formData.gender === option}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="peer hidden"
                />
                <div className={`flex w-full cursor-pointer items-center justify-center rounded-lg border py-3 text-sm font-medium transition-smooth peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary ${
                  errors.gender ? 'border-error' : 'border-input'
                }`}>
                  {option}
                </div>
              </label>
            ))}
          </div>
          {errors.gender && <p className="mt-1 text-sm text-error">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
            Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="LockClosedIcon" size={20} className="text-muted-foreground" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full rounded-lg border bg-background py-3 pl-12 pr-12 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-error focus:ring-error'
                  : 'border-input focus:ring-primary'
              }`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
          {passwordStrength.score > 0 && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Password Strength:</span>
                <span
                  className={`text-xs font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full ${
                      level <= passwordStrength.score ? passwordStrength.color : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Use 8+ characters with mix of letters, numbers & symbols
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Confirm Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Icon name="LockClosedIcon" size={20} className="text-muted-foreground" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full rounded-lg border bg-background py-3 pl-12 pr-12 text-foreground transition-smooth focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-error focus:ring-error'
                  : 'border-input focus:ring-primary'
              }`}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="space-y-4 rounded-lg bg-muted p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="flex-1 text-sm text-foreground">
              I accept the{' '}
              <button type="button" className="font-medium text-primary hover:underline">
                Terms and Conditions
              </button>{' '}
              and{' '}
              <button type="button" className="font-medium text-primary hover:underline">
                Privacy Policy
              </button>{' '}
              <span className="text-error">*</span>
            </span>
          </label>
          {errors.acceptTerms && <p className="text-sm text-error">{errors.acceptTerms}</p>}

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={formData.subscribeNewsletter}
              onChange={(e) => handleInputChange('subscribeNewsletter', e.target.checked)}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="flex-1 text-sm text-foreground">
              Subscribe to our newsletter for exclusive deals, new arrivals, and special offers. You
              can unsubscribe anytime.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <Icon name="ArrowRightIcon" size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-border">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <button
            onClick={() => {
              const redirectTo = searchParams.get('redirectTo');
              const path = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login';
              router.push(path);
            }}
            className="font-bold text-primary hover:text-primary/80 transition-smooth"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
