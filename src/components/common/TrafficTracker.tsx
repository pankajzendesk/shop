'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import { recordTraffic } from '@/app/actions';

export default function TrafficTracker() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      if (!isInitialized) return;

      try {
        // Skip tracking admin pages to avoid noise
        if (pathname.startsWith('/admin')) return;

        // Try to get visitor info (IP/Country)
        let visitorInfo = {
          ip: '127.0.0.1',
          country: 'India',
          city: 'Mumbai',
          device: 'Desktop',
        };

        try {
          // Skip external fetch on localhost to avoid CORS/Network noise
          const isLocal = globalThis.window?.location.hostname === 'localhost' || globalThis.window?.location.hostname === '127.0.0.1';
          
          if (!isLocal) {
            // Using a free, no-key-required API for demo purposes
            const response = await fetch('https://ipapi.co/json/', { 
              mode: 'cors',
              cache: 'force-cache' // Reduce external hits
            });
            
            if (response.ok) {
              const data = await response.json();
              visitorInfo = {
                ip: data.ip || 'Unknown',
                country: data.country_name || 'India',
                city: data.city || 'Unknown',
                device: getDeviceType(),
              };
            }
          }
        } catch (e) {
          // Fallback to default mock silently for telemetry
          if (process.env.NODE_ENV === 'development') {
            console.warn('TrafficTracker: Visitor info fetch failed', e);
          }
        }

        await recordTraffic({
          path: pathname,
          ip: visitorInfo.ip,
          country: visitorInfo.country,
          city: visitorInfo.city,
          device: visitorInfo.device,
          userAgent: navigator.userAgent,
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
        });

      } catch (error) {
        console.error('Traffic tracking error:', error);
      }
    };

    trackVisit();
  }, [pathname, isAuthenticated, user, isInitialized]);

  return null;
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}
