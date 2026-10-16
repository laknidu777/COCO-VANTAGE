'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  DollarSign,
  Calendar,
  AlertCircle,
  ExternalLink,
  Code,
  ShieldCheck,
} from 'lucide-react';

interface DemoCustomer {
  id: string;
  name: string;
  email: string;
  location: string;
  registeredDate: string;
  totalOrders: number;
  totalSpent: number; // in cents
  status: 'ACTIVE' | 'INACTIVE';
  isDemonstrationData: boolean;
}

const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: 'cust-01',
    name: 'Elena Rostova',
    email: 'elena.rostova@atelier-nordic.com',
    location: 'Stockholm, Sweden',
    registeredDate: '2026-08-12',
    totalOrders: 4,
    totalSpent: 32800,
    status: 'ACTIVE',
    isDemonstrationData: true,
  },
  {
    id: 'cust-02',
    name: 'Marcus Vane',
    email: 'marcus.vane@arch-design.org',
    location: 'Zurich, Switzerland',
    registeredDate: '2026-09-04',
    totalOrders: 2,
    totalSpent: 11400,
    status: 'ACTIVE',
    isDemonstrationData: true,
  },
  {
    id: 'cust-03',
    name: 'Sora Tanaka',
    email: 's.tanaka@kyoto-minimal.jp',
    location: 'Kyoto, Japan',
    registeredDate: '2026-09-28',
    totalOrders: 3,
    totalSpent: 24900,
    status: 'ACTIVE',
    isDemonstrationData: true,
  },
  {
    id: 'cust-04',
    name: 'Claire Dupont',
    email: 'claire.dupont@paris-botanique.fr',
    location: 'Paris, France',
    registeredDate: '2026-10-02',
    totalOrders: 1,
    totalSpent: 5200,
    status: 'ACTIVE',
    isDemonstrationData: true,
  },
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = DEMO_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            CLIENT DIRECTORY · CAPABILITY PREVIEW
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Customer Directory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono uppercase tracking-wider">
            ▲ Demonstration Dataset
          </span>
        </div>
      </div>

      {/* Backend Capability & Architecture Notice */}
      <div className="p-5 bg-white border border-[#E5E5E5] space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#111111] font-semibold uppercase tracking-wider text-[11px]">
          <Code className="size-4 text-[#111111]" />
          <span>Backend Architecture Status: Customer Endpoint Pending</span>
        </div>
        <p className="text-[#555555] leading-relaxed font-sans">
          The NestJS backend currently manages client authentication and order associations via the PostgreSQL <code className="text-[#111111] font-mono bg-[#F5F5F2] px-1 py-0.5">User</code> and <code className="text-[#111111] font-mono bg-[#F5F5F2] px-1 py-0.5">Order</code> entities, but does not yet expose a dedicated administrative customer management controller (<code className="text-[#111111] font-mono bg-[#F5F5F2] px-1 py-0.5">GET /api/v1/admin/customers</code>).
        </p>
        <div className="p-3 bg-[#FBFBFA] border border-[#E5E5E5] text-[11px] text-[#444444] space-y-1">
          <div className="font-semibold uppercase tracking-wider text-[#111111]">
            Required Next Steps for Full Backend Integration:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[#666666]">
            <li>Implement <code className="text-[#111111]">AdminCustomersController</code> in <code className="text-[#111111]">backend/src/admin/customers</code>.</li>
            <li>Add pagination, search query params, and order aggregation queries.</li>
            <li>Connect customer lifetime value and order history relations.</li>
          </ul>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-[#E5E5E5] p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search simulated customers by name, email, or country..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FBFBFA] text-[10px] font-mono uppercase tracking-[0.18em] text-[#777777]">
                <th className="py-3 px-4 font-normal">Customer</th>
                <th className="py-3 px-4 font-normal">Location</th>
                <th className="py-3 px-4 font-normal">Joined</th>
                <th className="py-3 px-4 font-normal">Orders</th>
                <th className="py-3 px-4 font-normal">Lifetime Value</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FBFBFA] transition-colors">
                  <td className="py-3 px-4 font-sans text-[#111111]">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[10px] font-mono text-[#777777]">
                      {c.email}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#111111]">
                    {c.location}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#777777]">
                    {c.registeredDate}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#111111]">
                    {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#111111] font-medium">
                    ${(c.totalSpent / 100).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 uppercase tracking-wider">
                      Simulated Data
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
