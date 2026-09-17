import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import EmployeePin from "./pages/employee/EmployeePin";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AddExpense from "./pages/employee/AddExpense";
import EditExpense from "./pages/employee/EditExpense";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import Employees from "./pages/admin/Employee";
import Categories from "./pages/admin/Categories";
import Allocations from "./pages/admin/Allocations";
import Expenses from "./pages/admin/Expenses";

function RequireAdmin({ children }) {
  return localStorage.getItem("adminToken")
    ? children
    : <Navigate to="/admin/login" replace />;
}

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/employee"
          element={<EmployeePin />}
        />

        <Route
          path="/employee/dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="/employee/add-expense"
          element={<AddExpense />}
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/employee"
              replace
            />
          }
        />

        <Route
          path="/employee/edit-expense/:id"
          element={<EditExpense />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin/employees" element={<RequireAdmin><Employees /></RequireAdmin>} />

        <Route path="/admin/categories" element={<RequireAdmin><Categories /></RequireAdmin>} />

        <Route
          path="/admin/allocations"
          element={<RequireAdmin><Allocations /></RequireAdmin>}
        />

        <Route
    path="/admin/expenses"
    element={<RequireAdmin><Expenses /></RequireAdmin>}
/>
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
