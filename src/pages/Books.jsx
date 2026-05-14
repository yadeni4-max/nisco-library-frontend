import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [genres, setGenres] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    published_year: "",
    available_copies: "",
    genre_id: "",
  });

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await API.get("/books");
        setBooks(response.data);
        setFilteredBooks(response.data);

        const genresResponse = await API.get("/genres");
        setGenres(genresResponse.data);
      } catch (error) {
        console.error("Books fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // =========================
  // SEARCH FILTER
  // =========================
  useEffect(() => {
    const searchTerm = search.toLowerCase();

    const filtered = books.filter((book) => {
      const title = book.title || "";
      const author = book.author || "";
      const genre = book.genre?.name || "";

      return (
        title.toLowerCase().includes(searchTerm) ||
        author.toLowerCase().includes(searchTerm) ||
        genre.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredBooks(filtered);
  }, [search, books]);

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
  // ADD BOOK
  // =========================
  const handleAddBook = async (e) => {
    e.preventDefault();

    try {
      await API.post("/books", {
        ...formData,
        published_year: Number(formData.published_year),
        available_copies: Number(formData.available_copies),
        genre_id: Number(formData.genre_id),
      });

      const response = await API.get("/books");
      setBooks(response.data);
      setFilteredBooks(response.data);

      setShowModal(false);
      setFormData({
        title: "",
        author: "",
        published_year: "",
        available_copies: "",
        genre_id: "",
      });
    } catch (error) {
      console.error("Add book error:", error);
    }
  };

  // =========================
  // EDIT CLICK
  // =========================
  const handleEditClick = (book) => {
    setEditingBook(book);

    setFormData({
      title: book.title,
      author: book.author,
      published_year: book.published_year,
      available_copies: book.available_copies,
      genre_id: book.genre_id,
    });

    setShowModal(true);
  };

  // =========================
  // UPDATE BOOK
  // =========================
  const handleUpdateBook = async (e) => {
    e.preventDefault();

    try {
      await API.patch(`/books/${editingBook.id}`, {
        title: formData.title,
        author: formData.author,
        published_year: Number(formData.published_year),
        available_copies: Number(formData.available_copies),
        genre_id: Number(formData.genre_id),
      });

      const response = await API.get("/books");
      setBooks(response.data);
      setFilteredBooks(response.data);

      setShowModal(false);
      setEditingBook(null);
    } catch (error) {
      console.error("Update book error:", error);
    }
  };

  // =========================
  // DELETE BOOK
  // =========================
  const handleDeleteBook = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/books/${id}`);

      const response = await API.get("/books");
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Delete book error:", error);
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
          <h1 className="text-3xl font-bold">Books</h1>
          <p className="text-gray-500 mt-1">
            Manage your library's book collection
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg mt-4 md:mt-0 hover:bg-blue-700 transition"
        >
          Add Book
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search books by title, author or genre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-300 p-4 rounded-lg"
        />
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading books...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white p-5 rounded-xl shadow">
              <h2 className="text-xl font-bold mb-2">{book.title}</h2>

              <p className="text-gray-600">
                <span className="font-semibold">Author:</span> {book.author}
              </p>

              

              <p className="text-gray-600 mt-2">
                <span className="font-semibold">Genre:</span>{" "}
                {book.genre?.name || "No Genre"}
              </p>

              <p className="text-gray-600">
                <span className="font-semibold">Published:</span>{" "}
                {book.published_year || "N/A"}
              </p>

              <p className="text-gray-600">
                <span className="font-semibold">Available Copies:</span>{" "}
                {book.available_copies ?? 0}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditClick(book)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteBook(book.id)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingBook ? "Edit Book" : "Add Book"}
            </h2>

            <form
              onSubmit={editingBook ? handleUpdateBook : handleAddBook}
              className="space-y-4"
            >
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border p-3 rounded"
              />

              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author"
                className="w-full border p-3 rounded"
              />

              <input
                name="published_year"
                value={formData.published_year}
                onChange={handleChange}
                placeholder="Published Year"
                className="w-full border p-3 rounded"
              />

              <input
                name="available_copies"
                value={formData.available_copies}
                onChange={handleChange}
                placeholder="Copies"
                className="w-full border p-3 rounded"
              />

              <select
                name="genre_id"
                value={formData.genre_id}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              >
                <option value="">Select Genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingBook ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Books;