import { useHandleSignInCallback, useLogto } from "@logto/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Callback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, /*fetchUserInfo,*/ getIdTokenClaims } = useLogto()
  const { isLoading } = useHandleSignInCallback(() => {

    // navigate("/");
  });

  useEffect(() => {
    const syncUser = async() => {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          console.log("Logto claims:", claims);
            
          if (claims) {
            const response = await fetch ("http://127.0.0.1:8000/auth/login", {
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
            }
          }   
          }catch(error){console.log("Database sync failed", error);}
        }
      };

      syncUser();
    }, [isAuthenticated, getIdTokenClaims, navigate]);

  // When it's working in progress
  if (isLoading) {
    return <div>Redirecting...</div>;
  }

  return null;
};

export default Callback;
