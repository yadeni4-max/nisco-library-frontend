import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Reports() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [popularGenres, setPopularGenres] = useState([]);

  const [summary, setSummary] = useState({
    totalBorrowsThisMonth: 0,
    averageBorrowDuration: 0,
    returnRate: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // =========================
        // FETCH DATA
        // =========================
        const [borrowsRes, genresRes, summaryRes] = await Promise.all([
          API.get("/borrow-records"),
          API.get("/borrow-records/reports/popular-genres"),
          API.get("/borrow-records/reports/summary"),
        ]);

        const borrows = borrowsRes.data || [];

        // =========================
        // SAME LOGIC AS MEMBERS PAGE
        // =========================
        const overdue = borrows.filter(
          (b) =>
            !b.return_date &&
            new Date(b.due_date) < new Date()
        );

        setOverdueBooks(overdue);

        // =========================
        // POPULAR GENRES
        // =========================
        setPopularGenres(genresRes.data || []);

        // =========================
        // SUMMARY DATA
        // =========================
        const summaryData = summaryRes.data || {};
// =========================
// FRONTEND AVERAGE DURATION FIX
// =========================
const returnedBooks = borrows.filter(
  (b) =>
    b.return_date &&
    b.borrow_date
);

let averageDays = 0;

if (returnedBooks.length > 0) {

  const totalDays = returnedBooks.reduce(
    (sum, record) => {

      const borrowDate = new Date(
        record.borrow_date
      );

      const dueDate = new Date(
        record.due_date
      );

      // SAME TECHNIQUE AS MEMBERS/BORROW
      const diffDays =
        (dueDate - borrowDate) /
        (1000 * 60 * 60 * 24);

      return sum + diffDays;

    },
    0
  );

  averageDays = (
    totalDays / returnedBooks.length
  ).toFixed(1);
}

        setSummary({
          totalBorrowsThisMonth:
            summaryData.totalBorrowsThisMonth || 0,

          averageBorrowDuration: averageDays,

          returnRate:
            summaryData.returnRate || 0,
        });

      } catch (error) {
        console.error("Reports error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">
        Reports
      </h1>

      <p className="text-gray-500 mb-6">
        Library analytics and reports
      </p>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Overdue Books */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-red-600">
              Overdue Books
            </h2>

            <p className="text-3xl font-bold">
              {overdueBooks.length}
            </p>
          </div>

          {/* Popular Genres */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-blue-600">
              Popular Genres
            </h2>

            <ul className="text-sm space-y-1">
              {popularGenres
                .slice(0, 5)
                .map((g, i) => (
                  <li key={i}>
                    {g.genre_name || g.genre} —{" "}
                    {g.borrow_count || g.count}
                  </li>
                ))}
            </ul>
          </div>

          {/* Total Borrows */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-green-600">
              Total Borrows This Month
            </h2>

            <p className="text-3xl font-bold">
              {summary.totalBorrowsThisMonth}
            </p>
          </div>

          {/* Average Duration */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-purple-600">
              Average Borrow Duration
            </h2>

            <p className="text-3xl font-bold">
              {summary.averageBorrowDuration}{" "}
              <span className="text-lg">
                Days
              </span>
            </p>
          </div>

          {/* Return Rate */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-orange-600">
              Return Rate
            </h2>

            <p className="text-3xl font-bold">
              {summary.returnRate}%
            </p>
          </div>

        </div>
      )}
    </MainLayout>
  );
}

export default Reports;