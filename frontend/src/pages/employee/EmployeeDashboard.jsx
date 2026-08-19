/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { EmptyState, LoadingState, formatDate, formatMoney } from "../../components/Ui";

export default function EmployeeDashboard() {
  const navigate = useNavigate(); const [employee, setEmployee] = useState(null), [expenses, setExpenses] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => { const stored = sessionStorage.getItem("employee"), token = sessionStorage.getItem("employeeToken"); if (!stored || !token) return navigate("/employee"); setEmployee(JSON.parse(stored)); api.get("/employees/my-expenses", { headers: { Authorization: `Bearer ${token}` } }).then(r => setExpenses(r.data.expenses || [])).catch(() => { setError("Unable to load your expenses."); }).finally(() => setLoading(false)); }, [navigate]);
  const logout = () => { sessionStorage.removeItem("employeeToken"); sessionStorage.removeItem("employee"); navigate("/employee"); };
  const totalSpent = expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  if (loading) return <LoadingState label="Loading your expenses..." />;
  return <div className="employee-dashboard"><header className="employee-header"><div><small className="text-secondary">Employee expenses</small><h2>{employee?.name}</h2></div><button className="btn btn-sm btn-outline-secondary" onClick={logout}>Exit</button></header><section className="expense-summary"><span>Total spent</span><strong>{formatMoney(totalSpent)}</strong></section><section className="expense-section"><div className="section-heading"><h3 className="h5 mb-0">My expenses</h3><button className="btn btn-primary btn-sm" onClick={() => navigate("/employee/add-expense")}>Add Expense</button></div>{error && <div className="alert alert-danger mt-3">{error}</div>}{!error && (expenses.length ? <div className="expense-list">{expenses.map(expense => <article className="expense-card" key={expense._id}><div><strong>{expense.category?.name || "Uncategorized"}</strong><small className="d-block text-secondary mt-1">{formatDate(expense.expenseDate)}</small>{expense.description && <small className="d-block text-secondary mt-1">{expense.description}</small>}</div><strong>{formatMoney(expense.amount)}</strong><button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/employee/edit-expense/${expense._id}`)}>Edit</button></article>)}</div> : <div className="mt-3"><EmptyState label="No expenses yet. Your submitted expenses will appear here." /></div>)}</section></div>;
}
