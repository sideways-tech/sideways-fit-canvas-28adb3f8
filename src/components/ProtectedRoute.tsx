import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
