import prisma from '@/lib/prisma';
import { CouponManagementClient } from './CouponManagementClient';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <CouponManagementClient initialCoupons={coupons} />
    </div>
  );
}
