import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Brain, Bell, LogOut, Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { path: '/municipal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/municipal/insights', label: 'AI Insights', icon: Brain },
    { path: '/municipal/alerts', label: 'Send Alerts', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-municipal-900 text-white h-14 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary-400" />
          <span className="font-bold text-sm">SmartGarbage</span>
        </div>
        <button onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-municipal-900 text-white z-50 transition-transform duration-300 
        lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="p-6 border-b border-municipal-800">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">SmartGarbage</p>
              <p className="text-xs text-municipal-400">Municipal Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-municipal-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-municipal-700 rounded-full w-9 h-9 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-municipal-400 truncate">{user?.ward}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-municipal-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
