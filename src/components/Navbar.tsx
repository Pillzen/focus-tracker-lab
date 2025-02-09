
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Home, History, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = ({ email }: { email: string }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span className="font-bold">Home</span>
          </Link>
          <Link to="/new-analysis" className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>New Analysis</span>
          </Link>
          <Link to="/past-analysis" className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <span>Past Analysis</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{email}</span>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
