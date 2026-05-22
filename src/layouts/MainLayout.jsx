import { Link, useNavigate } from "react-router-dom";
import { logout, getRole, getUser } from "../utils/auth";

import logo from "../assets/logo.png";
import banner from "../assets/banner.gif";

function MainLayout({ children }) {
  const navigate = useNavigate();

  const user = getUser();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-amber-800 text-white p-5 flex flex-col">

        <h1 className="text-2xl font-bold text-center">
          NISCO Library Manager
        </h1>

        <img
          src={logo}
          alt="Library Logo"
          className="w-24 h-24 object-contain mb-6 self-center"
        />

        <div className="mb-6 p-3 bg-blue-700 rounded">
          <p className="text-sm">👤 {user?.name || user?.email}</p>
          <p className="text-xs text-blue-200">
            Role: {role}
          </p>
        </div>

        <nav className="flex flex-col gap-3 text-sm">

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

        {/* ✅ THIN HEADER BANNER (NEW ADDITION) */}
        <div
          className="w-full h-20 mb-6 rounded-lg overflow-hidden relative"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
         
        </div>

        {/* Page Content */}
        <div className="bg-white p-6 rounded">
          {children}
        </div>

      </div>

    </div>
  );
}

export default MainLayout;