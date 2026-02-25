import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/home/Home.tsx";
import Callback from "./pages/callback/Callback.jsx";
import SettingsPage from "./pages/settings/Settings.tsx";
import AddressesPage from "./pages/addresses/addresses.tsx";
import CheckoutPage from "./pages/checkout/checkout.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
