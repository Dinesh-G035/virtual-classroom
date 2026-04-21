import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiBell, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = user?.role === 'teacher'
    ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/30'
    : 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30';

  return (
    <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-neon group-hover:shadow-neon-lg transition-shadow">
              <span className="text-white font-bold text-sm">VC</span>
            </div>
            <span className="text-lg font-display font-bold text-white hidden sm:block">
              Virtual<span className="gradient-text">Class</span>
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Visual notification bell */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              <FiBell className="w-5 h-5" />
              {showNotification && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full animate-pulse-soft" />
              )}
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface-800/50 border border-surface-700/50">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                <span className={`inline-block px-1.5 py-0 text-[10px] font-semibold uppercase rounded border ${roleBadge}`}>
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-700/50 bg-surface-900/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-800/50">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <span className={`inline-block px-1.5 py-0 text-[10px] font-semibold uppercase rounded border ${roleBadge}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
