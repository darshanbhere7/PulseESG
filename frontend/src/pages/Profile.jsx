import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, CheckCircle } from "lucide-react";

function Profile() {
  const role = localStorage.getItem("role") || "UNKNOWN";
  const token = localStorage.getItem("token");

  let email = "Unknown";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      email = payload.sub || "Unknown";
    } catch {
      console.error("Failed to decode token");
    }
  }

  return (
    <div className="pt-24 px-6 pb-10 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account details and access level
        </p>
      </div>

      {/* PROFILE CARD */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-muted-foreground" />
            Account Details
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Information associated with your PulseESG account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* EMAIL */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Email Address
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {email}
            </p>
          </div>

          <Separator />

          {/* ROLE */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Role
              </p>
              <p className="mt-1 text-base font-medium text-foreground">
                {role}
              </p>
            </div>

            <Badge
              variant="secondary"
              className={
                role === "ADMIN"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }
            >
              <Shield className="h-3 w-3 mr-1" />
              {role}
            </Badge>
          </div>

          <Separator />

          {/* ACCOUNT STATUS */}
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Account Status
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Active and signed in
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
