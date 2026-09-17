import { useEffect, useState } from "react";
import "./Admin.css";
import AdminLayout from "../../components/AdminLayout";
import {
    EmptyState,
    LoadingState,
    formatDateTime,
    formatMoney
} from "../../components/Ui";
import api from "../../services/api";

export default function Expenses() {

    const [
        expenses,
        setExpenses
    ] = useState([]);

    const [
        employees,
        setEmployees
    ] = useState([]);

    const [
        categories,
        setCategories
    ] = useState([]);

    const [
        employee,
        setEmployee
    ] = useState("");

    const [
        category,
        setCategory
    ] = useState("");

    const [
        month,
        setMonth
    ] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    });

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const headers = () => ({
        Authorization:
            `Bearer ${localStorage.getItem("adminToken")}`
    });


    useEffect(() => {

        (async () => {

            try {

                const [
                    e,
                    c
                ] = await Promise.all([
                    api.get(
                        "/employees/",
                        {
                            headers: headers()
                        }
                    ),

                    api.get(
                        "/categories/?status=active",
                        {
                            headers: headers()
                        }
                    )
                ]);

                setEmployees(
                    e.data.employees || []
                );

                setCategories(
                    c.data.categories || []
                );

            } catch {

                setError(
                    "Unable to load filter options."
                );
            }

        })();

    }, []);


    useEffect(() => {

        (async () => {

            setLoading(true);

            try {

                const params = {};

                if (employee)
                    params.employee = employee;

                if (category)
                    params.category = category;

                const res = await api.get(
                    "/expenses/",
                    {
                        headers: headers(),
                        params
                    }
                );

                setExpenses(
                    res.data.expenses || []
                );

            } catch {

                setError(
                    "Unable to load expenses."
                );

            } finally {

                setLoading(false);
            }

        })();

    }, [employee, category]);


    const download = async (
        url,
        filename
    ) => {

        try {

            const response = await api.get(
                url,
                {
                    headers: headers(),
                    responseType: "blob"
                }
            );

            const link =
                document.createElement("a");

            const objectUrl =
                URL.createObjectURL(
                    new Blob(
                        [response.data],
                        {
                            type:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        }
                    )
                );

            link.href = objectUrl;
            link.download = filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(
                objectUrl
            );

        } catch (e) {

            alert(
                e.response?.data?.message ||
                "Failed to export Excel"
            );
        }
    };


    const total = expenses.reduce(
        (n, e) =>
            n + Number(e.amount || 0),
        0
    );


    return (
        <AdminLayout title="Expenses">

            <div className="admin-form-card mb-3">

                <h2 className="section-title mb-3">
                    Filter expenses
                </h2>

                <div className="row g-3">

                    {/* MONTH */}

                    <div className="col-12 col-md-3">

                        <label className="form-label">
                            Export Month
                        </label>

                        <input
                            type="month"
                            className="form-control"
                            value={month}
                            onChange={(e) =>
                                setMonth(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* EMPLOYEE */}

                    <div className="col-12 col-md-4">

                        <label className="form-label">
                            Employee
                        </label>

                        <select
                            className="form-select"
                            value={employee}
                            onChange={(e) =>
                                setEmployee(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                All employees
                            </option>

                            {employees.map((e) => (

                                <option
                                    key={e._id}
                                    value={e._id}
                                >
                                    {e.name} — {e.employeeCode}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* CATEGORY */}

                    <div className="col-12 col-md-3">

                        <label className="form-label">
                            Category
                        </label>

                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                All categories
                            </option>

                            {categories.map((c) => (

                                <option
                                    key={c._id}
                                    value={c._id}
                                >
                                    {c.name}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* CLEAR */}

                    <div className="col-12 col-md-2 d-grid align-self-end">

                        <button
                            className="btn btn-outline-secondary"
                            disabled={
                                !employee &&
                                !category
                            }
                            onClick={() => {
                                setEmployee("");
                                setCategory("");
                            }}
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>

            </div>


            {/* EXPORT */}

            <div className="section-card mb-3">

                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">

                    <div>

                        <h2 className="section-title mb-1">
                            Export reports
                        </h2>

                        <p className="text-secondary small mb-0">
                            Excel exports are generated for the selected month.
                        </p>

                    </div>


                    <div className="d-flex flex-wrap gap-2">


                        {/* EMPLOYEE */}

                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                                employee
                                    ? download(
                                        `/admin/export/employee/${employee}?month=${month}`,
                                        `Employee-Expense-${month}.xlsx`
                                    )
                                    : alert(
                                        "Please select an employee first."
                                    )
                            }
                        >
                            Employee Excel
                        </button>


                        {/* CATEGORY */}

                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                                category
                                    ? download(
                                        `/admin/export/category/${category}?month=${month}`,
                                        `Category-Expense-${month}.xlsx`
                                    )
                                    : alert(
                                        "Please select a category first."
                                    )
                            }
                        >
                            Category Excel
                        </button>


                        {/* HEAD OFFICE */}

                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                                download(
                                    `/admin/export/head-office?month=${month}`,
                                    `Head-Office-Expense-${month}.xlsx`
                                )
                            }
                        >
                            Head Office Excel
                        </button>

                    </div>

                </div>

            </div>


            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            {/* TOTAL */}

            <div className="summary-card mb-4">

                <p className="summary-label">
                    Total currently displayed
                </p>

                <p className="summary-value text-primary">
                    {formatMoney(total)}
                </p>

            </div>


            {/* EXPENSE HISTORY */}

            <section className="section-card">

                <h2 className="section-title mb-3">
                    Expense history
                </h2>


                {loading ? (

                    <LoadingState
                        label="Loading expenses..."
                    />

                ) : expenses.length ? (

                    <div className="table-responsive">

                        <table className="table table-hover data-table">

                            <thead>

                                <tr>

                                    <th>
                                        Expense ID
                                    </th>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Expense date
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {expenses.map((e) => (

                                    <tr key={e._id}>

                                        <td>
                                            {e.expenseId}
                                        </td>

                                        <td>
                                            {e.employee?.name ||
                                                "Unknown"}
                                        </td>

                                        <td>
                                            {e.employee
                                                ?.employeeCode ||
                                                "-"}
                                        </td>

                                        <td>
                                            {e.category?.name ||
                                                "Unknown"}
                                        </td>

                                        <td className="fw-semibold">
                                            {formatMoney(
                                                e.amount
                                            )}
                                        </td>

                                        <td>
                                            {e.description ||
                                                "-"}
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                e.expenseDate
                                            )}
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                e.createdAt
                                            )}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <EmptyState
                        label="No expenses found."
                    />

                )}

            </section>

        </AdminLayout>
    );
}