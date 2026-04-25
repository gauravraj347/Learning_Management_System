import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <HiOutlineAcademicCap className="w-8 h-8 text-primary group-hover:text-primary-light" />
            <span className="text-xl font-bold gradient-text">LMS Pro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/courses" className="text-gray-300 hover:text-white text-sm font-medium">
              Courses
            </Link>

            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin/dashboard" className="text-gray-300 hover:text-white text-sm font-medium">
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm font-medium">
                      My Learning
                    </Link>
                    <Link to="/wishlist" className="text-gray-300 hover:text-white text-sm font-medium">
                      Wishlist
                    </Link>
                    <Link to="/payments" className="text-gray-300 hover:text-white text-sm font-medium">
                      Payments
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <Link to="/profile" className="flex items-center gap-3 hover:opacity-80">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-primary-light">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-3 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-gray-400 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/10 px-4 pb-4 pt-2 space-y-2">
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
            Courses
          </Link>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                    My Learning
                  </Link>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                    Wishlist
                  </Link>
                  <Link to="/payments" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                    Payments
                  </Link>
                </>
              )}
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300 hover:text-white">
                Profile
              </Link>
              <button onClick={handleLogout} className="w-full text-left py-2 text-accent">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-300">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-primary-light">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
