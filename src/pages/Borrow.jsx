import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Borrow() {

  const [borrowRecords, setBorrowRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);

  const [selectedBorrowId, setSelectedBorrowId] = useState("");

  const today = new Date();

  const due = new Date();
  due.setDate(today.getDate() + 15);

  const [formData, setFormData] = useState({
    book_id: "",
    member_id: "",
    due_date: due.toISOString().split("T")[0],
  });

  // FETCH DATA
  useEffect(() => {

    const fetchData = async () => {

      try {

        const [borrowRes, booksRes, membersRes] = await Promise.all([
          API.get("/borrow-records"),
          API.get("/books"),
          API.get("/members"),
        ]);

        setBorrowRecords(borrowRes.data);
        setBooks(booksRes.data);
        setMembers(membersRes.data);

      } catch (error) {

        console.error("Borrow page fetch error:", error);

      } finally {

        setLoading(false);

      }
    };

    fetchData();

  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // BORROW BOOK
  const handleBorrowBook = async (e) => {

    e.preventDefault();

    try {

      const payload = {
        book_id: Number(formData.book_id),
        member_id: Number(formData.member_id),
        due_date: formData.due_date,
      };

      console.log("BORROW PAYLOAD:", payload);

      await API.post("/borrow-records/borrow", payload);

      const updated = await API.get("/borrow-records");

      setBorrowRecords(updated.data);

      setShowBorrowModal(false);

      // RESET FORM
      const newDue = new Date();
      newDue.setDate(new Date().getDate() + 15);

      setFormData({
        book_id: "",
        member_id: "",
        due_date: newDue.toISOString().split("T")[0],
      });

    } catch (error) {

      console.log("FULL ERROR:", error);
      console.log("STATUS:", error?.response?.status);
      console.log("DATA:", error?.response?.data);

    }

  };

  // RETURN BOOK
  const handleReturnBook = async (e) => {

    e.preventDefault();

    try {

      await API.post("/borrow-records/return", {
        borrow_record_id: Number(selectedBorrowId),
      });

      const updated = await API.get("/borrow-records");

      setBorrowRecords(updated.data);

      setShowReturnModal(false);

      setSelectedBorrowId("");

    } catch (error) {

      console.error("Return book error:", error);

    }

  };

  return (

    <MainLayout>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-3xl font-bold">
            Borrow & Return
          </h1>

          <p className="text-gray-500">
            Manage book borrowing and return operations
          </p>

        </div>

        <div className="flex gap-3">

          <button
            onClick={() => setShowBorrowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Borrow Book
          </button>

          <button
            onClick={() => setShowReturnModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Return Book
          </button>

        </div>

      </div>

      {/* GRID */}
      {loading ? (

        <p>Loading...</p>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {borrowRecords.map((record) => (

            <div
              key={record.id}
              className="bg-white p-5 rounded-xl shadow"
            >

              {/* TITLE */}
              <h2 className="text-xl font-bold mb-2">
                {record.book?.title}
              </h2>

              {/* AUTHOR */}
              <p className="text-gray-600">

                <span className="font-semibold">
                  Author:
                </span>{" "}

                {record.book?.author}

              </p>

              {/* BORROW DATE */}
              <p className="text-gray-600 mt-2">

                <span className="font-semibold">
                  Borrowed:
                </span>{" "}

                {record.borrow_date}

              </p>

              {/* DUE DATE */}
              <p className="text-gray-600">

                <span className="font-semibold">
                  Due:
                </span>{" "}

                {record.due_date}

              </p>

              {/* STATUS */}
              <div className="mt-4">

                {(() => {

                  const today = new Date();

                  const dueDate = new Date(record.due_date);

                  const isReturned = !!record.return_date;

                  const isOverdue =
                    !isReturned && dueDate < today;

                  if (isReturned) {

                    return (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Returned
                      </span>
                    );

                  }

                  if (isOverdue) {

                    return (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        Overdue
                      </span>
                    );

                  }

                  return (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  );

                })()}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* BORROW MODAL */}
      {showBorrowModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[400px]">

            <h2 className="text-xl font-bold mb-4">
              Borrow Book
            </h2>

            <form
              onSubmit={handleBorrowBook}
              className="space-y-3"
            >

              {/* BOOK */}
              <select
                name="book_id"
                value={formData.book_id}
                onChange={handleChange}
                className="w-full border p-2"
                required
              >

                <option value="">
                  Select Book
                </option>

                {books.map((b) => (

                  <option
                    key={b.id}
                    value={b.id}
                  >
                    {b.title}
                  </option>

                ))}

              </select>

              {/* MEMBER */}
              <select
                name="member_id"
                value={formData.member_id}
                onChange={handleChange}
                className="w-full border p-2"
                required
              >

                <option value="">
                  Select Member
                </option>

                {members.map((m) => (

                  <option
                    key={m.id}
                    value={m.id}
                  >
                    {m.name}
                  </option>

                ))}

              </select>

              {/* BORROW DATE */}
              <div className="bg-gray-100 p-3 rounded">

                <p className="text-sm text-gray-700">

                  <span className="font-semibold">
                    Borrow Date:
                  </span>{" "}

                  {new Date().toISOString().split("T")[0]}

                </p>

              </div>

              {/* DUE DATE */}
              <div className="bg-gray-100 p-3 rounded">

                <p className="text-sm text-gray-700">

                  <span className="font-semibold">
                    Due Date:
                  </span>{" "}

                  {formData.due_date}

                </p>

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="px-3 py-2 border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2"
                >
                  Borrow
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* RETURN MODAL */}
      {showReturnModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[400px]">

            <h2 className="text-xl font-bold mb-4">
              Return Book
            </h2>

            <form
              onSubmit={handleReturnBook}
              className="space-y-4"
            >

              <select
                value={selectedBorrowId}
                onChange={(e) => setSelectedBorrowId(e.target.value)}
                className="w-full border p-2"
                required
              >

                <option value="">
                  Select Borrowed Book
                </option>

                {borrowRecords
                  .filter((record) => !record.return_date)
                  .map((record) => (

                    <option key={record.id} value={record.id}>
                      {record.book?.title} — {record.member?.name}

                      {new Date(record.due_date) < new Date()
                      ? " (Overdue)"
                      : " (Active)"}
                    </option>

                  ))}

              </select>

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3 py-2 border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-2"
                >
                  Return
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </MainLayout>

  );
}

export default Borrow;