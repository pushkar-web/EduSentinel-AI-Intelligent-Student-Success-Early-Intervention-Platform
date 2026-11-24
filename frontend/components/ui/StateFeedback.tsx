import React from "react";

export function LoadingSkeleton({
  rows = 3,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-md bg-[#EAECEF]"
          style={{ width: `${95 - ((i * 13) % 40)}%` }}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

interface StateProps {
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ title, message, action, className = "" }: StateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#DDDDDD] bg-white px-6 py-12 text-center ${className}`}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" className="mb-3">
        <rect x="10" y="14" width="44" height="36" rx="8" stroke="#9297A0" strokeWidth="2" />
        <path d="M10 26h44" stroke="#9297A0" strokeWidth="2" />
        <circle cx="32" cy="38" r="5" stroke="#AA2D00" strokeWidth="2" />
      </svg>
      <p className="text-[15px] font-semibold text-[#181D26]">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[13px] text-[#666D7A]">{message}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-[10px] bg-[#181D26] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0D1218] cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title, message, action, className = "" }: StateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-[20px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-12 text-center ${className}`}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" className="mb-3">
        <path d="M32 10 56 52H8L32 10Z" stroke="#DC2626" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 26v12" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="44" r="1.8" fill="#DC2626" />
      </svg>
      <p className="text-[15px] font-semibold text-[#991B1B]">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[13px] text-[#B91C1C]">{message}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-[10px] bg-[#DC2626] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#B91C1C] cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
