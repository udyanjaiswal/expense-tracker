import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import api from "../../services/api";

const AdminLogin = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setErrorMessage("");
            const res = await api.post(
                "/admin/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "adminToken",
                res.data.token
            );

            localStorage.setItem(
                "admin",
                JSON.stringify(res.data.admin)
            );

            navigate("/admin");

        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Admin login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <main className="admin-login-box">
                <div className="admin-login-heading">
                    <i className="bi bi-wallet2" aria-hidden="true" />
                    <h1>ExpenseTrack Admin</h1>
                    <p>Sign in to manage expenses.</p>
                </div>

                <form onSubmit={handleLogin} className="admin-login-form">
                    <div>
                        <label className="form-label" htmlFor="adminEmail">Email</label>
                        <input id="adminEmail" className="form-control"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                        />
                    </div>

                    <div>
                        <label className="form-label" htmlFor="adminPassword">Password</label>
                        <input id="adminPassword" className="form-control"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                        />
                    </div>

                {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>

                </form>
            </main>

        </div>
    );
};

export default AdminLogin;
