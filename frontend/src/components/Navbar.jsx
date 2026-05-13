import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const NavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors duration-200 ${
        active ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-primary to-primary-light" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07]"
      style={{
        background: 'rgba(6, 4, 23, 0.85)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
      }}
    >
      {/* Top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 group-hover:border-primary/50 transition-all duration-300">
              <HiOutlineAcademicCap className="w-4.5 h-4.5 text-primary-light" />
              <div className="absolute inset-0 rounded-xl bg-primary/10 blur-sm group-hover:bg-primary/20 transition-all duration-300" />
            </div>
            <span
              className="text-lg font-bold shimmer-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              LMS Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/courses">Courses</NavLink>

            {user ? (
              <>
                {isAdmin ? (
                  <NavLink to="/admin/dashboard">Admin Panel</NavLink>
                ) : (
                  <>
                    <NavLink to="/dashboard">My Learning</NavLink>
                    <NavLink to="/wishlist">Wishlist</NavLink>
                    <NavLink to="/payments">Payments</NavLink>
                  </>
                )}

                {/* User pill */}
                <div className="flex items-center gap-2 pl-5 border-l border-white/[0.08]">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                      <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-xs font-semibold leading-none">{user.name}</p>
                      <p className="text-gray-500 text-[10px] capitalize mt-0.5">{user.role}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent/15 hover:text-accent text-gray-500 font-medium border border-white/5 hover:border-accent/20"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink to="/login">Sign In</NavLink>
                <Link
                  to="/register"
                  className="btn-glow px-4 py-2 text-white text-sm font-semibold rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10"
          >
            {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/[0.07] px-4 pb-5 pt-3 space-y-1"
          style={{ background: 'rgba(6, 4, 23, 0.95)', backdropFilter: 'blur(24px)' }}
        >
          {[
            { to: '/courses', label: 'Courses' },
            ...(user
              ? isAdmin
                ? [{ to: '/admin/dashboard', label: 'Admin Panel' }]
                : [
                    { to: '/dashboard', label: 'My Learning' },
                    { to: '/wishlist', label: 'Wishlist' },
                    { to: '/payments', label: 'Payments' },
                    { to: '/profile', label: 'Profile' },
                  ]
              : [
                  { to: '/login', label: 'Sign In' },
                  { to: '/register', label: 'Get Started' },
                ]),
          ].map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-white border border-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />}
                {label}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-accent/80 hover:text-accent hover:bg-accent/5"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
