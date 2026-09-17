import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function EmployeePin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pin.length !== 4) return setError("Please enter your 4-digit PIN.");
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/employees/verify-pin", { pin });
      sessionStorage.setItem("employeeToken", response.data.token);
      sessionStorage.setItem("employee", JSON.stringify(response.data.employee));
      navigate("/employee/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to verify PIN.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="employee-pin-page">
    <section className="employee-pin-card" aria-labelledby="employeeLoginTitle">
      <div className="employee-brand">
        <div className="brand-icon" aria-hidden="true">₹</div>
        <h1 id="employeeLoginTitle">ExpenseTrack</h1>
        <p>Enter your PIN to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="employee-pin-form">
        <div>
          <label className="form-label" htmlFor="pin">Employee PIN</label>
          <input id="pin" className="form-control employee-pin-input" type="password" inputMode="numeric" maxLength="4" value={pin} onChange={(event) => { setPin(event.target.value.replace(/\D/g, "")); setError(""); }} placeholder="••••" autoComplete="off" aria-describedby={error ? "pinError" : undefined} />
        </div>
        {error && <div className="alert alert-danger py-2 mb-0" id="pinError" role="alert">{error}</div>}
        <button className="btn btn-primary w-100" type="submit" disabled={loading || pin.length !== 4}>{loading ? "Checking..." : "Continue"}</button>
      </form>
    </section>
  </main>;
}
