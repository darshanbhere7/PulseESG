import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import GlobeDemo from "@/components/GlobeDemo";

export default function Home() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const features = [
    {
      title: "AI-Driven Risk Scoring",
      desc: "Machine-learning powered ESG sentiment analysis with explainable Low / Medium / High risk outputs and detailed risk breakdowns.",
    },
    {
      title: "Global Coverage",
      desc: "Track ESG signals across 150+ countries, supply chains, and jurisdictions in real time with comprehensive data sources.",
    },
    {
      title: "Audit & Compliance Ready",
      desc: "Complete ESG audit trails, role-based access, and secure JWT-protected workflows that meet regulatory standards.",
    },
    {
      title: "Real-Time Monitoring",
      desc: "Stay ahead of emerging risks with continuous monitoring of news, regulatory changes, and market sentiment.",
    },
    {
      title: "Custom Reports",
      desc: "Generate institutional-grade reports tailored to your stakeholders with one click, exportable in multiple formats.",
    },
    {
      title: "Integration Ready",
      desc: "Seamlessly integrate with your existing workflows via REST API, webhooks, and enterprise SSO solutions.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of ESG Risk, Apex Capital",
      content: "PulseESG transformed how we assess portfolio risks. The AI-driven insights are incredibly accurate, and the audit trails give us confidence in our compliance reporting.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Sustainability Officer, GreenTech Ventures",
      content: "The global coverage is unmatched. We can now monitor ESG signals across our entire supply chain in real time, which was impossible before.",
      rating: 5,
    },
    {
      name: "Dr. Emily Watson",
      role: "Investment Analyst, Horizon Fund",
      content: "Finally, an ESG platform that speaks our language. The risk scoring is transparent, explainable, and aligns perfectly with our investment thesis.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "150+", label: "Countries Covered" },
    { value: "10M+", label: "Data Points Analyzed" },
    { value: "500+", label: "Enterprise Clients" },
    { value: "99.9%", label: "Platform Uptime" },
  ];

  return (
    <main className="bg-white dark:bg-black text-black dark:text-white">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 z-50 rounded-md bg-black/60 p-2 text-white backdrop-blur-md"
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a.75.75 0 01.75.75V4a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM15.657 4.343a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75H16a.75.75 0 010-1.5h1.25A.75.75 0 0118 10zM15.657 15.657a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 111.06-1.06l1.06 1.06zM10 16a.75.75 0 01.75.75V18a.75.75 0 01-1.5 0v-1.25A.75.75 0 0110 16zM4.343 15.657a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06zM2 10a.75.75 0 01.75-.75H4a.75.75 0 010 1.5H2.75A.75.75 0 012 10zM4.343 4.343a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06L4.343 4.343zM10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Hero with Globe */}
      <GlobeDemo />

      {/* Stats Bar */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white">
            Institutional-Grade ESG Intelligence
          </h2>

          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            PulseESG empowers investment firms, analysts, and compliance teams to assess environmental, social, and governance risks with unprecedented transparency, explainability, and audit-ready analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/login">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                Login to Dashboard
              </button>
            </Link>

            <Link to="/register">
              <button className="px-8 py-4 rounded-lg border-2 border-neutral-300 dark:border-neutral-700 hover:border-cyan-500 dark:hover:border-cyan-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-300 font-semibold">
                Register
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powerful Features for Modern ESG Analysis
          </h2>
          <p className="text-center text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">
            Everything you need to make informed ESG decisions with confidence
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white dark:bg-black rounded"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-center text-neutral-600 dark:text-neutral-400 mb-12">
            See what industry leaders are saying about PulseESG
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-xl p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Make ESG Decisions with Confidence
        </h3>
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Built for modern finance, governance, and sustainability teams. Join 500+ institutions already using PulseESG.
        </p>
        <div className="mt-8">
          <Link to="/register">
            <button className="px-10 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
              Get Started Today
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}