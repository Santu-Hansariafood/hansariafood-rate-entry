"use client";

export function StatusDot({ status, className = "" }) {
  const color =
    status === "available"
      ? "bg-emerald-400"
      : status === "busy" || status === "away"
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <span className={`h-2.5 w-2.5 rounded-full ${color} ${className}`} />
  );
}

export function getStatusText(status) {
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  if (status === "away") return "Away";
  return "Not logged in yet";
}

export function buildStatusTitle(
  effectiveStatus,
  statusDurationLabel,
  onlineLabel
) {
  const base = getStatusText(effectiveStatus);
  const extra = statusDurationLabel || onlineLabel || "";
  if (!extra) return base;
  return `${base} • ${extra}`;
}

