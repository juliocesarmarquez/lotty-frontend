'use client';

import '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({
  children,
}: Readonly<I18nProviderProps>) {
  return <>{children}</>;
}
