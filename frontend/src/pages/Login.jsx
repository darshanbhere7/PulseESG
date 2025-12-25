import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {}
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      navigate("/overview", { replace: true });
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-neutral-100 dark:bg-black transition-colors">

      {/* Glow */}
      <div className="relative w-full max-w-md">
        <div className="
          absolute inset-0 rounded-2xl blur-xl
          bg-gradient-to-br from-cyan-400/20 via-indigo-400/20 to-purple-400/20
          dark:from-cyan-500/30 dark:via-indigo-500/30 dark:to-purple-500/30
        " />

        {/* Card */}
        <div className="
          relative rounded-2xl p-8 backdrop-blur-xl
          border border-neutral-200 dark:border-white/10
          bg-white/80 dark:bg-black/80
          shadow-xl
        ">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white text-center">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 text-center">
            Login to continue to <span className="font-medium">PulseESG</span>
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  w-full rounded-md px-4 py-2 outline-none transition
                  bg-white dark:bg-neutral-900
                  text-neutral-900 dark:text-white
                  placeholder-neutral-400
                  border border-neutral-300 dark:border-white/10
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full rounded-md px-4 py-2 outline-none transition
                  bg-white dark:bg-neutral-900
                  text-neutral-900 dark:text-white
                  placeholder-neutral-400
                  border border-neutral-300 dark:border-white/10
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                "
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="
                group relative w-full overflow-hidden rounded-md py-2 font-medium
                bg-neutral-900 text-white hover:bg-neutral-800
                dark:bg-white dark:text-black dark:hover:bg-neutral-200
                transition
              "
            >
              Login →
              <span className="
                absolute inset-x-0 bottom-0 h-px
                bg-gradient-to-r from-transparent via-cyan-500 to-transparent
                opacity-0 group-hover:opacity-100 transition
              " />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
