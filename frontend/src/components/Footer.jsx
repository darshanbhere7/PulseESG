import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/PulseESGlogo.png";

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide footer on public pages
  if (
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div
                className="flex items-center gap-3 cursor-pointer group mb-6"
                onClick={() => navigate("/overview")}
              >
                <img 
                  src={logo} 
                  alt="PulseESG" 
                  className="h-9 w-auto transition-transform group-hover:scale-105" 
                />
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  PulseESG
                </span>
              </div>

              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
                Enterprise-grade ESG risk intelligence platform delivering AI-driven insights for responsible and informed decision-making.
              </p>

              <div className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@pulseesg.com" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                    support@pulseesg.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Mumbai, India</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigate("/overview")}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/analyze")}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Analyze
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/history")}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    History
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Profile
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    ESG Methodology
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Risk Scoring
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Documentation
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    API Reference
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Compliance
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <span>© {new Date().getFullYear()}</span>
              <span className="font-semibold text-neutral-900 dark:text-white">PulseESG</span>
              <span>· All rights reserved</span>
            </div>

            <div className="flex items-center gap-1">
              <span>Developed by</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                Darshan Bhere
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}