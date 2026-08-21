import { useEffect, useState } from "react";
import "./Admin.css";
import AdminLayout from "../../components/AdminLayout";
import { EmptyState, LoadingState, formatDateTime, formatMoney } from "../../components/Ui";
import api from "../../services/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { (async () => { try { const token = localStorage.getItem("adminToken"); const res = await api.get("/admin/dashboard/", { headers: { Authorization: `Bearer ${token}` } }); setDashboard(res.data); } catch { setError("Unable to load dashboard data."); } })(); }, []);
  if (!dashboard && !error) return <AdminLayout title="Dashboard"><LoadingState label="Loading dashboard..." /></AdminLayout>;
  if (error) return <AdminLayout title="Dashboard"><div className="alert alert-danger">{error}</div></AdminLayout>;
  const summary = dashboard.summary || {};
  const totalRemaining = Number(summary.remaining || 0);
  return <AdminLayout title="Dashboard">
    <div className="row g-3 mb-4">
      {[["Total Given", summary.totalGiven, "text-primary"], ["Total Spent", summary.totalSpent, "text-danger"], [totalRemaining < 0 ? "Over allocation" : "Remaining", totalRemaining, totalRemaining < 0 ? "money-negative" : "text-success"]].map(([label, value, cls]) => <div className="col-12 col-sm-6 col-lg-4" key={label}><div className="summary-card"><p className="summary-label">{label}</p><p className={`summary-value ${cls}`}>{formatMoney(value)}</p></div></div>)}
    </div>
    <section className="section-card mb-4"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="section-title">Employee summary</h2></div>{dashboard.employees?.length ? <div className="table-responsive"><table className="table table-hover data-table"><thead><tr><th>Employee</th><th>Code</th><th>Given</th><th>Spent</th><th>Remaining</th><th>Status</th></tr></thead><tbody>{dashboard.employees.map(e => <tr key={e.employeeId}><td className="fw-medium">{e.name}</td><td>{e.employeeCode}</td><td>{formatMoney(e.moneyGiven)}</td><td>{formatMoney(e.spent)}</td><td className={Number(e.remaining) < 0 ? "money-negative fw-semibold" : ""}>{e.remaining === null ? "-" : formatMoney(e.remaining)}</td><td><span className={`badge text-bg-${e.allocationStatus === "Allocated" ? "success" : "secondary"}`}>{e.allocationStatus}</span></td></tr>)}</tbody></table></div> : <EmptyState label="No employee summary available." />}</section>
    <div className="row g-4"><section className="col-12 col-xl-4"><div className="section-card h-100"><h2 className="section-title mb-3">Category spending</h2>{dashboard.categories?.length ? dashboard.categories.map(c => <div className="category-row py-3 d-flex justify-content-between" key={c.categoryId}><span>{c.name}</span><strong>{formatMoney(c.total)}</strong></div>) : <EmptyState label="No category spending yet." />}</div></section><section className="col-12 col-xl-8"><div className="section-card h-100"><h2 className="section-title mb-3">Recent expenses</h2>{dashboard.recentExpenses?.length ? <div className="table-responsive"><table className="table table-hover data-table"><thead><tr><th>Expense ID</th><th>Employee</th><th>Category</th><th>Amount</th><th>Created</th></tr></thead><tbody>{dashboard.recentExpenses.map(e => <tr key={e.id}><td>{e.expenseId}</td><td>{e.employee?.name || "Unknown"}</td><td>{e.category}</td><td className="fw-semibold">{formatMoney(e.amount)}</td><td>{formatDateTime(e.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState label="No recent expenses." />}</div></section></div>
  </AdminLayout>;
}
