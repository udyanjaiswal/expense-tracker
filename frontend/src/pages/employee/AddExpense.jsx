import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddExpense() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("employeeToken");

        if (!token) {
            navigate("/employee");
            return;
        }

        const fetchCategories = async () => {
            try {
                const response = await api.get(
    "/categories/active",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

                setCategories(response.data.categories || []);

            } catch (error) {
                console.error(error);
                setError("Unable to load categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [navigate]);

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

        await api.post(
            "/expenses",
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
            "Failed to submit expense."
        );
    } finally {
        setSaving(false);
    }
};
    return (
        <div className="add-expense-page">

            <header className="add-expense-header">
                <button
                    className="back-button"
                    onClick={() => navigate("/employee/dashboard")}
                >
                    ←
                </button>

                <h2>Add Expense</h2>
            </header>

            <form
                className="expense-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">

                    <label htmlFor="category">
                        What was it for?
                    </label>

                    {loading ? (
                        <div className="form-loading">
                            Loading categories...
                        </div>
                    ) : (
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
                    )}

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
                            placeholder="0"
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
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setError("");
                        }}
                        placeholder="Anything you want to remember..."
                        rows="3"
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
                    disabled={loading || saving}
                >
                    {saving ? "Submitting..." : "Submit Expense"}
                </button>

            </form>

        </div>
    );
}

export default AddExpense;
