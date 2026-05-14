import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "librarian",
    created_at: today,
  });

  // =========================
  // FETCH STAFF (FIXED HERE)
  // =========================
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await API.get("/auth/users");

        console.log("STAFF RESPONSE:", res.data);

        // ✅ FIX: handle different backend response shapes
        const data =
        res.data?.users ||
        res.data?.data ||
        res.data?.items ||
        [];

        setStaff(data);
        setFilteredStaff(data);

      } catch (error) {
        console.error("Staff fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    const term = search.toLowerCase();

    const filtered = staff.filter((s) => {
      return (
        s.username?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.role?.toLowerCase().includes(term)
      );
    });

    setFilteredStaff(filtered);
  }, [search, staff]);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // ADD STAFF
  // =========================
 const handleAddStaff = async (e) => {
  e.preventDefault();

  // FRONTEND VALIDATION (important)
  if (!formData.password || formData.password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    await API.post("/staff", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    const res = await API.get("/auth/users");

    const data =
      res.data?.users ||
      res.data?.data ||
      res.data?.items ||
      [];

    setStaff(data);
    setFilteredStaff(data);

    setShowModal(false);

    setFormData({
      username: "",
      email: "",
      password: "",
      role: "librarian",
      created_at: today,
    });

  } catch (error) {
    console.error(
      "Add staff error:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message?.[0] ||
      "Failed to add staff"
    );
  }
};

  // =========================
  // EDIT CLICK
  // =========================
  const handleEditClick = (s) => {
    setEditingStaff(s);

    setFormData({
      username: s.username,
      email: s.email,
      password: "",
      role: s.role,
    });

    setShowModal(true);
  };

  // =========================
  // UPDATE STAFF
  // =========================
  const handleUpdateStaff = async (e) => {
    e.preventDefault();

    try {
      await API.patch(`/staff/${editingStaff.id}`, {
        username: formData.username,
        email: formData.email,
        password: formData.password || "password123",
        role: formData.role,
      });

      const res = await API.get("/auth/users");

        const data =
        res.data?.users ||
        res.data?.data ||
        res.data?.items ||
        [];

      setStaff(data);
      setFilteredStaff(data);

      setShowModal(false);
      setEditingStaff(null);

    } catch (error) {
      console.error("Update staff error:", error);
    }
  };

  // =========================
  // DELETE STAFF
  // =========================
  const handleDeleteStaff = async (id) => {
    const confirmDelete = window.confirm("Delete this staff?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/staff/${id}`);

      const res = await API.get("/auth/users");

        const data =
        res.data?.users ||
        res.data?.data ||
        res.data?.items ||
        [];

      setStaff(data);
      setFilteredStaff(data);

    } catch (error) {
      console.error("Delete staff error:", error);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <MainLayout>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Staff Management
          </h1>
          <p className="text-gray-500">
            Manage library staff and administrators (Admin Only)
          </p>
        </div>

        <button
          onClick={() => {
  setEditingStaff(null);

  setFormData({
    username: "",
    email: "",
    password: "",
    role: "librarian",
    created_at: today,
  });

  setShowModal(true);
}}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Staff
        </button>
      </div>

      <input
        type="text"
        placeholder="Search staff by username, email or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-3 rounded mb-6"
      />

      {/* DEBUG */}
      <p className="text-sm text-gray-500 mb-2">
        Staff count: {filteredStaff.length}
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredStaff.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded shadow">

              <span
              className={`px-2 py-1 text-sm rounded text-white ${
              s.role === "admin"
              ? "bg-red-600"
              : "bg-blue-600"
              }`}
              >
                {s.role}
              </span>

              <h2 className="text-xl font-bold mt-2">
                {s.username}
              </h2>

              <p className="text-gray-600">{s.email}</p>

              <p className="text-gray-500 text-sm mt-2">
                Created: {s.created_at || "N/A"}
              </p>

              
                  <div className="flex gap-2 mt-4">

                  <button
                  onClick={() => handleEditClick(s)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                  Edit
                  </button>

                  <button
                  onClick={() => handleDeleteStaff(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                  Delete
                  </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded w-full max-w-md shadow-lg">

      <h2 className="text-xl font-bold mb-4">
        {editingStaff ? "Edit Staff" : "Add Staff"}
      </h2>

      <form
        onSubmit={
          editingStaff
            ? handleUpdateStaff
            : handleAddStaff
        }
        className="space-y-3"
      >

        {/* USERNAME */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder={
            editingStaff
              ? "Leave blank to keep current password"
              : "Password"
          }
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required={!editingStaff}
        />

        {/* ROLE SELECTOR */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="librarian">
            Librarian
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">

          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setEditingStaff(null);
            }}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingStaff ? "Update" : "Add"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

    </MainLayout>
  );
}

export default Staff;