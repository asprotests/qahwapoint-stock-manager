import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Coffee, Lock, User } from "lucide-react";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔵 Login attempt started");
    console.log("📦 Credentials:", credentials);

    if (!credentials.username || !credentials.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Calling login function...");
      const result = await login(credentials);
      console.log("✅ Login success!", result);
      toast.success("Login successful!");
      navigate("/orders");
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.response?.data?.message);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-primary-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/images/logo.png"
              alt="QahwaPoint Logo"
              className="h-24 w-24 object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">QahwaPoint</h1>
          <p className="text-gray-600 mt-2">Restaurant Stock Manager</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="input pl-10"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="input pl-10"
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Default credentials:
              <br />
              <span className="font-medium">Username: admin</span>
              <br />
              <span className="font-medium">Password: admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
