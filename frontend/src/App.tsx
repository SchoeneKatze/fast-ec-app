import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useLogto } from "@logto/react";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import Home from "./pages/home/Home.tsx";
import Callback from "./pages/callback/Callback.jsx";
import SettingsPage from "./pages/settings/Settings.tsx";
import AddressesPage from "./pages/addresses/addresses.tsx";
import CheckoutPage from "./pages/checkout/checkout.tsx";
import ContactSupportPage from "./pages/order/contact.tsx";
import OrderSuccessPage from "./pages/order/success.tsx";
import OrderHistoryPage from "./pages/order/history.tsx";
import RefundPage from "./pages/order/refund.tsx";

const App = () => {
  const { isAuthenticated, getIdTokenClaims, signOut } = useLogto();

  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          if (claims && claims.exp * 1000 < Date.now()) {
            // Token expired
            signOut(window.location.origin);
            toast({
              title: "Session expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking token:", error);
        }
      }
    };

    checkSession();
  }, [isAuthenticated, getIdTokenClaims, signOut]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/contact-support/:orderNo" element={<ContactSupportPage />} />
        <Route path="/refund/:orderNo" element={<RefundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
