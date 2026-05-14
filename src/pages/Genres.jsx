import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Genres() {
  const [genres, setGenres] = useState([]);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  // =========================
  // FETCH GENRES
  // =========================
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await API.get("/genres");
        setGenres(res.data);
        setFilteredGenres(res.data);
      } catch (error) {
        console.error("Genres fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    const term = search.toLowerCase();

    const filtered = genres.filter((g) =>
      g.name?.toLowerCase().includes(term)
    );

    setFilteredGenres(filtered);
  }, [search, genres]);

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
  // ADD GENRE
  // =========================
  const handleAddGenre = async (e) => {
    e.preventDefault();

    try {
      await API.post("/genres", {
        name: formData.name,
      });

      const res = await API.get("/genres");
      setGenres(res.data);
      setFilteredGenres(res.data);

      setShowModal(false);
      setFormData({ name: "" });
    } catch (error) {
      console.error("Add genre error:", error);
    }
  };

  // =========================
  // EDIT CLICK
  // =========================
  const handleEditClick = (genre) => {
    setEditingGenre(genre);

    setFormData({
      name: genre.name,
    });

    setShowModal(true);
  };

  // =========================
  // UPDATE GENRE
  // =========================
  const handleUpdateGenre = async (e) => {
    e.preventDefault();

    try {
      await API.patch(`/genres/${editingGenre.id}`, {
        name: formData.name,
      });

      const res = await API.get("/genres");
      setGenres(res.data);
      setFilteredGenres(res.data);

      setShowModal(false);
      setEditingGenre(null);
      setFormData({ name: "" });
    } catch (error) {
      console.error("Update genre error:", error);
    }
  };

  // =========================
  // DELETE GENRE
  // =========================
  const handleDeleteGenre = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this genre?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/genres/${id}`);

      const res = await API.get("/genres");
      setGenres(res.data);
      setFilteredGenres(res.data);
    } catch (error) {
      console.error("Delete genre error:", error);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Genres</h1>
          <p className="text-gray-500">
            Manage book genres (Admin Only)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGenre(null);
            setFormData({ name: "" });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg mt-4 md:mt-0 hover:bg-blue-700"
        >
          Add Genre
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search genres..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-4 rounded-lg mb-6"
      />

      {/* LIST */}
      {loading ? (
        <p>Loading genres...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredGenres.map((g) => (
            <div key={g.id} className="bg-white p-5 rounded shadow">

              {/* NAME FIRST, ID SECOND */}
              <div>
                <h2 className="text-xl font-bold">
                  {g.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  ID: {g.id}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditClick(g)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteGenre(g.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              {editingGenre ? "Edit Genre" : "Add Genre"}
            </h2>

            <form
              onSubmit={
                editingGenre ? handleUpdateGenre : handleAddGenre
              }
              className="space-y-3"
            >

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Genre name"
                className="w-full border p-3"
                required
              />

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2"
                >
                  Cancel
                </button>

                <button className="bg-blue-600 text-white px-4 py-2">
                  {editingGenre ? "Update" : "Add"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </MainLayout>
  );
}

export default Genres;