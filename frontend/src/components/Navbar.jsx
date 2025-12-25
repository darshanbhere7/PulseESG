import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/PulseESGlogo.png";
import { Sun, Moon } from "lucide-react";

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Normalize theme values and apply on mount
  useEffect(() => {
    const raw = localStorage.getItem("theme");
    const normalize = (v) => {
      if (!v) return "dark";
      if (v === "dark" || v === "light") return v;
      if (v === "true") return "dark";
      if (v === "false") return "light";
      return "dark";
    };
    const savedTheme = normalize(raw);
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", savedTheme);
  }, []);

  // Toggle theme immediately and persist
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next);
  };

  // ❌ Hide navbar on public pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const role = localStorage.getItem("role");

  const logout = () => {
    // Preserve theme when logging out so the login page keeps the user's preference
    const currentTheme = localStorage.getItem("theme");
    localStorage.clear();
    if (currentTheme) localStorage.setItem("theme", currentTheme);
    navigate("/login");
  };

  const navItems = [
    { name: "Overview", link: "/overview" },
    { name: "Analyze", link: "/analyze" },
    { name: "History", link: "/history" },
    ...(role === "ADMIN" ? [{ name: "Companies", link: "/companies" }] : []),
    { name: "Profile", link: "/profile" },
  ];

  return (
    <Navbar
      className="
        fixed top-0 left-0 right-0 z-50
        bg-white/80 dark:bg-black/70
        backdrop-blur-md
        border-b border-neutral-200 dark:border-neutral-800
      "
      containerClassName="max-w-none px-6"
    >
      {/* ================= DESKTOP ================= */}
      <NavBody className="h-14">
        {/* LOGO */}
        <button
          onClick={() => navigate("/overview")}
          className="flex items-center gap-3"
        >
          <img src={logo} alt="PulseESG" className="h-8 w-auto" />
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            PulseESG
          </span>
        </button>

        <NavItems
          items={navItems}
          className="
            text-sm font-medium
            text-neutral-600 dark:text-neutral-300
            [&_a:hover]:text-neutral-900 dark:[&_a:hover]:text-white
          "
        />

        <div className="flex items-center gap-2">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="
              h-9 w-9 flex items-center justify-center rounded-md
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              transition
            "
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-neutral-300" />
            ) : (
              <Sun className="h-5 w-5 text-neutral-700" />
            )}
          </button>

          <NavbarButton
            variant="primary"
            onClick={logout}
            className="
              h-9 px-4 text-sm
              bg-neutral-900 dark:bg-white
              text-white dark:text-neutral-900
              hover:bg-neutral-800 dark:hover:bg-neutral-100
            "
          >
            Logout
          </NavbarButton>
        </div>
      </NavBody>

      {/* ================= MOBILE ================= */}
      <MobileNav>
        <MobileNavHeader className="h-14 px-4">
          <button
            onClick={() => navigate("/overview")}
            className="flex items-center gap-2"
          >
            <img src={logo} className="h-7" />
            <span className="font-semibold">PulseESG</span>
          </button>

          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                navigate(item.link);
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-base"
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={toggleTheme}
            className="mt-4 flex items-center gap-2 text-left"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />} Toggle Theme
          </button>

          <NavbarButton
            variant="primary"
            onClick={logout}
            className="mt-4"
          >
            Logout
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
