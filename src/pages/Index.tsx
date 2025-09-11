import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to user dashboard
    navigate("/user", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Redirecting to Donny Hub...</h1>
        <p className="text-xl text-muted-foreground">Loading your AI agent dashboard</p>
      </div>
    </div>
  );
};

export default Index;
