'use client';

import React from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Settings,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    badge: 'Demo',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  return (
    <aside className="w-64 flex flex-col h-full bg-[#111111] text-[#F5F5F2] border-r border-[#262626] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#262626]">
        <NextLink
          href="/admin"
          onClick={onNavigate}
          className="group block space-y-1 focus:outline-none"
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#777777] group-hover:text-white transition-colors">
            ARCHITECTURAL FORMULATIONS
          </div>
          <div className="text-lg font-serif tracking-[0.15em] uppercase font-light text-white">
            COCO-VANTAGE
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A0A0A0]">
              ADMIN ENGINE · V1
            </span>
          </div>
        </NextLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <NextLink
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-mono uppercase tracking-[0.12em] transition-all ${
                isActive
                  ? 'bg-white text-[#111111] font-semibold shadow-sm'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`size-4 ${
                    isActive ? 'text-[#111111]' : 'text-[#777777]'
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-mono ${
                    isActive
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#262626] text-[#A0A0A0]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NextLink>
          );
        })}

        {/* Public Storefront link */}
        <div className="pt-6">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            External
          </div>
          <NextLink
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 text-xs font-mono uppercase tracking-[0.12em] text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all"
          >
            <span className="flex items-center gap-2">
              <span>View Storefront</span>
            </span>
            <ArrowUpRight className="size-3.5 text-[#777777]" />
          </NextLink>
        </div>
      </nav>

      {/* Admin User Identity & Sign Out */}
      <div className="p-4 border-t border-[#262626] bg-[#0A0A0A]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              {isSuperAdmin ? (
                <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="size-3 text-amber-400 shrink-0" />
              )}
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#A0A0A0]">
                {admin?.role || 'ADMINISTRATOR'}
              </span>
            </div>
            <div className="text-xs text-white font-medium truncate">
              {admin?.name || 'Admin User'}
            </div>
            <div className="text-[10px] text-[#777777] font-mono truncate">
              {admin?.email || 'admin@cocovantage.com'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sign out of Admin Console"
            className="p-2 text-[#777777] hover:text-white hover:bg-[#1F1F1F] transition-colors focus:outline-none focus:ring-1 focus:ring-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
