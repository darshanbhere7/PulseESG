import { useEffect, useState } from "react";
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

import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Shield,
} from "lucide-react";

function Analyze() {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [newsText, setNewsText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanies();
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

      const res = await api.post("/analyze", {
        companyId: Number(companyId),
        newsText,
      });

      setResult(res.data);
    } catch {
      setError("ESG analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (level) => {
    const configs = {
      HIGH: {
        variant: "destructive",
        icon: AlertTriangle,
        border: "border-red-200",
      },
      MEDIUM: {
        variant: "warning",
        icon: TrendingUp,
        border: "border-amber-200",
      },
      LOW: {
        variant: "success",
        icon: CheckCircle2,
        border: "border-green-200",
      },
    };
    return configs[level] || configs.MEDIUM;
  };

  const riskConfig = result ? getRiskConfig(result.riskLevel) : null;
  const RiskIcon = riskConfig?.icon;

  const renderSignals = (signals, type) => {
    const label = type === "positive" ? "Positive Signals" : "Risk Signals";
    const color = type === "positive" ? "success" : "destructive";

    const items =
      signals &&
      Object.entries(signals).flatMap(([pillar, values]) =>
        values.map((v) => `${pillar}: ${v}`)
      );

    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-semibold">{label}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant={color}>
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-24 px-6 pb-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7" />
        <div>
          <h1 className="text-3xl font-bold">ESG Risk Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Event-based ESG intelligence (ISS / MSCI style)
          </p>
        </div>
      </div>

      {/* INPUT CARD */}
      <Card>
        <CardHeader>
          <CardTitle>New Analysis</CardTitle>
          <CardDescription>
            Select a company and paste ESG-related news
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Select value={companyId} onValueChange={setCompanyId}>
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
            placeholder="Paste ESG-related content..."
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
          />

          <Button onClick={analyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              "Analyze ESG"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* RESULT */}
      {result && (
        <Card className={`border-2 ${riskConfig.border}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiskIcon className="h-5 w-5" />
              Analysis Result
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p>
              <strong>Company:</strong> {result.company}
            </p>
            <p>
              <strong>ESG Score:</strong> {result.esgScore}
            </p>

            <Badge variant={riskConfig.variant}>
              {result.riskLevel} RISK
            </Badge>

            <Separator />

            <p>{result.explanation}</p>

            {renderSignals(result.signals, "positive")}
            {renderSignals(result.signals, "negative")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Analyze;
