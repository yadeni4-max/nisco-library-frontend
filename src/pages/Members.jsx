import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Members() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [borrows, setBorrows] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    join_date: today,
  });

  // =========================
  // STEP 1 + FIXED HELPERS
  // =========================
  const getActiveBorrows = (memberId) =>
    borrows.filter(
      (b) =>
        b.member?.id === memberId &&
        !b.return_date
    ).length;

  const getOverdueBorrows = (memberId) =>
    borrows.filter(
      (b) =>
        b.member?.id === memberId &&
        !b.return_date &&
        new Date(b.due_date) < new Date()
    ).length;

  const isOverdueBorrow = (borrow) =>
    !borrow.return_date &&
    new Date(borrow.due_date) < new Date();

  // =========================
  // FETCH MEMBERS
  // =========================
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.get("/members");
        setMembers(res.data);
        setFilteredMembers(res.data);

        const borrowRes = await API.get("/borrow-records");
        setBorrows(borrowRes.data);
      } catch (error) {
        console.error("Members fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    const term = search.toLowerCase();

    const filtered = members.filter((m) => {
      return (
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.phone?.toLowerCase().includes(term)
      );
    });

    setFilteredMembers(filtered);
  }, [search, members]);

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
  // ADD MEMBER
  // =========================
  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      await API.post("/members", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        join_date: formData.join_date,
      });

      const res = await API.get("/members");
      setMembers(res.data);
      setFilteredMembers(res.data);

      setShowModal(false);

      setFormData({
        name: "",
        email: "",
        phone: "",
        join_date: today,
      });
    } catch (error) {
      console.error("Add member error:", error);
    }
  };

  // =========================
  // EDIT CLICK
  // =========================
  const handleEditClick = (member) => {
    setEditingMember(member);

    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      join_date: member.join_date || today,
    });

    setShowModal(true);
  };

  // =========================
  // UPDATE MEMBER
  // =========================
  const handleUpdateMember = async (e) => {
    e.preventDefault();

    try {
      await API.patch(`/members/${editingMember.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      const res = await API.get("/members");
      setMembers(res.data);
      setFilteredMembers(res.data);

      setShowModal(false);
      setEditingMember(null);
    } catch (error) {
      console.error("Update member error:", error);
    }
  };

  // =========================
  // DELETE MEMBER
  // =========================
  const handleDeleteMember = async (id) => {
    const confirmDelete = window.confirm("Delete this member?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/members/${id}`);

      const res = await API.get("/members");
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (error) {
      console.error("Delete member error:", error);
    }
  };

  // =========================
  // SELECT MEMBER
  // =========================
  const handleSelectMember = async (member) => {
    setSelectedMember(member);

    try {
      const res = await API.get(
        `/members/${member.id}/borrowing-history`
      );
      setHistory(res.data);
    } catch (error) {
      console.error("History error:", error);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <MainLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-500">Manage library members</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Member
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-3 rounded mb-6"
      />

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {filteredMembers.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded shadow">

                <h2
                  onClick={() => handleSelectMember(m)}
                  className="text-xl font-bold cursor-pointer text-blue-600 hover:underline"
                >
                  {m.name}
                </h2>

                <p className="text-gray-600">{m.email}</p>
                <p className="text-gray-600">{m.phone}</p>

                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">Joined Date:</span>{" "}
                  {m.join_date || "N/A"}
                </p>

                {/* ACTIVE */}
                <p className="text-gray-600">
                  <span className="font-semibold">Active Borrows:</span>{" "}
                  {getActiveBorrows(m.id)}
                </p>

                {/* OVERDUE (STEP 2 FIXED) */}
                <p className="text-gray-600">
                  <span className="font-semibold">Overdue Borrows:</span>{" "}
                  {getOverdueBorrows(m.id)}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditClick(m)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="bg-white p-5 rounded shadow">

            {!selectedMember ? (
              <p className="text-gray-500">
                Select a member to view details
              </p>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  {selectedMember.name}
                </h2>

                <p className="text-gray-600">{selectedMember.email}</p>
                <p className="text-gray-600">{selectedMember.phone}</p>

                <p className="mt-2 text-sm text-gray-500">
                  Joined: {selectedMember.join_date || "N/A"}
                </p>

                {/* STEP 3 FIX */}
                <div className="mt-4 space-y-2">
                  <p>🟢 Active: {getActiveBorrows(selectedMember.id)}</p>
                  <p>🔴 Overdue: {getOverdueBorrows(selectedMember.id)}</p>
                </div>

                {/* HISTORY + STEP 4 BADGES FIX */}
                <div className="mt-5">
                  <h3 className="font-bold mb-2">Borrow History</h3>

                  {history.length === 0 ? (
                    <p className="text-gray-500">No history found</p>
                  ) : (
                    <div className="space-y-2">

                      {history.map((h) => {
                        const isReturned = !!h.return_date;
                        const isOverdue =
                          !isReturned &&
                          new Date(h.due_date) < new Date();

                        return (
                          <div key={h.id} className="border p-2 rounded">

                            <p className="font-semibold">
                              {h.book?.title}
                            </p>

                            <p className="text-sm text-gray-600">
                              Borrowed: {h.borrow_date}
                            </p>

                            <p className="text-sm text-gray-600">
                              Due: {h.due_date}
                            </p>

                            {/* BADGES */}
                            <p
                              className={`text-sm font-medium px-2 py-1 rounded w-fit
                                ${
                                  isReturned
                                    ? "bg-yellow-100 text-yellow-700"
                                    : isOverdue
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                            >
                              {isReturned
                                ? "Returned"
                                : isOverdue
                                ? "Overdue"
                                : "Active"}
                            </p>

                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>

              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL (UNCHANGED) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              {editingMember ? "Edit Member" : "Add Member"}
            </h2>

            <form
              onSubmit={
                editingMember
                  ? handleUpdateMember
                  : handleAddMember
              }
              className="space-y-3"
            >

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full border p-2"
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border p-2"
              />

              {!editingMember && (
                <input
                  name="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={handleChange}
                  className="w-full border p-2"
                />
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border px-3 py-1"
                >
                  Cancel
                </button>

                <button className="bg-blue-600 text-white px-3 py-1">
                  {editingMember ? "Update" : "Add"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </MainLayout>
  );
}

export default Members;