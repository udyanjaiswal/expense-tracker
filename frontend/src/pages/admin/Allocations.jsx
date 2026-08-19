import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

import AdminLayout from "../../components/AdminLayout";
import {
  EmptyState,
  LoadingState,
  formatDate,
  formatMoney
} from "../../components/Ui";

const API = "http://localhost:2411";

function Allocations() {

  const [employees, setEmployees] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [data, setData] = useState({
    employee: "",
    amount: "",
    type: "allocation",
    note: ""
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization:
      `Bearer ${localStorage.getItem("adminToken")}`
  });

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [employeesResponse, allocationsResponse] =
        await Promise.all([
          axios.get(
            `${API}/api/employees/active`,
            {
              headers: getHeaders()
            }
          ),

          axios.get(
            `${API}/api/allocations/`,
            {
              headers: getHeaders()
            }
          )
        ]);

      setEmployees(
        employeesResponse.data.employees || []
      );

      setAllocations(
        allocationsResponse.data.allocations || []
      );

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Unable to load allocation data."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {

    setEditingId(null);

    setData({
      employee: "",
      amount: "",
      type: "allocation",
      note: ""
    });
  };

  const handleChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!data.employee) {
      setError("Please select an employee.");
      return;
    }

    if (!data.amount || Number(data.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {

      setSaving(true);

      if (editingId) {

        await axios.put(
          `${API}/api/allocations/${editingId}`,
          {
            amount: Number(data.amount),
            type: data.type,
            note: data.note
          },
          {
            headers: getHeaders()
          }
        );

      } else {

        await axios.post(
          `${API}/api/allocations/`,
          {
            employee: data.employee,
            amount: Number(data.amount),
            type: data.type,
            note: data.note
          },
          {
            headers: getHeaders()
          }
        );

      }

      resetForm();

      await loadData();

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to save allocation."
      );

    } finally {

      setSaving(false);

    }
  };

  const handleEdit = (allocation) => {

    setEditingId(allocation._id);

    setData({
      employee:
        allocation.employee?._id || "",
      amount:
        allocation.amount || "",
      type:
        allocation.type || "allocation",
      note:
        allocation.note || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AdminLayout title="Allocations">

      {/* FORM */}

      <div className="admin-form-card mb-4">

        <h2 className="section-title mb-3">
          {editingId
            ? "Edit Allocation"
            : "Give Money"}
        </h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="row g-3">

            {/* EMPLOYEE */}

            <div className="col-12 col-md-6">

              <label className="form-label">
                Employee
              </label>

              <select
                className="form-select"
                name="employee"
                value={data.employee}
                onChange={handleChange}
                disabled={Boolean(editingId)}
              >

                <option value="">
                  Select employee
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} -{" "}
                      {employee.employeeCode}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* AMOUNT */}

            <div className="col-12 col-md-3">

              <label className="form-label">
                Amount
              </label>

              <div className="input-group">

                <span className="input-group-text">
                  ₹
                </span>

                <input
                  className="form-control"
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={data.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />

              </div>

            </div>


            {/* TYPE */}

            <div className="col-12 col-md-3">

              <label className="form-label">
                Type
              </label>

              <select
                className="form-select"
                name="type"
                value={data.type}
                onChange={handleChange}
              >

                <option value="allocation">
                  Allocation
                </option>

                <option value="additional">
                  Additional
                </option>

              </select>

            </div>


            {/* NOTE */}

            <div className="col-12">

              <label className="form-label">
                Note{" "}
                <span className="text-secondary fw-normal">
                  (optional)
                </span>
              </label>

              <input
                className="form-control"
                type="text"
                name="note"
                value={data.note}
                onChange={handleChange}
                placeholder="Add a note"
              />

            </div>


            {/* BUTTONS */}

            <div className="col-12 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Give Money"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

            </div>

          </div>

        </form>

      </div>


      {/* HISTORY */}

      <section className="section-card">

        <h2 className="section-title mb-3">
          Allocation History
        </h2>

        {loading ? (

          <LoadingState
            label="Loading allocations..."
          />

        ) : allocations.length === 0 ? (

          <EmptyState
            label="No allocations found."
          />

        ) : (

          <div className="table-responsive">

            <table className="table table-hover data-table">

              <thead>

                <tr>

                  <th>
                    Allocation ID
                  </th>

                  <th>
                    Employee
                  </th>

                  <th>
                    Code
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Note
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {allocations.map(
                  (allocation) => (

                    <tr
                      key={
                        allocation._id
                      }
                    >

                      <td>
                        {
                          allocation.allocationId
                        }
                      </td>

                      <td>
                        {
                          allocation
                            .employee
                            ?.name ||
                          "Unknown"
                        }
                      </td>

                      <td>
                        {
                          allocation
                            .employee
                            ?.employeeCode ||
                          "-"
                        }
                      </td>

                      <td className="fw-semibold">
                        {formatMoney(
                          allocation.amount
                        )}
                      </td>

                      <td>

                        <span className="badge text-bg-primary text-capitalize">
                          {
                            allocation.type
                          }
                        </span>

                      </td>

                      <td>
                        {
                          allocation.note ||
                          "-"
                        }
                      </td>

                      <td>
                        {formatDate(
                          allocation.allocationDate
                        )}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            handleEdit(
                              allocation
                            )
                          }
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </AdminLayout>
  );
}

export default Allocations;