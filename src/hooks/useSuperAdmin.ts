import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSuperAdmin = () => {
  const { session } = useAuth();
  const email = session?.user?.email;

  const { data: isSuperAdmin = false, isLoading } = useQuery({
    queryKey: ["super-admin-check", email],
    queryFn: async () => {
      if (!email) return false;
      const { data, error } = await supabase.rpc("is_super_admin", {
        check_email: email.toLowerCase(),
      });
      if (error) {
        console.error("Super admin check failed:", error);
        return false;
      }
      return !!data;
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
  });

  return { isSuperAdmin, isLoading };
};
