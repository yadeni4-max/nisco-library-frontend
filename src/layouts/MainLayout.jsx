import { Link, useNavigate } from "react-router-dom";
import { logout, getRole } from "../utils/auth";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">
          Library Manager
        </h1>

        <nav className="flex flex-col gap-4">

          {/* COMMON (Admin + Librarian) */}
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/books">Books</Link>
          <Link to="/borrow">Borrow / Return</Link>
          <Link to="/members">Members</Link>

          {/* ADMIN ONLY SECTION */}
          {role === "admin" && (
            <>
              
              <Link to="/genres">Genres</Link>
              <Link to="/staff">Staff</Link>
              <Link to="/reports">Reports</Link>
            </>
          )}

        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;