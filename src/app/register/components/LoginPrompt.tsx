'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const LoginPrompt = () => {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const loginUrl = redirectTo ? `/login?redirectTo=${redirectTo}` : '/login';

  return (
    <div className="w-full max-w-2xl rounded-lg bg-muted p-6 text-center">
      <p className="mb-4 text-foreground">
        Already have an account?{' '}
        <Link
          href={loginUrl}
          className="font-semibold text-primary transition-smooth hover:text-primary/80"
        >
          Sign in here
        </Link>
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Icon name="QuestionMarkCircleIcon" size={16} />
        <span>
          Need help?{' '}
          <Link href="/support" className="text-primary hover:underline">
            Contact Support
          </Link>
        </span>
      </div>
    </div>
  );
};

export default LoginPrompt;
