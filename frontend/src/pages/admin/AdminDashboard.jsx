import { useEffect, useState } from "react";
import "./Admin.css";
import AdminLayout from "../../components/AdminLayout";
import { EmptyState, LoadingState, formatDateTime, formatMoney } from "../../components/Ui";
import api from "../../services/api";

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const response = await api.get("/admin/dashboard/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboard(response.data);
            } catch {
                setError("Unable to load dashboard data.");
            }
        })();
    }, []);

    if (!dashboard && !error) {
        return <AdminLayout title="Dashboard"><LoadingState label="Loading dashboard..." /></AdminLayout>;
    }
    if (error) {
        return <AdminLayout title="Dashboard"><div className="alert alert-danger">{error}</div></AdminLayout>;
    }

    const summary = dashboard.summary || {};
    const totalRemaining = Number(summary.remaining || 0);
    const monthLabel = summary.period?.label || dashboard.currentMonth || "This month";
    return (
        <AdminLayout title="Dashboard">
            <div className="mb-3">
                <h2 className="section-title mb-1">{monthLabel}</h2>
                <p className="text-secondary mb-0">Current month</p>
            </div>

            <div className="row g-3 mb-4">
                {[
                    ["Total Given", summary.totalGiven, "text-primary"],
                    ["Total Spent", summary.totalSpent, "text-danger"],
                    [totalRemaining < 0 ? "Over allocation" : "Remaining", totalRemaining, totalRemaining < 0 ? "money-negative" : "text-success"]
                ].map(([label, value, className]) => (
                    <div className="col-12 col-sm-6 col-lg-4" key={label}>
                        <div className="summary-card">
                            <p className="summary-label">{label}</p>
                            <p className={`summary-value ${className}`}>{formatMoney(value)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="section-card mb-4">
                <h2 className="section-title mb-3">Employee summary · {monthLabel}</h2>
                {dashboard.employees?.length ? (
                    <div className="table-responsive">
                        <table className="table table-hover data-table">
                            <thead><tr><th>Employee</th><th>Code</th><th>Given</th><th>Spent</th><th>Remaining</th><th>Status</th></tr></thead>
                            <tbody>{dashboard.employees.map((employee) => (
                                <tr key={employee.employeeId}>
                                    <td className="fw-medium">{employee.name}</td>
                                    <td>{employee.employeeCode}</td>
                                    <td>{formatMoney(employee.moneyGiven)}</td>
                                    <td>{formatMoney(employee.spent)}</td>
                                    <td className={Number(employee.remaining) < 0 ? "money-negative fw-semibold" : ""}>
                                        {employee.remaining === null ? "-" : formatMoney(employee.remaining)}
                                    </td>
                                    <td>
                                        <span className={`badge text-bg-${employee.allocationStatus === "within_allocation" ? "success" : employee.allocationStatus === "over_allocation" ? "danger" : "secondary"}`}>
                                            {employee.allocationStatus === "not_recorded" ? "No allocation" : employee.allocationStatus === "over_allocation" ? "Over allocation" : "Within allocation"}
                                        </span>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <EmptyState label="No employee activity recorded this month." />}
            </section>

            <div className="row g-4 mb-4">
                <section className="col-12 col-xl-4">
                    <div className="section-card h-100">
                        <h2 className="section-title mb-3">Category spending · {monthLabel}</h2>
                        {dashboard.categories?.length ? dashboard.categories.map((category) => (
                            <div className="category-row py-3 d-flex justify-content-between" key={category.categoryId}>
                                <span>{category.name}</span><strong>{formatMoney(category.total)}</strong>
                            </div>
                        )) : <EmptyState label="No category spending this month." />}
                    </div>
                </section>

                <section className="col-12 col-xl-8">
                    <div className="section-card h-100">
                        <h2 className="section-title mb-3">Recent expenses this month</h2>
                        {dashboard.recentExpenses?.length ? (
                            <div className="table-responsive">
                                <table className="table table-hover data-table">
                                    <thead><tr><th>Expense ID</th><th>Employee</th><th>Category</th><th>Amount</th><th>Expense date</th></tr></thead>
                                    <tbody>{dashboard.recentExpenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td>{expense.expenseId}</td>
                                            <td>{expense.employee?.name || "Unknown"}</td>
                                            <td>{expense.category}</td>
                                            <td className="fw-semibold">{formatMoney(expense.amount)}</td>
                                            <td>{formatDateTime(expense.expenseDate)}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        ) : <EmptyState label="No expenses recorded this month." />}
                    </div>
                </section>
            </div>

            <section className="section-card">
                <div className="mb-3">
                    <h2 className="section-title mb-1">History</h2>
                    <p className="text-secondary mb-0">Previous months are preserved here.</p>
                </div>
                {dashboard.history?.length ? (
                    <div className="table-responsive">
                        <table className="table table-hover data-table">
                            <thead><tr><th>Month</th><th>Total Given</th><th>Total Spent</th><th>Remaining / Extra</th></tr></thead>
                            <tbody>{dashboard.history.map((month) => (
                                <tr key={month.month}>
                                    <td className="fw-medium">{month.label}</td>
                                    <td>{formatMoney(month.totalGiven)}</td>
                                    <td>{formatMoney(month.totalSpent)}</td>
                                    <td className={Number(month.remaining) < 0 ? "money-negative fw-semibold" : "text-success fw-semibold"}>
                                        {formatMoney(month.remaining)}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <EmptyState label="No previous month data yet." />}
            </section>
        </AdminLayout>
    );
}
