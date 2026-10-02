/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { EmptyState, LoadingState, formatDate, formatMoney } from "../../components/Ui";

export default function EmployeeDashboard() {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ totalAllocated: 0, totalSpent: 0, remaining: 0, period: null, currentMonth: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("employee");
        const token = sessionStorage.getItem("employeeToken");
        if (!stored || !token) {
            navigate("/employee");
            return;
        }
        try {
            setEmployee(JSON.parse(stored));
        } catch {
            sessionStorage.removeItem("employee");
            sessionStorage.removeItem("employeeToken");
            navigate("/employee");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            api.get("/employees/my-expenses", { headers }),
            api.get("/allocations/my-summary", { headers })
        ])
            .then(([expensesResponse, summaryResponse]) => {
                setExpenses(expensesResponse.data.expenses || []);
                setSummary({
                    totalAllocated: summaryResponse.data.totalAllocated ?? 0,
                    totalSpent: summaryResponse.data.totalSpent ?? 0,
                    remaining: summaryResponse.data.remaining ?? 0,
                    period: summaryResponse.data.period || null,
                    currentMonth: summaryResponse.data.currentMonth || ""
                });
            })
            .catch(() => setError("Unable to load your dashboard."))
            .finally(() => setLoading(false));
    }, [navigate]);

    const logout = () => {
        sessionStorage.removeItem("employeeToken");
        sessionStorage.removeItem("employee");
        navigate("/employee");
    };

    if (loading) return <LoadingState label="Loading your dashboard..." />;

    const periodStart = summary.period?.start ? new Date(summary.period.start).getTime() : null;
    const periodEnd = summary.period?.end ? new Date(summary.period.end).getTime() : null;
    const currentMonthExpenses = periodStart === null || periodEnd === null
        ? expenses
        : expenses.filter((expense) => {
            const time = new Date(expense.expenseDate).getTime();
            return Number.isFinite(time) && time >= periodStart && time < periodEnd;
        });
    const historyExpenses = periodStart === null || periodEnd === null
        ? []
        : expenses.filter((expense) => {
            const time = new Date(expense.expenseDate).getTime();
            return !Number.isFinite(time) || time < periodStart || time >= periodEnd;
        });

    const renderExpenses = (items) => (
        <div className="expense-list">
            {items.map((expense) => (
                <article className="expense-card" key={expense._id}>
                    <div>
                        <strong>{expense.category?.name || "Uncategorized"}</strong>
                        <small className="d-block text-secondary mt-1">{formatDate(expense.expenseDate)}</small>
                        {expense.description && <small className="d-block text-secondary mt-1">{expense.description}</small>}
                    </div>
                    <strong>{formatMoney(expense.amount)}</strong>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/employee/edit-expense/${expense._id}`)}>Edit</button>
                </article>
            ))}
        </div>
    );

    const monthLabel = summary.period?.label || summary.currentMonth || "This month";
    return (
        <div className="employee-dashboard">
            <header className="employee-header">
                <div>
                    <small className="text-secondary">{monthLabel}</small>
                    <h2>{employee?.name}</h2>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={logout}>Exit</button>
            </header>

            <section className="expense-summary-grid" aria-label={`Monthly totals for ${monthLabel}`}>
                <article className="expense-summary"><span>Allocation · {monthLabel}</span><strong>{formatMoney(summary.totalAllocated)}</strong></article>
                <article className="expense-summary"><span>Spent · {monthLabel}</span><strong>{formatMoney(summary.totalSpent)}</strong></article>
                <article className="expense-summary"><span>Remaining · {monthLabel}</span><strong>{formatMoney(summary.remaining)}</strong></article>
            </section>

            <section className="expense-section">
                <div className="section-heading">
                    <h3 className="h5 mb-0">Expenses this month</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate("/employee/add-expense")}>Add Expense</button>
                </div>
                {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
                {!error && (currentMonthExpenses.length
                    ? renderExpenses(currentMonthExpenses)
                    : <div className="mt-3"><EmptyState label="No expenses recorded for this month yet." /></div>)}
                {!error && historyExpenses.length > 0 && (
                    <details className="expense-history">
                        <summary>Expense history ({historyExpenses.length})</summary>
                        {renderExpenses(historyExpenses)}
                    </details>
                )}
            </section>
        </div>
    );
}
