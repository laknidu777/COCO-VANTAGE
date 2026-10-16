'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, ChevronRight, Info } from 'lucide-react';

export function AdminSecurityBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-[#111111] text-[#F5F5F2] border-b border-[#262626] px-4 md:px-8 py-2.5 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="size-4 text-amber-400 shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
            Development Session Active:
          </span>
          <span className="text-[#CCCCCC] text-xs">
            In-memory bearer authorization in use. Production architecture requires server-managed HttpOnly sessions.
          </span>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono uppercase tracking-wider text-[#A0A0A0] hover:text-white underline underline-offset-4 focus:outline-none"
          >
            {showDetails ? 'Hide Architecture Notes' : 'Security Details'}
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            title="Dismiss notice"
            className="text-[#777777] hover:text-white focus:outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#262626] text-[11px] text-[#A0A0A0] font-mono leading-relaxed space-y-1.5 max-w-7xl mx-auto">
          <p>
            • <strong className="text-white">Route Protection:</strong> Frontend route redirects provide navigation convenience. True authorization is strictly enforced on the NestJS backend via <code className="text-white bg-[#1A1A1A] px-1 py-0.5">JwtAuthGuard</code> and <code className="text-white bg-[#1A1A1A] px-1 py-0.5">RolesGuard</code>.
          </p>
          <p>
            • <strong className="text-white">Production Recommendation:</strong> Transition from client-stored tokens to server-side session management using secure, encrypted, same-site <code className="text-white bg-[#1A1A1A] px-1 py-0.5">HttpOnly</code> cookies to mitigate XSS exposure.
          </p>
          <p>
            • <strong className="text-white">Destructive Action Guard:</strong> Product publication status mutation and order cancellation are restricted by backend role assertions (<code className="text-white bg-[#1A1A1A] px-1 py-0.5">SUPER_ADMIN</code> only).
          </p>
        </div>
      )}
    </div>
  );
}
