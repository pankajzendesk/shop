import { Suspense } from 'react';
import type { Metadata } from 'next';
import HeaderWithCart from '@/components/common/HeaderWithCart';
import RegistrationForm from './components/RegistrationForm';
import SocialRegistration from './components/SocialRegistration';
import RegistrationBenefits from './components/RegistrationBenefits';
import LoginPrompt from './components/LoginPrompt';

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'GiftShop';

export const metadata: Metadata = {
  title: `Create Account - ${shopName}`,
  description:
    `Join ${shopName} to enjoy fast checkout, order tracking, exclusive deals, personalized recommendations, and rewards on every purchase. Sign up now for free.`,
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithCart />

      <main className="mx-auto max-w-[1440px] px-6 py-12">
        <Suspense fallback={<div className="flex justify-center p-12">Loading...</div>}>
          <div className="flex flex-col items-center gap-8">
            <RegistrationForm />
            <SocialRegistration />
            <RegistrationBenefits />
            <LoginPrompt />
          </div>
        </Suspense>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-[1440px] px-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
