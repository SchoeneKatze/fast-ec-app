import { useHandleSignInCallback, useLogto } from "@logto/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const Callback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, /*fetchUserInfo,*/ getIdTokenClaims } = useLogto()
  const { isLoading } = useHandleSignInCallback(() => {
     // navigate("/");
  });
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    const syncUser = async() => {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          console.log("Logto claims:", claims);
            
          if (claims) {
            const response = await fetch (`${BACKEND_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify ({
                logto_id: claims.sub,
                email: claims.email,
              })
            });

            if (response.ok){
              const responseUserJsonFromBackend = await response.json(); 
              console.log("internal_id: ", responseUserJsonFromBackend.internal_id);

              navigate("/");
              toast({
            title: "Login successful",
            description: `Logged in successfully`,
          });
            }
          }   
          }catch(error){console.log("Database sync failed", error);toast({
            title: "Database sync failed. Login data may not be saved correctly.",
            description: `Database sync failed. Login data may not be saved correctly.`,
          });}
        }
      };

      syncUser();
    }, [isAuthenticated, getIdTokenClaims, navigate, BACKEND_URL]);

  // When it's working in progress
  if (isLoading) {
    return <div>Redirecting...</div>;
  }

  return null;
};

export default Callback;
