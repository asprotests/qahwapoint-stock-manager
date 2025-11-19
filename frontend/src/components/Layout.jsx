import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  LogOut,
  Coffee,
} from "lucide-react";

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/products", label: "Products", icon: Coffee },
    { path: "/stock", label: "Stock", icon: Package },
    { path: "/suppliers", label: "Suppliers", icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <img
                  src="/images/logo.png"
                  alt="QahwaPoint Logo"
                  className="h-6 w-6 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">QahwaPoint</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-amber-100">
                Welcome,{" "}
                <span className="font-medium text-white">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-amber-100 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-primary-800 border-b border-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive(path)
                    ? "border-amber-300 text-white"
                    : "border-transparent text-amber-100 hover:text-white hover:border-amber-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
