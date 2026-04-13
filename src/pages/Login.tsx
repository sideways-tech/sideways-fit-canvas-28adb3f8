import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import sidewaysLogo from "@/assets/sideways-logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Missing fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <img src={sidewaysLogo} alt="Sideways" className="h-20 mx-auto" />
          <h1 className="text-xl font-semibold">Internal Access</h1>
          <p className="text-sm text-muted-foreground">Sign in to access the assessment tool</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@sideways.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sketch-border-light bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sketch-border-light bg-background"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          This tool is for authorised Sideways team members only.
        </p>
      </div>
    </div>
  );
};

export default Login;
