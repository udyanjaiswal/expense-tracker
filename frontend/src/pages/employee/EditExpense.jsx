import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function EditExpense() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const token =
            sessionStorage.getItem("employeeToken");

        if (!token) {
            navigate("/employee");
            return;
        }

        const loadExpense = async () => {

            try {

                const [expenseResponse, categoryResponse] =
                    await Promise.all([
                        api.get(
                            "/employees/my-expenses",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        ),

                        api.get(
                            "/categories/active",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        )
                    ]);

                const expenses =
                    expenseResponse.data.expenses || [];

                const expense = expenses.find(
                    (item) => item._id === id
                );

                if (!expense) {
                    setError("Expense not found.");
                    return;
                }

                setCategory(expense.category?._id || "");
                setAmount(expense.amount);
                setDescription(expense.description || "");

                setCategories(
                    categoryResponse.data.categories || []
                );

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load expense."
                );

            } finally {
                setLoading(false);
            }
        };

        loadExpense();

    }, [id, navigate]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!category) {
            setError("Please select a category.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        try {

            setSaving(true);
            setError("");

            const token =
                sessionStorage.getItem("employeeToken");

            await api.put(
                `/expenses/${id}`,
                {
                    category,
                    amount: Number(amount),
                    description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            navigate("/employee/dashboard");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to update expense."
            );

        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="loading-screen">
                Loading expense...
            </div>
        );
    }


    return (
        <div className="add-expense-page">

            <header className="add-expense-header">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/employee/dashboard")
                    }
                >
                    ←
                </button>

                <h2>Edit Expense</h2>

            </header>


            <form
                className="expense-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">

                    <label htmlFor="category">
                        What was it for?
                    </label>

                    <select
                        id="category"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setError("");
                        }}
                    >

                        <option value="">
                            Select category
                        </option>

                        {categories.map((item) => (
                            <option
                                key={item._id}
                                value={item._id}
                            >
                                {item.name}
                            </option>
                        ))}

                    </select>

                </div>


                <div className="form-group">

                    <label htmlFor="amount">
                        Amount
                    </label>

                    <div className="amount-input">

                        <span>₹</span>

                        <input
                            id="amount"
                            type="number"
                            min="1"
                            step="0.01"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError("");
                            }}
                        />

                    </div>

                </div>


                <div className="form-group">

                    <label htmlFor="description">
                        Description
                        <span className="optional">
                            Optional
                        </span>
                    </label>

                    <textarea
                        id="description"
                        rows="3"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setError("");
                        }}
                        placeholder="Anything you want to remember..."
                    />

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <button
                    type="submit"
                    className="submit-expense-button"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Changes"}
                </button>

            </form>

        </div>
    );
}

export default EditExpense;