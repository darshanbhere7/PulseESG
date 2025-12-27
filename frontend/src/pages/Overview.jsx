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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  LineChart,
  Line,
  Legend,
} from "recharts";

// icons
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  BarChart3,
  Leaf,
  Users,
  Shield,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";

const RISK_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

export default function Overview() {
  const [companies, setCompanies] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

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
        analyses.reduce((sum, a) => {
          const score = a.overallAssessment?.esgScore ?? a.esgScore ?? 0;
          return sum + score;
        }, 0) / analyses.length
      )
      : 0;

  const riskCounts = {
    HIGH: analyses.filter((a) => {
      const risk = a.overallAssessment?.riskLevel ?? a.riskLevel;
      return risk === "HIGH";
    }).length,
    MEDIUM: analyses.filter((a) => {
      const risk = a.overallAssessment?.riskLevel ?? a.riskLevel;
      return risk === "MEDIUM";
    }).length,
    LOW: analyses.filter((a) => {
      const risk = a.overallAssessment?.riskLevel ?? a.riskLevel;
      return risk === "LOW";
    }).length,
  };

  // Calculate trend (mock data - you can replace with actual trend logic)
  const scoreTrend = Math.random() > 0.5 ? "up" : "down";
  const trendValue = Math.floor(Math.random() * 10) + 1;

  // ESG Pillar breakdown (mock data based on scores)


  // Fallback function only - prefer riskLevel from backend AI service
  // This should only be used when riskLevel is truly missing from backend data
  const getRiskLevelFromScore = (score) => {
    // This is a last resort fallback - backend should always provide riskLevel
    const s = Number(score || 0);
    if (s <= 35) return "HIGH";
    if (s <= 65) return "MEDIUM";
    return "LOW";
  };

  // Helper function to get timestamp from analysis record
  const getTs = (rec) => rec?.timestamp || rec?.date || rec?.createdAt || rec?.created_at || rec?.analysisDate || null;

  const pieData = Object.keys(riskCounts).map((key) => ({
    name: key,
    value: riskCounts[key],
  }));

  // Get unique companies with their latest/highest scores for performance charts
  
  const companyPerformanceData = (() => {
    // Group analyses by company and get the latest analysis for each company
    const companyMap = new Map();
    
    analyses.forEach((a) => {
      const companyName = a.companyName;
      const score = Number(a.overallAssessment?.esgScore ?? a.esgScore ?? 0);
      const timestamp = getTs(a);
      
      if (!companyName || isNaN(score)) return;
      
      // Prefer riskLevel from overallAssessment, then fallback to root level, then score-based
      const riskLevel = (a.overallAssessment?.riskLevel ?? a.riskLevel) || (score !== undefined && score !== null ? getRiskLevelFromScore(score) : "UNKNOWN");
      
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          name: companyName,
          score: score,
          riskLevel: riskLevel,
          timestamp: timestamp ? new Date(timestamp).getTime() : 0,
        });
      } else {
        const existing = companyMap.get(companyName);
        const existingTs = existing.timestamp || 0;
        const newTs = timestamp ? new Date(timestamp).getTime() : 0;
        
        // Use the most recent analysis for each company
        if (newTs > existingTs) {
          companyMap.set(companyName, {
            name: companyName,
            score: score,
            riskLevel: riskLevel,
            timestamp: newTs,
          });
        }
      }
    });
    
    return Array.from(companyMap.values());
  })();

  // Top performers: highest scores, descending order (top 5)
  const topPerformersData = [...companyPerformanceData]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Needs attention: lowest scores, ascending order (top 5 - highest risk first)
  const needsAttentionData = [...companyPerformanceData]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  // Build trend data: Average ESG score over time (grouped by time periods)
  const trendData = (() => {
    if (!analyses || analyses.length === 0) {
      return [
        { month: "Jan", score: avgScore - 8 },
        { month: "Feb", score: avgScore - 6 },
        { month: "Mar", score: avgScore - 4 },
        { month: "Apr", score: avgScore - 2 },
        { month: "May", score: avgScore - 1 },
        { month: "Jun", score: avgScore },
      ];
    }

    // Filter analyses with valid scores and timestamps
    const validAnalyses = analyses
      .filter((a) => {
        const score = a?.overallAssessment?.esgScore ?? a?.esgScore;
        const ts = getTs(a);
        return score !== undefined && score !== null && ts;
      })
      .map((a) => ({
        score: Number(a.overallAssessment?.esgScore ?? a.esgScore ?? 0),
        timestamp: new Date(getTs(a)).getTime(),
        date: new Date(getTs(a)),
      }));

    if (validAnalyses.length === 0) {
      return [{ month: "No Data", score: 0 }];
    }

    // Group by month and calculate average score for each month
    const monthlyData = new Map();
    
    validAnalyses.forEach((a) => {
      const year = a.date.getFullYear();
      const month = a.date.getMonth();
      const key = `${year}-${month}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          key,
          year,
          month,
          scores: [],
          date: a.date,
        });
      }
      
      monthlyData.get(key).scores.push(a.score);
    });

    // Convert to array, calculate averages, and sort by date
    const trendArray = Array.from(monthlyData.values())
      .map((item) => {
        const avgScore = item.scores.reduce((sum, s) => sum + s, 0) / item.scores.length;
        const monthName = item.date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
        return {
          month: monthName,
          score: Math.round(avgScore),
          timestamp: item.date.getTime(),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-6); // Last 6 months

    return trendArray.length > 0 ? trendArray : [{ month: "No Data", score: 0 }];
  })();

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ESG Overview</h1>
          <p className="text-muted-foreground">
            AI-driven ESG risk intelligence for portfolio monitoring
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
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
          trend={scoreTrend}
          trendValue={trendValue}
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



      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RISK DISTRIBUTION */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Portfolio risk level breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-4">
              {Object.keys(RISK_COLORS).map((risk) => (
                <div key={risk} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[risk] }}
                  />
                  <span className="text-xs text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SCORE TREND */}
        <Card className="text-foreground">
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>
              Average ESG score over time
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />
                <YAxis />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>




      </div>

      {/* COMPANY PERFORMANCE */}
      <Card className="text-foreground">
        <CardHeader>
          <CardTitle>Company Performance</CardTitle>
          <CardDescription>
            Top and bottom ESG performers in your portfolio
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="top">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="top">Top Performers</TabsTrigger>
              <TabsTrigger value="bottom">Needs Attention</TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="mt-6">
              {topPerformersData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No performance data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {topPerformersData.map((entry, i) => (
                        <Cell key={i} fill={RISK_COLORS[entry.riskLevel]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="bottom" className="mt-6">
              {needsAttentionData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No performance data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={needsAttentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {needsAttentionData.map((entry, i) => (
                        <Cell key={i} fill={RISK_COLORS[entry.riskLevel]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


      {/* TABLE */}
      <Card>
        <CardHeader className="flex items-start gap-4">
          <div>
            <CardTitle>Recent ESG Analyses</CardTitle>
            <CardDescription>Latest ESG risk evaluations performed by the system</CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Risks" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No ESG analyses available
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[420px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>ESG Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead className="flex items-center justify-end">Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {analyses
                      .filter((a) => (companyFilter === "all" ? true : a.companyName === companyFilter))
                      .filter((a) => {
                        const risk = a.overallAssessment?.riskLevel ?? a.riskLevel;
                        return riskFilter === "all" ? true : risk === riskFilter;
                      })
                      .sort((a, b) => {
                        // Sort by timestamp descending (most recent first)
                        const tsA = getTs(a);
                        const tsB = getTs(b);
                        if (!tsA && !tsB) return 0;
                        if (!tsA) return 1;
                        if (!tsB) return -1;
                        return new Date(tsB).getTime() - new Date(tsA).getTime();
                      })
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
                        const score = Number(a.overallAssessment?.esgScore ?? a.esgScore ?? 0);
                        // Prefer riskLevel from overallAssessment, then root level, then fallback
                        const displayRisk = (a.overallAssessment?.riskLevel ?? a.riskLevel) || (score !== undefined && score !== null ? getRiskLevelFromScore(score) : "UNKNOWN");

                        return (
                          <TableRow
                            key={a.analysisId}
                            className="hover:bg-neutral-100 dark:hover:bg-white/5 transition"
                          >
                            <TableCell className="font-medium">{a.companyName}</TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{score}</span>
                                <Progress
                                  value={score}
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

                            <TableCell className="text-sm text-neutral-500 dark:text-neutral-400 text-right">
                              {dateStr}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, icon, description, valueColor = "text-foreground", trend, trendValue }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={`text-2xl font-bold ${valueColor}`}>
            {value}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trendValue}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}