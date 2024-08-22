import { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { useUser } from "~/context/UserContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { username, setUsername } = useUser();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("uname");
      setUsername(null);
      navigate("/login");
    }
  };

  return (
    <header className="bg-indigo-600 shadow-md">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">
          Domain In Domain
        </Link>
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
        <nav className="hidden md:flex md:items-center md:space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">
            Home
          </Link>
          {username ? (
            <>
              <span className="text-white">Welcome, {username}</span>
              <Link
                to="/manage"
                className="text-white hover:text-gray-200"
              >
                Manage
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white hover:text-gray-200">
              Login
            </Link>
          )}
        </nav>
      </div>
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out md:hidden ${
          isOpen ? "max-h-40" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center">
          <Link to="/" className="block text-white py-2">
            Home
          </Link>
          {username ? (
            <>
              <span className="block text-white py-2">Welcome, {username}</span>
              <Link
                to="/manage"
                className="block text-white hover:text-gray-200 py-2"
              >
                Manage
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-500 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-white py-2">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
