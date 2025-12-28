import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

// shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  Zap,
} from "lucide-react";

function Analyze() {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newsText, setNewsText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  const loadingIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  useEffect(() => {
    fetchCompanies();
    return () => {
      clearInterval(loadingIntervalRef.current);
      clearInterval(timeIntervalRef.current);
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch {
      setError("Unable to load companies");
    }
  };

  const analyze = async () => {
    if (!companyId || !newsText.trim()) {
      setError("Please select a company and enter ESG-related news");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setResult(null);
      setElapsedTime(0);

      const messages = [
        "Initializing AI analysis...",
        "Analyzing environmental risk...",
        "Evaluating social impact...",
        "Assessing governance factors...",
        "Calculating ESG scores...",
        "Generating analyst insights...",
      ];

      let idx = 0;
      loadingIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMessage(messages[idx]);
      }, 8000);

      timeIntervalRef.current = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);

      const res = await api.post("/esg/analyze", {
        companyId: Number(companyId),
        text: newsText,
      });

      clearInterval(loadingIntervalRef.current);
      clearInterval(timeIntervalRef.current);

      setResult(res.data);
    } catch (err) {
      setError("ESG analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const getRiskConfig = (level) => {
    const configs = {
      HIGH: { variant: "destructive", icon: AlertTriangle },
      MEDIUM: { variant: "warning", icon: TrendingUp },
      LOW: { variant: "success", icon: CheckCircle2 },
    };
    return configs[level] || configs.MEDIUM;
  };

  const riskConfig = result
    ? getRiskConfig(result.overallAssessment.riskLevel)
    : null;
  const RiskIcon = riskConfig?.icon;

  const renderPillar = (label, data) => {
    if (!data) return null;
    const cfg = getRiskConfig(data.risk);
    const Icon = cfg.icon;

    return (
      <Card key={label} className="border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4" /> {label} Pillar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Score</span>
            <span className="font-semibold">{data.score}</span>
          </div>
          <Badge variant={cfg.variant}>{data.risk}</Badge>
          <div className="flex flex-wrap gap-1">
            {data.drivers?.map((d, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {d}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="pt-24 px-6 pb-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7" />
        <div>
          <h1 className="text-3xl font-bold">ESG Risk Analysis</h1>
          <p className="text-sm text-muted-foreground">
            ISS-style event-driven ESG intelligence
          </p>
        </div>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>New Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Select
            value={companyId}
            onValueChange={(val) => {
              setCompanyId(val);
              setSelectedCompany(
                companies.find((c) => String(c.id) === val)
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            rows={8}
            placeholder="Paste ESG-related news..."
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
          />

          <Button onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Analyze ESG"}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              Analysis Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-semibold">{selectedCompany?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ESG Score</p>
                <p className="font-semibold">
                  {result.overallAssessment.esgScore}
                </p>
              </div>
            </div>

            <Badge variant={riskConfig.variant}>
              {result.overallAssessment.riskLevel} RISK
            </Badge>

            <Separator />

            <p className="leading-relaxed">{result.analystSummary}</p>

            <Separator />

            <div className="grid md:grid-cols-3 gap-4">
              {renderPillar("Environmental", result.pillarAssessment.E)}
              {renderPillar("Social", result.pillarAssessment.S)}
              {renderPillar("Governance", result.pillarAssessment.G)}
            </div>

            {result.keyIncidents?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Key Incidents</h4>
                  {result.keyIncidents.map((i, idx) => (
                    <p key={idx} className="text-sm">
                      • {i.incident} ({i.severity})
                    </p>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Analyze;
