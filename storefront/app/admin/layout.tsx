import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: {
    default: 'COCO-VANTAGE | Admin Console',
    template: '%s | COCO-VANTAGE Admin',
  },
  description: 'COCO-VANTAGE Architectural E-Commerce Administration Console',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
