/* eslint-disable react-refresh/only-export-components */
export const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const formatDateTime = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";
export const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" }) : "-";

export function StatusBadge({ status }) {
  const active = String(status).toLowerCase() === "active";
  return <span className={`badge text-bg-${active ? "success" : "secondary"}`}>{active ? "Active" : "Inactive"}</span>;
}

export function LoadingState({ label = "Loading..." }) { return <div className="py-5 text-center text-secondary"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />{label}</div>; }
export function EmptyState({ label }) { return <div className="empty-state border rounded-3 bg-white py-4 px-3 text-center text-secondary">{label}</div>; }
