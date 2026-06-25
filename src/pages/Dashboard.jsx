import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    activeBorrows: 0,
    overdue: 0,
  });

  const [genreData, setGenreData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const booksRes = await API.get("/books");
        const membersRes = await API.get("/members");
        const borrowsRes = await API.get("/borrow-records");
        const genresRes = await API.get("/borrow-records/reports/popular-genres");

        const books = booksRes.data;
        const members = membersRes.data;
        const borrows = borrowsRes.data;

        // =========================
        // 🔥 FIXED DATE LOGIC (MATCHES BORROW + MEMBERS)
        // =========================
        const today = new Date();
        const todayNormalized = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const overdueBorrows = borrows.filter((record) => {
          const dueDate = new Date(record.due_date);

          const dueNormalized = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate()
          );

          const isReturned = !!record.return_date;

          return !isReturned && dueNormalized < todayNormalized;
        });

        const activeBorrows = borrows.filter((b) => !b.return_date);

        const sortedActivities = [...borrows]
          .sort(
            (a, b) =>
              new Date(b.borrow_date || b.createdAt) -
              new Date(a.borrow_date || a.createdAt)
          )
          .slice(0, 10);

        const formattedGenres = genresRes.data.map((item) => ({
          genre: item.genre || item.name,
          count: item.count || item.value,
        }));

        setStats({
          books: books.length,
          members: members.length,
          activeBorrows: activeBorrows.length,
          overdue: overdueBorrows.length,
        });

        setRecentActivities(sortedActivities);
        setGenreData(formattedGenres);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Total Books</h2>
          <p className="text-2xl font-bold">{loading ? "..." : stats.books}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Total Members</h2>
          <p className="text-2xl font-bold">{loading ? "..." : stats.members}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Active Borrows</h2>
          <p className="text-2xl font-bold">
            {loading ? "..." : stats.activeBorrows}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Overdue Books</h2>
          <p className="text-2xl font-bold">
            {loading ? "..." : stats.overdue}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>

        <p className="text-gray-500 mb-6">
          Administrative and library operations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {(role === "admin" || role === "librarian") && (
            <button
              onClick={() => navigate("/borrow")}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition"
            >
              Borrow Book
            </button>
          )}

          {(role === "admin" || role === "librarian") && (
            <button
              onClick={() => navigate("/borrow")}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition"
            >
              Return Book
            </button>
          )}

          {(role === "admin" || role === "librarian") && (
            <button
              onClick={() => navigate("/members")}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition"
            >
              Add Member
            </button>
          )}

          {(role === "admin" || role === "librarian") && (
            <button
              onClick={() => navigate("/books")}
              className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition"
            >
              Add Book
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/genres")}
              className="bg-pink-600 text-white p-4 rounded-lg hover:bg-pink-700 transition"
            >
              Manage Genres
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={() => navigate("/reports")}
              className="bg-gray-800 text-white p-4 rounded-lg hover:bg-black transition"
            >
              Admin Reports
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="text-2xl font-bold mb-2">Recent Activity</h2>

        <p className="text-gray-500 mb-6">
          Recent borrow and return operations
        </p>

        <div className="space-y-4">
          {loading ? (
            <p>Loading activities...</p>
          ) : recentActivities.length === 0 ? (
            <p className="text-gray-500">No recent activities found.</p>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">
                    {activity.book?.title || "Unknown Book"}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Member: {activity.member?.name || "Unknown Member"}
                  </p>

                  <p className="text-sm text-gray-400">
                    Borrowed:{" "}
                    {new Date(activity.borrow_date).toLocaleDateString()}
                  </p>

                  {activity.return_date && (
                    <p className="text-sm text-green-600">
                      Returned:{" "}
                      {new Date(activity.return_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div>
                  {activity.return_date ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Returned
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Borrowed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;