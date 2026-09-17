import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const navigation = [
  ["/admin", "Dashboard", "bi-grid-1x2"],
  ["/admin/employees", "Employees", "bi-people"],
  ["/admin/categories", "Categories", "bi-tags"],
  ["/admin/allocations", "Allocations", "bi-cash-stack"],
  ["/admin/expenses", "Expenses", "bi-receipt"],
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-mobile-header d-lg-none">
        <button className="btn btn-outline-light" type="button" onClick={() => setMenuOpen(true)} aria-controls="adminNavigation" aria-expanded={menuOpen}>
          <i className="bi bi-list" aria-hidden="true" /> <span className="visually-hidden">Open navigation</span>
        </button>
        <span className="fw-semibold">ExpenseTrack</span>
        <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>
      </header>

      <aside className="admin-sidebar d-none d-lg-flex">
        <div className="admin-sidebar-brand"><i className="bi bi-wallet2" aria-hidden="true" /> ExpenseTrack</div>
        <nav className="nav nav-pills flex-column gap-1" aria-label="Admin navigation">
          {navigation.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/admin"} className="nav-link"><i className={`bi ${icon}`} aria-hidden="true" /> {label}</NavLink>)}
        </nav>
        <button className="btn btn-outline-light mt-auto text-start" onClick={logout}><i className="bi bi-box-arrow-right" aria-hidden="true" /> Logout</button>
      </aside>

      {menuOpen && <div className="offcanvas-backdrop fade show" onClick={() => setMenuOpen(false)} />}
      <div className={`offcanvas offcanvas-start admin-offcanvas ${menuOpen ? "show" : ""}`} tabIndex="-1" id="adminNavigation" aria-labelledby="adminNavigationLabel" aria-hidden={!menuOpen}>
        <div className="offcanvas-header"><h5 className="offcanvas-title" id="adminNavigationLabel"><i className="bi bi-wallet2 me-2" />ExpenseTrack</h5><button type="button" className="btn-close btn-close-white" onClick={() => setMenuOpen(false)} aria-label="Close" /></div>
        <div className="offcanvas-body d-flex flex-column">
          <nav className="nav nav-pills flex-column gap-1">{navigation.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/admin"} className="nav-link" onClick={() => setMenuOpen(false)}><i className={`bi ${icon}`} aria-hidden="true" /> {label}</NavLink>)}</nav>
          <button className="btn btn-outline-light mt-auto text-start" onClick={logout}><i className="bi bi-box-arrow-right" aria-hidden="true" /> Logout</button>
        </div>
      </div>

      <main className="admin-content"><div className="container-fluid px-3 px-md-4 py-4"><h1 className="page-title">{title}</h1>{children}</div></main>
    </div>
  );
}
