import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-slate-500 py-2">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/products"
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              {isLast || !item.to ? (
                <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-slate-600 hover:text-indigo-600 transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
