'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSecurityBanner } from '@/components/admin/admin-security-banner';
import { useAdminAuth } from '@/lib/admin-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex flex-col items-center justify-center p-6 text-[#111111]">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#777777] mb-3">
          COCO-VANTAGE · CONSOLE
        </div>
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent animate-spin mb-4" />
        <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#111111]">
          Verifying Administrator Session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex flex-col items-center justify-center p-6 text-[#111111]">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#777777] mb-2">
          Redirecting to Authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#111111] flex flex-col antialiased selection:bg-[#111111] selection:text-white">
      {/* Security Architecture Banner */}
      <AdminSecurityBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#111111] shadow-2xl z-10">
              <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AdminHeader
            mobileNavOpen={mobileNavOpen}
            onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
