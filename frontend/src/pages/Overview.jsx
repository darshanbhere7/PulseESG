import { useEffect, useState } from "react";
import api from "../api/axios";

// shadcn ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// removed Badge import: use compact pill spans for risk level styling
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// charts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// icons
import { TrendingUp, AlertTriangle, Building2, BarChart3 } from "lucide-react";

const RISK_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

export default function Overview() {
  const [companies, setCompanies] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const companyRes = await api.get("/companies");
      const companyList = companyRes.data || [];
      setCompanies(companyList);

      const historyRequests = companyList.map((c) =>
        api.get(`/esg/history/${c.id}`)
      );

      const historyResponses = await Promise.all(historyRequests);

      const allAnalyses = historyResponses.flatMap(
        (res) => res.data || []
      );

      setAnalyses(allAnalyses);
    } catch (err) {
      console.error("Failed to load overview data", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== METRICS =====
  const avgScore =
    analyses.length > 0
      ? Math.round(
          analyses.reduce((sum, a) => sum + (a.esgScore || 0), 0) /
            analyses.length
        )
      : 0;

  const riskCounts = {
    HIGH: analyses.filter((a) => a.riskLevel === "HIGH").length,
    MEDIUM: analyses.filter((a) => a.riskLevel === "MEDIUM").length,
    LOW: analyses.filter((a) => a.riskLevel === "LOW").length,
  };

  const pieData = Object.keys(riskCounts).map((key) => ({
    name: key,
    value: riskCounts[key],
  }));

  const barData = analyses.slice(0, 6).map((a) => ({
    name: a.companyName,
    score: a.esgScore,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Score:{" "}
            <span className="font-semibold text-primary">
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            Loading ESG overview…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ESG Overview</h1>
        <p className="text-muted-foreground">
          Portfolio-level ESG risk intelligence
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Companies"
          value={companies.length}
          icon={<Building2 className="h-5 w-5" />}
          description="In portfolio"
        />
        <KpiCard
          title="Average ESG Score"
          value={avgScore}
          icon={<BarChart3 className="h-5 w-5" />}
          description="Portfolio average"
          valueColor="text-primary"
        />
        <KpiCard
          title="High Risk"
          value={riskCounts.HIGH}
          icon={<AlertTriangle className="h-5 w-5" />}
          description="Critical attention"
          valueColor="text-destructive"
        />
        <KpiCard
          title="Medium / Low Risk"
          value={`${riskCounts.MEDIUM} / ${riskCounts.LOW}`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Stable companies"
          valueColor="text-success"
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="flex items-start gap-4">
          <div>
            <CardTitle>Recent ESG Analyses</CardTitle>
            <CardDescription>Latest ESG risk evaluations performed by the system</CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-card border border-border text-foreground text-sm"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No ESG analyses available
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>ESG Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses
                  .filter((a) => (companyFilter === "ALL" ? true : a.companyName === companyFilter))
                  .filter((a) => (riskFilter === "ALL" ? true : a.riskLevel === riskFilter))
                  .slice(0, 5)
                  .map((a) => {
                    const getDateStr = (rec) => {
                      const val = rec?.timestamp || rec?.date || rec?.createdAt || rec?.created_at || rec?.analysisDate;
                      if (!val) return "-";
                      try {
                        return new Date(val).toLocaleDateString();
                      } catch {
                        return "-";
                      }
                    };

                    const dateStr = getDateStr(a);
                    const score = Number(a.esgScore || 0);

                    return (
                      <TableRow key={a.analysisId}>
                        <TableCell className="font-medium">{a.companyName}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 text-sm font-medium">{score}</div>
                            <div className="w-44 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full"
                                style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: 'var(--color-primary)' }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: RISK_COLORS[a.riskLevel] || '#6b7280',
                              color: '#fff',
                            }}
                          >
                            {a.riskLevel}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">{dateStr}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, description, valueColor = "text-foreground" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
