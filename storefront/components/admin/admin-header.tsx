'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Activity, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi } from '@/lib/admin-api';

interface AdminHeaderProps {
  onToggleMobileNav: () => void;
  mobileNavOpen: boolean;
}

export function AdminHeader({
  onToggleMobileNav,
  mobileNavOpen,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [backendStatus, setBackendStatus] = useState<
    'checking' | 'online' | 'offline'
  >('checking');
  const [uptimeSeconds, setUptimeSeconds] = useState<number | null>(null);

  const checkHealth = async () => {
    try {
      const res = await adminApi.getHealth();
      if (res && res.status === 'ok') {
        setBackendStatus('online');
        setUptimeSeconds(res.uptimeSeconds);
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute breadcrumb title
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/products')) return 'Product Management';
    if (pathname.startsWith('/admin/orders')) return 'Order Management';
    if (pathname.startsWith('/admin/categories')) return 'Category Catalog';
    if (pathname.startsWith('/admin/customers')) return 'Customer Directory';
    if (pathname.startsWith('/admin/settings')) return 'Administrative Settings';
    return 'Console';
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E5E5] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 text-[#111111] hover:bg-[#F5F5F2] border border-[#E5E5E5] focus:outline-none"
          aria-label={mobileNavOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          {mobileNavOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>

        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#777777] hidden sm:inline">
            COCO-VANTAGE /
          </span>
          <h1 className="text-sm md:text-base font-medium tracking-[0.05em] uppercase text-[#111111]">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Status Indicators & Identity */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* API Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#F5F5F2] border border-[#E5E5E5] text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'online'
                ? 'bg-emerald-500 animate-pulse'
                : backendStatus === 'checking'
                ? 'bg-amber-400'
                : 'bg-red-500'
            }`}
          />
          <span className="text-[#111111] hidden lg:inline">
            {backendStatus === 'online'
              ? 'Backend API 4000: Live'
              : backendStatus === 'checking'
              ? 'Connecting...'
              : 'Backend Offline'}
          </span>
          <span className="text-[#111111] lg:hidden">
            {backendStatus === 'online' ? 'Live' : 'Off'}
          </span>
          <button
            type="button"
            onClick={checkHealth}
            title="Refresh backend status"
            className="text-[#777777] hover:text-[#111111] transition-colors ml-1"
          >
            <RefreshCw className="size-3" />
          </button>
        </div>

        {/* Security Architecture Notice */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F2] border border-[#E5E5E5] text-[11px] font-mono text-[#777777]">
          <Shield className="size-3 text-[#111111]" />
          <span>Dev Session Auth</span>
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
          <div className="size-8 bg-[#111111] text-white flex items-center justify-center font-mono text-xs uppercase font-light">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-[#111111] leading-tight">
              {admin?.name || 'Admin'}
            </div>
            <div className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
              {admin?.role || 'ADMIN'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
