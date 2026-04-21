import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiUpload,
  FiVideo,
  FiBarChart2,
  FiMessageSquare,
  FiGrid,
  FiTrendingUp,
} from 'react-icons/fi';

const Sidebar = () => {
  const { isTeacher, isStudent } = useAuth();
  const location = useLocation();

  const teacherLinks = [
    { to: '/teacher', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/teacher/upload', icon: FiUpload, label: 'Upload Video' },
    { to: '/teacher/my-videos', icon: FiVideo, label: 'My Videos' },
    { to: '/teacher/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const studentLinks = [
    { to: '/student', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/student/videos', icon: FiGrid, label: 'Browse Videos' },
    { to: '/student/my-feedback', icon: FiMessageSquare, label: 'My Feedback' },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-surface-900/50 border-r border-surface-700/50">
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20 shadow-neon/10'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-bg flex items-center justify-center">
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            {isTeacher
              ? 'Upload videos & track student engagement'
              : 'Watch lectures & share your feedback'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
