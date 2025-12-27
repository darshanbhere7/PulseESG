import { useEffect, useState } from "react";
import api from "../api/axios";

// Lucide icons
import { 
  Loader2, 
  Trash2, 
  Plus, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Search 
} from "lucide-react";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  // Use real backend API via axios wrapper

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err) {
      console.error("Failed to load companies", err);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    if (!name.trim() || !sector.trim() || !country.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSubmitting(true);
      const payload = { 
        name: name.trim(), 
        sector: sector.trim(), 
        country: country.trim()
      };
      const res = await api.post("/companies", payload);
      // refresh list from backend
      await loadCompanies();
      setName("");
      setSector("");
      setCountry("");
      setSuccess("Company added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to create company", err);
      setError(err?.response?.data?.message || "Failed to create company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCompany = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      setError("");
      await api.delete(`/companies/${deleteId}`);
      // refresh list after delete
      await loadCompanies();
      setSuccess("Company deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete company", err);
      setError(err?.response?.data?.message || "Failed to delete company. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      createCompany();
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 px-6 pb-10 space-y-8 max-w-7xl mx-auto">
      <div>
        {/* HEADER */}
          <div className="mb-8 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl shadow-lg shadow-neutral-700/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Company Master
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage companies available for ESG risk analysis
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS/ERROR ALERTS */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-slideDown">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {success}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800 rounded-xl shadow-sm animate-slideDown">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* CREATE COMPANY CARD */}
        <div className="mb-8 bg-card border-border rounded-2xl shadow-sm overflow-hidden animate-slideUp transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Add New Company
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Enter company details to add to the master database
            </p>
          </div>

          <div className="p-6 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-transparent block select-none">
                  Action
                </label>
                <button
                  onClick={createCompany}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-neutral-900 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg shadow-lg shadow-neutral-700/30 hover:shadow-xl hover:shadow-neutral-700/40 disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Company
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COMPANY TABLE CARD */}
        <div className="bg-card border-border rounded-2xl shadow-sm overflow-hidden animate-slideUp" style={{animationDelay: '100ms'}}>
          <div className="p-6 border-b border-border bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Registered Companies
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'} in database
                </p>
              </div>
              
              {companies.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-400 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Building2 className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No companies yet
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add your first company to get started with ESG analysis
                </p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Search className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Sector
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredCompanies.map((c, index) => (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150 animate-fadeIn"
                          style={{animationDelay: `${index * 50}ms`}}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Building2 className="h-5 w-5 text-slate-900 dark:text-white" />
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {c.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-black/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {c.sector}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {c.country}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setDeleteId(c.id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            ></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full animate-scaleIn">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                This will permanently delete this company from the database. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteCompany}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Companies;