import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mt-4">Page not found</p>
          <p className="text-muted-foreground mt-2 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Go back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
