import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../api/axios";

function Reports() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [popularGenres, setPopularGenres] = useState([]);
  const [totalBorrows, setTotalBorrows] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [returnRate, setReturnRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Overdue books
        const overdueRes = await API.get("/borrow-records/reports/overdue");

        // Popular genres
        const genresRes = await API.get("/borrow-records/reports/popular-genres");

        // All borrows
        const borrowsRes = await API.get("/borrow-records");

        const borrows = borrowsRes.data;

        // Overdue
        setOverdueBooks(overdueRes.data);

        // Popular genres
        setPopularGenres(genresRes.data);

        // Total borrows this month
        const now = new Date();
        const thisMonth = borrows.filter((b) => {
          const date = new Date(b.borrow_date);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });

        setTotalBorrows(thisMonth.length);

        // Average borrow duration
        const completed = borrows.filter((b) => b.return_date);

        const durations = completed.map((b) => {
          const start = new Date(b.borrow_date);
          const end = new Date(b.return_date);
          return (end - start) / (1000 * 60 * 60 * 24);
        });

        const avg =
          durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0;

        setAvgDuration(avg.toFixed(1));

        // Return rate
        const returned = borrows.filter((b) => b.return_date).length;
        const rate =
          borrows.length > 0
            ? (returned / borrows.length) * 100
            : 0;

        setReturnRate(rate.toFixed(1));

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
      {/* HEADER */}
      <h1 className="text-3xl font-bold">Reports</h1>
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
            <p className="text-gray-500 mb-2">
              Books that are past their due date
            </p>
            <p className="text-3xl font-bold">
              {overdueBooks.length}
            </p>
          </div>

          {/* Popular Genres */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-blue-600">
              Popular Genres
            </h2>
            <p className="text-gray-500 mb-2">
              Most borrowed book genres
            </p>

            <ul className="text-sm space-y-1">
              {popularGenres.slice(0, 5).map((g, i) => (
                <li key={i}>
                  {g.genre_name} — {g.borrow_count}
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
              {totalBorrows}
            </p>
          </div>

          {/* Average Duration */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-purple-600">
              Average Borrow Duration
            </h2>
            <p className="text-gray-500 mb-2">
              In days
            </p>
            <p className="text-3xl font-bold">
              {avgDuration}
            </p>
          </div>

          {/* Return Rate */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-bold text-orange-600">
              Return Rate
            </h2>
            <p className="text-gray-500 mb-2">
              Percentage of returned books
            </p>
            <p className="text-3xl font-bold">
              {returnRate}%
            </p>
          </div>

        </div>
      )}
    </MainLayout>
  );
}

export default Reports;