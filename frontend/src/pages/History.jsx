import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

// shadcn/ui
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";

// Recharts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function History() {
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() => update());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const mqHandler = (e) => update();
    if (mq && mq.addEventListener) mq.addEventListener("change", mqHandler);
    return () => {
      obs.disconnect();
      if (mq && mq.removeEventListener) mq.removeEventListener("change", mqHandler);
    };
  }, []);

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const companyRes = await api.get("/companies");
      const companies = companyRes.data || [];

      const historyRequests = companies.map((c) =>
        api.get(`/esg/history/${c.id}`)
      );

      const historyResponses = await Promise.all(historyRequests);
      const allAnalyses = historyResponses.flatMap(
        (res) => res.data || []
      );

      setAnalyses(allAnalyses);
    } catch (err) {
      console.error("Failed to load ESG history", err);
      setError("Unable to load ESG history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDate = (a) => {
    if (!a?.timestamp) return "—";
    try {
      return new Date(a.timestamp).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  // Computed data for charts
  const chartData = useMemo(() => {
    if (!analyses.length) {
      return {
        riskDistribution: [],
        scoreDistribution: [],
        timeline: [],
        companyAverages: [],
      };
    }

    // Risk distribution
    const riskDist = analyses.reduce((acc, a) => {
      const risk = a.riskLevel || "UNKNOWN";
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    const riskDistribution = Object.entries(riskDist).map(([name, value]) => ({
      name,
      value,
    }));

    // Score distribution: Group by actual risk levels from backend (HIGH, MEDIUM, LOW)
    // Reuse the existing riskDist object which already has the counts by risk level
    // Ensure HIGH, MEDIUM, LOW are always present (even if count is 0)
    const scoreDistribution = ["HIGH", "MEDIUM", "LOW"].map((risk) => ({
      riskLevel: risk,
      count: riskDist[risk] || 0,
    }));

    // Timeline data (last 10 analyses)
    const timeline = [...analyses]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-10)
      .map((a) => ({
        date: getDate(a),
        score: a.esgScore,
        company: a.companyName,
      }));

    // Company averages
    const companyScores = analyses.reduce((acc, a) => {
      const name = a.companyName;
      if (!acc[name]) acc[name] = { scores: [], risks: [] };
      acc[name].scores.push(a.esgScore || 0);
      acc[name].risks.push(a.riskLevel || "UNKNOWN");
      return acc;
    }, {});

    const companyAverages = Object.entries(companyScores)
      .map(([company, data]) => {
        const avgScore = Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length);
        // determine most common risk level for the company
        const riskCounts = data.risks.reduce((rAcc, r) => {
          rAcc[r] = (rAcc[r] || 0) + 1;
          return rAcc;
        }, {});
        const mostCommonRisk = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        // Use actual risk level from backend, only fallback to score-based if truly missing
        const riskLevel = mostCommonRisk || "UNKNOWN";
        return {
          company,
          avgScore,
          riskLevel,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 8);

    return {
      riskDistribution,
      scoreDistribution,
      timeline,
      companyAverages,
    };
  }, [analyses]);

  // Statistics
  const stats = useMemo(() => {
    if (!analyses.length) return null;

    const scores = analyses.map((a) => a.esgScore || 0);
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const highRisk = analyses.filter((a) => a.riskLevel === "HIGH").length;
    const lowRisk = analyses.filter((a) => a.riskLevel === "LOW").length;

    return {
      total: analyses.length,
      avgScore,
      highRisk,
      lowRisk,
      improvement: avgScore > 50,
    };
  }, [analyses]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      const matchCompany = selectedCompany === "all" || a.companyName === selectedCompany;
      const matchRisk = selectedRisk === "all" || a.riskLevel === selectedRisk;
      return matchCompany && matchRisk;
    });
  }, [analyses, selectedCompany, selectedRisk]);

  // Unique companies and risk levels
  const companies = useMemo(() => {
    return [...new Set(analyses.map((a) => a.companyName))];
  }, [analyses]);

  const riskLevels = useMemo(() => {
    return [...new Set(analyses.map((a) => a.riskLevel))];
  }, [analyses]);

  const COLORS = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#10b981",
    UNKNOWN: "#6b7280",
  };

  const getRiskLevelFromScore = (score) => {
    const s = Number(score || 0);
    if (s <= 35) return "HIGH";
    if (s <= 65) return "MEDIUM";
    return "LOW";
  };

  return (
    <div className="pt-24 px-6 pb-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          ESG Analysis History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historical ESG scores and risk classifications across all analyzed companies
        </p>
      </div>

      <Separator className="mb-6" />

      {/* LOADING STATE */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-32 w-full bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
          <Skeleton className="h-96 w-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && analyses.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No ESG analysis history available
          </CardContent>
        </Card>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && analyses.length > 0 && (
        <div className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-muted-foreground">Total Analyses</CardDescription>
                <CardTitle className="text-2xl text-foreground">
                  {stats.total}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  <span>All time</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-muted-foreground">Avg ESG Score</CardDescription>
                <CardTitle className="text-2xl text-foreground">
                  {stats.avgScore}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs">
                  {stats.improvement ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Good performance</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Needs improvement</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">High Risk</CardDescription>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  {stats.highRisk}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={stats.total ? (stats.highRisk / stats.total) * 100 : 0}
                  className="h-2 bg-neutral-200 dark:bg-neutral-800"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {stats.total ? Math.round((stats.highRisk / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Low Risk</CardDescription>
                <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
                  {stats.lowRisk}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={stats.total ? (stats.lowRisk / stats.total) * 100 : 0}
                  className="h-2 bg-neutral-200 dark:bg-neutral-800 [&>div]:bg-emerald-500"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {stats.total ? Math.round((stats.lowRisk / stats.total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* TABS FOR CHARTS AND TABLE */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-card">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="table">
                <CalendarDays className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RISK DISTRIBUTION PIE CHART */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Risk Distribution
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Breakdown of risk levels across analyses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.riskDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.UNKNOWN} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            color: 'hsl(var(--foreground))',
                            borderRadius: 8,
                          }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* SCORE DISTRIBUTION BAR CHART */}
                <Card className="bg-card border-border text-foreground">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Score Distribution
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Distribution by risk level (from AI analysis)
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="riskLevel" />
                        <YAxis />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />

                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.scoreDistribution.map((entry, i) => {
                            const risk = entry.riskLevel || "UNKNOWN";
                            return (
                              <Cell
                                key={`cell-score-${i}`}
                                fill={COLORS[risk] || COLORS.UNKNOWN}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>

              {/* COMPANY AVERAGES */}
              <Card className="bg-card border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-base">
                    Company Performance
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Average ESG scores by company
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.companyAverages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="company"
                        type="category"
                        width={120}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />

                      <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                        {chartData.companyAverages.map((entry, i) => (
                          <Cell
                            key={`cell-company-${i}`}
                            fill={COLORS[entry.riskLevel] || COLORS.UNKNOWN}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>  
              </Card>

            </TabsContent>

            {/* TRENDS TAB */}
            <TabsContent value="trends">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    ESG Score Timeline
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Recent ESG score progression (last 10 analyses)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                      <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          border: `1px solid var(--color-border)`,
                          borderRadius: '6px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-primary)', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TABLE TAB */}
            <TabsContent value="table">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-base text-foreground">
                        Recent ESG Analyses
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Latest ESG risk evaluations performed by the system
                      </CardDescription>
                    </div>

                    {/* FILTERS */}
                    <div className="flex gap-2">
                      <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="all">All Companies</SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company} value={company}>
                              {company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="All Risks" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="all">All Risks</SelectItem>
                          {riskLevels.map((risk) => (
                            <SelectItem key={risk} value={risk}>
                              {risk}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>ESG Score</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredAnalyses.map((a) => {
                            // Prefer riskLevel from backend AI service, only use fallback if missing
                            const displayRisk = a.riskLevel || (a.esgScore !== undefined && a.esgScore !== null ? getRiskLevelFromScore(a.esgScore) : "UNKNOWN");
                            return (
                              <TableRow
                                key={a.analysisId}
                                className="hover:bg-neutral-100 dark:hover:bg-white/5 transition"
                              >
                                <TableCell className="font-medium">
                                  {a.companyName}
                                </TableCell>

                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{a.esgScore}</span>
                                    <Progress
                                      value={a.esgScore}
                                      className={`h-2 w-20 bg-neutral-200 dark:bg-neutral-800 ${displayRisk === 'HIGH'
                                          ? '[&>div]:bg-red-500 dark:[&>div]:bg-red-400'
                                          : displayRisk === 'MEDIUM'
                                            ? '[&>div]:bg-amber-500 dark:[&>div]:bg-amber-400'
                                            : '[&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400'
                                        }`}
                                    />
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <Badge
                                    variant={
                                      displayRisk === "HIGH"
                                        ? "destructive"
                                        : displayRisk === "MEDIUM"
                                          ? "secondary"
                                          : "default"
                                    }
                                    className={
                                      displayRisk === "LOW"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : ""
                                    }
                                  >
                                    {displayRisk}
                                  </Badge>
                                </TableCell>

                                <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {getDate(a)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default History;