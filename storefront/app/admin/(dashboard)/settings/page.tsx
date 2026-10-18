'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Shield,
  Server,
  Database,
  Lock,
  Globe,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';
import { adminApi, AdminApiError } from '@/lib/admin-api';
import { HealthCheckResponse } from '@/lib/admin-types';

export default function AdminSettingsPage() {
  const { admin } = useAdminAuth();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await adminApi.getHealth();
      setHealth(res);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setHealthError(err.message);
      } else {
        setHealthError('Failed to contact backend health endpoint.');
      }
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
            SYSTEM CONFIGURATION · READ-ONLY AUDIT
          </div>
          <h2 className="text-xl sm:text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light mt-0.5">
            Administrative Settings
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchHealth}
          disabled={isLoadingHealth}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] text-xs font-mono uppercase tracking-wider text-[#111111] hover:bg-[#F5F5F2] transition-colors focus:outline-none cursor-pointer"
        >
          <RefreshCw
            className={`size-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`}
          />
          <span>Check Health Status</span>
        </button>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Active Administrator Profile */}
        <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
            <Shield className="size-4 text-[#111111]" />
            <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111] font-medium">
              Administrator Profile
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
              <span className="text-[#777777]">Account ID:</span>
              <span className="text-[#111111]">{admin?.id || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
              <span className="text-[#777777]">Full Name:</span>
              <span className="text-[#111111] font-sans font-medium">
                {admin?.name || 'Administrator'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
              <span className="text-[#777777]">Email Address:</span>
              <span className="text-[#111111]">{admin?.email || '—'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#777777]">Assigned Role:</span>
              <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] uppercase tracking-wider">
                {admin?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#FBFBFA] border border-[#E5E5E5] text-[11px] font-mono text-[#555555] leading-relaxed">
            <strong className="text-[#111111] block mb-0.5">Role Permissions:</strong>
            {admin?.role === 'SUPER_ADMIN'
              ? 'SUPER_ADMIN role has full privileges, including catalog creation, product publication status alteration, order status updates, and inventory management.'
              : 'ADMIN role can create products and manage orders, but publication status transitions require SUPER_ADMIN authority.'}
          </div>
        </div>

        {/* Card 2: Backend Runtime Status */}
        <div className="bg-white border border-[#E5E5E5] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
            <Server className="size-4 text-[#111111]" />
            <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111] font-medium">
              Backend Service Telemetry
            </h3>
          </div>

          {isLoadingHealth ? (
            <div className="py-8 text-center text-xs font-mono text-[#777777]">
              Querying GET /health...
            </div>
          ) : healthError ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="size-4 text-red-600 shrink-0" />
              <span>{healthError}</span>
            </div>
          ) : health ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
                <span className="text-[#777777]">Health Endpoint:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="size-3.5" />
                  <span>ONLINE (HTTP 200)</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
                <span className="text-[#777777]">Database Status:</span>
                <span className="text-[#111111]">
                  {health.database.type.toUpperCase()} ({health.database.status})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F5F5F2]">
                <span className="text-[#777777]">Node Environment:</span>
                <span className="text-[#111111] uppercase">
                  {health.environment}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#777777]">Service Uptime:</span>
                <span className="text-[#111111]">
                  {Math.floor(health.uptimeSeconds)} seconds
                </span>
              </div>
            </div>
          ) : null}

          <div className="p-3 bg-[#FBFBFA] border border-[#E5E5E5] text-[11px] font-mono text-[#555555] leading-relaxed">
            Telemetry is fetched directly from the NestJS health controller at <code className="text-[#111111]">/health</code> endpoint without exposing sensitive environment keys.
          </div>
        </div>

        {/* Card 3: Security & Session Architecture Review */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
            <Lock className="size-4 text-[#111111]" />
            <h3 className="text-sm font-mono uppercase tracking-[0.15em] text-[#111111] font-medium">
              Security Architecture & Production Hardening
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-[#444444] leading-relaxed">
            <div className="space-y-3">
              <h4 className="font-semibold text-[#111111] uppercase tracking-wider text-[11px]">
                Current Development Implementation
              </h4>
              <p>
                • <strong>Bearer Tokens:</strong> The current development build stores JWT tokens in-memory with session storage synchronization for developer reload convenience.
              </p>
              <p>
                • <strong>Route Verification:</strong> Frontend redirection is applied in <code className="text-[#111111]">AdminAuthProvider</code>, but all mutations require backend token verification.
              </p>
              <p>
                • <strong>Zero Credential Hardcoding:</strong> No passwords, JWT secrets, or private keys are bundled in client assets.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#111111] uppercase tracking-wider text-[11px]">
                Recommended Production Roadmap
              </h4>
              <p>
                • <strong>HttpOnly Secure Cookies:</strong> Move token storage from the client browser to encrypted, SameSite <code className="text-[#111111]">HttpOnly</code> cookies to completely eliminate token theft via XSS.
              </p>
              <p>
                • <strong>Server-Managed Sessions:</strong> Implement Redis or database-backed session revocation so administrators can revoke compromised credentials immediately.
              </p>
              <p>
                • <strong>Rate Limiting & MFA:</strong> Add NestJS throttler guard on <code className="text-[#111111]">/api/v1/auth/login</code> and multi-factor authentication for administrative users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
