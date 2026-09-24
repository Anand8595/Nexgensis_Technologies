import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { localOverlayService } from '../../services/localOverlayService';
import { LogOut, Package2, RotateCcw, User } from 'lucide-react';

export default function Navbar({ onResetData }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login');
  };

  const handleResetSimulatedData = () => {
    localOverlayService.resetOverlay();
    showToast('Simulated added/edited products have been reset to default API data.', 'info');
    if (onResetData) {
      onResetData();
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Package2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    NexStore
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  Inventory & Product Control
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Reset mock cache shortcut */}
            <button
              type="button"
              onClick={handleResetSimulatedData}
              title="Reset any mock products added, edited or deleted"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors border border-slate-200/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Mock Edits</span>
            </button>

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 bg-slate-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white rounded-full"></span>
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    @{user.username}
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
