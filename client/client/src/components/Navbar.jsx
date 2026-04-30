import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <Link to="/dashboard" className="text-xl font-bold tracking-wide">
          Team Task Manager
        </Link>
        <div className="flex flex-wrap items-center gap-3">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/projects" className="hover:underline">Projects</Link>
        <span className="text-sm bg-blue-800 px-3 py-1 rounded-full">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-3 py-1 rounded font-semibold hover:bg-gray-100"
        >
          Logout
        </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
