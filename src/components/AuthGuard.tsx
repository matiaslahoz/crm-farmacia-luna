'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const r = useRouter();
  const p = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const logged = !!data.user?.id;
      if (!logged) r.replace('/login');
      else setOk(true);
    });
  }, [r, p]);

  if (!ok) return null;
  return <>{children}</>;
}
