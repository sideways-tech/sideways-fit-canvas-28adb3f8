import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created", description: "You're now signed in." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <img src={sidewaysLogo} alt="Sideways" className="h-20 mx-auto" />
          <h1 className="text-xl font-semibold">Internal Access</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create your team account" : "Sign in to access the assessment tool"}
          </p>
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
            {loading ? (isSignUp ? "Creating account…" : "Signing in…") : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground underline underline-offset-2 hover:opacity-70"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="text-xs text-muted-foreground text-center">
          This tool is for authorised Sideways team members only.
        </p>
      </div>
    </div>
  );
};

export default Login;
