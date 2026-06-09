import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "../../components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-200">
      {/* Background ambient glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-2xl space-y-6 z-10 backdrop-blur-sm">
        {/* Warning Icon with pulse */}
        <div className="mx-auto w-16 h-16 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-foreground select-none">
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for does not exist, has been moved, or you might not have the correct role authorization to access it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link to="/login" className="flex-1">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
