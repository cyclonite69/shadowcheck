import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid-pattern">
      <div className="premium-card w-full max-w-md mx-4 hover:scale-105">
        <CardContent className="p-8 text-center">
          <div className="icon-container mx-auto mb-6">
            <Shield className="h-8 w-8 text-slate-300" />
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-200 mb-2">ShadowCheck</h1>
            <p className="text-xs text-slate-400 cyber-text tracking-wider mb-4">
              SIGINT FORENSICS PLATFORM
            </p>
          </div>

          <div className="silver-accent px-4 py-2 rounded-full mb-6 inline-block">
            <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              404 - Page Not Found
            </span>
          </div>

          <p className="text-sm text-slate-300 mb-6">
            The requested intelligence resource could not be located in the system.
          </p>
          
          <div className="space-y-2">
            <a href="/dashboard" className="gold-accent px-4 py-2 rounded-full inline-block hover:scale-105 transition-all duration-300">
              <span className="text-sm font-semibold text-slate-800">Return to Command Center</span>
            </a>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
