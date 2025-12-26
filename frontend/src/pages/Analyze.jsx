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
    
    // Cleanup intervals on unmount
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
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
      setLoadingMessage("Initializing AI analysis...");

      // Start loading message rotation
      const messages = [
        "Initializing AI analysis...",
        "Processing ESG content...",
        "Analyzing environmental factors...",
        "Evaluating social impact...",
        "Assessing governance practices...",
        "Calculating risk scores...",
        "Generating insights...",
        "Finalizing analysis...",
        "AI is processing your request...",
        "This may take a few minutes, please wait...",
        "Analyzing complex ESG patterns...",
        "Almost there, processing final details...",
      ];

      let messageIndex = 0;
      loadingIntervalRef.current = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 8000); // Change message every 8 seconds

      // Start elapsed time counter
      timeIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      const res = await api.post("/esg/analyze", {
        companyId: Number(companyId),
        newsText,
      });

      // Clear intervals on success
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }

      setResult(res.data);
      setLoadingMessage("");
    } catch (err) {
      // Clear intervals on error
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }

      // Use user-friendly message from axios interceptor, or fallback to extracting from response
      let errorMessage = err?.userFriendlyMessage;
      
      if (!errorMessage && err?.response?.data) {
        const errorData = err.response.data;
        
        // Safely extract error message, avoiding HTML
        if (typeof errorData === 'string') {
          // Check if it's HTML
          if (!errorData.trim().startsWith('<!DOCTYPE') && 
              !errorData.trim().startsWith('<html') &&
              !errorData.includes('<html')) {
            // Remove any HTML tags and use if reasonable
            const clean = errorData.replace(/<[^>]*>/g, '').trim();
            if (clean.length > 0 && clean.length < 500) {
              errorMessage = clean;
            }
          }
        } else if (typeof errorData === 'object') {
          errorMessage = errorData.error || errorData.message;
          // Sanitize if it contains HTML
          if (errorMessage && typeof errorMessage === 'string') {
            if (errorMessage.includes('<html') || errorMessage.includes('<!DOCTYPE')) {
              errorMessage = null; // Will use fallback
            } else {
              errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim();
            }
          }
        }
      }
      
      // Final fallback
      if (!errorMessage) {
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          errorMessage = "Request timed out. The AI service may be processing your request. Please try again.";
        } else {
          errorMessage = "ESG analysis failed. Please try again later.";
        }
      }
      
      setError(errorMessage);
      setLoadingMessage("");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getRiskConfig = (level) => {
    const configs = {
      HIGH: {
        variant: "destructive",
        icon: AlertTriangle,
        border: "border-destructive/50 dark:border-destructive/30",
        bg: "bg-destructive/5 dark:bg-destructive/10",
      },
      MEDIUM: {
        variant: "warning",
        icon: TrendingUp,
        border: "border-yellow-500/50 dark:border-yellow-500/30",
        bg: "bg-yellow-500/5 dark:bg-yellow-500/10",
      },
      LOW: {
        variant: "success",
        icon: CheckCircle2,
        border: "border-green-500/50 dark:border-green-500/30",
        bg: "bg-green-500/5 dark:bg-green-500/10",
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
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">{label}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant={color} className="text-xs">
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
        <Shield className="h-7 w-7 text-foreground" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">ESG Risk Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Event-based ESG intelligence for informed decisions
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

      {/* LOADING CARD */}
      {loading && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 animate-pulse text-primary" />
              AI Analysis in Progress
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Our AI is analyzing your ESG content. This may take several minutes, especially if the service is starting up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <Zap className="h-5 w-5 absolute -top-1 -right-1 animate-pulse text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base text-foreground">{loadingMessage}</p>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Elapsed time: <span className="font-medium">{formatTime(elapsedTime)}</span>
                </p>
              </div>
            </div>
            
            <Progress 
              value={Math.min((elapsedTime / 600) * 100, 95)} 
              className="h-2.5"
            />
            
            <div className="flex items-start gap-3 text-sm bg-muted/50 dark:bg-muted/30 border border-border rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold mb-1.5 text-foreground">Why is this taking time?</p>
                <p className="text-muted-foreground leading-relaxed">
                  The AI service may be starting up (cold start) or processing complex analysis. 
                  Please wait - the analysis will complete automatically. You can keep this page open.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RESULT */}
      {result && (
        <Card className={`border-2 ${riskConfig.border} ${riskConfig.bg}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <RiskIcon className="h-5 w-5" />
              Analysis Result
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-lg font-semibold text-foreground">{result.company}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">ESG Score</p>
                <p className="text-lg font-semibold text-foreground">{result.esgScore}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={riskConfig.variant} className="text-sm font-semibold px-3 py-1">
                {result.riskLevel} RISK
              </Badge>
            </div>

            <Separator className="my-2" />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Analysis</p>
              <p className="text-foreground leading-relaxed">{result.explanation}</p>
            </div>

            {renderSignals(result.signals, "positive")}
            {renderSignals(result.signals, "negative")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Analyze;
