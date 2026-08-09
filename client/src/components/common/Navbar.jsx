import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAPI } from '../../services/api';
import { FiLogOut, FiUser, FiBell, FiMenu, FiX, FiCheck } from 'react-icons/fi';
import { useCallback, useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      // Notifications are supplementary; don't interrupt the dashboard if a refresh fails.
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const refreshId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(refreshId);
  }, [fetchNotifications, user?._id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, read: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
      try {
        await notificationAPI.markRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        fetchNotifications();
      }
    }

    const videoId = notification.video?._id || notification.video;
    if (videoId) {
      navigate(user?.role === 'teacher' ? `/teacher/video/${videoId}` : `/student/watch/${videoId}`);
    }
    setShowNotifications(false);
  };

  const markAllNotificationsRead = async () => {
    if (!unreadCount) return;
    try {
      await notificationAPI.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const formatNotificationTime = (date) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
            {/* Notifications */}
            <button
              onClick={() => {
                setShowNotifications((open) => !open);
                if (!showNotifications) fetchNotifications();
              }}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
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
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => {
                setShowNotifications((open) => !open);
                if (!showNotifications) fetchNotifications();
              }}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full animate-pulse-soft" />
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-4 sm:right-6 top-[4.5rem] w-[calc(100vw-2rem)] sm:w-96 max-h-[28rem] overflow-hidden rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/70">
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              {unreadCount > 0 && <p className="text-xs text-surface-400">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs font-medium text-accent-cyan hover:text-white transition-colors"
              >
                <FiCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <div className="p-4 space-y-3">
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FiBell className="w-7 h-7 mx-auto mb-2 text-surface-500" />
                <p className="text-sm text-surface-400">You’re all caught up.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-surface-800 last:border-0 transition-colors hover:bg-surface-800/80 ${
                    notification.read ? '' : 'bg-accent-cyan/5'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-surface-600' : 'bg-accent-cyan'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <span className="shrink-0 text-[11px] text-surface-500">{formatNotificationTime(notification.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-5 text-surface-400">{notification.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

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
