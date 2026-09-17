/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import {
    EmptyState,
    LoadingState,
    formatDate,
    formatMoney
} from "../../components/Ui";


export default function EmployeeDashboard() {

    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    const [expenses, setExpenses] = useState([]);

    const [summary, setSummary] = useState({
        totalAllocated: 0,
        totalSpent: 0,
        remaining: 0,
        currentMonth: ""
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const stored =
            sessionStorage.getItem("employee");

        const token =
            sessionStorage.getItem("employeeToken");

        if (!stored || !token) {

            navigate("/employee");
            return;

        }

        setEmployee(JSON.parse(stored));

        const headers = {
            Authorization: `Bearer ${token}`
        };


        Promise.all([

            api.get(
                "/employees/my-expenses",
                { headers }
            ),

            api.get(
                "/allocations/my-summary",
                { headers }
            )

        ])

            .then(([expensesResponse, summaryResponse]) => {

                setExpenses(
                    expensesResponse.data.expenses || []
                );

                setSummary({
                    totalAllocated:
                        summaryResponse.data.totalAllocated || 0,

                    totalSpent:
                        summaryResponse.data.totalSpent || 0,

                    remaining:
                        summaryResponse.data.remaining || 0,

                    currentMonth:
                        summaryResponse.data.currentMonth || ""
                });

            })

            .catch(() => {

                setError(
                    "Unable to load your dashboard."
                );

            })

            .finally(() => {

                setLoading(false);

            });

    }, [navigate]);


    const logout = () => {

        sessionStorage.removeItem("employeeToken");

        sessionStorage.removeItem("employee");

        navigate("/employee");

    };


    if (loading) {

        return (
            <LoadingState
                label="Loading your dashboard..."
            />
        );

    }


    return (

        <div className="employee-dashboard">

            <header className="employee-header">

                <div>

                    <small className="text-secondary">
                        {summary.currentMonth || "Current month"}
                    </small>

                    <h2>
                        {employee?.name}
                    </h2>

                </div>

                <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={logout}
                >
                    Exit
                </button>

            </header>


            {/* SUMMARY */}

            <section className="expense-summary-grid">

                <article className="expense-summary">

                    <span>
                        Total Allocation
                    </span>

                    <strong>
                        {formatMoney(
                            summary.totalAllocated
                        )}
                    </strong>

                </article>


                <article className="expense-summary">

                    <span>
                        Total Spent
                    </span>

                    <strong>
                        {formatMoney(
                            summary.totalSpent
                        )}
                    </strong>

                </article>


                <article className="expense-summary">

                    <span>
                        Remaining
                    </span>

                    <strong>
                        {formatMoney(
                            summary.remaining
                        )}
                    </strong>

                </article>

            </section>


            {/* EXPENSES */}

            <section className="expense-section">

                <div className="section-heading">

                    <h3 className="h5 mb-0">
                        My expenses
                    </h3>

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            navigate(
                                "/employee/add-expense"
                            )
                        }
                    >
                        Add Expense
                    </button>

                </div>


                {error && (

                    <div className="alert alert-danger mt-3">
                        {error}
                    </div>

                )}


                {!error && (

                    expenses.length ? (

                        <div className="expense-list">

                            {expenses.map((expense) => (

                                <article
                                    className="expense-card"
                                    key={expense._id}
                                >

                                    <div>

                                        <strong>
                                            {expense.category?.name ||
                                                "Uncategorized"}
                                        </strong>

                                        <small className="d-block text-secondary mt-1">

                                            {formatDate(
                                                expense.expenseDate
                                            )}

                                        </small>


                                        {expense.description && (

                                            <small className="d-block text-secondary mt-1">

                                                {expense.description}

                                            </small>

                                        )}

                                    </div>


                                    <strong>

                                        {formatMoney(
                                            expense.amount
                                        )}

                                    </strong>


                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                            navigate(
                                                `/employee/edit-expense/${expense._id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                </article>

                            ))}

                        </div>

                    ) : (

                        <div className="mt-3">

                            <EmptyState
                                label="No expenses yet. Your submitted expenses will appear here."
                            />

                        </div>

                    )

                )}

            </section>

        </div>

    );

}