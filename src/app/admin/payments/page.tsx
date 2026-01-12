import { getPaymentMethods } from '@/app/actions';
import { PaymentSettingsClient } from './PaymentSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const paymentMethods = await getPaymentMethods();

  return (
    <div className="p-8">
      <PaymentSettingsClient initialMethods={paymentMethods} />
    </div>
  );
}
